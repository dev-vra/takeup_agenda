import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AgendaEntryDetalhe } from '@/components/agenda/agenda-entry-detalhe'
import { getMockAgendaEntryById } from '@/lib/mock-data'

export default async function AgendaEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const entry = getMockAgendaEntryById(id)
    if (!entry) notFound()
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <AgendaEntryDetalhe entry={entry as any} comments={[]} currentUserId="mock-admin" />
      </div>
    )
  }

  const supabase = await createClient()
  const [{ data: entry }, { data: commentsData }, { data: { user } }] = await Promise.all([
    supabase
      .from('agenda_entries')
      .select('*, creator:created_by(name), analysis:related_analysis_id(id,status,contract:contract_id(contract_number,seller:seller_id(name),buyer:buyer_id(name)),installment:installment_id(reference_month)), contract:related_contract_id(contract_number)')
      .eq('id', id).single(),
    supabase
      .from('agenda_comments').select('*, creator:created_by(name)').eq('agenda_entry_id', id).order('created_at', { ascending: true }),
    supabase.auth.getUser(),
  ])

  if (!entry) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <AgendaEntryDetalhe entry={entry as any} comments={commentsData as any || []} currentUserId={user?.id} />
    </div>
  )
}
