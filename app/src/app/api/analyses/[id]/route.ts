import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_USER_ID = '37e812af-9bb7-44ff-ae42-4cd04a2422e5'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (user.id !== ADMIN_USER_ID) return NextResponse.json({ error: 'Apenas admin pode excluir análises' }, { status: 403 })

  // Fetch old values for audit
  const { data: oldData } = await supabase.from('analyses').select('*').eq('id', id).single()

  const { error } = await supabase.from('analyses').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Audit log
  await supabase.from('audit_log').insert({
    user_id: user.id,
    action: 'delete',
    entity_type: 'analysis',
    entity_id: id,
    old_values: oldData || null,
    new_values: null,
  })

  return NextResponse.json({ success: true })
}
