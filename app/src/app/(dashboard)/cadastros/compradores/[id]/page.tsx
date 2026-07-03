import { getDetailData } from '@/lib/partners/server'
import { PartnerDetailClient } from '@/components/cadastros/partner-detail-client'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { config, item, contracts, canWrite, isAdmin, currentUserId } = await getDetailData('compradores', id)
  return (
    <PartnerDetailClient
      config={config}
      item={item as never}
      contracts={contracts as never}
      canWrite={canWrite}
      isAdmin={isAdmin}
      currentUserId={currentUserId}
    />
  )
}
