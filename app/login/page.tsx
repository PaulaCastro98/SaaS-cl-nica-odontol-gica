'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('[v0] Sending login request:', { email, password: '***' })
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      console.log('[v0] Login response status:', response.status)
      const data = await response.json()
      console.log('[v0] Login response data:', data)

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        console.error('[v0] Login error:', data.error)
        return
      }

      console.log('[v0] Login successful, redirecting to dashboard')
      // Aguardar um pouco para garantir que o cookie foi setado
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/dashboard')
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Desconhecido'
      console.error('[v0] Login exception:', err)
      setError('Erro ao conectar ao servidor: ' + errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Entrar</h1>
              <p className="text-muted-foreground">Acesse sua clínica odontológica</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Não tem uma conta?{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
