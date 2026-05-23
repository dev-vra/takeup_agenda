'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Package, FileText, BarChart3, Plus, ArrowLeft,
  CheckCircle2, AlertCircle, Clock, ChevronRight, Pencil, Archive, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatMonth } from '@/lib/utils/date-format'
import {
  ANALYSIS_STATUS_LABEL, ANALYSIS_STATUS_COLOR, ANALYSIS_STATUS_DOT,
  INSTALLMENT_STATUS_COLOR, INSTALLMENT_STATUS_LABEL
} from '@/lib/utils/ui'
import { cn } from '@/lib/utils'
import type { Contract, ContractInstallment, Analysis } from '@/types'

const ADMIN_USER_ID = '37e812af-9bb7-44ff-ae42-4cd04a2422e5'

interface ContratoDetalheProps {
  contract: Contract & {
    seller: { name: string; city?: string; state?: string }
    buyer: { name: string; city?: string; country?: string }
    installments: (ContractInstallment & { analyses: Analysis[] })[]
  }
  currentUserId?: string
}

export function ContratoDetalhe({ contract: initialContract, currentUserId }: ContratoDetalheProps) {
  const router = useRouter()
  const [c, setC] = useState(initialContract)
  const [selectedInstallment, setSelectedInstallment] = useState<string | null>(null)
  const isAdmin = currentUserId === ADMIN_USER_ID

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editResponsible, setEditResponsible] = useState(c.responsible || '')
  const [editObservation, setEditObservation] = useState(c.observation || '')
  const [editQualitySpec, setEditQualitySpec] = useState(c.quality_spec || '')

  // Archive dialog state
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)

  // Installment edit state
  const [instEditOpen, setInstEditOpen] = useState(false)
  const [instEditLoading, setInstEditLoading] = useState(false)
  const [instEditId, setInstEditId] = useState('')
  const [instEditQty, setInstEditQty] = useState('')
  const [instEditDue, setInstEditDue] = useState('')
  const [instEditStatus, setInstEditStatus] = useState('')

  async function handleEditSave() {
    setEditLoading(true)
    try {
      const res = await fetch(`/api/contracts/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responsible: editResponsible,
          observation: editObservation,
          quality_spec: editQualitySpec,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao salvar')
      }
      setC(prev => ({ ...prev, responsible: editResponsible, observation: editObservation, quality_spec: editQualitySpec }))
      toast.success('Contrato atualizado!')
      setEditOpen(false)
      router.refresh()
    } catch (e) {
      toast.error(`Erro: ${String(e)}`)
    } finally {
      setEditLoading(false)
    }
  }

  async function handleArchive() {
    setArchiveLoading(true)
    try {
      const res = await fetch(`/api/contracts/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao arquivar')
      }
      toast.success('Contrato arquivado.')
      router.push('/contratos')
    } catch (e) {
      toast.error(`Erro: ${String(e)}`)
    } finally {
      setArchiveLoading(false)
      setArchiveOpen(false)
    }
  }
  async function handleInstEditSave() {
    setInstEditLoading(true)
    try {
      const res = await fetch(`/api/installments/${instEditId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_quantity: parseFloat(instEditQty),
          due_date: instEditDue || null,
          status: instEditStatus,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao salvar parcela')
      }
      setC(prev => ({
        ...prev,
        installments: prev.installments.map(i =>
          i.id === instEditId
            ? { ...i, scheduled_quantity: parseFloat(instEditQty), due_date: instEditDue, status: instEditStatus as ContractInstallment['status'], analyses: i.analyses ?? [] }
            : { ...i, analyses: i.analyses ?? [] }
        ),
      }))
      toast.success('Parcela atualizada!')
      setInstEditOpen(false)
      router.refresh()
    } catch (e) {
      toast.error(`Erro: ${String(e)}`)
    } finally {
      setInstEditLoading(false)
    }
  }

  const pct = c.total_quantity > 0 ? ((c.total_takeup || 0) / c.total_quantity) * 100 : 0
  const installments = (c as typeof initialContract).installments || []

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
        <div className="flex gap-2 shrink-0 flex-wrap">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEditResponsible(c.responsible || ''); setEditObservation(c.observation || ''); setEditQualitySpec(c.quality_spec || ''); setEditOpen(true) }}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchiveOpen(true)}
                className="gap-1.5 text-orange-600 hover:text-orange-700 hover:border-orange-300"
              >
                <Archive className="h-3.5 w-3.5" /> Arquivar
              </Button>
            </>
          )}
          <Button asChild className="bg-blue-700 hover:bg-blue-800">
            <Link href={`/analises/nova?contract=${c.id}`}>
              <Plus className="h-4 w-4 mr-1.5" /> Nova Análise
            </Link>
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contrato {c.contract_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input value={editResponsible} onChange={e => setEditResponsible(e.target.value)} placeholder="Nome do responsável" />
            </div>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Textarea value={editObservation} onChange={e => setEditObservation(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Especificação de Qualidade</Label>
              <Textarea value={editQualitySpec} onChange={e => setEditQualitySpec(e.target.value)} rows={4} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditSave} disabled={editLoading} className="bg-blue-700 hover:bg-blue-800 gap-1.5">
              {editLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar Contrato</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Deseja arquivar o contrato <strong>{c.contract_number}</strong>? O contrato ficará inativo e não aparecerá na lista de contratos ativos.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>Cancelar</Button>
            <Button onClick={handleArchive} disabled={archiveLoading} className="bg-orange-600 hover:bg-orange-700 gap-1.5">
              {archiveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Archive className="h-3.5 w-3.5" />}
              Arquivar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Installment Edit Dialog */}
      <Dialog open={instEditOpen} onOpenChange={setInstEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Parcela</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quantidade Programada (t)</Label>
              <Input type="number" value={instEditQty} onChange={e => setInstEditQty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <DateInput value={instEditDue} onChange={setInstEditDue} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={instEditStatus}
                onChange={e => setInstEditStatus(e.target.value)}
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="atrasada">Atrasada</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setInstEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleInstEditSave} disabled={instEditLoading} className="bg-blue-700 hover:bg-blue-800 gap-1.5">
              {instEditLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Parcela {formatMonth(selected.reference_month)}
                      </CardTitle>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-7 text-xs"
                          onClick={() => {
                            setInstEditId(selected.id)
                            setInstEditQty(String(selected.scheduled_quantity))
                            setInstEditDue(selected.due_date || '')
                            setInstEditStatus(selected.status)
                            setInstEditOpen(true)
                          }}
                        >
                          <Pencil className="h-3 w-3" /> Editar
                        </Button>
                      )}
                    </div>
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
