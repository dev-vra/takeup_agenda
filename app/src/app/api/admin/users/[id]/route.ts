import { NextRequest, NextResponse } from 'next/server'
import { createClient, createPureAdminClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado', status: 401 }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Acesso negado', status: 403 }

  return { error: null, status: 200 }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ error }, { status })

  const { id } = await params
  const body = await request.json()
  const admin = createPureAdminClient()

  const profileUpdates: Record<string, string> = {}
  if (body.name) profileUpdates.name = body.name
  if (body.role) profileUpdates.role = body.role

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await admin
      .from('profiles')
      .update({ ...profileUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (body.password) {
    const { error: authError } = await admin.auth.admin.updateUserById(id, { password: body.password })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ error }, { status })

  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === id) return NextResponse.json({ error: 'Não é possível excluir sua própria conta' }, { status: 400 })

  const admin = createPureAdminClient()
  await admin.from('profiles').delete().eq('id', id)
  const { error: authError } = await admin.auth.admin.deleteUser(id)
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
