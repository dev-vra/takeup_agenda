export { cn } from '@/lib/utils'
import type { AnalysisStatus } from '@/types'

export const ANALYSIS_STATUS_LABEL: Record<AnalysisStatus, string> = {
  aguardando_hvi: 'Aguardando HVI',
  aguardando_aprovacao_hvi: 'HVI em Análise',
  hvi_aprovado: 'HVI Aprovado',
  analise_interrompida: 'Interrompida',
  takeup_agendado: 'TakeUp Agendado',
  takeup_reagendado: 'TakeUp Reagendado',
  takeup_finalizado: 'TakeUp Finalizado',
  takeup_cancelado: 'TakeUp Cancelado',
  finalizada: 'Finalizada',
}

export const ANALYSIS_STATUS_COLOR: Record<AnalysisStatus, string> = {
  aguardando_hvi: 'border-slate-300 text-slate-600 bg-slate-50',
  aguardando_aprovacao_hvi: 'border-blue-300 text-blue-700 bg-blue-50',
  hvi_aprovado: 'border-green-300 text-green-700 bg-green-50',
  analise_interrompida: 'border-red-300 text-red-700 bg-red-50',
  takeup_agendado: 'border-purple-300 text-purple-700 bg-purple-50',
  takeup_reagendado: 'border-orange-300 text-orange-700 bg-orange-50',
  takeup_finalizado: 'border-teal-300 text-teal-700 bg-teal-50',
  takeup_cancelado: 'border-gray-300 text-gray-600 bg-gray-50',
  finalizada: 'border-green-400 text-green-800 bg-green-100',
}

export const ANALYSIS_STATUS_DOT: Record<AnalysisStatus, string> = {
  aguardando_hvi: 'bg-slate-400',
  aguardando_aprovacao_hvi: 'bg-blue-500',
  hvi_aprovado: 'bg-green-500',
  analise_interrompida: 'bg-red-500',
  takeup_agendado: 'bg-purple-500',
  takeup_reagendado: 'bg-orange-500',
  takeup_finalizado: 'bg-teal-500',
  takeup_cancelado: 'bg-gray-400',
  finalizada: 'bg-green-600',
}

export const INSTALLMENT_STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
}

export const INSTALLMENT_STATUS_COLOR: Record<string, string> = {
  pendente: 'border-slate-200 text-slate-600 bg-slate-50',
  em_andamento: 'border-blue-300 text-blue-700 bg-blue-50',
  concluida: 'border-green-300 text-green-700 bg-green-50',
  atrasada: 'border-red-300 text-red-700 bg-red-50',
}
