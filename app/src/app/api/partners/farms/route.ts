import { NextRequest, NextResponse } from 'next/server'
import { getAuth, canWrite } from '@/lib/partners/crud'

const FIELDS = ['seller_id', 'name', 'sai_farm_code', 'city', 'state', 'hectares']

export async function GET(request: NextRequest) {
  const { supabase, userId } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const sellerId = new URL(request.url).searchParams.get('seller_id')
  if (!sellerId) return NextResponse.json({ error: 'seller_id é obrigatório' }, { status: 400 })

  const { data, error } = await supabase
    .from('producer_farms')
    .select('*')
    .eq('seller_id', sellerId)
    .order('name', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para cadastrar fazendas' }, { status: 403 })

  const body = (await request.json()) as Record<string, unknown>
  if (!body.seller_id) return NextResponse.json({ error: 'seller_id é obrigatório' }, { status: 400 })
  if (!body.name || String(body.name).trim() === '') {
    return NextResponse.json({ error: 'O nome da fazenda é obrigatório.' }, { status: 400 })
  }

  const insert: Record<string, unknown> = { created_by: userId }
  for (const f of FIELDS) if (f in body) insert[f] = body[f] === '' ? null : body[f]

  const { data, error } = await supabase.from('producer_farms').insert(insert).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'create', entity_type: 'producer_farm', entity_id: data.id, new_values: insert,
  })
  return NextResponse.json({ data })
}
