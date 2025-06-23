
// Based on JPA entities: Usuario (as Profile), Categoria, Lancamento

export interface Profile {
  id: string; // UUID from auth.users
  nome: string | null;
  username: string | null;
  // password is handled by Supabase Auth, not stored here
}

export interface Categoria {
  id: bigint;
  nome: string;
}

export interface Lancamento {
  id: bigint;
  descricao: string | null;
  valor: number; // Using number for client-side, Supabase stores as numeric
  data: string; // ISO date string (YYYY-MM-DD)
  categoria_id: bigint;
  user_id: string; // Added user_id
  categorias?: Categoria; // Optional: for joined data
}

// For form data, typically without 'id' and with potential conversions
export type CategoriaFormData = Omit<Categoria, 'id'>;
export type LancamentoFormData = Omit<Lancamento, 'id' | 'categorias'> & {
  // Ensure valor is number, data is string
  valor: number;
  data: string;
};