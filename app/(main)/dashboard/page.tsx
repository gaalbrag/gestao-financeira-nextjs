
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Ensured lowercase 'button'
import { PlusCircle } from "lucide-react";
import { Lancamento } from "@/types"; 

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let totalCategorias = 0;
  let totalLancamentos = 0;
  let saldoTotal = 0;

  if (user) {
    const { count: categoriasCount } = await supabase
      .from('categorias')
      .select('*', { count: 'exact', head: true });
    totalCategorias = categoriasCount ?? 0;

    const { data: lancamentosData, count: lancamentosCount, error: lancamentosError } = await supabase
      .from('lancamentos')
      .select('valor', { count: 'exact' }) // Only select 'valor' for sum
      .eq('user_id', user.id); // Ensure user_id filter is applied
    
    totalLancamentos = lancamentosCount ?? 0;
    if (lancamentosData) {
      saldoTotal = lancamentosData.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.email}!
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/lancamentos/novo"> {/* This path might need to be /lancamentos and form handled there */}
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Lançamento
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {saldoTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Baseado em todos os lançamentos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lançamentos</CardTitle>
            <ListChecksIcon className="h-4 w-4 text-muted-foreground" /> {/* Changed to avoid conflict */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLancamentos}</div>
             <Link href="/lancamentos" className="text-xs text-muted-foreground hover:underline">
              Ver todos os lançamentos
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
            <ListChecksIcon className="h-4 w-4 text-muted-foreground" /> {/* Changed to avoid conflict */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategorias}</div>
            <Link href="/categorias" className="text-xs text-muted-foreground hover:underline">
              Gerenciar categorias
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Resumo dos seus últimos lançamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em breve...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Icons (simple versions for brevity, actual lucide-react icons are better)
const DollarSign = ({ className }: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const ListChecksIcon = ({ className }: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="10" x2="21" y1="6" y2="6"></line><line x1="10" x2="21" y1="12" y2="12"></line><line x1="10" x2="21" y1="18" y2="18"></line><polyline points="3 6 4 7 6 5"></polyline><polyline points="3 12 4 13 6 11"></polyline><polyline points="3 18 4 19 6 17"></polyline></svg>;