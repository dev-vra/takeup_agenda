import { NextRequest, NextResponse } from 'next/server'
import { getAuth, canWrite } from '@/lib/partners/crud'

const FIELDS = ['name', 'sai_farm_code', 'city', 'state', 'hectares']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para editar fazendas' }, { status: 403 })

  const body = (await request.json()) as Record<string, unknown>
  const updates: Record<string, unknown> = {}
  for (const f of FIELDS) if (f in body) updates[f] = body[f] === '' ? null : body[f]
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })

  const { data: oldData } = await supabase.from('producer_farms').select('*').eq('id', id).single()
  const { error } = await supabase.from('producer_farms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'update', entity_type: 'producer_farm', entity_id: id, old_values: oldData ?? null, new_values: updates,
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para excluir fazendas' }, { status: 403 })

  const { data: oldData } = await supabase.from('producer_farms').select('*').eq('id', id).single()
  const { error } = await supabase.from('producer_farms').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'delete', entity_type: 'producer_farm', entity_id: id, old_values: oldData ?? null,
  })
  return NextResponse.json({ success: true })
}
