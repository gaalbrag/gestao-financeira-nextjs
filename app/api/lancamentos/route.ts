
import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { LancamentoFormData } from '@/types'

// GET all lancamentos for the authenticated user
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('lancamentos')
    .select('*, categorias (id, nome)') // Join with categorias
    .eq('user_id', user.id)
    .order('data', { ascending: false });

  if (error) {
    console.error('Error fetching lancamentos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST a new lancamento for the authenticated user
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as LancamentoFormData;

    // Basic validation
    if (typeof body.valor !== 'number' || body.valor === 0) {
      return NextResponse.json({ error: 'Valor é obrigatório e não pode ser zero.' }, { status: 400 })
    }
    if (!body.data || typeof body.data !== 'string') {
      return NextResponse.json({ error: 'Data é obrigatória.' }, { status: 400 })
    }
    if (!body.categoria_id) {
      return NextResponse.json({ error: 'Categoria é obrigatória.' }, { status: 400 })
    }
    
    // Ensure data is in YYYY-MM-DD format if not already
    const isoDate = new Date(body.data).toISOString().split('T')[0];


    const { data, error } = await supabase
      .from('lancamentos')
      .insert({
        descricao: body.descricao || null,
        valor: body.valor,
        data: isoDate,
        categoria_id: BigInt(body.categoria_id),
        user_id: user.id,
      })
      .select('*, categorias (id, nome)')
      .single();

    if (error) {
      console.error('Error creating lancamento:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('Error parsing request body or other server error:', e)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
