'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { ArrowLeft, Loader2, Save, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { PartnerFormFields, toPayload, type FormValues } from './partner-form-fields'
import { ContactsTab } from './contacts-tab'
import { DocumentsTab } from './documents-tab'
import { InteractionsTab } from './interactions-tab'
import { FarmsTab } from './farms-tab'
import type { PartnerConfig } from '@/lib/partners/config'
import { formatDate } from '@/lib/utils/date-format'

type Item = Record<string, unknown> & { id: string; name: string; is_active: boolean }

interface ContractSummary {
  id: string
  contract_number: string
  reference?: string
  total_quantity?: number
  total_takeup?: number
  is_active?: boolean
}

interface PartnerDetailClientProps {
  config: PartnerConfig
  item: Item
  canWrite: boolean
  isAdmin: boolean
  currentUserId?: string
  contracts?: ContractSummary[]
}

function initialValues(config: PartnerConfig, item: Item): FormValues {
  const v: FormValues = {}
  for (const f of config.fields) {
    const raw = item[f.key]
    v[f.key] = raw == null ? '' : String(raw)
  }
  return v
}

export function PartnerDetailClient({ config, item, canWrite, isAdmin, currentUserId, contracts }: PartnerDetailClientProps) {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>(() => initialValues(config, item))
  const [isActive, setIsActive] = useState<boolean>(item.is_active)
  const [name, setName] = useState(item.name)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const entityType = config.entityType as 'seller' | 'buyer' | 'laboratory' | 'warehouse' | 'carrier'

  async function saveDados() {
    if (!values.name?.trim()) { toast.error('Informe o nome.'); return }
    setSaving(true)
    try {
      const res = await fetch(`${config.apiBase}/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...toPayload(config.fields, values), is_active: isActive }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      toast.success('Cadastro atualizado!')
      setName(values.name)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`${config.apiBase}/${item.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Erro ao excluir')
      toast.success(`${config.singular} excluído.`)
      router.push(config.route)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={config.route}>
            <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-foreground truncate">{name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{config.singular}</span>
              <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
            </div>
          </div>
        </div>
        {isAdmin && (
          <Button variant="outline" className="text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Excluir
          </Button>
        )}
      </div>

      <Tabs defaultValue="dados">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="crm">Relacionamento</TabsTrigger>
          {config.hasFarms && <TabsTrigger value="fazendas">Fazendas</TabsTrigger>}
          {config.hasContracts && <TabsTrigger value="contratos">Contratos</TabsTrigger>}
        </TabsList>

        <TabsContent value="dados" className="pt-4">
          <div className="rounded-lg border border-border bg-card p-5 space-y-5">
            <PartnerFormFields
              fields={config.fields}
              values={values}
              onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
              disabled={!canWrite || saving}
            />
            <div className="flex items-center gap-2">
              <Checkbox id="is_active" checked={isActive} disabled={!canWrite || saving} onCheckedChange={(v) => setIsActive(v === true)} />
              <Label htmlFor="is_active" className="cursor-pointer">Cadastro ativo</Label>
            </div>
            {canWrite && (
              <div className="flex justify-end">
                <Button onClick={saveDados} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar alterações
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contatos" className="pt-4">
          <ContactsTab partnerKind={config.kind} partnerId={item.id} canWrite={canWrite} currentUserId={currentUserId} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="documentos" className="pt-4">
          <DocumentsTab entityType={entityType} entityId={item.id} canWrite={canWrite} />
        </TabsContent>

        <TabsContent value="crm" className="pt-4">
          <InteractionsTab partnerKind={config.kind} partnerId={item.id} canWrite={canWrite} currentUserId={currentUserId} isAdmin={isAdmin} />
        </TabsContent>

        {config.hasFarms && (
          <TabsContent value="fazendas" className="pt-4">
            <FarmsTab sellerId={item.id} canWrite={canWrite} isAdmin={isAdmin} />
          </TabsContent>
        )}

        {config.hasContracts && (
          <TabsContent value="contratos" className="pt-4">
            {!contracts || contracts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Nenhum contrato vinculado.</p>
            ) : (
              <div className="rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead className="text-right">Qtd. total</TableHead>
                      <TableHead className="text-right">TakeUp</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-foreground">{c.contract_number}</TableCell>
                        <TableCell>{c.reference || '—'}</TableCell>
                        <TableCell className="text-right tabular-nums">{(c.total_quantity ?? 0).toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right tabular-nums">{(c.total_takeup ?? 0).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <Link href={`/contratos/${c.id}`}><ExternalLink className="h-4 w-4 text-muted-foreground" /></Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <p className="text-xs text-muted-foreground">Criado em {formatDate(item.created_at as string)}</p>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir {config.singular.toLowerCase()}?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Se o cadastro estiver vinculado a contratos, considere apenas inativá-lo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
