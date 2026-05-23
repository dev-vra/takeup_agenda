import { createClient } from '@/lib/supabase/server'
import { AgendaDashboard } from '@/components/agenda/agenda-dashboard'
import {
  MOCK_AGENDA_ENTRIES, MOCK_ANALYSES, MOCK_NOTIFICATIONS,
  getMockAgendaKpis,
} from '@/lib/mock-data'

export default async function AgendaPage() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = MOCK_AGENDA_ENTRIES.filter(e => e.scheduled_date === today)
    const overdueAnalyses = MOCK_ANALYSES.filter(a =>
      ['takeup_reagendado','takeup_agendado','aguardando_aprovacao_hvi'].includes(a.status) &&
      a.takeup_scheduled_date && a.takeup_scheduled_date < today
    )
    const upcomingAnalyses = MOCK_ANALYSES.filter(a =>
      ['takeup_agendado','takeup_reagendado'].includes(a.status) &&
      a.takeup_scheduled_date && a.takeup_scheduled_date >= today
    )
    const overdueInstallments = MOCK_ANALYSES
      .flatMap(a => a.installment ? [{ ...a.installment, contract: a.contract }] : [])
      .filter(i => i.status === 'atrasada')
      .slice(0, 5)
    const recentComments = MOCK_ANALYSES.flatMap(a =>
      (a.comments || []).map(c => ({ ...c, analysis: { id: a.id, status: a.status, contract: a.contract } }))
    ).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5)

    const OPEN_STATUSES = [
      'aguardando_hvi', 'aguardando_aprovacao_hvi', 'hvi_aprovado',
      'takeup_agendado', 'takeup_reagendado', 'takeup_finalizado',
    ]
    const openAnalyses = MOCK_ANALYSES.filter(a => OPEN_STATUSES.includes(a.status))

    return (
      <AgendaDashboard
        todayEntries={todayEntries}
        overdueAnalyses={overdueAnalyses}
        upcomingAnalyses={upcomingAnalyses}
        overdueInstallments={overdueInstallments as any}
        recentComments={recentComments as any}
        kpis={getMockAgendaKpis()}
        openAnalyses={openAnalyses as any}
      />
    )
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: todayEntries },
    { data: overdueAnalyses },
    { data: upcomingAnalyses },
    { data: overdueInstallments },
    { data: recentComments },
  ] = await Promise.all([
    supabase.from('agenda_entries')
      .select('*, analysis:related_analysis_id(id,status,contract:contract_id(contract_number,seller:seller_id(name),buyer:buyer_id(name))), contract:related_contract_id(contract_number)')
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true }),
    supabase.from('analyses')
      .select('*, contract:contract_id(contract_number,seller:seller_id(name),buyer:buyer_id(name)), installment:installment_id(reference_month,scheduled_quantity)')
      .in('status', ['takeup_reagendado', 'takeup_agendado', 'aguardando_aprovacao_hvi'])
      .lt('takeup_scheduled_date', today)
      .order('takeup_scheduled_date', { ascending: true })
      .limit(10),
    supabase.from('analyses')
      .select('*, contract:contract_id(contract_number,seller:seller_id(name),buyer:buyer_id(name)), installment:installment_id(reference_month,scheduled_quantity)')
      .in('status', ['takeup_agendado', 'takeup_reagendado'])
      .gte('takeup_scheduled_date', today)
      .order('takeup_scheduled_date', { ascending: true })
      .limit(10),
    supabase.from('contract_installments')
      .select('*, contract:contract_id(contract_number,seller:seller_id(name),buyer:buyer_id(name))')
      .eq('status', 'pendente')
      .lte('due_date', new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(10),
    supabase.from('analysis_comments')
      .select('*, creator:created_by(name), analysis:analysis_id(id,status,contract:contract_id(contract_number))')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const { count: totalActiveAnalyses } = await supabase
    .from('analyses').select('*', { count: 'exact', head: true })
    .not('status', 'in', '(finalizada,analise_interrompida,takeup_cancelado)')
  const { count: finishedThisMonth } = await supabase
    .from('analyses').select('*', { count: 'exact', head: true })
    .eq('status', 'finalizada')
    .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  const { data: tonsApproved } = await supabase
    .from('analyses').select('approved_tons')
    .eq('status', 'finalizada')
    .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  const totalTonsThisMonth = tonsApproved?.reduce((acc, a) => acc + (a.approved_tons || 0), 0) || 0

  const { data: openAnalysesData } = await supabase
    .from('analyses')
    .select('*, contract:contract_id(contract_number,seller:seller_id(name),buyer:buyer_id(name))')
    .not('status', 'in', '(finalizada,analise_interrompida,takeup_cancelado)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AgendaDashboard
      todayEntries={todayEntries || []}
      overdueAnalyses={overdueAnalyses || []}
      upcomingAnalyses={upcomingAnalyses || []}
      overdueInstallments={overdueInstallments || []}
      recentComments={recentComments || []}
      kpis={{
        activeAnalyses: totalActiveAnalyses || 0,
        finishedThisMonth: finishedThisMonth || 0,
        totalTonsThisMonth,
        todayCount: todayEntries?.length || 0,
      }}
      openAnalyses={openAnalysesData || []}
    />
  )
}
