import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ContratoDetalhe } from '@/components/contracts/contrato-detalhe'
import { getMockContractById, getMockAnalysesByContractId } from '@/lib/mock-data'

export default async function ContratoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const contract = getMockContractById(id)
    if (!contract) notFound()
    const analyses = getMockAnalysesByContractId(id)
    // Attach analyses to each installment
    const enrichedContract = {
      ...contract,
      installments: (contract.installments || []).map(inst => ({
        ...inst,
        analyses: analyses.filter(a => a.installment_id === inst.id),
      })),
    }
    return <ContratoDetalhe contract={enrichedContract as any} />
  }

  const supabase = await createClient()
  const { data: contract } = await supabase
    .from('contracts')
    .select(`*, seller:seller_id(id,name,document,city,state), buyer:buyer_id(id,name,document,city,state,country),
      installments:contract_installments(id,reference_month,scheduled_quantity,delivered_quantity,remaining_quantity,due_date,status,
        analyses(id,status,hvi_received_date,hvi_approved,takeup_scheduled_date,takeup_actual_date,approved_tons,takeup_reschedule_count,created_at))`)
    .eq('id', id).single()

  if (!contract) notFound()
  return <ContratoDetalhe contract={contract as any} />
}
