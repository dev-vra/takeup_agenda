import { makeItemHandlers } from '@/lib/partners/crud'
import { PARTNER_CONFIGS, apiFields } from '@/lib/partners/config'

const cfg = PARTNER_CONFIGS.compradores

export const { PATCH, DELETE } = makeItemHandlers(cfg.table, cfg.entityType, {
  fields: apiFields(cfg),
  uniqueMessage: cfg.uniqueMessage,
})
