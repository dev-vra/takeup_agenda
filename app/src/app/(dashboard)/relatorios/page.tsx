import { createClient } from '@/lib/supabase/server'
import { RelatoriosList } from '@/components/reports/relatorios-list'
import { MOCK_REPORTS, MOCK_CONTRACTS } from '@/lib/mock-data'

export default async function RelatoriosPage({
  searchParams
}: {
  searchParams: Promise<{ active?: string; contract?: string; search?: string }>
}) {
  const { active, contract } = await searchParams

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const showInactive = active === 'false'
    const mockContracts = MOCK_CONTRACTS.map(c => ({ id: c.id, contract_number: c.contract_number }))
    const reports = MOCK_REPORTS
      .filter(r => r.is_active !== showInactive)
      .filter(r => !contract || r.related_contract_id === contract)
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <RelatoriosList reports={reports as any} contracts={mockContracts} showInactive={showInactive} />
      </div>
    )
  }

  const supabase = await createClient()
  const showInactive = active === 'false'
  let query = supabase
    .from('reports')
    .select('*, contract:related_contract_id(id,contract_number,seller:seller_id(name),buyer:buyer_id(name)), creator:created_by(name)')
    .eq('is_active', !showInactive)
    .order('created_at', { ascending: false })
  if (contract) query = query.eq('related_contract_id', contract)
  const { data: reports } = await query.limit(50)
  const { data: contracts } = await supabase.from('contracts').select('id,contract_number').eq('is_active', true).order('contract_number')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <RelatoriosList reports={reports || []} contracts={contracts || []} showInactive={showInactive} />
    </div>
  )
}
