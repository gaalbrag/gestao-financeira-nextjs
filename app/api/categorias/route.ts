
import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { CategoriaFormData } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Error fetching categorias:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { nome } = await request.json() as CategoriaFormData;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert({ nome: nome.trim() })
      .select()
      .single();

    if (error) {
      console.error('Error creating categoria:', error)
      // Check for unique constraint violation or other specific errors if needed
      if (error.code === '23505') { // unique_violation
          return NextResponse.json({ error: 'Uma categoria com este nome já existe.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('Error parsing request body or other server error:', e)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
