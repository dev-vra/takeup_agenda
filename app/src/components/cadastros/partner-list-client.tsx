'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Loader2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { PartnerFormFields, toPayload, type FormValues } from './partner-form-fields'
import type { PartnerConfig } from '@/lib/partners/config'
import { cn } from '@/lib/utils'

type Row = Record<string, unknown> & { id: string; name: string; is_active: boolean }

interface PartnerListClientProps {
  config: PartnerConfig
  items: Row[]
  canWrite: boolean
}

function emptyValues(config: PartnerConfig): FormValues {
  const v: FormValues = {}
  for (const f of config.fields) v[f.key] = ''
  return v
}

export function PartnerListClient({ config, items, canWrite }: PartnerListClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<FormValues>(() => emptyValues(config))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((it) => {
      if (activeFilter === 'active' && !it.is_active) return false
      if (activeFilter === 'inactive' && it.is_active) return false
      if (!q) return true
      return config.searchColumns.some((c) => String(it[c] ?? '').toLowerCase().includes(q))
    })
  }, [items, search, activeFilter, config.searchColumns])

  async function handleCreate() {
    if (!values.name?.trim()) { toast.error('Informe o nome.'); return }
    setSaving(true)
    try {
      const res = await fetch(config.apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...toPayload(config.fields, values), is_active: true }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao criar cadastro')
      toast.success(`${config.singular} cadastrado!`)
      setOpen(false)
      router.push(`${config.route}/${json.data.id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar cadastro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{config.plural}</h1>
          <p className="text-sm text-muted-foreground">Cadastro mestre de {config.plural.toLowerCase()}.</p>
        </div>
        {canWrite && (
          <Button onClick={() => { setValues(emptyValues(config)); setOpen(true) }}>
            <Plus className="h-4 w-4" /> Novo
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cidade…"
            className="pl-9"
          />
        </div>
        <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {config.listColumns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
              <TableHead>Situação</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={config.listColumns.length + 2} className="text-center text-muted-foreground py-10">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((it) => (
                <TableRow
                  key={it.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`${config.route}/${it.id}`)}
                >
                  {config.listColumns.map((c) => (
                    <TableCell key={c.key} className={cn(c.key === 'name' && 'font-medium text-foreground')}>
                      {String(it[c.key] ?? '—') || '—'}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge variant={it.is_active ? 'default' : 'secondary'}>
                      {it.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`${config.route}/${it.id}`} onClick={(e) => e.stopPropagation()}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Novo {config.singular}</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <PartnerFormFields
              fields={config.fields}
              values={values}
              onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
              disabled={saving}
            />
          </div>
          <SheetFooter>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Cadastrar
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
