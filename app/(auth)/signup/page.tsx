
import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
       <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>
            Crie sua conta para começar a usar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" />
          <p className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline">
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
