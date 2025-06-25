import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Garante que o código use as variáveis de ambiente que definimos na Vercel
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}