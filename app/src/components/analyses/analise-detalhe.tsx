'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, Upload, CheckCircle, XCircle, Calendar, MessageSquare,
  FileText, Loader2, CheckCircle2, AlertTriangle, Clock, RotateCcw, Printer
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatMonth, toISODate } from '@/lib/utils/date-format'
import { ANALYSIS_STATUS_LABEL, ANALYSIS_STATUS_COLOR, ANALYSIS_STATUS_DOT } from '@/lib/utils/ui'
import { cn } from '@/lib/utils'
import type { Analysis, AnalysisComment, TakeupReschedule } from '@/types'

interface AnaliseDetalheProps {
  analysis: Analysis & {
    contract: { id: string; contract_number: string; seller: { name: string }; buyer: { name: string } }
    installment: { id: string; reference_month: string; scheduled_quantity: number; remaining_quantity: number; due_date?: string }
    comments: (AnalysisComment & { creator?: { name: string } })[]
    reschedules: (TakeupReschedule & { creator?: { name: string } })[]
  }
  responsibles: { name: string; type: string }[]
  currentUserId?: string
}

export function AnaliseDetalhe({ analysis: initialAnalysis, responsibles, currentUserId }: AnaliseDetalheProps) {
  const router = useRouter()
  const supabase = createClient()
  const [analysis, setAnalysis] = useState(initialAnalysis)
  const [loading, setLoading] = useState(false)

  // Comment form state
  const [commentText, setCommentText] = useState('')
  const [commentFile, setCommentFile] = useState<File | null>(null)
  const [commentLoading, setCommentLoading] = useState(false)

  // HVI approval
  const [hviApproved, setHviApproved] = useState<boolean | null>(null)
  const [hviApprovalDate, setHviApprovalDate] = useState('')
  const [hviObservation, setHviObservation] = useState('')
  const [hviRejectionReason, setHviRejectionReason] = useState('')

  // TakeUp scheduling
  const [takeupDate, setTakeupDate] = useState('')
  const [takeupResponsible, setTakeupResponsible] = useState('')

  // TakeUp resolution
  const [takeupAction, setTakeupAction] = useState<'finalizado' | 'cancelado' | 'reagendado' | null>(null)
  const [takeupActualDate, setTakeupActualDate] = useState('')
  const [takeupFile, setTakeupFile] = useState<File | null>(null)
  const [takeupCancelReason, setTakeupCancelReason] = useState('')
  const [takeupNewDate, setTakeupNewDate] = useState('')
  const [takeupRescheduleReason, setTakeupRescheduleReason] = useState('')

  // Finalization
  const [reportDate, setReportDate] = useState('')
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [approvedTons, setApprovedTons] = useState('')
  const [finalObservation, setFinalObservation] = useState('')

  const hviResponsibles = responsibles.filter(r => r.type === 'hvi' || r.type === 'geral')
  const takeupResponsibles = responsibles.filter(r => r.type === 'takeup' || r.type === 'geral')

  // Export report dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  function handleExportReport() {
    const a = analysis
    const now = new Date()
    const todayFormatted = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    const todayISO = now.toISOString().split('T')[0]

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Resumo de Análise — ${a.contract?.contract_number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #1e293b; font-size: 13px; padding: 32px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #1d4ed8; margin-bottom: 24px; }
  .company { font-size: 20px; font-weight: bold; color: #1d4ed8; }
  .subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
  .issue-date { font-size: 11px; color: #64748b; text-align: right; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #1d4ed8; border-bottom: 1px solid #bfdbfe; padding-bottom: 4px; margin-bottom: 10px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
  .field { display: flex; flex-direction: column; gap: 2px; }
  .label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 600; }
  .value { font-size: 13px; color: #0f172a; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: bold; background: #dbeafe; color: #1d4ed8; }
  .obs { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; font-size: 12px; color: #475569; min-height: 40px; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">LAFERLINS CORRETORA</div>
      <div class="subtitle">Relatório de Análise de Algodão</div>
    </div>
    <div class="issue-date">
      Data de emissão: ${todayFormatted}<br/>
      Documento: ${a.contract?.contract_number || '—'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Dados do Contrato</div>
    <div class="grid">
      <div class="field"><span class="label">Número do Contrato</span><span class="value">${a.contract?.contract_number || '—'}</span></div>
      <div class="field"><span class="label">Status</span><span class="value"><span class="badge">${a.status}</span></span></div>
      <div class="field"><span class="label">Vendedor (Produtor)</span><span class="value">${a.contract?.seller?.name || '—'}</span></div>
      <div class="field"><span class="label">Comprador</span><span class="value">${a.contract?.buyer?.name || '—'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Dados HVI</div>
    <div class="grid">
      <div class="field"><span class="label">Responsável HVI</span><span class="value">${a.hvi_responsible || '—'}</span></div>
      <div class="field"><span class="label">Data Recebimento HVI</span><span class="value">${a.hvi_received_date ? new Date(a.hvi_received_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</span></div>
      <div class="field"><span class="label">HVI Aprovado</span><span class="value">${a.hvi_approved === true ? 'Sim' : a.hvi_approved === false ? 'Não' : '—'}</span></div>
      <div class="field"><span class="label">Data Aprovação/Reprovação</span><span class="value">${a.hvi_approval_date ? new Date(a.hvi_approval_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</span></div>
      ${a.hvi_rejection_reason ? `<div class="field" style="grid-column:1/-1"><span class="label">Motivo Reprovação</span><span class="value">${a.hvi_rejection_reason}</span></div>` : ''}
      ${a.hvi_observation ? `<div class="field" style="grid-column:1/-1"><span class="label">Observação HVI</span><span class="value">${a.hvi_observation}</span></div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Dados TakeUp</div>
    <div class="grid">
      <div class="field"><span class="label">Responsável TakeUp</span><span class="value">${a.takeup_responsible || '—'}</span></div>
      <div class="field"><span class="label">Data Prevista</span><span class="value">${a.takeup_scheduled_date ? new Date(a.takeup_scheduled_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</span></div>
      <div class="field"><span class="label">Data Realização</span><span class="value">${a.takeup_actual_date ? new Date(a.takeup_actual_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</span></div>
      <div class="field"><span class="label">Reagendamentos</span><span class="value">${a.takeup_reschedule_count || 0}</span></div>
      ${a.approved_tons != null ? `<div class="field"><span class="label">Toneladas Aprovadas</span><span class="value">${a.approved_tons}t</span></div>` : ''}
      ${a.report_delivery_date ? `<div class="field"><span class="label">Data Entrega Relatório</span><span class="value">${new Date(a.report_delivery_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span></div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Observações</div>
    <div class="obs">${a.final_observation || 'Nenhuma observação registrada.'}</div>
  </div>

  <div class="footer">
    <span>Gerado em ${todayFormatted} por Gabriela Ferreira</span>
    <span>LAFERLINS CORRETORA DE ALGODÃO — Documento interno</span>
  </div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (win) {
      win.onload = () => {
        win.print()
        setTimeout(() => URL.revokeObjectURL(url), 10000)
      }
    }
    setExportDialogOpen(false)
  }

  async function updateAnalysis(updates: Partial<Analysis>) {
    const { data, error } = await supabase
      .from('analyses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', analysis.id)
      .select('*').single()

    if (error) throw error

    await supabase.from('audit_log').insert({
      action: 'update', entity_type: 'analysis', entity_id: analysis.id,
      new_values: updates,
    })

    setAnalysis(prev => ({ ...prev, ...data }))
    router.refresh()
  }

  async function handleHviDecision() {
    if (hviApproved === null) return toast.error('Indique se o HVI foi aprovado ou reprovado.')
    if (!hviApprovalDate) return toast.error('Informe a data de aprovação/reprovação.')
    if (hviApproved === false && !hviRejectionReason) return toast.error('Informe o motivo da reprovação.')

    setLoading(true)
    try {
      await updateAnalysis({
        hvi_approved: hviApproved,
        hvi_approval_date: toISODate(hviApprovalDate),
        hvi_observation: hviObservation,
        hvi_rejection_reason: hviRejectionReason,
        status: hviApproved ? 'hvi_aprovado' : 'analise_interrompida',
      })
      toast.success(hviApproved ? 'HVI aprovado!' : 'HVI reprovado. Análise interrompida.')
    } catch (e) {
      toast.error('Erro ao registrar decisão do HVI.')
    } finally {
      setLoading(false)
    }
  }

  async function handleScheduleTakeup() {
    if (!takeupDate) return toast.error('Informe a data prevista do TakeUp.')
    if (!takeupResponsible) return toast.error('Informe o responsável pelo TakeUp.')
    setLoading(true)
    try {
      await updateAnalysis({
        takeup_scheduled_date: toISODate(takeupDate),
        takeup_responsible: takeupResponsible,
        status: 'takeup_agendado',
      })
      await supabase.from('known_responsibles')
        .upsert({ name: takeupResponsible, type: 'takeup' }, { onConflict: 'name,type', ignoreDuplicates: true })
      toast.success('TakeUp agendado!')
    } catch (e) {
      toast.error('Erro ao agendar TakeUp.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTakeupResolution() {
    if (!takeupAction) return
    setLoading(true)
    try {
      if (takeupAction === 'finalizado') {
        if (!takeupActualDate) return toast.error('Informe a data de realização.')
        let fileUrl: string | undefined
        if (takeupFile) {
          const path = `takeup/${analysis.contract_id}/${Date.now()}.${takeupFile.name.split('.').pop()}`
          await supabase.storage.from('takeup-files').upload(path, takeupFile)
          const { data: { publicUrl } } = supabase.storage.from('takeup-files').getPublicUrl(path)
          fileUrl = publicUrl
        }
        await updateAnalysis({
          takeup_actual_date: toISODate(takeupActualDate),
          takeup_file_url: fileUrl,
          takeup_file_name: takeupFile?.name,
          status: 'takeup_finalizado',
        })
        toast.success('TakeUp finalizado!')
      } else if (takeupAction === 'cancelado') {
        if (!takeupCancelReason) return toast.error('Informe o motivo do cancelamento.')
        await updateAnalysis({
          takeup_cancel_reason: takeupCancelReason,
          status: 'takeup_cancelado',
        })
        toast.success('TakeUp cancelado.')
      } else if (takeupAction === 'reagendado') {
        if (!takeupNewDate) return toast.error('Informe a nova data prevista.')
        // Record reschedule history
        await supabase.from('takeup_reschedules').insert({
          analysis_id: analysis.id,
          previous_date: analysis.takeup_scheduled_date,
          new_date: toISODate(takeupNewDate),
          reason: takeupRescheduleReason,
        })
        await updateAnalysis({
          takeup_scheduled_date: toISODate(takeupNewDate),
          takeup_reschedule_count: (analysis.takeup_reschedule_count || 0) + 1,
          status: 'takeup_agendado',
        })
        toast.success('TakeUp reagendado!')
      }
    } catch (e) {
      toast.error(`Erro: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleFinalize() {
    if (!reportDate) return toast.error('Informe a data de entrega do relatório.')
    if (!approvedTons) return toast.error('Informe a quantidade de toneladas aprovadas.')
    setLoading(true)
    try {
      let fileUrl: string | undefined
      if (reportFile) {
        const path = `report-files/${analysis.contract_id}/${Date.now()}.${reportFile.name.split('.').pop()}`
        await supabase.storage.from('report-files').upload(path, reportFile)
        const { data: { publicUrl } } = supabase.storage.from('report-files').getPublicUrl(path)
        fileUrl = publicUrl
      }
      await updateAnalysis({
        report_delivery_date: toISODate(reportDate),
        report_file_url: fileUrl,
        report_file_name: reportFile?.name,
        approved_tons: parseFloat(approvedTons),
        final_observation: finalObservation,
        status: 'finalizada',
      })
      toast.success('Análise finalizada com sucesso!')
    } catch (e) {
      toast.error(`Erro ao finalizar: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    setCommentLoading(true)
    try {
      let attachmentUrl: string | undefined
      let attachmentName: string | undefined
      if (commentFile) {
        const path = `comment-attachments/${analysis.id}/${Date.now()}.${commentFile.name.split('.').pop()}`
        await supabase.storage.from('comment-attachments').upload(path, commentFile)
        const { data: { publicUrl } } = supabase.storage.from('comment-attachments').getPublicUrl(path)
        attachmentUrl = publicUrl
        attachmentName = commentFile.name
      }

      const { data: comment } = await supabase.from('analysis_comments').insert({
        analysis_id: analysis.id,
        content: commentText.trim(),
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
      }).select('*, creator:created_by(name)').single()

      if (comment) {
        setAnalysis(prev => ({
          ...prev,
          comments: [comment as any, ...(prev.comments || [])],
        }))
      }
      setCommentText('')
      setCommentFile(null)
      toast.success('Comentário adicionado.')
    } catch (e) {
      toast.error('Erro ao adicionar comentário.')
    } finally {
      setCommentLoading(false)
    }
  }

  const s = analysis.status
  const showHviDecision = s === 'aguardando_aprovacao_hvi'
  const showTakeupSchedule = s === 'hvi_aprovado'
  const showTakeupResolution = s === 'takeup_agendado' || s === 'takeup_reagendado'
  const showFinalize = s === 'takeup_finalizado'

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/analises" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para Análises
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800">
              {analysis.contract?.contract_number}
            </h1>
            <Badge variant="outline" className={cn('text-xs', ANALYSIS_STATUS_COLOR[s])}>
              {ANALYSIS_STATUS_LABEL[s]}
            </Badge>
            {analysis.takeup_reschedule_count > 0 && (
              <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200">
                <RotateCcw className="h-3 w-3 mr-1" />
                {analysis.takeup_reschedule_count}x reagendado
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {analysis.contract?.seller?.name} → {analysis.contract?.buyer?.name}
            {' · '}Parcela: {formatMonth(analysis.installment?.reference_month)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExportDialogOpen(true)}
          className="shrink-0 gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          Exportar Resumo
        </Button>
      </div>

      {/* Export dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Resumo da Análise</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Será gerado um documento HTML formatado com os dados da análise{' '}
            <strong>{analysis.contract?.contract_number}</strong> que abrirá em nova aba para impressão.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleExportReport} className="bg-blue-700 hover:bg-blue-800 gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              Gerar e Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Status da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TimelineItem
              done={!!analysis.hvi_received_date}
              active={s === 'aguardando_aprovacao_hvi'}
              label="HVI Recebido"
              sub={analysis.hvi_received_date ? `${formatDate(analysis.hvi_received_date)} · ${analysis.hvi_responsible}` : ''}
              fileUrl={analysis.hvi_file_url}
              fileName={analysis.hvi_file_name}
            />
            <TimelineItem
              done={analysis.hvi_approved !== null && analysis.hvi_approved !== undefined}
              active={false}
              label={analysis.hvi_approved === false ? 'HVI Reprovado' : 'HVI Aprovado'}
              sub={analysis.hvi_approval_date ? formatDate(analysis.hvi_approval_date) : ''}
              error={analysis.hvi_approved === false}
            />
            <TimelineItem
              done={!!analysis.takeup_scheduled_date}
              active={s === 'takeup_agendado' || s === 'takeup_reagendado'}
              label="TakeUp Agendado"
              sub={analysis.takeup_scheduled_date
                ? `${formatDate(analysis.takeup_scheduled_date)} · ${analysis.takeup_responsible || '—'}`
                : ''}
            />
            <TimelineItem
              done={!!analysis.takeup_actual_date}
              active={s === 'takeup_finalizado'}
              label="TakeUp Realizado"
              sub={analysis.takeup_actual_date ? formatDate(analysis.takeup_actual_date) : ''}
              fileUrl={analysis.takeup_file_url}
              fileName={analysis.takeup_file_name}
            />
            <TimelineItem
              done={s === 'finalizada'}
              active={false}
              label="Análise Finalizada"
              sub={analysis.report_delivery_date
                ? `Relatório: ${formatDate(analysis.report_delivery_date)} · ${analysis.approved_tons}t aprovadas`
                : ''}
              fileUrl={analysis.report_file_url}
              fileName={analysis.report_file_name}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      {showHviDecision && (
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-blue-800">
              <FileText className="h-5 w-5" /> Decisão sobre HVI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                variant={hviApproved === true ? 'default' : 'outline'}
                onClick={() => setHviApproved(true)}
                className={cn(hviApproved === true && 'bg-green-700 hover:bg-green-800 border-green-700')}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" /> Aprovado
              </Button>
              <Button
                variant={hviApproved === false ? 'default' : 'outline'}
                onClick={() => setHviApproved(false)}
                className={cn(hviApproved === false && 'bg-red-700 hover:bg-red-800 border-red-700')}
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Reprovado
              </Button>
            </div>

            {hviApproved !== null && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Data de {hviApproved ? 'Aprovação' : 'Reprovação'} *</Label>
                  <Input type="date" value={hviApprovalDate} onChange={e => setHviApprovalDate(e.target.value)} />
                </div>
                {hviApproved === false && (
                  <div className="space-y-2">
                    <Label>Motivo da Reprovação *</Label>
                    <Textarea value={hviRejectionReason} onChange={e => setHviRejectionReason(e.target.value)} rows={2} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Observação (opcional)</Label>
                  <Textarea value={hviObservation} onChange={e => setHviObservation(e.target.value)} rows={2} />
                </div>
                <Button onClick={handleHviDecision} disabled={loading} className={cn(hviApproved ? 'bg-green-700 hover:bg-green-800' : 'bg-red-700 hover:bg-red-800')}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Confirmar Decisão
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showTakeupSchedule && (
        <Card className="border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-purple-800">
              <Calendar className="h-5 w-5" /> Agendar TakeUp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Data Prevista do TakeUp *</Label>
              <Input type="date" value={takeupDate} onChange={e => setTakeupDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>Responsável pelo TakeUp *</Label>
              <Input list="takeup-responsibles" placeholder="Nome..." value={takeupResponsible} onChange={e => setTakeupResponsible(e.target.value)} />
              <datalist id="takeup-responsibles">
                {takeupResponsibles.map(r => <option key={r.name} value={r.name} />)}
              </datalist>
            </div>
            <Button onClick={handleScheduleTakeup} disabled={loading} className="bg-purple-700 hover:bg-purple-800">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Calendar className="h-4 w-4 mr-1.5" />}
              Agendar TakeUp
            </Button>
          </CardContent>
        </Card>
      )}

      {showTakeupResolution && (
        <Card className="border-teal-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-teal-800">
              <CheckCircle2 className="h-5 w-5" /> Resolver TakeUp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              TakeUp previsto para: <strong>{formatDate(analysis.takeup_scheduled_date)}</strong>
              {' · '}{analysis.takeup_responsible}
            </p>

            <div className="flex gap-2 flex-wrap">
              {(['finalizado', 'cancelado', 'reagendado'] as const).map(a => (
                <Button
                  key={a}
                  variant={takeupAction === a ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTakeupAction(a)}
                  className={cn(
                    takeupAction === a && a === 'finalizado' && 'bg-green-700 border-green-700',
                    takeupAction === a && a === 'cancelado' && 'bg-red-700 border-red-700',
                    takeupAction === a && a === 'reagendado' && 'bg-orange-600 border-orange-600',
                  )}
                >
                  {a === 'finalizado' ? <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> : null}
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </Button>
              ))}
            </div>

            {takeupAction === 'finalizado' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Data de Realização *</Label>
                  <Input type="date" value={takeupActualDate} onChange={e => setTakeupActualDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Arquivo do TakeUp (opcional)</Label>
                  <Input type="file" onChange={e => setTakeupFile(e.target.files?.[0] || null)} />
                </div>
              </div>
            )}

            {takeupAction === 'cancelado' && (
              <div className="space-y-2">
                <Label>Motivo do Cancelamento *</Label>
                <Textarea value={takeupCancelReason} onChange={e => setTakeupCancelReason(e.target.value)} rows={2} />
              </div>
            )}

            {takeupAction === 'reagendado' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Nova Data Prevista *</Label>
                  <Input type="date" value={takeupNewDate} onChange={e => setTakeupNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Motivo do Reagendamento</Label>
                  <Textarea value={takeupRescheduleReason} onChange={e => setTakeupRescheduleReason(e.target.value)} rows={2} />
                </div>
              </div>
            )}

            {takeupAction && (
              <Button onClick={handleTakeupResolution} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Confirmar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {showFinalize && (
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" /> Finalizar Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data Entrega do Relatório *</Label>
                <Input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Toneladas Aprovadas *</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={approvedTons} onChange={e => setApprovedTons(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Upload do Relatório</Label>
              <Input type="file" onChange={e => setReportFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Observações Finais</Label>
              <Textarea value={finalObservation} onChange={e => setFinalObservation(e.target.value)} rows={2} />
            </div>
            <Button onClick={handleFinalize} disabled={loading} className="bg-green-700 hover:bg-green-800 gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Finalizar Análise
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reagendamento history */}
      {analysis.reschedules && analysis.reschedules.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-orange-500" /> Histórico de Reagendamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.reschedules.map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-orange-50">
                <div>
                  <span className="font-medium">{formatDate(r.previous_date)}</span>
                  <span className="text-slate-400 mx-2">→</span>
                  <span className="font-medium text-orange-700">{formatDate(r.new_date)}</span>
                  {r.reason && <span className="text-slate-500 ml-2">· {r.reason}</span>}
                </div>
                <span className="text-slate-400">{(r as any).creator?.name} · {formatDate(r.created_at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Comentários e Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add comment */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-50 border">
            <Textarea
              placeholder="Adicione um comentário ou observação..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={2}
              className="resize-none bg-white"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                <Upload className="h-3.5 w-3.5" />
                <input type="file" className="hidden" onChange={e => setCommentFile(e.target.files?.[0] || null)} />
                {commentFile ? commentFile.name : 'Anexar imagem'}
              </label>
              <Button size="sm" onClick={handleAddComment} disabled={commentLoading || !commentText.trim()}>
                {commentLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Comentar'}
              </Button>
            </div>
          </div>

          {/* Comment list */}
          <div className="space-y-3">
            {(analysis.comments || []).map(c => (
              <div key={c.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0 mt-0.5">
                  {(c as any).creator?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-slate-700">{(c as any).creator?.name || 'Usuário'}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{c.content}</p>
                  {c.attachment_url && (
                    <a href={c.attachment_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1">
                      <FileText className="h-3 w-3" /> {c.attachment_name || 'Anexo'}
                    </a>
                  )}
                </div>
              </div>
            ))}
            {(!analysis.comments || analysis.comments.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4">Nenhum comentário ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TimelineItem({ done, active, label, sub, fileUrl, fileName, error }: {
  done: boolean; active: boolean; label: string; sub?: string;
  fileUrl?: string | null; fileName?: string | null; error?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2',
        done && !error ? 'bg-green-600 border-green-600' :
        done && error ? 'bg-red-500 border-red-500' :
        active ? 'border-blue-500 bg-blue-50' :
        'border-slate-200 bg-white'
      )}>
        {done && !error && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
        {done && error && <XCircle className="h-3.5 w-3.5 text-white" />}
        {active && !done && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
      </div>
      <div className="flex-1">
        <p className={cn(
          'text-sm font-medium',
          done && !error ? 'text-slate-800' :
          done && error ? 'text-red-700' :
          active ? 'text-blue-700' : 'text-slate-400'
        )}>
          {label}
        </p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        {fileUrl && (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-0.5">
            <FileText className="h-3 w-3" /> {fileName || 'Ver arquivo'}
          </a>
        )}
      </div>
    </div>
  )
}
