import { NextRequest, NextResponse } from 'next/server'
import { getAuth, canWrite } from '@/lib/partners/crud'
import type { PartnerKind } from '@/types'

const KINDS: PartnerKind[] = ['seller', 'buyer', 'laboratory', 'warehouse', 'carrier']
const TYPES = ['ligacao', 'email', 'reuniao', 'visita', 'whatsapp', 'nota']

function validKind(k: string | null): k is PartnerKind {
  return !!k && (KINDS as string[]).includes(k)
}

export async function GET(request: NextRequest) {
  const { supabase, userId } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const url = new URL(request.url)
  const partnerKind = url.searchParams.get('partner_kind')
  const partnerId = url.searchParams.get('partner_id')
  if (!validKind(partnerKind) || !partnerId) {
    return NextResponse.json({ error: 'partner_kind e partner_id são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('partner_interactions')
    .select('*, creator:created_by(id,name)')
    .eq('partner_kind', partnerKind)
    .eq('partner_id', partnerId)
    .order('occurred_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para registrar interações' }, { status: 403 })

  const body = (await request.json()) as Record<string, unknown>
  if (!validKind(body.partner_kind as string) || !body.partner_id) {
    return NextResponse.json({ error: 'partner_kind e partner_id são obrigatórios' }, { status: 400 })
  }
  if (!body.content || String(body.content).trim() === '') {
    return NextResponse.json({ error: 'O conteúdo da interação é obrigatório.' }, { status: 400 })
  }
  const type = TYPES.includes(body.type as string) ? body.type : 'nota'

  const insert: Record<string, unknown> = {
    partner_kind: body.partner_kind,
    partner_id: body.partner_id,
    type,
    content: body.content,
    occurred_at: body.occurred_at || new Date().toISOString(),
    created_by: userId,
  }

  const { data, error } = await supabase.from('partner_interactions').insert(insert).select('*, creator:created_by(id,name)').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'create', entity_type: 'partner_interaction', entity_id: data.id, new_values: insert,
  })
  return NextResponse.json({ data })
}
