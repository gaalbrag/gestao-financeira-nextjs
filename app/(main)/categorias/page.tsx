
import { createClient } from "@/lib/supabase/server";
import { Categoria } from "@/types";
import CategoriaList from "./CategoriaList"; // Client component for interactivity
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Ensured lowercase 'button'

export const revalidate = 0; 

async function getCategorias(): Promise<Categoria[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Error fetching categorias:", error);
    return [];
  }
  return data || [];
}

export default async function CategoriasPage() {
  const categorias = await getCategorias();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie suas categorias de lançamentos.
          </p>
        </div>
      </div>
      <CategoriaList initialCategorias={categorias} />
    </div>
  );
}