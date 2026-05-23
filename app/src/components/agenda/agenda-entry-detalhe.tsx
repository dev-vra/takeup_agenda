'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Send, Paperclip, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { formatDate, formatMonth } from '@/lib/utils/date-format'
import { ANALYSIS_STATUS_LABEL, ANALYSIS_STATUS_COLOR } from '@/lib/utils/ui'
import { cn } from '@/lib/utils'
import type { AgendaEntry, AgendaComment, AgendaEntryStatus } from '@/types'

const ADMIN_USER_ID = '37e812af-9bb7-44ff-ae42-4cd04a2422e5'

interface AgendaEntryDetalheProps {
  entry: AgendaEntry & {
    creator?: { name: string }
    analysis?: {
      id: string
      status: string
      contract: { contract_number: string; seller: { name: string }; buyer: { name: string } } | null
      installment: { reference_month: string } | null
    } | null
    contract?: { contract_number: string } | null
  }
  comments: (AgendaComment & { creator?: { name: string } })[]
  currentUserId?: string
}

const STATUS_LABELS: Record<AgendaEntryStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const STATUS_COLORS: Record<AgendaEntryStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  em_andamento: 'bg-blue-100 text-blue-700',
  concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-slate-100 text-slate-500',
}

export function AgendaEntryDetalhe({ entry: initialEntry, comments: initialComments, currentUserId }: AgendaEntryDetalheProps) {
  const router = useRouter()
  const supabase = createClient()
  const [entry, setEntry] = useState(initialEntry)
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const isAdmin = currentUserId === ADMIN_USER_ID

  // Edit state
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editTitle, setEditTitle] = useState(entry.title)
  const [editDescription, setEditDescription] = useState(entry.description || '')
  const [editDate, setEditDate] = useState(entry.scheduled_date || '')
  const [editTime, setEditTime] = useState(entry.scheduled_time || '')

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleEditSave() {
    if (!editTitle.trim()) return toast.error('Título é obrigatório.')
    setEditLoading(true)
    try {
      const { error } = await supabase.from('agenda_entries').update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        scheduled_date: editDate || null,
        scheduled_time: editTime || null,
      }).eq('id', entry.id)

      if (error) throw error
      setEntry(prev => ({ ...prev, title: editTitle.trim(), description: editDescription.trim() || undefined, scheduled_date: editDate || prev.scheduled_date, scheduled_time: editTime || undefined }))
      toast.success('Lançamento atualizado!')
      setEditOpen(false)
      router.refresh()
    } catch (e) {
      toast.error(`Erro: ${String(e)}`)
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      const { error } = await supabase.from('agenda_entries').delete().eq('id', entry.id)
      if (error) throw error

      await supabase.from('audit_log').insert({
        action: 'delete',
        entity_type: 'agenda_entry',
        entity_id: entry.id,
        old_values: { title: entry.title, scheduled_date: entry.scheduled_date },
      })

      toast.success('Lançamento excluído.')
      router.push('/agenda')
    } catch (e) {
      toast.error(`Erro: ${String(e)}`)
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  async function handleStatusChange(newStatus: AgendaEntryStatus) {
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('agenda_entries')
        .update({ status: newStatus })
        .eq('id', entry.id)

      if (error) throw error

      setEntry(prev => ({ ...prev, status: newStatus }))
      toast.success('Status atualizado!')
    } catch (e) {
      toast.error(`Erro: ${String(e)}`)
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return

    setSubmittingComment(true)
    try {
      let attachmentUrl: string | null = null
      let attachmentName: string | null = null

      if (attachmentFile) {
        const ext = attachmentFile.name.split('.').pop()
        const path = `agenda/${entry.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('agenda-attachments').upload(path, attachmentFile)

        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage.from('agenda-attachments').getPublicUrl(path)
        attachmentUrl = publicUrl
        attachmentName = attachmentFile.name
      }

      const { data: comment, error } = await supabase
        .from('agenda_comments')
        .insert({
          agenda_entry_id: entry.id,
          content: commentText.trim(),
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
        })
        .select('*, creator:created_by(name)')
        .single()

      if (error) throw error

      setComments(prev => [...prev, comment as any])
      setCommentText('')
      setAttachmentFile(null)
      toast.success('Comentário adicionado!')
    } catch (e) {
      toast.error(`Erro: ${String(e)}`)
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lançamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data</Label>
                <DateInput value={editDate} onChange={setEditDate} />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} />
              </div>
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

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Lançamento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Tem certeza que deseja excluir o lançamento <strong>{entry.title}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button onClick={handleDelete} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700 gap-1.5">
              {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-800">{entry.title}</h1>
          {entry.description && (
            <p className="text-slate-500 text-sm mt-0.5">{entry.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEditTitle(entry.title); setEditDescription(entry.description || ''); setEditDate(entry.scheduled_date || ''); setEditTime(entry.scheduled_time || ''); setEditOpen(true) }}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                className="gap-1.5 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </Button>
            </>
          )}
          <Badge className={cn(STATUS_COLORS[entry.status])}>
            {STATUS_LABELS[entry.status]}
          </Badge>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Data</span>
            <span className="font-medium">{formatDate(entry.scheduled_date)}</span>
          </div>
          {entry.scheduled_time && (
            <div className="flex justify-between">
              <span className="text-slate-500">Horário</span>
              <span className="font-medium">{entry.scheduled_time}</span>
            </div>
          )}
          {entry.analysis && (
            <div className="flex justify-between">
              <span className="text-slate-500">Análise</span>
              <a href={`/analises/${entry.analysis.id}`} className="font-medium text-blue-600 hover:underline">
                {entry.analysis.contract?.contract_number}
                {entry.analysis.installment && ` · ${formatMonth(entry.analysis.installment.reference_month)}`}
                <span className={cn('ml-2 text-xs px-1.5 py-0.5 rounded-full', (ANALYSIS_STATUS_COLOR as Record<string, string>)[entry.analysis.status] || 'bg-slate-100 text-slate-600')}>
                  {(ANALYSIS_STATUS_LABEL as Record<string, string>)[entry.analysis.status] || entry.analysis.status}
                </span>
              </a>
            </div>
          )}
          {entry.contract && (
            <div className="flex justify-between">
              <span className="text-slate-500">Contrato</span>
              <span className="font-medium">{entry.contract.contract_number}</span>
            </div>
          )}
          {entry.creator && (
            <div className="flex justify-between">
              <span className="text-slate-500">Criado por</span>
              <span className="font-medium">{entry.creator.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change */}
      <Card>
        <CardHeader><CardTitle className="text-base">Atualizar Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(STATUS_LABELS) as [AgendaEntryStatus, string][]).map(([status, label]) => (
              <Button
                key={status}
                variant={entry.status === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(status)}
                disabled={updatingStatus || entry.status === status}
                className={entry.status === status ? 'bg-blue-700 hover:bg-blue-800' : ''}
              >
                {status === 'concluido' && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader><CardTitle className="text-base">Comentários</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum comentário ainda</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="rounded-lg bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{c.creator?.name || 'Usuário'}</span>
                    <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">{c.content}</p>
                  {c.attachment_url && c.attachment_name && (
                    <a
                      href={c.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                    >
                      <Paperclip className="h-3 w-3" />
                      {c.attachment_name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          <div className="space-y-2 pt-2 border-t">
            <Label>Novo Comentário</Label>
            <Input
              placeholder="Adicione um comentário..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                <Paperclip className="h-3.5 w-3.5" />
                {attachmentFile ? attachmentFile.name : 'Anexar arquivo'}
                <input
                  type="file"
                  className="hidden"
                  onChange={e => setAttachmentFile(e.target.files?.[0] || null)}
                />
              </label>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={submittingComment || !commentText.trim()}
                className="gap-1.5 bg-blue-700 hover:bg-blue-800"
              >
                {submittingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
