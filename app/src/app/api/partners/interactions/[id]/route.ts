import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/partners/crud'

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: existing } = await supabase.from('partner_interactions').select('*').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Interação não encontrada' }, { status: 404 })
  if (existing.created_by !== userId && role !== 'admin') {
    return NextResponse.json({ error: 'Apenas o autor ou um admin pode excluir esta interação' }, { status: 403 })
  }

  const { error } = await supabase.from('partner_interactions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'delete', entity_type: 'partner_interaction', entity_id: id, old_values: existing,
  })
  return NextResponse.json({ success: true })
}
