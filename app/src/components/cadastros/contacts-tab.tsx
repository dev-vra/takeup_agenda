'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Loader2, Star, Mail, Phone, Trash2, Pencil, User } from 'lucide-react'
import { toast } from 'sonner'
import { useCollection } from '@/lib/partners/use-collection'
import type { PartnerContact, PartnerKind } from '@/types'

interface ContactsTabProps {
  partnerKind: PartnerKind
  partnerId: string
  canWrite: boolean
  currentUserId?: string
  isAdmin: boolean
}

const EMPTY = { name: '', role: '', email: '', phone: '', whatsapp: '', is_primary: false }
type ContactForm = typeof EMPTY

export function ContactsTab({ partnerKind, partnerId, canWrite, currentUserId, isAdmin }: ContactsTabProps) {
  const { data: contacts, loading, reload } = useCollection<PartnerContact>(
    `/api/partners/contacts?partner_kind=${partnerKind}&partner_id=${partnerId}`,
  )
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContactForm>(EMPTY)

  function openNew() { setEditingId(null); setForm(EMPTY); setOpen(true) }
  function openEdit(c: PartnerContact) {
    setEditingId(c.id)
    setForm({
      name: c.name, role: c.role || '', email: c.email || '',
      phone: c.phone || '', whatsapp: c.whatsapp || '', is_primary: c.is_primary,
    })
    setOpen(true)
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Informe o nome do contato.'); return }
    setSaving(true)
    try {
      const url = editingId ? `/api/partners/contacts/${editingId}` : '/api/partners/contacts'
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? form : { ...form, partner_kind: partnerKind, partner_id: partnerId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar contato')
      toast.success(editingId ? 'Contato atualizado!' : 'Contato adicionado!')
      setOpen(false)
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar contato')
    } finally {
      setSaving(false)
    }
  }

  async function remove(c: PartnerContact) {
    if (!confirm(`Remover o contato "${c.name}"?`)) return
    try {
      const res = await fetch(`/api/partners/contacts/${c.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Erro ao remover')
      toast.success('Contato removido.')
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover')
    }
  }

  const canManage = (c: PartnerContact) => canWrite && (isAdmin || c.created_by === currentUserId)

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className="flex justify-end">
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Novo contato</Button>
        </div>
      )}

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhum contato cadastrado.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground truncate">{c.name}</span>
                  {c.is_primary && <Badge variant="default" className="gap-1"><Star className="h-3 w-3" /> Principal</Badge>}
                </div>
                {canManage(c) && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
              {c.role && <p className="text-sm text-muted-foreground">{c.role}</p>}
              {c.email && <p className="text-sm flex items-center gap-1.5 text-foreground"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {c.email}</p>}
              {c.phone && <p className="text-sm flex items-center gap-1.5 text-foreground"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {c.phone}</p>}
              {c.whatsapp && <p className="text-sm flex items-center gap-1.5 text-foreground"><Phone className="h-3.5 w-3.5 text-emerald-500" /> {c.whatsapp}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar contato' : 'Novo contato'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="c-name">Nome</Label>
              <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="c-role">Cargo / função</Label>
              <Input id="c-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">E-mail</Label>
              <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">Telefone</Label>
              <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-whatsapp">WhatsApp</Label>
              <Input id="c-whatsapp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox id="c-primary" checked={form.is_primary} onCheckedChange={(v) => setForm({ ...form, is_primary: v === true })} />
              <Label htmlFor="c-primary" className="cursor-pointer">Contato principal</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
