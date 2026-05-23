import { createClient } from '@/lib/supabase/server'
import { NovaAgendaForm } from '@/components/agenda/nova-agenda-form'
import { MOCK_CONTRACTS, MOCK_ANALYSES } from '@/lib/mock-data'

export default async function NovaAgendaPage() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const activeStatuses = ['aguardando_hvi','aguardando_aprovacao_hvi','hvi_aprovado','takeup_agendado','takeup_reagendado','takeup_finalizado']
    const analyses = MOCK_ANALYSES.filter(a => activeStatuses.includes(a.status))
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <NovaAgendaForm contracts={MOCK_CONTRACTS as any} analyses={analyses as any} />
      </div>
    )
  }

  const supabase = await createClient()
  const [{ data: contractsRaw }, { data: analyses }] = await Promise.all([
    supabase.from('contracts').select('id,contract_number,seller:seller_id(name),buyer:buyer_id(name)').eq('is_active', true).order('contract_number'),
    supabase.from('analyses').select('id,status,contract:contract_id(contract_number),installment:installment_id(reference_month)')
      .not('status', 'in', '(finalizada,analise_interrompida,takeup_cancelado)').order('created_at', { ascending: false }).limit(50),
  ])
  const contracts = (contractsRaw || []).map(c => ({
    ...c,
    seller: Array.isArray(c.seller) ? (c.seller[0] || { name: '' }) : (c.seller || { name: '' }),
    buyer: Array.isArray(c.buyer) ? (c.buyer[0] || { name: '' }) : (c.buyer || { name: '' }),
  }))
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <NovaAgendaForm contracts={contracts as any} analyses={analyses as any || []} />
    </div>
  )
}
