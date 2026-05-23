'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  FileSpreadsheet, Plus, Search, TrendingUp, Package,
  BarChart3, AlertCircle, ChevronRight, CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatMonth } from '@/lib/utils/date-format'
import { INSTALLMENT_STATUS_COLOR, INSTALLMENT_STATUS_LABEL } from '@/lib/utils/ui'
import type { Contract } from '@/types'

interface AnalysisStat {
  total: number
  finished: number
  interrupted: number
}

interface ContratosDashboardProps {
  contracts: Contract[]
  analysesByContract: Record<string, AnalysisStat>
  kpis: {
    totalContracts: number
    totalTons: number
    totalTakeup: number
    balancePending: number
  }
}

export function ContratosDashboard({ contracts, analysesByContract, kpis }: ContratosDashboardProps) {
  const [search, setSearch] = useState('')

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase()
    return (
      c.contract_number.toLowerCase().includes(q) ||
      (c.seller as any)?.name?.toLowerCase().includes(q) ||
      (c.buyer as any)?.name?.toLowerCase().includes(q) ||
      c.origin?.toLowerCase().includes(q) ||
      c.reference?.toLowerCase().includes(q)
    )
  })

  const pct = kpis.totalTons > 0 ? (kpis.totalTakeup / kpis.totalTons) * 100 : 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contratos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{kpis.totalContracts} contratos ativos</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/contratos/importar">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Importar Planilha
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-blue-700 hover:bg-blue-800">
            <Link href="/analises/nova">
              <Plus className="h-4 w-4 mr-1.5" /> Nova Análise
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Contratos Ativos</p>
                <p className="text-2xl font-bold text-slate-800">{kpis.totalContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Contratado</p>
                <p className="text-2xl font-bold text-slate-800">{kpis.totalTons.toLocaleString('pt-BR')}t</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">TakeUp Realizado</p>
                <p className="text-2xl font-bold text-slate-800">{kpis.totalTakeup.toLocaleString('pt-BR')}t</p>
                <p className="text-[10px] text-slate-400">{pct.toFixed(1)}% do total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Saldo Pendente</p>
                <p className="text-2xl font-bold text-slate-800">{kpis.balancePending.toLocaleString('pt-BR')}t</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress geral */}
      <Card>
        <CardContent className="py-4 px-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Progresso Global de TakeUp</p>
            <span className="text-sm font-semibold text-slate-800">{pct.toFixed(1)}%</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">0t</span>
            <span className="text-[10px] text-slate-400">{kpis.totalTons.toLocaleString('pt-BR')}t</span>
          </div>
        </CardContent>
      </Card>

      {/* Search + List */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por contrato, vendedor, comprador, origem..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BarChart3 className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">Nenhum contrato encontrado</p>
            </div>
          ) : (
            filtered.map(c => (
              <ContractCard
                key={c.id}
                contract={c}
                stats={analysesByContract[c.id]}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ContractCard({ contract: c, stats }: { contract: Contract; stats?: AnalysisStat }) {
  const installments = (c as any).installments || []
  const scheduledTotal = installments.reduce((s: number, i: any) => s + (i.scheduled_quantity || 0), 0)
  const deliveredTotal = installments.reduce((s: number, i: any) => s + (i.delivered_quantity || 0), 0)
  const pct = scheduledTotal > 0 ? (deliveredTotal / scheduledTotal) * 100 : 0

  const overdueInstallments = installments.filter((i: any) =>
    i.status === 'atrasada' || (i.due_date && new Date(i.due_date) < new Date() && i.remaining_quantity > 0)
  )

  return (
    <Link href={`/contratos/${c.id}`}>
      <Card className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
        <CardContent className="py-4 px-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 text-sm">{c.contract_number}</span>
                {c.reference && (
                  <span className="text-xs text-slate-400">Ref: {c.reference}</span>
                )}
                {c.currency && (
                  <Badge variant="outline" className="text-[10px] px-1.5">{c.currency}</Badge>
                )}
                {c.terms && (
                  <Badge variant="outline" className="text-[10px] px-1.5">{c.terms}</Badge>
                )}
                {overdueInstallments.length > 0 && (
                  <Badge className="text-[10px] px-1.5 bg-red-100 text-red-700 border-red-200">
                    {overdueInstallments.length} parcela(s) em atraso
                  </Badge>
                )}
              </div>

              {/* Seller → Buyer */}
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                <span className="font-medium">{(c.seller as any)?.name || '—'}</span>
                <span className="text-slate-300">→</span>
                <span>{(c.buyer as any)?.name || '—'}</span>
                {c.origin && <span className="text-slate-400 ml-1">· {c.origin}</span>}
              </div>

              {/* Progress */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>TakeUp: {(c.total_takeup || 0).toLocaleString('pt-BR')}t / {c.total_quantity.toLocaleString('pt-BR')}t</span>
                  <span>{pct.toFixed(1)}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>

              {/* Installments preview */}
              {installments.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {installments.slice(0, 8).map((inst: any) => (
                    <div
                      key={inst.id}
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded border font-medium',
                        INSTALLMENT_STATUS_COLOR[inst.status]
                      )}
                      title={`${formatMonth(inst.reference_month)}: ${inst.scheduled_quantity}t programado, ${inst.delivered_quantity}t entregue`}
                    >
                      {formatMonth(inst.reference_month)} · {inst.remaining_quantity}t
                    </div>
                  ))}
                  {installments.length > 8 && (
                    <span className="text-[9px] text-slate-400 self-center">+{installments.length - 8}</span>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="text-right shrink-0 space-y-2">
              {stats && (
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>{stats.total} análises</p>
                  <p className="text-green-600">{stats.finished} finaliz.</p>
                </div>
              )}
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 ml-auto mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
