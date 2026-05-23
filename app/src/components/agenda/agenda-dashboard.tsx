'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDate, formatMonth } from '@/lib/utils/date-format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider
} from '@/components/ui/tooltip'
import {
  AlertTriangle, Calendar, CheckCircle2, Clock, Package,
  Plus, TrendingUp, Activity, FileSearch, MessageSquare,
  ChevronRight, Zap
} from 'lucide-react'
import { ANALYSIS_STATUS_LABEL, ANALYSIS_STATUS_COLOR, cn } from '@/lib/utils/ui'
import type { AgendaEntry, Analysis, ContractInstallment, AnalysisComment } from '@/types'

const DashboardCharts = dynamic(
  () => import('@/components/charts/dashboard-charts').then(m => m.DashboardCharts),
  { ssr: false }
)

interface KPIs {
  activeAnalyses: number
  finishedThisMonth: number
  totalTonsThisMonth: number
  todayCount: number
}

interface AgendaDashboardProps {
  todayEntries: AgendaEntry[]
  overdueAnalyses: Analysis[]
  upcomingAnalyses: Analysis[]
  overdueInstallments: ContractInstallment[]
  recentComments: AnalysisComment[]
  kpis: KPIs
  openAnalyses: Analysis[]
}

export function AgendaDashboard({
  todayEntries, overdueAnalyses, upcomingAnalyses,
  overdueInstallments, recentComments, kpis, openAnalyses
}: AgendaDashboardProps) {
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <TooltipProvider delayDuration={500}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Greeting + actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {greeting}! 👋
            </h1>
            <p className="text-slate-500 mt-0.5">
              {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/analises/nova">
                <Plus className="h-4 w-4 mr-1" /> Nova Análise
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-blue-700 hover:bg-blue-800">
              <Link href="/agenda/nova">
                <Calendar className="h-4 w-4 mr-1" /> Novo Lançamento
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Análises em Aberto — card clicável, sem tooltip de info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0 }}
          >
            <Link href="/analises" className="block group">
              <Card className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="py-4 px-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Análises em Aberto</p>
                    <p className="text-xl font-bold text-slate-800">{kpis.activeAnalyses}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Finalizadas no Mês */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardContent className="py-4 px-4 flex items-center gap-3 cursor-default">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-green-50">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Finalizadas no Mês</p>
                      <p className="text-xl font-bold text-slate-800">{kpis.finishedThisMonth}</p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Análises com status &apos;Finalizada&apos; criadas/atualizadas neste mês</TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Tons Aprovadas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardContent className="py-4 px-4 flex items-center gap-3 cursor-default">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-50">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tons Aprovadas (Mês)</p>
                      <p className="text-xl font-bold text-slate-800">{kpis.totalTonsThisMonth.toFixed(2)}t</p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Total de toneladas aprovadas em análises finalizadas neste mês</TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Compromissos Hoje */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className={cn(kpis.todayCount > 0 && 'border-orange-200')}>
                  <CardContent className="py-4 px-4 flex items-center gap-3 cursor-default">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-orange-50">
                      <Zap className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Compromissos Hoje</p>
                      <p className="text-xl font-bold text-slate-800">{kpis.todayCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Lançamentos da agenda com data de hoje</TooltipContent>
            </Tooltip>
          </motion.div>
        </div>

        {/* Charts Section */}
        <DashboardCharts openAnalyses={openAnalyses} />

        {/* Alertas críticos */}
        {(overdueAnalyses.length > 0 || overdueInstallments.length > 0) && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertas — Ação Necessária ({overdueAnalyses.length + overdueInstallments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueAnalyses.map(a => (
                <AlertItem
                  key={a.id}
                  href={`/analises/${a.id}`}
                  title={`TakeUp Atrasado — ${(a.contract as any)?.contract_number || '—'}`}
                  sub={`Previsto: ${formatDate(a.takeup_scheduled_date)} · ${(a.contract as any)?.seller?.name || ''}`}
                  color="text-red-700"
                />
              ))}
              {overdueInstallments.map(i => (
                <AlertItem
                  key={i.id}
                  href={`/contratos/${(i as any).contract?.id}`}
                  title={`Parcela Vencendo — ${(i as any).contract?.contract_number || '—'}`}
                  sub={`Vencimento: ${formatDate(i.due_date)} · Saldo: ${i.remaining_quantity}t`}
                  color="text-orange-700"
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Main content: tabs */}
        <Tabs defaultValue="hoje" className="space-y-4">
          <TabsList>
            <TabsTrigger value="hoje" className="gap-1">
              Hoje
              {todayEntries.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">{todayEntries.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analises" className="gap-1">
              Análises em Andamento
              {openAnalyses.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">{openAnalyses.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1">
              Próximos TakeUps
              {upcomingAnalyses.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">{upcomingAnalyses.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="atividade">Atividade Recente</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje" className="mt-0">
            {todayEntries.length === 0 ? (
              <EmptyState icon={<Calendar className="h-8 w-8 text-slate-300" />} message="Nenhum lançamento para hoje" />
            ) : (
              <div className="space-y-2">
                {todayEntries.map(entry => (
                  <Link key={entry.id} href={`/agenda/${entry.id}`} className="block">
                    <Card className="hover:border-blue-300 transition-colors cursor-pointer">
                      <CardContent className="py-3 px-4 flex items-center gap-3">
                        <div className={cn(
                          'w-1.5 h-10 rounded-full',
                          entry.status === 'concluido' ? 'bg-green-400' :
                          entry.status === 'cancelado' ? 'bg-slate-300' :
                          entry.status === 'em_andamento' ? 'bg-blue-400' : 'bg-orange-400'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800 truncate">{entry.title}</p>
                          {entry.description && (
                            <p className="text-xs text-slate-500 truncate">{entry.description}</p>
                          )}
                        </div>
                        {entry.scheduled_time && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" /> {entry.scheduled_time}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analises" className="mt-0">
            <AnalysesKanban analyses={openAnalyses} />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            {upcomingAnalyses.length === 0 ? (
              <EmptyState icon={<FileSearch className="h-8 w-8 text-slate-300" />} message="Nenhum TakeUp agendado próximo" />
            ) : (
              <div className="space-y-2">
                {upcomingAnalyses.map(a => (
                  <Link key={a.id} href={`/analises/${a.id}`} className="block">
                    <Card className="hover:border-blue-300 transition-colors cursor-pointer">
                      <CardContent className="py-3 px-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-slate-800">
                              {(a.contract as any)?.contract_number || '—'}
                            </p>
                            <Badge variant="outline" className={cn('text-[10px] px-1.5', ANALYSIS_STATUS_COLOR[a.status])}>
                              {ANALYSIS_STATUS_LABEL[a.status]}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {(a.contract as any)?.seller?.name} → {(a.contract as any)?.buyer?.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-slate-700">{formatDate(a.takeup_scheduled_date)}</p>
                          <p className="text-[10px] text-slate-400">{a.takeup_responsible || 'Sem resp.'}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="atividade" className="mt-0">
            {recentComments.length === 0 ? (
              <EmptyState icon={<MessageSquare className="h-8 w-8 text-slate-300" />} message="Nenhuma atividade recente" />
            ) : (
              <div className="space-y-2">
                {recentComments.map(c => (
                  <Link key={c.id} href={`/analises/${c.analysis_id}`} className="block">
                    <Card className="hover:border-slate-300 transition-colors cursor-pointer">
                      <CardContent className="py-3 px-4 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                          {(c as any).creator?.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{(c as any).creator?.name || 'Usuário'}</span>
                            {' '}comentou em{' '}
                            <span className="font-medium text-blue-600">{(c as any).analysis?.contract?.contract_number || '—'}</span>
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">{c.content}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{formatDate(c.created_at)}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

function AnalysesKanban({ analyses }: { analyses: Analysis[] }) {
  const [showFinalizada, setShowFinalizada] = useState(false)

  const displayed = showFinalizada
    ? analyses.filter(a => a.status === 'finalizada')
    : analyses.filter(a => a.status !== 'finalizada')

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFinalizada(v => !v)}
        >
          {showFinalizada ? 'Ver em Andamento' : 'Ver Finalizadas'}
        </Button>
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={<FileSearch className="h-8 w-8 text-slate-300" />}
          message={showFinalizada ? 'Nenhuma análise finalizada' : 'Nenhuma análise em andamento'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayed.map(a => (
            <AnalysisKanbanCard key={a.id} analysis={a} />
          ))}
        </div>
      )}
    </div>
  )
}

function AnalysisKanbanCard({ analysis: a }: { analysis: Analysis }) {
  const contract = (a as any).contract

  return (
    <Link href={`/analises/${a.id}`} className="block">
      <Card className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer h-full">
        <CardContent className="py-3.5 px-4 space-y-2.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-sm text-slate-800 truncate">
              {contract?.contract_number || '—'}
            </span>
            <Badge variant="outline" className={cn('text-[10px] px-1.5 shrink-0', ANALYSIS_STATUS_COLOR[a.status])}>
              {ANALYSIS_STATUS_LABEL[a.status]}
            </Badge>
          </div>

          {/* Seller → Buyer */}
          <div className="text-xs text-slate-500 flex items-center gap-1 min-w-0">
            <span className="truncate">{contract?.seller?.name || '—'}</span>
            <span className="text-slate-300 shrink-0">→</span>
            <span className="truncate">{contract?.buyer?.name || '—'}</span>
          </div>

          {/* Dates */}
          <div className="text-xs text-slate-400 space-y-0.5">
            {a.hvi_received_date && (
              <p>HVI: <span className="text-slate-600">{formatDate(a.hvi_received_date)}</span></p>
            )}
            {a.takeup_scheduled_date && (
              <p>TakeUp: <span className="text-slate-600">{formatDate(a.takeup_scheduled_date)}</span></p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {a.takeup_responsible ? (
              <span className="text-[10px] text-slate-400 truncate">{a.takeup_responsible}</span>
            ) : a.hvi_responsible ? (
              <span className="text-[10px] text-slate-400 truncate">{a.hvi_responsible}</span>
            ) : (
              <span />
            )}
            {a.takeup_reschedule_count > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 text-orange-600 border-orange-200 shrink-0">
                Reagendado {a.takeup_reschedule_count}x
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function AlertItem({ href, title, sub, color }: {
  href: string; title: string; sub: string; color: string
}) {
  return (
    <Link href={href} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-red-100/50 transition-colors group">
      <div>
        <p className={cn('text-xs font-semibold', color)}>{title}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
    </Link>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  )
}
