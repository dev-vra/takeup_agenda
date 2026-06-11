'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

export default function AlterarSenhaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/agenda')
      router.refresh()
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao alterar a senha.')
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="space-y-4 pb-4 pt-8">
            <div className="flex flex-col items-center gap-3">
              <Image src="/logo-laferlins.png" alt="Laferlins" width={64} height={64} className="object-contain" priority />
              <div className="flex items-center gap-2 text-blue-700">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold">Defina sua nova senha</span>
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-center">Primeiro acesso</CardTitle>
              <CardDescription className="text-center">
                Por segurança, crie uma nova senha pessoal para continuar.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoFocus disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirme a nova senha</Label>
                <Input
                  id="confirm" type="password" placeholder="••••••••"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  required disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                ) : 'Alterar senha e continuar'}
              </Button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Sair
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
