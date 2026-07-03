'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DateInput } from '@/components/ui/date-input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Phone, Mail, Users, MapPin, MessageCircle, StickyNote, Loader2, Send, Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/date-format'
import { useCollection } from '@/lib/partners/use-collection'
import type { PartnerInteraction, PartnerKind, InteractionType } from '@/types'

interface InteractionsTabProps {
  partnerKind: PartnerKind
  partnerId: string
  canWrite: boolean
  currentUserId?: string
  isAdmin: boolean
}

const TYPE_META: Record<InteractionType, { label: string; icon: typeof Phone }> = {
  ligacao: { label: 'Ligação', icon: Phone },
  email: { label: 'E-mail', icon: Mail },
  reuniao: { label: 'Reunião', icon: Users },
  visita: { label: 'Visita', icon: MapPin },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle },
  nota: { label: 'Nota', icon: StickyNote },
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function InteractionsTab({ partnerKind, partnerId, canWrite, currentUserId, isAdmin }: InteractionsTabProps) {
  const { data: items, loading, reload } = useCollection<PartnerInteraction>(
    `/api/partners/interactions?partner_kind=${partnerKind}&partner_id=${partnerId}`,
  )
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState<InteractionType>('nota')
  const [content, setContent] = useState('')
  const [occurredAt, setOccurredAt] = useState(() => todayISO())

  async function submit() {
    if (!content.trim()) { toast.error('Descreva a interação.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/partners/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_kind: partnerKind, partner_id: partnerId, type, content,
          occurred_at: occurredAt ? new Date(occurredAt).toISOString() : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao registrar')
      toast.success('Interação registrada!')
      setContent(''); setType('nota'); setOccurredAt(todayISO())
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao registrar')
    } finally {
      setSaving(false)
    }
  }

  async function remove(it: PartnerInteraction) {
    if (!confirm('Remover esta interação?')) return
    try {
      const res = await fetch(`/api/partners/interactions/${it.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Erro ao remover')
      toast.success('Interação removida.')
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover')
    }
  }

  return (
    <div className="space-y-6">
      {canWrite && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as InteractionType)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_META) as InteractionType[]).map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_META[t].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Data</Label>
              <DateInput value={occurredAt} onChange={setOccurredAt} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="O que foi tratado…" />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Registrar
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma interação registrada.</p>
      ) : (
        <ol className="relative border-l border-border ml-3 space-y-6">
          {items.map((it) => {
            const meta = TYPE_META[it.type] ?? TYPE_META.nota
            const Icon = meta.icon
            const canManage = canWrite && (isAdmin || it.created_by === currentUserId)
            return (
              <li key={it.id} className="ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted border border-border">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">{meta.label}</span>
                      <span className="text-muted-foreground">· {formatDate(it.occurred_at)}</span>
                    </div>
                    {canManage && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(it)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{it.content}</p>
                  {it.creator?.name && <p className="text-xs text-muted-foreground mt-2">por {it.creator.name}</p>}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
