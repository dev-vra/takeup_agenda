import { getListData } from '@/lib/partners/server'
import { PartnerListClient } from '@/components/cadastros/partner-list-client'

export default async function Page() {
  const { config, items, canWrite } = await getListData('produtores')
  return <PartnerListClient config={config} items={items as never} canWrite={canWrite} />
}
