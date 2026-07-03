import { NextRequest, NextResponse } from 'next/server'
import { getAuth, canWrite } from '@/lib/partners/crud'

const ENTITY_TYPES = ['seller', 'buyer', 'laboratory', 'warehouse', 'carrier']

export async function GET(request: NextRequest) {
  const { supabase, userId } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const url = new URL(request.url)
  const entityType = url.searchParams.get('entity_type')
  const entityId = url.searchParams.get('entity_id')
  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'entity_type e entity_id são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para anexar documentos' }, { status: 403 })

  const body = (await request.json()) as Record<string, unknown>
  const entityType = body.entity_type as string
  if (!ENTITY_TYPES.includes(entityType) || !body.entity_id || !body.file_url || !body.file_name) {
    return NextResponse.json({ error: 'Dados do documento incompletos.' }, { status: 400 })
  }

  const insert = {
    entity_type: entityType,
    entity_id: body.entity_id,
    file_url: body.file_url,
    file_name: body.file_name,
    file_type: body.file_type ?? null,
    file_size: body.file_size ?? null,
    created_by: userId,
  }

  const { data, error } = await supabase.from('documents').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'create', entity_type: 'document', entity_id: data.id, new_values: insert,
  })
  return NextResponse.json({ data })
}
