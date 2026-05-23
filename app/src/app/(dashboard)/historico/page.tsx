import { createClient } from '@/lib/supabase/server'
import { HistoricoPage } from '@/components/historico/historico-page'

export const metadata = { title: 'Histórico de Atividades' }

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export default async function HistoricoRoute() {
  let logs: unknown[] = []
  let contracts: { id: string; contract_number: string }[] = []

  if (USE_MOCK) {
    const { MOCK_AUDIT_LOGS, MOCK_AUDIT_CONTRACTS } = await import('@/lib/mock-audit-data')
    logs = MOCK_AUDIT_LOGS
    contracts = MOCK_AUDIT_CONTRACTS
  } else {
    try {
      const supabase = await createClient()
      const [logsRes, contractsRes] = await Promise.all([
        supabase
          .from('audit_log')
          .select('*, user:user_id(name, email)')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('contracts')
          .select('id, contract_number')
          .eq('is_active', true)
          .order('contract_number'),
      ])
      logs = logsRes.data || []
      contracts = contractsRes.data || []
    } catch {
      logs = []
      contracts = []
    }
  }

  return <HistoricoPage logs={logs as any[]} contracts={contracts} />
}
