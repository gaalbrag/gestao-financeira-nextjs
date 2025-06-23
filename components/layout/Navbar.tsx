
"use client"
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Ensured lowercase 'button'
import type { User } from '@supabase/supabase-js';
import { Home, ListChecks, DollarSign, LogOut, UserCircle } from 'lucide-react';

export default function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <nav className="flex items-center space-x-4 lg:space-x-6 mr-6 text-sm font-medium">
          <Link href="/dashboard" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
            <Home className="h-5 w-5 mr-1" /> Painel
          </Link>
          <Link href="/categorias" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
            <ListChecks className="h-5 w-5 mr-1" /> Categorias
          </Link>
          <Link href="/lancamentos" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
            <DollarSign className="h-5 w-5 mr-1" /> Lançamentos
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user && (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline-block flex items-center">
                <UserCircle className="h-4 w-4 mr-1" />
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Sair
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}