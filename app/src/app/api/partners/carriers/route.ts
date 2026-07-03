import { makeCollectionHandlers } from '@/lib/partners/crud'
import { PARTNER_CONFIGS, apiFields } from '@/lib/partners/config'

const cfg = PARTNER_CONFIGS.transportadoras

export const { GET, POST } = makeCollectionHandlers(cfg.table, cfg.entityType, {
  fields: apiFields(cfg),
  requiredFields: ['name'],
  searchColumns: cfg.searchColumns,
  orderBy: { column: 'name', ascending: true },
  uniqueMessage: cfg.uniqueMessage,
})
