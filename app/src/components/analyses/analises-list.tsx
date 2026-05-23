'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter, ChevronRight, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatMonth } from '@/lib/utils/date-format'
import { ANALYSIS_STATUS_LABEL, ANALYSIS_STATUS_COLOR, ANALYSIS_STATUS_DOT } from '@/lib/utils/ui'
import type { Analysis, AnalysisStatus } from '@/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '__all__', label: 'Todos os status' },
  { value: 'aguardando_hvi', label: 'Aguardando HVI' },
  { value: 'aguardando_aprovacao_hvi', label: 'HVI em Análise' },
  { value: 'hvi_aprovado', label: 'HVI Aprovado' },
  { value: 'analise_interrompida', label: 'Interrompida' },
  { value: 'takeup_agendado', label: 'TakeUp Agendado' },
  { value: 'takeup_reagendado', label: 'TakeUp Reagendado' },
  { value: 'takeup_finalizado', label: 'TakeUp Finalizado' },
  { value: 'takeup_cancelado', label: 'TakeUp Cancelado' },
  { value: 'finalizada', label: 'Finalizada' },
]

interface AnalisesListProps {
  analyses: Analysis[]
}

export function AnalisesList({ analyses }: AnalisesListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('__all__')

  const filtered = analyses.filter(a => {
    const contract = (a as any).contract
    const q = search.toLowerCase()

    const matchSearch = !search || [
      contract?.contract_number,
      contract?.seller?.name,
      contract?.buyer?.name,
      contract?.seller?.city,
      contract?.buyer?.city,
      a.hvi_responsible,
      a.takeup_responsible,
    ].some(v => v?.toLowerCase().includes(q))

    const matchStatus = !statusFilter || statusFilter === '__all__' || a.status === statusFilter

    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Histórico de Análises</h1>
          <p className="text-slate-500 text-sm mt-0.5">{analyses.length} análises no total</p>
        </div>
        <Button asChild className="bg-blue-700 hover:bg-blue-800">
          <Link href="/analises/nova"><Plus className="h-4 w-4 mr-1.5" /> Nova Análise</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por contrato, produtor, comprador, cidade..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '__all__')}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <History className="h-12 w-12" />
          <p className="text-sm">Nenhuma análise encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => <AnalysisCard key={a.id} analysis={a} />)}
        </div>
      )}
    </div>
  )
}

function AnalysisCard({ analysis: a }: { analysis: Analysis }) {
  const contract = (a as any).contract
  const installment = (a as any).installment

  return (
    <Link href={`/analises/${a.id}`}>
      <Card className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
        <CardContent className="py-3.5 px-4 flex items-center gap-4">
          {/* Status dot */}
          <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 mt-0.5', ANALYSIS_STATUS_DOT[a.status])} />

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-800">
                {contract?.contract_number || '—'}
              </span>
              {installment && (
                <span className="text-xs text-slate-400">
                  Parcela: {formatMonth(installment.reference_month)}
                </span>
              )}
              <Badge variant="outline" className={cn('text-[10px] px-1.5', ANALYSIS_STATUS_COLOR[a.status])}>
                {ANALYSIS_STATUS_LABEL[a.status]}
              </Badge>
              {a.takeup_reschedule_count > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 text-orange-600 border-orange-200">
                  {a.takeup_reschedule_count}x reagendado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
              <span>{contract?.seller?.name}</span>
              <span className="text-slate-300">→</span>
              <span>{contract?.buyer?.name}</span>
              {a.hvi_responsible && <span className="text-slate-400">· HVI: {a.hvi_responsible}</span>}
            </div>
          </div>

          {/* Dates & Tons */}
          <div className="text-right text-xs text-slate-500 space-y-0.5 shrink-0">
            {a.hvi_received_date && (
              <p>HVI: {formatDate(a.hvi_received_date)}</p>
            )}
            {a.takeup_scheduled_date && (
              <p>TakeUp: {formatDate(a.takeup_scheduled_date)}</p>
            )}
            {a.approved_tons != null && (
              <p className="text-green-700 font-medium">{a.approved_tons}t aprovadas</p>
            )}
          </div>

          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}
