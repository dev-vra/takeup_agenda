import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PARTNER_CONFIGS } from './config'

async function roleAndUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let role: string | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = data?.role ?? 'leitor'
  }
  return { supabase, user, role }
}

const canWriteRole = (role: string | null) => role === 'admin' || role === 'consultor'

export async function getListData(slug: string) {
  const config = PARTNER_CONFIGS[slug]
  if (!config) notFound()
  const { supabase, role } = await roleAndUser()
  const { data } = await supabase.from(config.table).select('*').order('name', { ascending: true })
  return { config, items: data ?? [], canWrite: canWriteRole(role) }
}

export async function getDetailData(slug: string, id: string) {
  const config = PARTNER_CONFIGS[slug]
  if (!config) notFound()
  const { supabase, user, role } = await roleAndUser()

  const { data: item } = await supabase.from(config.table).select('*').eq('id', id).single()
  if (!item) notFound()

  let contracts
  if (config.hasContracts) {
    const col = config.hasContracts === 'seller' ? 'seller_id' : 'buyer_id'
    const { data } = await supabase
      .from('contracts')
      .select('id,contract_number,reference,total_quantity,total_takeup,is_active')
      .eq(col, id)
      .order('created_at', { ascending: false })
    contracts = data ?? []
  }

  return {
    config,
    item,
    contracts,
    canWrite: canWriteRole(role),
    isAdmin: role === 'admin',
    currentUserId: user?.id,
  }
}
