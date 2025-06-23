
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Ensured lowercase 'button'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState(''); // Only for signup
  const [username, setUsername] = useState(''); // Only for signup
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (mode === 'signup') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome, 
            username: username,
          },
        },
      });

      if (signUpError) {
        setMessage(signUpError.message);
      } else if (signUpData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ nome: nome, username: username }) 
          .eq('id', signUpData.user.id);

        if (profileError) {
          setMessage(`Usuário criado, mas falha ao criar perfil: ${profileError.message}. Verifique o console.`);
          console.error("Profile creation error:", profileError);
        } else {
          setMessage('Cadastro realizado! Verifique seu email para confirmação.');
        }
      } else {
         setMessage('Cadastro realizado! Verifique seu email para confirmação.');
      }
    } else { // login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        router.push('/dashboard');
        router.refresh(); 
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      {mode === 'signup' && (
        <>
          <div className="space-y-1">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Seu nome completo"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="username">Usuário (opcional)</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de usuário único"
            />
          </div>
        </>
      )}
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Cadastrar')}
      </Button>
      {message && <p className="text-sm text-center text-red-500">{message}</p>}
    </form>
  );
}