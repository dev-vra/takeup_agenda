import { makeItemHandlers } from '@/lib/partners/crud'
import { PARTNER_CONFIGS, apiFields } from '@/lib/partners/config'

const cfg = PARTNER_CONFIGS.produtores

export const { PATCH, DELETE } = makeItemHandlers(cfg.table, cfg.entityType, {
  fields: apiFields(cfg),
  uniqueMessage: cfg.uniqueMessage,
})
