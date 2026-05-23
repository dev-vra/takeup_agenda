import { createClient } from '@/lib/supabase/server'
import { GerarRelatorio } from '@/components/reports/gerar-relatorio'
import { MOCK_CONTRACTS, MOCK_ANALYSES } from '@/lib/mock-data'

export default async function GerarRelatorioPage() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const contracts = MOCK_CONTRACTS.map(c => ({ id: c.id, contract_number: c.contract_number, seller: c.seller, buyer: c.buyer }))
    const analyses = MOCK_ANALYSES.map(a => ({ id: a.id, status: a.status, contract: a.contract, installment: a.installment }))
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <GerarRelatorio contracts={contracts as any} analyses={analyses as any} />
      </div>
    )
  }

  const supabase = await createClient()
  const [{ data: contracts }, { data: analyses }] = await Promise.all([
    supabase.from('contracts').select('id,contract_number,seller:seller_id(name),buyer:buyer_id(name)').eq('is_active', true).order('contract_number'),
    supabase.from('analyses').select('id,status,contract:contract_id(contract_number),installment:installment_id(reference_month)').order('created_at', { ascending: false }).limit(100),
  ])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <GerarRelatorio contracts={contracts || []} analyses={analyses || []} />
    </div>
  )
}
