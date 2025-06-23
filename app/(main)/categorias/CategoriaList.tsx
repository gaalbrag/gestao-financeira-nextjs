
"use client";

import { useState, FormEvent } from "react";
import { Categoria, CategoriaFormData } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button"; // Ensured lowercase 'button'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Edit3, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoriaListProps {
  initialCategorias: Categoria[];
}

export default function CategoriaList({ initialCategorias }: CategoriaListProps) {
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<bigint | null>(null);
  const [currentNome, setCurrentNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const openFormForNew = () => {
    setIsEditing(null);
    setCurrentNome("");
    setShowForm(true);
    setError(null);
  };

  const openFormForEdit = (categoria: Categoria) => {
    setIsEditing(categoria.id);
    setCurrentNome(categoria.nome);
    setShowForm(true);
    setError(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(null);
    setCurrentNome("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentNome.trim()) {
      setError("O nome da categoria é obrigatório.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData: CategoriaFormData = { nome: currentNome.trim() };

    if (isEditing !== null) {
      const { data, error: updateError } = await supabase
        .from("categorias")
        .update(formData)
        .eq("id", isEditing)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating categoria:", updateError);
        setError(`Erro ao atualizar: ${updateError.message}`);
      } else if (data) {
        setCategorias(categorias.map((c) => (c.id === data.id ? data : c)));
        handleCloseForm();
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("categorias")
        .insert(formData)
        .select()
        .single();
      
      if (insertError) {
        console.error("Error inserting categoria:", insertError);
        setError(`Erro ao adicionar: ${insertError.message}`);
      } else if (data) {
        setCategorias([...categorias, data]);
        handleCloseForm();
      }
    }
    setLoading(false);
    router.refresh(); 
  };

  const handleDelete = async (id: bigint) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from("categorias")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting categoria:", deleteError);
        setError(`Erro ao excluir: ${deleteError.message}`);
      } else {
        setCategorias(categorias.filter((c) => c.id !== id));
        setError(null);
      }
      setLoading(false);
      router.refresh(); 
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={openFormForNew} variant="outline">
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Categoria
      </Button>

      {showForm && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nomeCategoria">Nome da Categoria</Label>
                <Input
                  id="nomeCategoria"
                  type="text"
                  value={currentNome}
                  onChange={(e) => setCurrentNome(e.target.value)}
                  placeholder="Ex: Alimentação"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Adicionar Categoria")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {categorias.length === 0 && !showForm ? (
         <Card>
            <CardContent className="p-6">
                 <p className="text-muted-foreground text-center">Nenhuma categoria encontrada. Adicione uma para começar.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <Card key={String(categoria.id)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{categoria.nome}</CardTitle>
                 <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openFormForEdit(categoria)} title="Editar">
                        <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(categoria.id)} disabled={loading} title="Excluir">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                 </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">ID: {String(categoria.id)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}