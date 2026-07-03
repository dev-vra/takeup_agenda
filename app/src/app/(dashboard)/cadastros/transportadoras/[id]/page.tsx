import { getDetailData } from '@/lib/partners/server'
import { PartnerDetailClient } from '@/components/cadastros/partner-detail-client'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { config, item, canWrite, isAdmin, currentUserId } = await getDetailData('transportadoras', id)
  return (
    <PartnerDetailClient
      config={config}
      item={item as never}
      canWrite={canWrite}
      isAdmin={isAdmin}
      currentUserId={currentUserId}
    />
  )
}
