
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RootPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  // Fallback content if redirect doesn't happen immediately (should not be visible)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo!</h1>
      <p className="mb-2">Carregando sua experiência...</p>
      {!user && <Link href="/login" className="text-blue-500 hover:underline">Ir para Login</Link>}
    </div>
  );
}
