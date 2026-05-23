import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RelatorioViewer } from '@/components/reports/relatorio-viewer'

export default async function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: report } = await supabase
    .from('reports')
    .select('*, contract:related_contract_id(contract_number,seller:seller_id(name),buyer:buyer_id(name)), creator:created_by(name)')
    .eq('id', id)
    .single()

  if (!report) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <RelatorioViewer report={report as any} />
    </div>
  )
}
