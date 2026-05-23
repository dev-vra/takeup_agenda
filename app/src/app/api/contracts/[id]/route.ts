import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_USER_ID = '37e812af-9bb7-44ff-ae42-4cd04a2422e5'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (user.id !== ADMIN_USER_ID) return NextResponse.json({ error: 'Apenas admin pode editar contratos' }, { status: 403 })

  const body = await request.json()

  // Only allow safe fields
  const allowed = ['responsible', 'observation', 'quality_spec', 'is_active']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  // Fetch old values for audit
  const { data: oldData } = await supabase.from('contracts').select('*').eq('id', id).single()

  const { error } = await supabase.from('contracts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Audit log
  await supabase.from('audit_log').insert({
    user_id: user.id,
    action: 'update',
    entity_type: 'contract',
    entity_id: id,
    old_values: oldData || null,
    new_values: updates,
  })

  return NextResponse.json({ success: true })
}
