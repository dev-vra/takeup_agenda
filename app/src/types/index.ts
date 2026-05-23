export type UserRole = 'admin' | 'consultor' | 'leitor'

export type AnalysisStatus =
  | 'aguardando_hvi'
  | 'aguardando_aprovacao_hvi'
  | 'hvi_aprovado'
  | 'analise_interrompida'
  | 'takeup_agendado'
  | 'takeup_reagendado'
  | 'takeup_finalizado'
  | 'takeup_cancelado'
  | 'finalizada'

export type InstallmentStatus = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada'

export type AgendaEntryType = 'analise' | 'takeup' | 'entrega' | 'outro'
export type AgendaEntryStatus = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'

export type NotificationType =
  | 'alerta_prazo'
  | 'hvi_pendente'
  | 'takeup_pendente'
  | 'takeup_atrasado'
  | 'parcela_vencendo'
  | 'geral'

export type ReportType =
  | 'contrato'
  | 'analise'
  | 'parcela'
  | 'conjunto_analises'
  | 'personalizado'

export type ResponsibleType = 'hvi' | 'takeup' | 'geral'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Seller {
  id: string
  name: string
  document?: string
  city?: string
  state?: string
  created_at: string
  updated_at: string
}

export interface Buyer {
  id: string
  name: string
  document?: string
  city?: string
  state?: string
  country?: string
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  contract_number: string
  reference?: string
  seller_id: string
  buyer_id: string
  total_quantity: number
  origin?: string
  currency?: string
  indexation?: string
  price?: number
  price_unit?: string
  terms?: string
  quality_spec?: string
  contract_subtype?: string
  responsible?: string
  observation?: string
  total_takeup?: number
  balance_pending?: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
  seller?: Seller
  buyer?: Buyer
  installments?: ContractInstallment[]
}

export interface ContractInstallment {
  id: string
  contract_id: string
  reference_month: string
  scheduled_quantity: number
  delivered_quantity: number
  remaining_quantity: number
  due_date?: string
  status: InstallmentStatus
  created_at: string
  updated_at: string
  contract?: Contract
  analyses?: Analysis[]
}

export interface ContractTakeupMonthly {
  id: string
  contract_id: string
  reference_month: string
  takeup_quantity: number
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  contract_id: string
  installment_id: string
  status: AnalysisStatus
  hvi_file_url?: string
  hvi_file_name?: string
  hvi_received_date?: string
  hvi_responsible?: string
  hvi_approved?: boolean
  hvi_approval_date?: string
  hvi_rejection_reason?: string
  hvi_observation?: string
  takeup_scheduled_date?: string
  takeup_responsible?: string
  takeup_actual_date?: string
  takeup_file_url?: string
  takeup_file_name?: string
  takeup_cancel_reason?: string
  takeup_cancel_file_url?: string
  takeup_reschedule_count: number
  report_delivery_date?: string
  report_file_url?: string
  report_file_name?: string
  approved_tons?: number
  final_observation?: string
  created_at: string
  updated_at: string
  created_by: string
  contract?: Contract
  installment?: ContractInstallment
  comments?: AnalysisComment[]
  reschedules?: TakeupReschedule[]
}

export interface TakeupReschedule {
  id: string
  analysis_id: string
  previous_date: string
  new_date: string
  reason?: string
  created_at: string
  created_by: string
  creator?: Profile
}

export interface AnalysisComment {
  id: string
  analysis_id: string
  content: string
  attachment_url?: string
  attachment_name?: string
  created_at: string
  updated_at: string
  created_by: string
  creator?: Profile
}

export interface Document {
  id: string
  entity_type: 'analysis' | 'contract' | 'agenda'
  entity_id: string
  file_url: string
  file_name: string
  file_type?: string
  file_size?: number
  created_at: string
  created_by: string
}

export interface AgendaEntry {
  id: string
  title: string
  description?: string
  entry_type: AgendaEntryType
  scheduled_date: string
  scheduled_time?: string
  status: AgendaEntryStatus
  related_analysis_id?: string
  related_contract_id?: string
  created_at: string
  updated_at: string
  created_by: string
  analysis?: Analysis
  contract?: Contract
  comments?: AgendaComment[]
}

export interface AgendaComment {
  id: string
  agenda_entry_id: string
  content: string
  attachment_url?: string
  attachment_name?: string
  created_at: string
  created_by: string
  creator?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  related_entity_type?: string
  related_entity_id?: string
  is_read: boolean
  email_sent: boolean
  created_at: string
}

export interface Report {
  id: string
  title: string
  report_type: ReportType
  content?: string
  file_url?: string
  related_contract_id?: string
  related_analysis_ids?: string[]
  related_installment_id?: string
  user_prompt?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
  contract?: Contract
}

export interface KnownResponsible {
  id: string
  name: string
  type: ResponsibleType
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  created_at: string
}

// Paste import types
export interface PasteImportRow {
  contract_number: string
  reference?: string
  seller_name: string
  buyer_name: string
  total_quantity: number
  origin?: string
  currency?: string
  indexation?: string
  price?: number
  price_unit?: string
  terms?: string
  quality_spec?: string
  contract_subtype?: string
  installments: { month: string; quantity: number }[]
  takeup_monthly: { month: string; quantity: number }[]
  total_takeup?: number
  balance_pending?: number
  responsible?: string
  observation?: string
}

export interface PasteImportPreview {
  rows: PasteImportRow[]
  errors: { row: number; message: string }[]
}
