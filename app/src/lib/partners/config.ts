import type { PartnerKind } from '@/types'

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'email' | 'phone'

export interface FieldDef {
  key: string
  label: string
  type?: FieldType
  options?: { value: string; label: string }[]
  placeholder?: string
  colSpan?: 1 | 2
}

export interface ListColumn {
  key: string
  label: string
}

export interface PartnerConfig {
  kind: PartnerKind
  table: string
  entityType: string
  apiBase: string
  route: string
  singular: string
  plural: string
  fields: FieldDef[]
  listColumns: ListColumn[]
  searchColumns: string[]
  hasFarms?: boolean
  hasContracts?: 'seller' | 'buyer'
  uniqueMessage: string
}

const PERSON_TYPE_OPTIONS = [
  { value: 'pf', label: 'Pessoa Física' },
  { value: 'pj', label: 'Pessoa Jurídica' },
]

export const PARTNER_CONFIGS: Record<string, PartnerConfig> = {
  produtores: {
    kind: 'seller',
    table: 'sellers',
    entityType: 'seller',
    apiBase: '/api/partners/sellers',
    route: '/cadastros/produtores',
    singular: 'Produtor',
    plural: 'Produtores',
    uniqueMessage: 'Já existe um produtor com esse nome.',
    hasFarms: true,
    hasContracts: 'seller',
    searchColumns: ['name', 'city', 'document'],
    listColumns: [
      { key: 'name', label: 'Nome' },
      { key: 'document', label: 'Documento' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
    ],
    fields: [
      { key: 'name', label: 'Nome / Razão social', colSpan: 2 },
      { key: 'person_type', label: 'Tipo', type: 'select', options: PERSON_TYPE_OPTIONS },
      { key: 'document', label: 'CPF / CNPJ' },
      { key: 'state_registration', label: 'Inscrição Estadual' },
      { key: 'sai_producer_code', label: 'Código produtor (SAI)' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'phone', label: 'Telefone', type: 'phone' },
      { key: 'address', label: 'Endereço', colSpan: 2 },
      { key: 'zip_code', label: 'CEP' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
      { key: 'notes', label: 'Observações', type: 'textarea', colSpan: 2 },
    ],
  },
  compradores: {
    kind: 'buyer',
    table: 'buyers',
    entityType: 'buyer',
    apiBase: '/api/partners/buyers',
    route: '/cadastros/compradores',
    singular: 'Comprador',
    plural: 'Compradores',
    uniqueMessage: 'Já existe um comprador com esse nome.',
    hasContracts: 'buyer',
    searchColumns: ['name', 'city', 'document'],
    listColumns: [
      { key: 'name', label: 'Nome' },
      { key: 'trader_type', label: 'Tipo' },
      { key: 'city', label: 'Cidade' },
      { key: 'country', label: 'País' },
    ],
    fields: [
      { key: 'name', label: 'Nome / Razão social', colSpan: 2 },
      { key: 'person_type', label: 'Tipo', type: 'select', options: PERSON_TYPE_OPTIONS },
      {
        key: 'trader_type', label: 'Perfil', type: 'select', options: [
          { value: 'trading', label: 'Trading' },
          { value: 'industria', label: 'Indústria' },
          { value: 'exportadora', label: 'Exportadora' },
        ],
      },
      { key: 'document', label: 'CPF / CNPJ' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'phone', label: 'Telefone', type: 'phone' },
      { key: 'address', label: 'Endereço', colSpan: 2 },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
      { key: 'country', label: 'País' },
      { key: 'notes', label: 'Observações', type: 'textarea', colSpan: 2 },
    ],
  },
  laboratorios: {
    kind: 'laboratory',
    table: 'laboratories',
    entityType: 'laboratory',
    apiBase: '/api/partners/laboratories',
    route: '/cadastros/laboratorios',
    singular: 'Laboratório',
    plural: 'Laboratórios',
    uniqueMessage: 'Já existe um laboratório com esse nome.',
    searchColumns: ['name', 'city', 'sbrhvi_code'],
    listColumns: [
      { key: 'name', label: 'Nome' },
      { key: 'sbrhvi_code', label: 'Cód. SBRHVI' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
    ],
    fields: [
      { key: 'name', label: 'Nome', colSpan: 2 },
      { key: 'sbrhvi_code', label: 'Código SBRHVI/ABRAPA' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'phone', label: 'Telefone', type: 'phone' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
      { key: 'notes', label: 'Observações', type: 'textarea', colSpan: 2 },
    ],
  },
  armazens: {
    kind: 'warehouse',
    table: 'warehouses',
    entityType: 'warehouse',
    apiBase: '/api/partners/warehouses',
    route: '/cadastros/armazens',
    singular: 'Armazém',
    plural: 'Armazéns',
    uniqueMessage: 'Já existe um armazém com esse nome.',
    searchColumns: ['name', 'city', 'sai_code', 'operator'],
    listColumns: [
      { key: 'name', label: 'Nome' },
      { key: 'sai_code', label: 'Cód. SAI' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
    ],
    fields: [
      { key: 'name', label: 'Nome', colSpan: 2 },
      { key: 'sai_code', label: 'Código UBA (SAI)' },
      { key: 'operator', label: 'Operador logístico' },
      { key: 'capacity_tons', label: 'Capacidade (t)', type: 'number' },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'phone', label: 'Telefone', type: 'phone' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
      { key: 'notes', label: 'Observações', type: 'textarea', colSpan: 2 },
    ],
  },
  transportadoras: {
    kind: 'carrier',
    table: 'carriers',
    entityType: 'carrier',
    apiBase: '/api/partners/carriers',
    route: '/cadastros/transportadoras',
    singular: 'Transportadora',
    plural: 'Transportadoras',
    uniqueMessage: 'Já existe uma transportadora com esse nome.',
    searchColumns: ['name', 'city', 'document'],
    listColumns: [
      { key: 'name', label: 'Nome' },
      { key: 'document', label: 'CNPJ' },
      { key: 'modal', label: 'Modal' },
      { key: 'city', label: 'Cidade' },
    ],
    fields: [
      { key: 'name', label: 'Nome', colSpan: 2 },
      { key: 'document', label: 'CNPJ' },
      {
        key: 'modal', label: 'Modal', type: 'select', options: [
          { value: 'rodoviario', label: 'Rodoviário' },
          { value: 'ferroviario', label: 'Ferroviário' },
          { value: 'multimodal', label: 'Multimodal' },
        ],
      },
      { key: 'email', label: 'E-mail', type: 'email' },
      { key: 'phone', label: 'Telefone', type: 'phone' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'UF' },
      { key: 'notes', label: 'Observações', type: 'textarea', colSpan: 2 },
    ],
  },
}

/** Nomes de campos aceitos pela API (derivado da config + is_active). */
export function apiFields(cfg: PartnerConfig): string[] {
  return [...cfg.fields.map((f) => f.key), 'is_active']
}

export const PARTNER_SLUGS = Object.keys(PARTNER_CONFIGS)

/** Caminho de storage para documentos de um cadastro (bucket partner-documents). */
export function partnerDocPath(entityType: string, entityId: string, fileName: string): string {
  return `${entityType}/${entityId}/${Date.now()}-${fileName}`
}

export function configByKind(kind: PartnerKind): PartnerConfig {
  const cfg = Object.values(PARTNER_CONFIGS).find((c) => c.kind === kind)
  if (!cfg) throw new Error(`Config não encontrada para kind ${kind}`)
  return cfg
}
