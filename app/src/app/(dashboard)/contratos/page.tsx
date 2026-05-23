import { createClient } from '@/lib/supabase/server'
import { ContratosDashboard } from '@/components/contracts/contratos-dashboard'
import { MOCK_CONTRACTS, getMockContractKpis, getMockAnalysesByContract } from '@/lib/mock-data'

export default async function ContratosPage() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return (
      <ContratosDashboard
        contracts={MOCK_CONTRACTS as any}
        analysesByContract={getMockAnalysesByContract()}
        kpis={getMockContractKpis()}
      />
    )
  }

  const supabase = await createClient()
  const [{ data: contracts }, { data: installmentStats }] = await Promise.all([
    supabase.from('contracts')
      .select(`*, seller:seller_id(id,name,city,state), buyer:buyer_id(id,name,city,country),
        installments:contract_installments(id,reference_month,scheduled_quantity,delivered_quantity,remaining_quantity,due_date,status)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase.from('analyses').select('contract_id, status, approved_tons').not('status', 'in', '(analise_interrompida)'),
  ])

  const totalContracts = contracts?.length || 0
  const totalTons = contracts?.reduce((s, c) => s + (c.total_quantity || 0), 0) || 0
  const totalTakeup = contracts?.reduce((s, c) => s + (c.total_takeup || 0), 0) || 0
  const balancePending = contracts?.reduce((s, c) => s + (c.balance_pending || 0), 0) || 0

  const analysesByContract: Record<string, { total: number; finished: number; interrupted: number }> = {}
  for (const a of (installmentStats || [])) {
    if (!analysesByContract[a.contract_id]) analysesByContract[a.contract_id] = { total: 0, finished: 0, interrupted: 0 }
    analysesByContract[a.contract_id].total++
    if (a.status === 'finalizada') analysesByContract[a.contract_id].finished++
    if (a.status === 'analise_interrompida') analysesByContract[a.contract_id].interrupted++
  }

  return (
    <ContratosDashboard
      contracts={contracts || []}
      analysesByContract={analysesByContract}
      kpis={{ totalContracts, totalTons, totalTakeup, balancePending }}
    />
  )
}
