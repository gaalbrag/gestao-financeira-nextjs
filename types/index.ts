// Define o formato de um objeto Categoria
export interface Categoria {
  id: number;
  nome: string;
}

// Define o formato dos dados do formulário para criar uma Categoria
export interface CategoriaFormData {
  nome: string;
}

// Define o formato de um objeto Lancamento (já pensando no futuro)
export interface Lancamento {
  id: number;
  descricao: string;
  valor: number;
  data: string; // O tipo pode ser string (ex: '2025-06-25') ou Date
  categoria_id: number;
  // Opcional: para incluir os dados da categoria junto do lançamento
  categorias?: {
    nome: string;
  };
}