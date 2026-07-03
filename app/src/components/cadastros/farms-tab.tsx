'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Loader2, Trash2, Pencil, Sprout } from 'lucide-react'
import { toast } from 'sonner'
import { useCollection } from '@/lib/partners/use-collection'
import type { ProducerFarm } from '@/types'

interface FarmsTabProps {
  sellerId: string
  canWrite: boolean
  isAdmin: boolean
}

const EMPTY = { name: '', sai_farm_code: '', city: '', state: '', hectares: '' }
type FarmForm = typeof EMPTY

export function FarmsTab({ sellerId, canWrite }: FarmsTabProps) {
  const { data: farms, loading, reload } = useCollection<ProducerFarm>(`/api/partners/farms?seller_id=${sellerId}`)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FarmForm>(EMPTY)

  function openNew() { setEditingId(null); setForm(EMPTY); setOpen(true) }
  function openEdit(f: ProducerFarm) {
    setEditingId(f.id)
    setForm({
      name: f.name, sai_farm_code: f.sai_farm_code || '', city: f.city || '',
      state: f.state || '', hectares: f.hectares != null ? String(f.hectares) : '',
    })
    setOpen(true)
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Informe o nome da fazenda.'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        sai_farm_code: form.sai_farm_code || null,
        city: form.city || null,
        state: form.state || null,
        hectares: form.hectares === '' ? null : Number(form.hectares),
      }
      const url = editingId ? `/api/partners/farms/${editingId}` : '/api/partners/farms'
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? payload : { ...payload, seller_id: sellerId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar fazenda')
      toast.success(editingId ? 'Fazenda atualizada!' : 'Fazenda adicionada!')
      setOpen(false)
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar fazenda')
    } finally {
      setSaving(false)
    }
  }

  async function remove(f: ProducerFarm) {
    if (!confirm(`Remover a fazenda "${f.name}"?`)) return
    try {
      const res = await fetch(`/api/partners/farms/${f.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Erro ao remover')
      toast.success('Fazenda removida.')
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover')
    }
  }

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className="flex justify-end">
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Nova fazenda</Button>
        </div>
      )}

      {farms.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center flex flex-col items-center gap-2">
          <Sprout className="h-6 w-6" /> Nenhuma fazenda cadastrada.
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fazenda</TableHead>
                <TableHead>Código SAI</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>UF</TableHead>
                <TableHead className="text-right">Hectares</TableHead>
                {canWrite && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium text-foreground">{f.name}</TableCell>
                  <TableCell>{f.sai_farm_code || '—'}</TableCell>
                  <TableCell>{f.city || '—'}</TableCell>
                  <TableCell>{f.state || '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.hectares != null ? f.hectares.toLocaleString('pt-BR') : '—'}</TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(f)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(f)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar fazenda' : 'Nova fazenda'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="f-name">Nome</Label>
              <Input id="f-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-sai">Código SAI</Label>
              <Input id="f-sai" value={form.sai_farm_code} onChange={(e) => setForm({ ...form, sai_farm_code: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-hectares">Hectares</Label>
              <Input id="f-hectares" type="number" inputMode="decimal" className="tabular-nums" value={form.hectares} onChange={(e) => setForm({ ...form, hectares: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-city">Cidade</Label>
              <Input id="f-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-state">UF</Label>
              <Input id="f-state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
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
