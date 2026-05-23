'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Package, FileText, BarChart3, Plus, ArrowLeft,
  CheckCircle2, AlertCircle, Clock, ChevronRight
} from 'lucide-react'
import { formatDate, formatMonth } from '@/lib/utils/date-format'
import {
  ANALYSIS_STATUS_LABEL, ANALYSIS_STATUS_COLOR, ANALYSIS_STATUS_DOT,
  INSTALLMENT_STATUS_COLOR, INSTALLMENT_STATUS_LABEL
} from '@/lib/utils/ui'
import { cn } from '@/lib/utils'
import type { Contract, ContractInstallment, Analysis } from '@/types'

interface ContratoDetalheProps {
  contract: Contract & {
    seller: { name: string; city?: string; state?: string }
    buyer: { name: string; city?: string; country?: string }
    installments: (ContractInstallment & { analyses: Analysis[] })[]
  }
}

export function ContratoDetalhe({ contract: c }: ContratoDetalheProps) {
  const [selectedInstallment, setSelectedInstallment] = useState<string | null>(null)
  const pct = c.total_quantity > 0 ? ((c.total_takeup || 0) / c.total_quantity) * 100 : 0
  const installments = c.installments || []

  const selected = selectedInstallment
    ? installments.find(i => i.id === selectedInstallment)
    : null

  const totalAnalyses = installments.reduce((s, i) => s + (i.analyses?.length || 0), 0)
  const finishedAnalyses = installments.reduce((s, i) =>
    s + (i.analyses?.filter(a => a.status === 'finalizada').length || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/contratos" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para Contratos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800">{c.contract_number}</h1>
            {c.reference && <span className="text-sm text-slate-400">Ref: {c.reference}</span>}
            {c.currency && <Badge variant="outline">{c.currency}</Badge>}
            {c.terms && <Badge variant="outline">{c.terms}</Badge>}
            {c.contract_subtype && <Badge variant="secondary">{c.contract_subtype}</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
            <span className="font-medium">{c.seller?.name}</span>
            <span className="text-slate-300">→</span>
            <span>{c.buyer?.name}</span>
          </div>
        </div>
        <Button asChild className="bg-blue-700 hover:bg-blue-800 shrink-0">
          <Link href={`/analises/nova?contract=${c.id}`}>
            <Plus className="h-4 w-4 mr-1.5" /> Nova Análise
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Qtd Contratada" value={`${c.total_quantity.toLocaleString('pt-BR')}t`} />
        <StatCard label="TakeUp Realizado" value={`${(c.total_takeup || 0).toLocaleString('pt-BR')}t`} color="text-green-700" />
        <StatCard label="Saldo Pendente" value={`${(c.balance_pending || 0).toLocaleString('pt-BR')}t`} color={(c.balance_pending || 0) > 0 ? "text-orange-600" : "text-slate-800"} />
        <StatCard label="Análises" value={`${finishedAnalyses}/${totalAnalyses}`} />
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4 px-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-slate-700">Progresso de TakeUp</span>
            <span className="font-semibold text-slate-800">{pct.toFixed(1)}%</span>
          </div>
          <Progress value={pct} className="h-2.5" />
        </CardContent>
      </Card>

      <Tabs defaultValue="parcelas">
        <TabsList>
          <TabsTrigger value="parcelas">Parcelas ({installments.length})</TabsTrigger>
          <TabsTrigger value="info">Informações do Contrato</TabsTrigger>
        </TabsList>

        <TabsContent value="parcelas" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Installments list */}
            <div className="space-y-2">
              {installments.map(inst => {
                const pctInst = inst.scheduled_quantity > 0
                  ? (inst.delivered_quantity / inst.scheduled_quantity) * 100 : 0
                const analyses = inst.analyses || []
                const isSelected = selectedInstallment === inst.id

                return (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInstallment(isSelected ? null : inst.id)}
                    className={cn(
                      'w-full text-left rounded-xl border p-4 transition-all hover:border-blue-300',
                      isSelected ? 'border-blue-500 bg-blue-50' : 'bg-white'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">
                          {formatMonth(inst.reference_month)}
                        </span>
                        <Badge variant="outline" className={cn('text-[10px]', INSTALLMENT_STATUS_COLOR[inst.status])}>
                          {INSTALLMENT_STATUS_LABEL[inst.status]}
                        </Badge>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>{inst.delivered_quantity}t / {inst.scheduled_quantity}t</p>
                        {inst.due_date && <p>Venc: {formatDate(inst.due_date)}</p>}
                      </div>
                    </div>
                    <Progress value={pctInst} className="h-1.5" />

                    {analyses.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {analyses.map(a => (
                          <span key={a.id} className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded-full border',
                            ANALYSIS_STATUS_COLOR[a.status]
                          )}>
                            {ANALYSIS_STATUS_LABEL[a.status]}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected installment detail */}
            <div>
              {selected ? (
                <Card className="sticky top-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Parcela {formatMonth(selected.reference_month)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Programado</p>
                        <p className="font-semibold">{selected.scheduled_quantity}t</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Entregue</p>
                        <p className="font-semibold text-green-700">{selected.delivered_quantity}t</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Saldo</p>
                        <p className="font-semibold text-orange-600">{selected.remaining_quantity}t</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Vencimento</p>
                        <p className="font-semibold">{formatDate(selected.due_date)}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        Análises ({selected.analyses?.length || 0})
                      </p>
                      {(selected.analyses || []).length === 0 ? (
                        <p className="text-xs text-slate-400">Nenhuma análise para esta parcela.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {selected.analyses!.map(a => (
                            <Link key={a.id} href={`/analises/${a.id}`}>
                              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 border text-xs">
                                <div className="flex items-center gap-2">
                                  <div className={cn('w-2 h-2 rounded-full', ANALYSIS_STATUS_DOT[a.status])} />
                                  <span>{ANALYSIS_STATUS_LABEL[a.status]}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                  {a.approved_tons && <span>{a.approved_tons}t</span>}
                                  <span>{formatDate(a.created_at)}</span>
                                  <ChevronRight className="h-3 w-3" />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      <Button asChild size="sm" variant="outline" className="w-full mt-3 gap-1.5 text-xs">
                        <Link href={`/analises/nova?contract=${c.id}&installment=${selected.id}`}>
                          <Plus className="h-3.5 w-3.5" /> Nova Análise nesta Parcela
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-300 gap-2">
                  <BarChart3 className="h-10 w-10" />
                  <p className="text-sm">Selecione uma parcela para ver detalhes</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="py-5 px-5 space-y-4">
              <InfoGrid items={[
                { label: 'Vendedor (Produtor)', value: c.seller?.name },
                { label: 'Comprador', value: c.buyer?.name },
                { label: 'Origem', value: c.origin },
                { label: 'Moeda', value: c.currency },
                { label: 'Preço', value: c.price ? `${c.price} ${c.price_unit || ''}` : undefined },
                { label: 'Indexação', value: c.indexation },
                { label: 'Terms', value: c.terms },
                { label: 'Subtipo', value: c.contract_subtype },
                { label: 'Responsável', value: c.responsible },
              ]} />
              {c.quality_spec && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Especificação de Qualidade</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{c.quality_spec}</p>
                </div>
              )}
              {c.observation && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Observação</p>
                  <p className="text-sm text-slate-700">{c.observation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ label, value, color = 'text-slate-800' }: {
  label: string; value: string; color?: string
}) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={cn('text-xl font-bold', color)}>{value}</p>
      </CardContent>
    </Card>
  )
}

function InfoGrid({ items }: { items: { label: string; value?: string | null }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
      {items.filter(i => i.value).map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-sm font-medium text-slate-700">{value}</p>
        </div>
      ))}
    </div>
  )
}
