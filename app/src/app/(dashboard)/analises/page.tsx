import { createClient } from '@/lib/supabase/server'
import { AnalisesList } from '@/components/analyses/analises-list'
import { getMockAnalysesByStatus } from '@/lib/mock-data'

export default async function AnalisesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; search?: string; from?: string; to?: string }>
}) {
  const { status, search } = await searchParams

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const analyses = getMockAnalysesByStatus(status, search)
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <AnalisesList analyses={analyses as any} />
      </div>
    )
  }

  const supabase = await createClient()
  const { from, to } = await searchParams

  let query = supabase
    .from('analyses')
    .select(`*, contract:contract_id(id,contract_number,reference,seller:seller_id(name,city),buyer:buyer_id(name,city,country)),
      installment:installment_id(id,reference_month,scheduled_quantity)`)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)
  if (search) query = query.or(`hvi_responsible.ilike.%${search}%,takeup_responsible.ilike.%${search}%,hvi_observation.ilike.%${search}%`)

  const { data: analyses } = await query.limit(100)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AnalisesList analyses={analyses || []} />
    </div>
  )
}
