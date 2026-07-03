import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Role = 'admin' | 'consultor' | 'leitor'

export interface AuthContext {
  supabase: SupabaseClient
  userId: string | null
  role: Role | null
}

/** Resolve o usuário atual e seu papel (via profiles). */
export async function getAuth(): Promise<AuthContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, userId: null, role: null }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return { supabase, userId: user.id, role: (profile?.role ?? 'leitor') as Role }
}

export const canWrite = (role: Role | null) => role === 'admin' || role === 'consultor'

/** Grava no audit_log usando o supabase client já autenticado. */
async function audit(
  supabase: SupabaseClient,
  userId: string,
  action: 'create' | 'update' | 'delete',
  entityType: string,
  entityId: string,
  oldValues?: unknown,
  newValues?: unknown,
) {
  await supabase.from('audit_log').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
  })
}

/** Mensagem amigável para violação de unicidade (índice único). */
function friendlyError(error: { code?: string; message: string }, uniqueMessage: string): string {
  if (error.code === '23505') return uniqueMessage
  return error.message
}

/** Extrai apenas os campos permitidos do corpo da requisição. */
function pick(body: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    if (f in body) out[f] = body[f] === '' ? null : body[f]
  }
  return out
}

export interface CollectionOptions {
  fields: string[]
  requiredFields?: string[]
  searchColumns?: string[]
  orderBy?: { column: string; ascending?: boolean }
  uniqueMessage?: string
}

export function makeCollectionHandlers(table: string, entityType: string, opts: CollectionOptions) {
  const uniqueMessage = opts.uniqueMessage ?? 'Já existe um registro com esse nome.'

  async function GET(request: NextRequest) {
    const { supabase, userId } = await getAuth()
    if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.trim()
    const active = url.searchParams.get('active')

    let query = supabase.from(table).select('*')

    if (active === 'true') query = query.eq('is_active', true)
    if (active === 'false') query = query.eq('is_active', false)

    if (search && opts.searchColumns?.length) {
      // Remove caracteres que quebram a sintaxe de filtro do PostgREST.
      const safe = search.replace(/[,()*]/g, ' ').trim()
      if (safe) {
        const or = opts.searchColumns.map((c) => `${c}.ilike.%${safe}%`).join(',')
        query = query.or(or)
      }
    }

    const order = opts.orderBy ?? { column: 'created_at', ascending: false }
    query = query.order(order.column, { ascending: order.ascending ?? false })

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  async function POST(request: NextRequest) {
    const { supabase, userId, role } = await getAuth()
    if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para criar cadastros' }, { status: 403 })

    const body = (await request.json()) as Record<string, unknown>
    for (const f of opts.requiredFields ?? []) {
      if (!body[f] || String(body[f]).trim() === '') {
        return NextResponse.json({ error: `O campo "${f}" é obrigatório.` }, { status: 400 })
      }
    }

    const insert = { ...pick(body, opts.fields), created_by: userId }
    const { data, error } = await supabase.from(table).insert(insert).select().single()
    if (error) return NextResponse.json({ error: friendlyError(error, uniqueMessage) }, { status: 400 })

    await audit(supabase, userId, 'create', entityType, data.id, null, insert)
    return NextResponse.json({ data })
  }

  return { GET, POST }
}

export interface ItemOptions {
  fields: string[]
  uniqueMessage?: string
}

export function makeItemHandlers(table: string, entityType: string, opts: ItemOptions) {
  const uniqueMessage = opts.uniqueMessage ?? 'Já existe um registro com esse nome.'

  async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { supabase, userId, role } = await getAuth()
    if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para editar cadastros' }, { status: 403 })

    const body = (await request.json()) as Record<string, unknown>
    const updates = pick(body, opts.fields)
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    const { data: oldData } = await supabase.from(table).select('*').eq('id', id).single()
    const { error } = await supabase
      .from(table)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: friendlyError(error, uniqueMessage) }, { status: 400 })

    await audit(supabase, userId, 'update', entityType, id, oldData ?? null, updates)
    return NextResponse.json({ success: true })
  }

  async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { supabase, userId, role } = await getAuth()
    if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    if (role !== 'admin') return NextResponse.json({ error: 'Apenas admin pode excluir cadastros' }, { status: 403 })

    const { data: oldData } = await supabase.from(table).select('*').eq('id', id).single()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await audit(supabase, userId, 'delete', entityType, id, oldData ?? null, null)
    return NextResponse.json({ success: true })
  }

  return { PATCH, DELETE }
}
