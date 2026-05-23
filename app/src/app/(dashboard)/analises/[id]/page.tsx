import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AnaliseDetalhe } from '@/components/analyses/analise-detalhe'
import { getMockAnalysisById, MOCK_USER } from '@/lib/mock-data'

const MOCK_RESPONSIBLES = [
  { name: 'Drielle', type: 'hvi' as const },
  { name: 'Diogo', type: 'takeup' as const },
  { name: 'Alice e Amanda', type: 'takeup' as const },
  { name: 'Raphaela', type: 'hvi' as const },
  { name: 'Raiane', type: 'hvi' as const },
  { name: 'Gabriela', type: 'geral' as const },
]

export default async function AnaliseDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const analysis = getMockAnalysisById(id)
    if (!analysis) notFound()
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <AnaliseDetalhe
          analysis={analysis as any}
          responsibles={MOCK_RESPONSIBLES}
          currentUserId={MOCK_USER.id}
        />
      </div>
    )
  }

  const supabase = await createClient()
  const [{ data: analysis }, { data: responsibles }, { data: user }] = await Promise.all([
    supabase.from('analyses').select(`
      *, contract:contract_id(id,contract_number,reference,seller:seller_id(name),buyer:buyer_id(name)),
      installment:installment_id(id,reference_month,scheduled_quantity,remaining_quantity,due_date),
      comments:analysis_comments(*, creator:created_by(name)),
      reschedules:takeup_reschedules(*, creator:created_by(name))
    `).eq('id', id).single(),
    supabase.from('known_responsibles').select('name,type').order('name'),
    supabase.auth.getUser(),
  ])

  if (!analysis) notFound()
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AnaliseDetalhe analysis={analysis as any} responsibles={responsibles || []} currentUserId={user.user?.id} />
    </div>
  )
}
