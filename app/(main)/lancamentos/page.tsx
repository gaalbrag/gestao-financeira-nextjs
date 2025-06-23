
import { createClient } from "@/lib/supabase/server";
import { Lancamento, Categoria } from "@/types";
import LancamentoList from "./LancamentoList"; 
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Ensured lowercase 'button'
import { PlusCircle } from "lucide-react";

export const revalidate = 0; 

async function getLancamentos(userId: string): Promise<Lancamento[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lancamentos")
    .select("*, categorias (id, nome)") 
    .eq("user_id", userId)
    .order("data", { ascending: false });

  if (error) {
    console.error("Error fetching lancamentos:", error);
    return [];
  }
  return data as Lancamento[] || [];
}

async function getCategorias(): Promise<Categoria[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome")
    .order("nome", { ascending: true });
  if (error) {
    console.error("Error fetching categorias for lancamentos:", error);
    return [];
  }
  return data || [];
}


export default async function LancamentosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p>Você precisa estar logado para ver os lançamentos.</p>;
  }

  const lancamentos = await getLancamentos(user.id);
  const categorias = await getCategorias();

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-muted-foreground">
            Gerencie suas entradas e saídas financeiras.
          </p>
        </div>
      </div>
      <LancamentoList initialLancamentos={lancamentos} categoriasDisponiveis={categorias} userId={user.id} />
    </div>
  );
}