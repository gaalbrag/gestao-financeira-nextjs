
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar user={user} />
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} Finanças Next - Apus. Todos os direitos reservados.
      </footer>
    </div>
  );
}
