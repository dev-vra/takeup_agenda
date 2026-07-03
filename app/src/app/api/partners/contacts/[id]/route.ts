import { NextRequest, NextResponse } from 'next/server'
import { getAuth, canWrite } from '@/lib/partners/crud'

const FIELDS = ['name', 'role', 'email', 'phone', 'whatsapp', 'is_primary']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para editar contatos' }, { status: 403 })

  const { data: existing } = await supabase.from('partner_contacts').select('*').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
  if (existing.created_by !== userId && role !== 'admin') {
    return NextResponse.json({ error: 'Apenas o autor ou um admin pode editar este contato' }, { status: 403 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const updates: Record<string, unknown> = {}
  for (const f of FIELDS) if (f in body) updates[f] = body[f] === '' ? null : body[f]
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })

  if (updates.is_primary === true) {
    await supabase.from('partner_contacts').update({ is_primary: false })
      .eq('partner_kind', existing.partner_kind).eq('partner_id', existing.partner_id)
  }

  const { error } = await supabase.from('partner_contacts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'update', entity_type: 'partner_contact', entity_id: id, old_values: existing, new_values: updates,
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: existing } = await supabase.from('partner_contacts').select('*').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
  if (existing.created_by !== userId && role !== 'admin') {
    return NextResponse.json({ error: 'Apenas o autor ou um admin pode excluir este contato' }, { status: 403 })
  }

  const { error } = await supabase.from('partner_contacts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'delete', entity_type: 'partner_contact', entity_id: id, old_values: existing,
  })
  return NextResponse.json({ success: true })
}
