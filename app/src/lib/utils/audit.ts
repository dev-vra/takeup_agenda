import { createClient } from '@/lib/supabase/server'

export async function logAudit(
  userId: string,
  action: 'create' | 'update' | 'delete',
  entityType: string,
  entityId: string,
  oldValues?: object,
  newValues?: object
) {
  const supabase = await createClient()
  await supabase.from('audit_log').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues || null,
    new_values: newValues || null,
  })
}
