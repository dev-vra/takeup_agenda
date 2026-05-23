import type { AuditEntry } from '@/components/historico/historico-page'

const GABRIELA = { name: 'Gabriela Ferreira', email: 'gabriela@laferlins.com.br' }

export const MOCK_AUDIT_CONTRACTS = [
  { id: '30000000-0000-0000-0001-000000000000', contract_number: 'AG-26367/10' },
  { id: '30000000-0000-0000-0005-000000000000', contract_number: 'AG-26657/10' },
  { id: '30000000-0000-0000-0009-000000000000', contract_number: 'AG-27148/10' },
  { id: '30000000-0000-0000-0013-000000000000', contract_number: 'AG-27624/10' },
  { id: '30000000-0000-0000-0014-000000000000', contract_number: 'AG-27629/10' },
]

export const MOCK_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'a001', action: 'create', entity_type: 'analysis', entity_id: 'ana-019',
    new_values: { status: 'aguardando_hvi', contract: 'AG-27661/10', parcela: 'Set/25' },
    user: GABRIELA, created_at: '2026-05-22T08:05:00Z',
  },
  {
    id: 'a002', action: 'update', entity_type: 'analysis', entity_id: 'ana-016',
    old_values: { status: 'aguardando_hvi', hvi_observation: null },
    new_values: { status: 'aguardando_aprovacao_hvi', hvi_observation: 'Amostra recebida. Aguardando laudo final do laboratorio.' },
    user: GABRIELA, created_at: '2026-05-21T14:00:00Z',
  },
  {
    id: 'a003', action: 'update', entity_type: 'analysis', entity_id: 'ana-014',
    old_values: { status: 'aguardando_hvi' },
    new_values: { status: 'aguardando_aprovacao_hvi', hvi_received_date: '2026-05-19', hvi_responsible: 'Drielle' },
    user: GABRIELA, created_at: '2026-05-19T08:30:00Z',
  },
  {
    id: 'a004', action: 'update', entity_type: 'analysis', entity_id: 'ana-017',
    old_values: { status: 'takeup_agendado', takeup_scheduled_date: '2026-05-15' },
    new_values: { status: 'takeup_reagendado', takeup_scheduled_date: '2026-05-27', takeup_reschedule_count: 1 },
    user: GABRIELA, created_at: '2026-05-15T16:00:00Z',
  },
  {
    id: 'a005', action: 'update', entity_type: 'analysis', entity_id: 'ana-013',
    old_values: { status: 'aguardando_aprovacao_hvi', hvi_approved: null },
    new_values: { status: 'hvi_aprovado', hvi_approved: true, hvi_approval_date: '2026-05-13' },
    user: GABRIELA, created_at: '2026-05-13T14:00:00Z',
  },
  {
    id: 'a006', action: 'update', entity_type: 'analysis', entity_id: 'ana-012',
    old_values: { status: 'hvi_aprovado' },
    new_values: { status: 'takeup_agendado', takeup_scheduled_date: '2026-05-29', takeup_responsible: 'Raphaela' },
    user: GABRIELA, created_at: '2026-05-10T15:00:00Z',
  },
  {
    id: 'a007', action: 'update', entity_type: 'analysis', entity_id: 'ana-011',
    old_values: { status: 'hvi_aprovado' },
    new_values: { status: 'takeup_agendado', takeup_scheduled_date: '2026-05-28', takeup_responsible: 'Alice e Amanda' },
    user: GABRIELA, created_at: '2026-05-07T16:00:00Z',
  },
  {
    id: 'a008', action: 'create', entity_type: 'analysis', entity_id: 'ana-011',
    new_values: { status: 'aguardando_hvi', contract: 'AG-26657/10', parcela: 'Dez/25' },
    user: GABRIELA, created_at: '2026-05-05T08:00:00Z',
  },
  {
    id: 'a009', action: 'update', entity_type: 'analysis', entity_id: 'ana-010',
    old_values: { status: 'takeup_agendado', takeup_actual_date: null },
    new_values: { status: 'finalizada', takeup_actual_date: '2026-05-12', approved_tons: 198.0, final_observation: 'Exportacao indireta. Lote Out/25 aprovado.' },
    user: GABRIELA, created_at: '2026-05-14T16:00:00Z',
  },
  {
    id: 'a010', action: 'update', entity_type: 'analysis', entity_id: 'ana-009',
    old_values: { status: 'takeup_agendado' },
    new_values: { status: 'finalizada', approved_tons: 985.0, report_delivery_date: '2026-05-07' },
    user: GABRIELA, created_at: '2026-05-07T17:00:00Z',
  },
  {
    id: 'a011', action: 'update', entity_type: 'analysis', entity_id: 'ana-008',
    old_values: { status: 'takeup_agendado' },
    new_values: { status: 'finalizada', approved_tons: 298.0, final_observation: 'Cavalca - lote Dez/25. TakeUp finalizado.' },
    user: GABRIELA, created_at: '2026-05-10T15:00:00Z',
  },
  {
    id: 'a012', action: 'update', entity_type: 'analysis', entity_id: 'ana-018',
    old_values: { status: 'aguardando_aprovacao_hvi', hvi_approved: null },
    new_values: { status: 'analise_interrompida', hvi_approved: false, hvi_rejection_reason: 'HVI reprovado - micronaire fora do padrao contratual (acima de 4.9).' },
    user: GABRIELA, created_at: '2026-03-15T11:00:00Z',
  },
  {
    id: 'a013', action: 'update', entity_type: 'contract', entity_id: 'c-005',
    old_values: { responsible: 'Diogo', observation: null },
    new_values: { responsible: 'Diogo e Alice', observation: 'Contrato prioritario - OLAM exige entrega antes de Jun/26.' },
    user: GABRIELA, created_at: '2026-05-03T10:00:00Z',
  },
  {
    id: 'a014', action: 'create', entity_type: 'report', entity_id: 'rep-001',
    new_values: { title: 'Relatório AG-26657/10 — Mai/26', report_type: 'contrato' },
    user: GABRIELA, created_at: '2026-05-02T15:30:00Z',
  },
  {
    id: 'a015', action: 'update', entity_type: 'agenda', entity_id: 'ag-003',
    old_values: { scheduled_date: '2026-05-15', status: 'pendente' },
    new_values: { scheduled_date: '2026-05-27', status: 'pendente' },
    user: GABRIELA, created_at: '2026-05-15T16:05:00Z',
  },
  {
    id: 'a016', action: 'create', entity_type: 'agenda', entity_id: 'ag-001',
    new_values: { title: 'TakeUp AG-26657/10 - OLAM Dez/25', scheduled_date: '2026-05-28', entry_type: 'takeup' },
    user: GABRIELA, created_at: '2026-05-07T17:05:00Z',
  },
  {
    id: 'a017', action: 'create', entity_type: 'contract', entity_id: 'c-022',
    new_values: { contract_number: 'AG-27668/10', seller: 'WILSON ROMAGNOLI E OUTRO', buyer: 'ADM DO BRASIL LTDA', total_quantity: 500 },
    user: GABRIELA, created_at: '2026-04-10T09:00:00Z',
  },
  {
    id: 'a018', action: 'create', entity_type: 'contract', entity_id: 'c-021',
    new_values: { contract_number: 'AG-27667/10', seller: 'WILSON ROMAGNOLI E OUTRO', buyer: 'ADM DO BRASIL LTDA', total_quantity: 500 },
    user: GABRIELA, created_at: '2026-04-10T08:55:00Z',
  },
  {
    id: 'a019', action: 'update', entity_type: 'contract', entity_id: 'c-009',
    old_values: { quality_spec: '2.5/40.0/28.0/34.0/81.0' },
    new_values: { quality_spec: '2.5/40.0/28.5/34.0/81.0', observation: 'Ajuste de qualidade negociado com Paul Reinhart em 20/03.' },
    user: GABRIELA, created_at: '2026-03-20T14:00:00Z',
  },
  {
    id: 'a020', action: 'delete', entity_type: 'analysis', entity_id: 'ana-old',
    old_values: { status: 'aguardando_hvi', contract: 'AG-26426/10', created_at: '2026-02-15' },
    user: GABRIELA, created_at: '2026-02-20T11:00:00Z',
  },
  {
    id: 'a021', action: 'update', entity_type: 'analysis', entity_id: 'ana-007',
    old_values: { status: 'takeup_agendado' },
    new_values: { status: 'finalizada', approved_tons: 397.0, report_delivery_date: '2025-09-12' },
    user: GABRIELA, created_at: '2025-09-12T16:00:00Z',
  },
  {
    id: 'a022', action: 'create', entity_type: 'analysis', entity_id: 'ana-001',
    new_values: { status: 'aguardando_hvi', contract: 'AG-26367/10', parcela: 'Set/25' },
    user: GABRIELA, created_at: '2025-09-02T08:30:00Z',
  },
]
