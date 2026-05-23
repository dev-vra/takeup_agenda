import type {
  Profile, Seller, Buyer, Contract, ContractInstallment,
  Analysis, AgendaEntry, Notification, Report
} from '@/types'

export const MOCK_USER: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Gabriela Ferreira',
  email: 'gabriela@laferlins.com.br',
  role: 'admin',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const MOCK_SELLERS: Seller[] = [
  { id: '10000000-0000-0000-0001-000000000000', name: 'AGROPECUARIA BONFIM', document: '12.345.678/0001-90', city: 'Sorriso', state: 'MT', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '10000000-0000-0000-0002-000000000000', name: 'FAZENDA SANTA RITA', document: '98.765.432/0001-10', city: 'Primavera do Leste', state: 'MT', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '10000000-0000-0000-0003-000000000000', name: 'GRAOS DO CERRADO', document: '55.123.456/0001-77', city: 'Rondonopolis', state: 'MT', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '10000000-0000-0000-0004-000000000000', name: 'COTTONBRASIL AGRO', document: '33.987.654/0001-22', city: 'Cuiaba', state: 'MT', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
]

export const MOCK_BUYERS: Buyer[] = [
  { id: '20000000-0000-0000-0001-000000000000', name: 'LOUIS DREYFUS', document: '', city: 'Sao Paulo', state: 'SP', country: 'Brasil', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '20000000-0000-0000-0002-000000000000', name: 'CARGILL AGRICOLA', document: '', city: 'Sao Paulo', state: 'SP', country: 'Brasil', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '20000000-0000-0000-0003-000000000000', name: 'TOYAMA COTTON', document: '', city: 'Osaka', state: '', country: 'Japao', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '20000000-0000-0000-0004-000000000000', name: 'OLAM INTERNATIONAL', document: '', city: 'Singapura', state: '', country: 'Singapura', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '20000000-0000-0000-0005-000000000000', name: 'BUNGE ALGODAO', document: '', city: 'Campinas', state: 'SP', country: 'Brasil', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '20000000-0000-0000-0006-000000000000', name: 'DUNAVANT ENTERPRISES', document: '', city: 'Memphis', state: 'TN', country: 'EUA', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '20000000-0000-0000-0007-000000000000', name: 'NIDERA COMMODITIES', document: '', city: 'Rotterdam', state: '', country: 'Holanda', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
]

function makeInstallments(contractId: string, months: {month: string; qty: number}[], deliveredMap: Record<string, number> = {}): ContractInstallment[] {
  return months.filter(m => m.qty > 0).map((m, i) => {
    const delivered = deliveredMap[m.month] || 0
    const remaining = m.qty - delivered
    const now = new Date().toISOString().split('T')[0]
    const due = m.month.substring(0, 7) + '-28'
    let status: ContractInstallment['status'] = 'pendente'
    if (delivered >= m.qty) status = 'concluida'
    else if (delivered > 0) status = 'em_andamento'
    else if (due < now) status = 'atrasada'
    return {
      id: `inst-${contractId.slice(-8, -4)}-${String(i).padStart(2,'0')}`,
      contract_id: contractId,
      reference_month: m.month,
      scheduled_quantity: m.qty,
      delivered_quantity: delivered,
      remaining_quantity: remaining,
      due_date: due,
      status,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-05-01T00:00:00Z',
    }
  })
}

const Q13 = [200,200,200,200,200,200,200,100,100,100,100,100,100]
const Q13B = [300,300,300,300,200,200,200,200,200,200,200,200,200]
const Q13C = [100,100,100,100,100,100,0,0,100,100,100,100,0]
const Q13D = [500,500,500,500,500,400,400,400,300,300,300,300,300]
const Q13E = [150,150,150,150,150,150,0,0,150,150,0,0,150]
const Q13F = [0,0,0,250,250,250,250,250,250,250,250,250,250]
const Q13G = [100,100,100,100,100,0,100,100,0,0,0,0,0]
const MONTHS = ['2025-06-01','2025-07-01','2025-08-01','2025-09-01','2025-10-01','2025-11-01','2025-12-01','2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01']

const C1 = '30000000-0000-0000-0001-000000000000'
const C2 = '30000000-0000-0000-0002-000000000000'
const C3 = '30000000-0000-0000-0003-000000000000'
const C4 = '30000000-0000-0000-0004-000000000000'
const C5 = '30000000-0000-0000-0005-000000000000'
const C6 = '30000000-0000-0000-0006-000000000000'
const C7 = '30000000-0000-0000-0007-000000000000'

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: C1, contract_number: 'AG-26367/10', reference: '23P07345',
    seller_id: MOCK_SELLERS[0].id, buyer_id: MOCK_BUYERS[0].id,
    total_quantity: 2000, origin: 'MT-BRASIL', currency: 'US$', indexation: 'FIXO', price: 78.50, price_unit: 'Libra',
    terms: 'FOB', quality_spec: 'HVI 5/7 Cor 41-2, Mic 3.8-4.9, Res 28+, Uni 79+', contract_subtype: 'Exportacao',
    responsible: 'Drielle', observation: '',
    total_takeup: 800, balance_pending: 1200, is_active: true,
    created_at: '2025-01-15T10:00:00Z', updated_at: '2025-05-10T08:00:00Z', created_by: MOCK_USER.id,
    seller: MOCK_SELLERS[0], buyer: MOCK_BUYERS[0],
    installments: makeInstallments(C1, MONTHS.map((m,i) => ({month:m,qty:Q13[i]})), {'2025-06-01':200,'2025-07-01':200,'2025-08-01':200,'2025-09-01':200}),
  },
  {
    id: C2, contract_number: 'AG-26368/11', reference: '23P07346',
    seller_id: MOCK_SELLERS[1].id, buyer_id: MOCK_BUYERS[1].id,
    total_quantity: 3000, origin: 'MT-BRASIL', currency: 'US$', indexation: 'NYF DEC/2025 (150 ON)', price_unit: 'Libra',
    terms: 'CIP', quality_spec: 'HVI 4/7 Cor 31-3, Mic 3.5-4.9, Res 27+, Uni 78+', contract_subtype: 'Exportacao Indireta',
    responsible: 'Diogo', observation: 'Embarque por Santos',
    total_takeup: 1500, balance_pending: 1500, is_active: true,
    created_at: '2025-01-20T10:00:00Z', updated_at: '2025-05-12T08:00:00Z', created_by: MOCK_USER.id,
    seller: MOCK_SELLERS[1], buyer: MOCK_BUYERS[1],
    installments: makeInstallments(C2, MONTHS.map((m,i) => ({month:m,qty:Q13B[i]})), {'2025-06-01':300,'2025-07-01':300,'2025-08-01':300,'2025-09-01':300,'2025-10-01':200,'2025-11-01':100}),
  },
  {
    id: C3, contract_number: 'AG-26369/12', reference: '23P07347',
    seller_id: MOCK_SELLERS[2].id, buyer_id: MOCK_BUYERS[2].id,
    total_quantity: 1000, origin: 'MT-BRASIL', currency: 'US$', indexation: 'FIXO', price: 82.00, price_unit: 'Libra',
    terms: 'FOB', quality_spec: 'HVI 5/7 Cor 41-2, Mic 3.8-4.9, Res 29+, Uni 80+', contract_subtype: 'Exportacao',
    responsible: 'Alice e Amanda', observation: '',
    total_takeup: 500, balance_pending: 500, is_active: true,
    created_at: '2025-02-01T10:00:00Z', updated_at: '2025-05-15T08:00:00Z', created_by: MOCK_USER.id,
    seller: MOCK_SELLERS[2], buyer: MOCK_BUYERS[2],
    installments: makeInstallments(C3, MONTHS.map((m,i) => ({month:m,qty:Q13C[i]})), {'2025-06-01':100,'2025-07-01':100,'2025-08-01':100,'2025-09-01':100,'2025-10-01':100}),
  },
  {
    id: C4, contract_number: 'AG-26370/13', reference: '23P07348',
    seller_id: MOCK_SELLERS[3].id, buyer_id: MOCK_BUYERS[3].id,
    total_quantity: 5000, origin: 'MT-BRASIL', currency: 'US$', indexation: 'NYF MAR/2026 (200 ON)', price_unit: 'Libra',
    terms: 'CIF', quality_spec: 'HVI 4/7 Cor 31-3, Mic 3.5-5.2, Res 27+, Uni 77+', contract_subtype: 'Exportacao',
    responsible: 'Raphaela', observation: 'Pagamento via carta de credito',
    total_takeup: 1000, balance_pending: 4000, is_active: true,
    created_at: '2025-02-10T10:00:00Z', updated_at: '2025-05-10T08:00:00Z', created_by: MOCK_USER.id,
    seller: MOCK_SELLERS[3], buyer: MOCK_BUYERS[3],
    installments: makeInstallments(C4, MONTHS.map((m,i) => ({month:m,qty:Q13D[i]})), {'2025-06-01':500,'2025-07-01':500}),
  },
  {
    id: C5, contract_number: 'AG-26371/14', reference: '23P07349',
    seller_id: MOCK_SELLERS[0].id, buyer_id: MOCK_BUYERS[4].id,
    total_quantity: 1500, origin: 'MT-BRASIL', currency: 'R$', indexation: 'FIXO', price: 420.00, price_unit: 'Arroba',
    terms: 'CIP', quality_spec: 'HVI 5/5 Cor 41-3, Mic 3.8-4.9, Res 28+', contract_subtype: 'Mercado Interno',
    responsible: 'Raiane', observation: '',
    total_takeup: 750, balance_pending: 750, is_active: true,
    created_at: '2025-02-15T10:00:00Z', updated_at: '2025-05-08T08:00:00Z', created_by: MOCK_USER.id,
    seller: MOCK_SELLERS[0], buyer: MOCK_BUYERS[4],
    installments: makeInstallments(C5, MONTHS.map((m,i) => ({month:m,qty:Q13E[i]})), {'2025-06-01':150,'2025-07-01':150,'2025-08-01':150,'2025-09-01':150,'2025-10-01':150}),
  },
  {
    id: C6, contract_number: 'AG-26372/15', reference: '23P07350',
    seller_id: MOCK_SELLERS[1].id, buyer_id: MOCK_BUYERS[5].id,
    total_quantity: 2500, origin: 'BA-BRASIL', currency: 'US$', indexation: 'FIXO', price: 79.20, price_unit: 'Libra',
    terms: 'FOB', quality_spec: 'HVI 5/7 Cor 41-2, Mic 3.8-4.9', contract_subtype: 'Exportacao',
    responsible: 'Drielle', observation: 'Certificado de origem obrigatorio',
    total_takeup: 0, balance_pending: 2500, is_active: true,
    created_at: '2025-03-01T10:00:00Z', updated_at: '2025-05-01T08:00:00Z', created_by: MOCK_USER.id,
    seller: MOCK_SELLERS[1], buyer: MOCK_BUYERS[5],
    installments: makeInstallments(C6, MONTHS.map((m,i) => ({month:m,qty:Q13F[i]})), {}),
  },
  {
    id: C7, contract_number: 'AG-26373/16', reference: '23P07351',
    seller_id: MOCK_SELLERS[2].id, buyer_id: MOCK_BUYERS[6].id,
    total_quantity: 800, origin: 'MT-BRASIL', currency: 'US$', indexation: 'FIXO', price: 81.00, price_unit: 'Libra',
    terms: 'FOB', quality_spec: 'HVI 5/7 Cor 41-3, Mic 4.0-4.9, Res 30+', contract_subtype: 'Exportacao',
    responsible: 'Gabriela', observation: '',
    total_takeup: 400, balance_pending: 400, is_active: true,
    created_at: '2025-03-10T10:00:00Z', updated_at: '2025-05-15T08:00:00Z', created_by: MOCK_USER.id,
    seller: MOCK_SELLERS[2], buyer: MOCK_BUYERS[6],
    installments: makeInstallments(C7, MONTHS.map((m,i) => ({month:m,qty:Q13G[i]})), {'2025-06-01':100,'2025-07-01':100,'2025-08-01':100,'2025-09-01':100}),
  },
]

// Shorthand refs
const S1 = MOCK_SELLERS[0], S2 = MOCK_SELLERS[1], S3 = MOCK_SELLERS[2]
const B1 = MOCK_BUYERS[0], B2 = MOCK_BUYERS[1], B3 = MOCK_BUYERS[2], B4 = MOCK_BUYERS[3], B5 = MOCK_BUYERS[4], B7 = MOCK_BUYERS[6]
const INST = (cid: string, iid: string, month: string, qty: number, delivered: number, st: ContractInstallment['status']): ContractInstallment => ({
  id: iid, contract_id: cid, reference_month: month, scheduled_quantity: qty,
  delivered_quantity: delivered, remaining_quantity: qty - delivered, due_date: month.substring(0,7)+'-28',
  status: st, created_at: '2025-01-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
})

export const MOCK_ANALYSES: Analysis[] = [
  {
    id: 'anal-0001', contract_id: C1, installment_id: 'inst-0001-00', status: 'finalizada',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26367_Jun25.pdf', hvi_received_date: '2025-06-05', hvi_responsible: 'Drielle',
    hvi_approved: true, hvi_approval_date: '2025-06-06', hvi_observation: 'Padrao aprovado',
    takeup_scheduled_date: '2025-06-10', takeup_responsible: 'Diogo', takeup_actual_date: '2025-06-10',
    takeup_file_url: '#', takeup_file_name: 'TK_AG26367_Jun25.pdf', takeup_reschedule_count: 0,
    report_delivery_date: '2025-06-12', report_file_url: '#', report_file_name: 'REL_AG26367_Jun25.pdf',
    approved_tons: 200, final_observation: 'Lote aprovado sem ressalvas',
    created_at: '2025-06-03T08:00:00Z', updated_at: '2025-06-12T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[0], seller: S1, buyer: B1 },
    installment: INST(C1,'inst-0001-00','2025-06-01',200,200,'concluida'),
    comments: [], reschedules: [],
  },
  {
    id: 'anal-0002', contract_id: C1, installment_id: 'inst-0001-01', status: 'finalizada',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26367_Jul25.pdf', hvi_received_date: '2025-07-04', hvi_responsible: 'Drielle',
    hvi_approved: true, hvi_approval_date: '2025-07-05',
    takeup_scheduled_date: '2025-07-08', takeup_responsible: 'Alice e Amanda', takeup_actual_date: '2025-07-09',
    takeup_file_url: '#', takeup_file_name: 'TK_AG26367_Jul25.pdf', takeup_reschedule_count: 1,
    report_delivery_date: '2025-07-11', report_file_url: '#', report_file_name: 'REL_AG26367_Jul25.pdf',
    approved_tons: 200,
    created_at: '2025-07-03T08:00:00Z', updated_at: '2025-07-11T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[0], seller: S1, buyer: B1 },
    installment: INST(C1,'inst-0001-01','2025-07-01',200,200,'concluida'),
    comments: [], reschedules: [],
  },
  {
    id: 'anal-0003', contract_id: C1, installment_id: 'inst-0001-02', status: 'finalizada',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26367_Ago25.pdf', hvi_received_date: '2025-08-06', hvi_responsible: 'Raphaela',
    hvi_approved: true, hvi_approval_date: '2025-08-07',
    takeup_scheduled_date: '2025-08-12', takeup_responsible: 'Diogo', takeup_actual_date: '2025-08-12',
    takeup_file_url: '#', takeup_file_name: 'TK_AG26367_Ago25.pdf', takeup_reschedule_count: 0,
    report_delivery_date: '2025-08-14', report_file_url: '#', report_file_name: 'REL_AG26367_Ago25.pdf',
    approved_tons: 200, final_observation: 'Excelente qualidade',
    created_at: '2025-08-05T08:00:00Z', updated_at: '2025-08-14T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[0], seller: S1, buyer: B1 },
    installment: INST(C1,'inst-0001-02','2025-08-01',200,200,'concluida'),
    comments: [], reschedules: [],
  },
  {
    id: 'anal-0004', contract_id: C1, installment_id: 'inst-0001-03', status: 'finalizada',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26367_Set25.pdf', hvi_received_date: '2025-09-03', hvi_responsible: 'Drielle',
    hvi_approved: true, hvi_approval_date: '2025-09-04',
    takeup_scheduled_date: '2025-09-08', takeup_responsible: 'Alice e Amanda', takeup_actual_date: '2025-09-08',
    takeup_file_url: '#', takeup_file_name: 'TK_AG26367_Set25.pdf', takeup_reschedule_count: 0,
    report_delivery_date: '2025-09-10', report_file_url: '#', report_file_name: 'REL_AG26367_Set25.pdf',
    approved_tons: 200,
    created_at: '2025-09-02T08:00:00Z', updated_at: '2025-09-10T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[0], seller: S1, buyer: B1 },
    installment: INST(C1,'inst-0001-03','2025-09-01',200,200,'concluida'),
    comments: [], reschedules: [],
  },
  // HVI aguardando aprovacao
  {
    id: 'anal-0005', contract_id: C1, installment_id: 'inst-0001-04', status: 'aguardando_aprovacao_hvi',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26367_Out25.pdf', hvi_received_date: '2026-05-18', hvi_responsible: 'Drielle',
    hvi_observation: 'Aguardando revisao tecnica', takeup_reschedule_count: 0,
    created_at: '2026-05-18T08:00:00Z', updated_at: '2026-05-18T08:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[0], seller: S1, buyer: B1 },
    installment: INST(C1,'inst-0001-04','2025-10-01',200,0,'em_andamento'),
    comments: [], reschedules: [],
  },
  // TakeUp agendado (proximo)
  {
    id: 'anal-0006', contract_id: C2, installment_id: 'inst-0002-05', status: 'takeup_agendado',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26368_Nov25.pdf', hvi_received_date: '2026-05-15', hvi_responsible: 'Diogo',
    hvi_approved: true, hvi_approval_date: '2026-05-16',
    takeup_scheduled_date: '2026-05-26', takeup_responsible: 'Alice e Amanda', takeup_reschedule_count: 0,
    created_at: '2026-05-15T08:00:00Z', updated_at: '2026-05-16T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[1], seller: S2, buyer: B2 },
    installment: INST(C2,'inst-0002-05','2025-11-01',200,0,'em_andamento'),
    comments: [], reschedules: [],
  },
  // TakeUp reagendado (atrasado — 2x)
  {
    id: 'anal-0007', contract_id: C2, installment_id: 'inst-0002-04', status: 'takeup_reagendado',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26368_Out25.pdf', hvi_received_date: '2026-04-20', hvi_responsible: 'Diogo',
    hvi_approved: true, hvi_approval_date: '2026-04-22',
    takeup_scheduled_date: '2026-05-28', takeup_responsible: 'Raphaela', takeup_reschedule_count: 2,
    created_at: '2026-04-20T08:00:00Z', updated_at: '2026-05-20T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[1], seller: S2, buyer: B2 },
    installment: INST(C2,'inst-0002-04','2025-10-01',200,0,'em_andamento'),
    comments: [
      { id: 'cmt-001', analysis_id: 'anal-0007', content: 'Produtor solicitou reagendamento por colheita tardia na fazenda.', created_at: '2026-05-05T10:00:00Z', updated_at: '2026-05-05T10:00:00Z', created_by: MOCK_USER.id, creator: MOCK_USER },
      { id: 'cmt-002', analysis_id: 'anal-0007', content: 'Segundo reagendamento: transporte indisponivel. Agendado para 28/mai.', created_at: '2026-05-20T14:00:00Z', updated_at: '2026-05-20T14:00:00Z', created_by: MOCK_USER.id, creator: MOCK_USER },
    ],
    reschedules: [
      { id: 'rsc-001', analysis_id: 'anal-0007', previous_date: '2026-05-05', new_date: '2026-05-15', reason: 'Colheita tardia', created_at: '2026-05-05T10:00:00Z', created_by: MOCK_USER.id, creator: MOCK_USER },
      { id: 'rsc-002', analysis_id: 'anal-0007', previous_date: '2026-05-15', new_date: '2026-05-28', reason: 'Transporte indisponivel', created_at: '2026-05-20T14:00:00Z', created_by: MOCK_USER.id, creator: MOCK_USER },
    ],
  },
  // HVI reprovado -> analise interrompida
  {
    id: 'anal-0008', contract_id: C3, installment_id: 'inst-0003-04', status: 'analise_interrompida',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26369_Out25.pdf', hvi_received_date: '2026-04-10', hvi_responsible: 'Raiane',
    hvi_approved: false, hvi_rejection_reason: 'Micronaire fora do padrao (5.3) — acima do limite 4.9',
    hvi_observation: 'Lote rejeitado por qualidade', takeup_reschedule_count: 0,
    final_observation: 'Lote recusado. Produtor sera notificado para novo envio.',
    created_at: '2026-04-10T08:00:00Z', updated_at: '2026-04-12T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[2], seller: S3, buyer: B3 },
    installment: INST(C3,'inst-0003-04','2025-10-01',100,0,'pendente'),
    comments: [], reschedules: [],
  },
  // Aguardando HVI
  {
    id: 'anal-0009', contract_id: C4, installment_id: 'inst-0004-01', status: 'aguardando_hvi',
    hvi_responsible: 'Raphaela', takeup_reschedule_count: 0,
    created_at: '2026-05-20T08:00:00Z', updated_at: '2026-05-20T08:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[3], seller: MOCK_SELLERS[3], buyer: B4 },
    installment: INST(C4,'inst-0004-01','2025-07-01',500,0,'pendente'),
    comments: [], reschedules: [],
  },
  // TakeUp finalizado (sem relatorio ainda)
  {
    id: 'anal-0010', contract_id: C5, installment_id: 'inst-0005-00', status: 'takeup_finalizado',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26371_Jun25.pdf', hvi_received_date: '2025-06-08', hvi_responsible: 'Raiane',
    hvi_approved: true, hvi_approval_date: '2025-06-09',
    takeup_scheduled_date: '2025-06-15', takeup_responsible: 'Gabriela', takeup_actual_date: '2025-06-15',
    takeup_file_url: '#', takeup_file_name: 'TK_AG26371_Jun25.pdf', takeup_reschedule_count: 0,
    approved_tons: 150,
    created_at: '2025-06-08T08:00:00Z', updated_at: '2025-06-15T16:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[4], seller: S1, buyer: B5 },
    installment: INST(C5,'inst-0005-00','2025-06-01',150,150,'concluida'),
    comments: [], reschedules: [],
  },
  // HVI aprovado, aguardando agendamento TakeUp
  {
    id: 'anal-0011', contract_id: C7, installment_id: 'inst-0007-03', status: 'hvi_aprovado',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26373_Set25.pdf', hvi_received_date: '2026-05-19', hvi_responsible: 'Gabriela',
    hvi_approved: true, hvi_approval_date: '2026-05-21', hvi_observation: 'Qualidade acima do esperado',
    takeup_reschedule_count: 0,
    created_at: '2026-05-19T08:00:00Z', updated_at: '2026-05-21T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[6], seller: S3, buyer: B7 },
    installment: INST(C7,'inst-0007-03','2025-09-01',100,0,'em_andamento'),
    comments: [], reschedules: [],
  },
  // TakeUp cancelado
  {
    id: 'anal-0012', contract_id: C5, installment_id: 'inst-0005-01', status: 'takeup_cancelado',
    hvi_file_url: '#', hvi_file_name: 'HVI_AG26371_Jul25.pdf', hvi_received_date: '2025-07-05', hvi_responsible: 'Raiane',
    hvi_approved: true, hvi_approval_date: '2025-07-06',
    takeup_scheduled_date: '2025-07-12', takeup_responsible: 'Gabriela',
    takeup_cancel_reason: 'Compradora solicitou cancelamento — mudanca de especificacao tecnica',
    takeup_cancel_file_url: '#', takeup_reschedule_count: 0,
    created_at: '2025-07-05T08:00:00Z', updated_at: '2025-07-13T10:00:00Z', created_by: MOCK_USER.id,
    contract: { ...MOCK_CONTRACTS[4], seller: S1, buyer: B5 },
    installment: INST(C5,'inst-0005-01','2025-07-01',150,0,'pendente'),
    comments: [], reschedules: [],
  },
]

export const MOCK_AGENDA_ENTRIES: AgendaEntry[] = [
  {
    id: 'agenda-001', title: 'TakeUp AG-26368 — Lote Nov/25',
    description: 'Confirmar com Alice antes de ir a fazenda.',
    entry_type: 'takeup', scheduled_date: '2026-05-26', scheduled_time: '09:00',
    status: 'pendente', related_analysis_id: 'anal-0006', related_contract_id: C2,
    created_at: '2026-05-16T10:00:00Z', updated_at: '2026-05-16T10:00:00Z', created_by: MOCK_USER.id,
    contract: MOCK_CONTRACTS[1],
  },
  {
    id: 'agenda-002', title: 'TakeUp AG-26368 — Lote Out/25 (reagendado)',
    description: 'Verificar disponibilidade de caminhao. 2 reagendamentos anteriores.',
    entry_type: 'takeup', scheduled_date: '2026-05-28', scheduled_time: '14:00',
    status: 'pendente', related_analysis_id: 'anal-0007', related_contract_id: C2,
    created_at: '2026-05-20T10:00:00Z', updated_at: '2026-05-20T10:00:00Z', created_by: MOCK_USER.id,
    contract: MOCK_CONTRACTS[1],
  },
  {
    id: 'agenda-003', title: 'Revisao HVI — AG-26367 Lote Out/25',
    description: 'HVI recebido. Aguardando aprovacao tecnica.',
    entry_type: 'analise', scheduled_date: new Date().toISOString().split('T')[0], scheduled_time: '10:00',
    status: 'em_andamento', related_analysis_id: 'anal-0005', related_contract_id: C1,
    created_at: '2026-05-18T08:00:00Z', updated_at: '2026-05-18T08:00:00Z', created_by: MOCK_USER.id,
    contract: MOCK_CONTRACTS[0],
  },
  {
    id: 'agenda-004', title: 'Reuniao mensal — Laferlins',
    description: 'Revisao do pipeline de TakeUp, pendencias HVI e previsao junho.',
    entry_type: 'outro', scheduled_date: '2026-05-30', scheduled_time: '15:00',
    status: 'pendente', related_contract_id: undefined,
    created_at: '2026-05-10T08:00:00Z', updated_at: '2026-05-10T08:00:00Z', created_by: MOCK_USER.id,
  },
  {
    id: 'agenda-005', title: 'Entrega Set/25 — AG-26367',
    description: '200 tons entregues. Documentacao OK.',
    entry_type: 'entrega', scheduled_date: '2025-09-10', scheduled_time: '09:00',
    status: 'concluido', related_analysis_id: 'anal-0004', related_contract_id: C1,
    created_at: '2025-09-02T08:00:00Z', updated_at: '2025-09-10T12:00:00Z', created_by: MOCK_USER.id,
    contract: MOCK_CONTRACTS[0],
  },
  {
    id: 'agenda-006', title: 'Agendar TakeUp — AG-26373 Set/25',
    description: 'HVI aprovado com nota excelente. Contatar Raphaela para definir data.',
    entry_type: 'takeup', scheduled_date: '2026-05-27', scheduled_time: '11:00',
    status: 'pendente', related_analysis_id: 'anal-0011', related_contract_id: C7,
    created_at: '2026-05-21T10:00:00Z', updated_at: '2026-05-21T10:00:00Z', created_by: MOCK_USER.id,
    contract: MOCK_CONTRACTS[6],
  },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001', user_id: MOCK_USER.id,
    title: 'TakeUp em atraso — AG-26368',
    message: 'TakeUp do lote Out/25 reagendado pela 2a vez. Data: 28/mai.',
    type: 'takeup_atrasado', related_entity_type: 'analysis', related_entity_id: 'anal-0007',
    is_read: false, email_sent: true, created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'notif-002', user_id: MOCK_USER.id,
    title: 'HVI pendente — AG-26367',
    message: 'HVI do lote Out/25 (AG-26367) aguarda aprovacao ha 5 dias.',
    type: 'hvi_pendente', related_entity_type: 'analysis', related_entity_id: 'anal-0005',
    is_read: false, email_sent: true, created_at: '2026-05-23T08:00:00Z',
  },
  {
    id: 'notif-003', user_id: MOCK_USER.id,
    title: 'TakeUp amanha — AG-26368 Nov/25',
    message: 'TakeUp do lote Nov/25 agendado para 26/mai as 09h00.',
    type: 'takeup_pendente', related_entity_type: 'analysis', related_entity_id: 'anal-0006',
    is_read: false, email_sent: false, created_at: '2026-05-25T07:00:00Z',
  },
  {
    id: 'notif-004', user_id: MOCK_USER.id,
    title: 'Parcela vencendo — AG-26370',
    message: 'Parcela Jun/25 do contrato AG-26370 vence em 3 dias (28/mai).',
    type: 'parcela_vencendo', related_entity_type: 'installment', related_entity_id: 'inst-0004-01',
    is_read: true, email_sent: true, created_at: '2026-05-22T09:00:00Z',
  },
  {
    id: 'notif-005', user_id: MOCK_USER.id,
    title: 'HVI aprovado — AG-26373 Set/25',
    message: 'HVI aprovado. Agendar TakeUp.',
    type: 'takeup_pendente', related_entity_type: 'analysis', related_entity_id: 'anal-0011',
    is_read: true, email_sent: false, created_at: '2026-05-21T10:30:00Z',
  },
  {
    id: 'notif-006', user_id: MOCK_USER.id,
    title: 'HVI aguardando — AG-26370 Jul/25',
    message: 'Analise do lote Jul/25 (AG-26370) criada. Aguardando envio do HVI.',
    type: 'hvi_pendente', related_entity_type: 'analysis', related_entity_id: 'anal-0009',
    is_read: true, email_sent: false, created_at: '2026-05-20T08:10:00Z',
  },
]

export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-001', title: 'Relatorio Contrato AG-26367 — Maio/2026',
    report_type: 'contrato',
    content: '## Contrato AG-26367/10\n\n**Vendedor:** Agropecuaria Bonfim (MT)\n**Comprador:** Louis Dreyfus\n**Total:** 2.000t\n\n### Entregas\n- Jun/25: 200t OK\n- Jul/25: 200t OK\n- Ago/25: 200t OK\n- Set/25: 200t OK\n- Out/25: HVI em aprovacao\n\n**Saldo pendente:** 1.200t',
    file_url: '#', related_contract_id: C1, related_analysis_ids: ['anal-0001','anal-0002','anal-0003','anal-0004'],
    user_prompt: 'Resumo para enviar ao comprador', is_active: true,
    created_at: '2026-05-10T14:00:00Z', updated_at: '2026-05-10T14:00:00Z', created_by: MOCK_USER.id,
    contract: MOCK_CONTRACTS[0],
  },
  {
    id: 'rep-002', title: 'Relatorio Analise AG-26368 — Lote Nov/25',
    report_type: 'analise',
    content: '## AG-26368 Lote Nov/25\n\n**Status:** TakeUp Agendado\n**HVI:** Aprovado em 16/mai/2026\n**TakeUp:** Agendado para 26/mai com Alice e Amanda\n\nSem ocorrencias.',
    file_url: '#', related_contract_id: C2, related_analysis_ids: ['anal-0006'],
    is_active: true,
    created_at: '2026-05-17T10:00:00Z', updated_at: '2026-05-17T10:00:00Z', created_by: MOCK_USER.id,
    contract: MOCK_CONTRACTS[1],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getMockAnalysesByContractId(contractId: string) {
  return MOCK_ANALYSES.filter(a => a.contract_id === contractId)
}

export function getMockAnalysisById(id: string) {
  return MOCK_ANALYSES.find(a => a.id === id) ?? null
}

export function getMockContractById(id: string) {
  return MOCK_CONTRACTS.find(c => c.id === id) ?? null
}

export function getMockAgendaEntryById(id: string) {
  return MOCK_AGENDA_ENTRIES.find(e => e.id === id) ?? null
}

export function getMockAnalysesByStatus(status?: string, search?: string) {
  let list = [...MOCK_ANALYSES]
  if (status) list = list.filter(a => a.status === status)
  if (search) {
    const s = search.toLowerCase()
    list = list.filter(a =>
      a.contract?.contract_number?.toLowerCase().includes(s) ||
      a.hvi_responsible?.toLowerCase().includes(s) ||
      a.takeup_responsible?.toLowerCase().includes(s) ||
      a.hvi_observation?.toLowerCase().includes(s)
    )
  }
  return list
}

export function getMockAgendaKpis() {
  const activeStatuses = ['aguardando_hvi','aguardando_aprovacao_hvi','hvi_aprovado','takeup_agendado','takeup_reagendado','takeup_finalizado']
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  return {
    activeAnalyses: MOCK_ANALYSES.filter(a => activeStatuses.includes(a.status)).length,
    finishedThisMonth: MOCK_ANALYSES.filter(a => a.status === 'finalizada' && a.updated_at >= monthStart).length,
    totalTonsThisMonth: MOCK_ANALYSES.filter(a => a.status === 'finalizada' && a.updated_at >= monthStart).reduce((s, a) => s + (a.approved_tons || 0), 0),
    todayCount: MOCK_AGENDA_ENTRIES.filter(e => e.scheduled_date === new Date().toISOString().split('T')[0]).length,
  }
}

export function getMockContractKpis() {
  return {
    totalContracts: MOCK_CONTRACTS.length,
    totalTons: MOCK_CONTRACTS.reduce((s, c) => s + (c.total_quantity || 0), 0),
    totalTakeup: MOCK_CONTRACTS.reduce((s, c) => s + (c.total_takeup || 0), 0),
    balancePending: MOCK_CONTRACTS.reduce((s, c) => s + (c.balance_pending || 0), 0),
  }
}

export function getMockAnalysesByContract() {
  const map: Record<string, { total: number; finished: number; interrupted: number }> = {}
  for (const a of MOCK_ANALYSES) {
    if (!map[a.contract_id]) map[a.contract_id] = { total: 0, finished: 0, interrupted: 0 }
    map[a.contract_id].total++
    if (a.status === 'finalizada') map[a.contract_id].finished++
    if (a.status === 'analise_interrompida') map[a.contract_id].interrupted++
  }
  return map
}
