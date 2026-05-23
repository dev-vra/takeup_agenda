import { createClient } from '@/lib/supabase/server'
import { NovaAnaliseWizard } from '@/components/analyses/nova-analise-wizard'
import { MOCK_CONTRACTS } from '@/lib/mock-data'

const MOCK_RESPONSIBLES = [
  { name: 'Drielle', type: 'hvi' as const },
  { name: 'Diogo', type: 'takeup' as const },
  { name: 'Alice e Amanda', type: 'takeup' as const },
  { name: 'Raphaela', type: 'hvi' as const },
  { name: 'Raiane', type: 'hvi' as const },
  { name: 'Gabriela', type: 'geral' as const },
]

export default async function NovaAnalisePage({
  searchParams
}: {
  searchParams: Promise<{ contract?: string; installment?: string }>
}) {
  const { contract: contractId, installment: installmentId } = await searchParams

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <NovaAnaliseWizard
          contracts={MOCK_CONTRACTS as any}
          responsibles={MOCK_RESPONSIBLES}
          preselectedContractId={contractId}
          preselectedInstallmentId={installmentId}
        />
      </div>
    )
  }

  const supabase = await createClient()
  const { data: contractsRaw } = await supabase
    .from('contracts')
    .select('id,contract_number,reference,seller:seller_id(name),buyer:buyer_id(name),installments:contract_installments(id,reference_month,scheduled_quantity,remaining_quantity,due_date,status)')
    .eq('is_active', true)
    .order('contract_number')

  const contracts = (contractsRaw || []).map(c => ({
    ...c,
    seller: Array.isArray(c.seller) ? (c.seller[0] || { name: '' }) : (c.seller || { name: '' }),
    buyer: Array.isArray(c.buyer) ? (c.buyer[0] || { name: '' }) : (c.buyer || { name: '' }),
  }))

  const { data: responsibles } = await supabase.from('known_responsibles').select('name,type').order('name')

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <NovaAnaliseWizard
        contracts={contracts as any}
        responsibles={responsibles || []}
        preselectedContractId={contractId}
        preselectedInstallmentId={installmentId}
      />
    </div>
  )
}
