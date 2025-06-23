
"use client";

import * as React from "react"; // Added import for React
import { useState, FormEvent, useEffect } from "react";
import { Lancamento, LancamentoFormData, Categoria } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button"; // Ensured lowercase 'button'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea"; // Assuming a Textarea component exists - this line was here
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Edit3, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateToInput } from "@/lib/utils";
import { cn } from "@/lib/utils"; // Added import for cn

interface LancamentoListProps {
  initialLancamentos: Lancamento[];
  categoriasDisponiveis: Categoria[];
  userId: string;
}

const defaultFormData: Omit<LancamentoFormData, "user_id"> & { user_id?: string } = { // Adjusted type for initial state before user_id is definitely set
  descricao: "",
  valor: 0,
  data: formatDateToInput(new Date()),
  categoria_id: "" as unknown as bigint, 
};


export default function LancamentoList({ initialLancamentos, categoriasDisponiveis, userId }: LancamentoListProps) {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(initialLancamentos);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<bigint | null>(null);
  const [currentLancamento, setCurrentLancamento] = useState<LancamentoFormData>({...defaultFormData, user_id: userId });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setCurrentLancamento(prev => ({ ...prev, user_id: userId }));
  }, [userId]);


  const openFormForNew = () => {
    setIsEditing(null);
    const newFormData: LancamentoFormData = {
        ...defaultFormData, 
        user_id: userId, 
        data: formatDateToInput(new Date()),
        // Safely access categoria_id
        categoria_id: categoriasDisponiveis.length > 0 ? categoriasDisponiveis[0].id : "" as unknown as bigint,
    };
    setCurrentLancamento(newFormData);
    setShowForm(true);
    setError(null);
  };

  const openFormForEdit = (lancamento: Lancamento) => {
    setIsEditing(lancamento.id);
    setCurrentLancamento({
      descricao: lancamento.descricao || "",
      valor: lancamento.valor,
      data: formatDateToInput(new Date(lancamento.data)),
      categoria_id: lancamento.categoria_id,
      user_id: lancamento.user_id, // user_id is now part of Lancamento type
    });
    setShowForm(true);
    setError(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(null);
    setCurrentLancamento({...defaultFormData, user_id: userId});
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setCurrentLancamento(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setCurrentLancamento(prev => ({
        ...prev,
        categoria_id: BigInt(value)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (currentLancamento.valor === 0) {
      setError("O valor do lançamento não pode ser zero.");
      return;
    }
    if (!currentLancamento.categoria_id || String(currentLancamento.categoria_id).trim() === "") { // Check if categoria_id is truly set
        setError("Por favor, selecione uma categoria.");
        return;
    }
    setLoading(true);
    setError(null);

    const payload: LancamentoFormData = {
      ...currentLancamento,
      valor: Number(currentLancamento.valor), 
      data: currentLancamento.data, 
    };

    if (isEditing !== null) {
      const { data, error: updateError } = await supabase
        .from("lancamentos")
        .update(payload)
        .eq("id", isEditing)
        .select("*, categorias(id, nome)") 
        .single();

      if (updateError) {
        setError(`Erro ao atualizar: ${updateError.message}`);
      } else if (data) {
        setLancamentos(lancamentos.map((l) => (l.id === data.id ? data as Lancamento : l)));
        handleCloseForm();
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("lancamentos")
        .insert(payload) 
        .select("*, categorias(id, nome)")
        .single();
      
      if (insertError) {
        setError(`Erro ao adicionar: ${insertError.message}`);
      } else if (data) {
        setLancamentos([data as Lancamento, ...lancamentos]);
        handleCloseForm();
      }
    }
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: bigint) => {
    if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from("lancamentos")
        .delete()
        .eq("id", id);

      if (deleteError) {
        setError(`Erro ao excluir: ${deleteError.message}`);
      } else {
        setLancamentos(lancamentos.filter((l) => l.id !== id));
        setError(null);
      }
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={openFormForNew} variant="outline">
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Lançamento
      </Button>

      {showForm && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Lançamento" : "Novo Lançamento"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea // Using the locally defined Textarea
                  id="descricao"
                  name="descricao"
                  value={currentLancamento.descricao || ""}
                  onChange={handleChange}
                  placeholder="Ex: Compra de supermercado"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    value={currentLancamento.valor}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    value={currentLancamento.data}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                    <Label htmlFor="categoria_id">Categoria</Label>
                    <Select
                        name="categoria_id"
                        value={currentLancamento.categoria_id ? String(currentLancamento.categoria_id) : ""}
                        onValueChange={handleSelectChange}
                        // required attribute is not standard for custom Select, validation handled in handleSubmit
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                        {categoriasDisponiveis.length === 0 && <SelectItem value="" disabled>Nenhuma categoria disponível</SelectItem>}
                        {categoriasDisponiveis.map((cat) => (
                            <SelectItem key={String(cat.id)} value={String(cat.id)}>
                                {cat.nome}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Adicionar Lançamento")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {lancamentos.length === 0 && !showForm ? (
         <Card>
            <CardContent className="p-6">
                 <p className="text-muted-foreground text-center">Nenhum lançamento encontrado. Adicione um para começar.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lancamentos.map((lancamento) => (
            <Card key={String(lancamento.id)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{lancamento.descricao || "Lançamento"}</CardTitle>
                        <CardDescription>
                            Data: {new Date(lancamento.data + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'})} {/* Ensure UTC for date part */}
                            {lancamento.categorias && ` | Categoria: ${lancamento.categorias.nome}`}
                        </CardDescription>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openFormForEdit(lancamento)} title="Editar">
                            <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lancamento.id)} disabled={loading} title="Excluir">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-semibold ${lancamento.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {lancamento.valor.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Basic Textarea component (as it was in the original file)
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// Removed export { Textarea }; as it's locally used. If it were meant to be shared, it should be in its own file.
