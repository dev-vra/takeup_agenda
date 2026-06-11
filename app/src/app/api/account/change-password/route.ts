import { NextRequest, NextResponse } from 'next/server'
import { createClient, createPureAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { password, confirm } = await request.json()
  if (!password || !confirm) {
    return NextResponse.json({ error: 'Informe a nova senha e a confirmação' }, { status: 400 })
  }
  if (password !== confirm) {
    return NextResponse.json({ error: 'As senhas não coincidem' }, { status: 400 })
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: 'A senha deve ter ao menos 6 caracteres' }, { status: 400 })
  }

  // Atualiza a senha do próprio usuário autenticado
  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Limpa a flag de troca obrigatória
  const admin = createPureAdminClient()
  await admin.from('profiles').update({ must_change_password: false }).eq('id', user.id)

  return NextResponse.json({ success: true })
}
