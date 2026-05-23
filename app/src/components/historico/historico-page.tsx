'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Pencil, Trash2, Filter, Download, Clock, FileText, Package, Calendar, ClipboardList, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuditEntry {
  id: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
  created_at: string
  user?: { name: string; email: string } | null
}

interface HistoricoPageProps {
  logs: AuditEntry[]
  contracts: { id: string; contract_number: string }[]
}

const ACTION_CONFIG = {
  create: { label: 'Criação',  color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500',  icon: Plus   },
  update: { label: 'Edição',   color: 'bg-blue-100  text-blue-700  border-blue-200',  dot: 'bg-blue-500',   icon: Pencil },
  delete: { label: 'Exclusão', color: 'bg-red-100   text-red-700   border-red-200',   dot: 'bg-red-500',    icon: Trash2 },
}

const ENTITY_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  contract: { label: 'Contrato',  icon: Package     },
  analysis: { label: 'Análise',   icon: ClipboardList },
  agenda:   { label: 'Agenda',    icon: Calendar    },
  report:   { label: 'Relatório', icon: FileText    },
}

const ENTITY_OPTIONS = [
  { value: '__all__',   label: 'Todas as entidades' },
  { value: 'contract',  label: 'Contratos' },
  { value: 'analysis',  label: 'Análises'  },
  { value: 'agenda',    label: 'Agenda'    },
  { value: 'report',    label: 'Relatórios'},
]

const ACTION_OPTIONS = [
  { value: '__all__', label: 'Todas as ações' },
  { value: 'create',  label: 'Criação'  },
  { value: 'update',  label: 'Edição'   },
  { value: 'delete',  label: 'Exclusão' },
]

function diffValues(oldV: Record<string,unknown>|null|undefined, newV: Record<string,unknown>|null|undefined): string[] {
  if (!oldV || !newV) return []
  return Object.keys(newV)
    .filter(k => JSON.stringify(oldV[k]) !== JSON.stringify(newV[k]))
    .map(k => {
      const fmt = (v: unknown) => (v === null || v === undefined) ? '—' : String(v)
      return `${k}: "${fmt(oldV[k])}" → "${fmt(newV[k])}"`
    })
}

function entityLabel(type: string) { return ENTITY_CONFIG[type]?.label ?? type }

function EntityIcon({ type, className }: { type: string; className?: string }) {
  const Ic = ENTITY_CONFIG[type]?.icon ?? FileText
  return <Ic className={cn('h-4 w-4', className)} />
}

export function HistoricoPage({ logs, contracts }: HistoricoPageProps) {
  const [search, setSearch]               = useState('')
  const [entityFilter, setEntityFilter]   = useState('__all__')
  const [actionFilter, setActionFilter]   = useState('__all__')
  const [contractFilter, setContractFilter] = useState('__all__')
  const [dateFrom, setDateFrom]           = useState('')
  const [dateTo, setDateTo]               = useState('')
  const [exportOpen, setExportOpen]       = useState(false)
  const [exportItems, setExportItems]     = useState<string[]>([])

  const filtered = useMemo(() => logs.filter(log => {
    if (entityFilter  !== '__all__' && log.entity_type !== entityFilter)  return false
    if (actionFilter  !== '__all__' && log.action      !== actionFilter)  return false
    if (dateFrom && log.created_at < dateFrom)                            return false
    if (dateTo   && log.created_at > dateTo + 'T23:59:59')               return false
    if (search) {
      const s = search.toLowerCase()
      const userMatch   = log.user?.name?.toLowerCase().includes(s) || log.user?.email?.toLowerCase().includes(s)
      const entityMatch = entityLabel(log.entity_type).toLowerCase().includes(s)
      const valMatch    = JSON.stringify(log.new_values || log.old_values || '').toLowerCase().includes(s)
      if (!userMatch && !entityMatch && !valMatch) return false
    }
    return true
  }), [logs, entityFilter, actionFilter, contractFilter, dateFrom, dateTo, search])

  const hasFilters = entityFilter !== '__all__' || actionFilter !== '__all__' || contractFilter !== '__all__' || !!dateFrom || !!dateTo || !!search

  function clearFilters() {
    setEntityFilter('__all__'); setActionFilter('__all__'); setContractFilter('__all__')
    setDateFrom(''); setDateTo(''); setSearch('')
  }

  function toggleExportItem(id: string) {
    setExportItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleExport() {
    const selected = filtered.filter(l => exportItems.includes(l.id))
    const rows = selected.map(l => {
      const cfg    = ACTION_CONFIG[l.action]
      const diffs  = diffValues(l.old_values as Record<string,unknown>, l.new_values as Record<string,unknown>)
      const detail = diffs.length > 0 ? diffs.join('<br>') : (l.new_values ? JSON.stringify(l.new_values).slice(0,100) : '—')
      const bg     = l.action === 'create' ? '#dcfce7;color:#16a34a' : l.action === 'update' ? '#dbeafe;color:#2563eb' : '#fee2e2;color:#dc2626'
      return `<tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:8px 12px;font-size:12px;color:#64748b">${new Date(l.created_at).toLocaleString('pt-BR')}</td>
        <td style="padding:8px 12px;font-size:12px">${l.user?.name ?? '—'}</td>
        <td style="padding:8px 12px;font-size:12px">${entityLabel(l.entity_type)}</td>
        <td style="padding:8px 12px"><span style="background:${bg};padding:2px 8px;border-radius:9999px;font-size:11px">${cfg.label}</span></td>
        <td style="padding:8px 12px;font-size:11px;color:#64748b">${detail}</td>
      </tr>`
    }).join('')

    const html = [
      '<!DOCTYPE html><html><head><meta charset="utf-8"><style>',
      'body{font-family:Arial,sans-serif;margin:0;padding:32px;color:#1e293b}',
      '.hdr{background:#1e3a5f;color:#fff;padding:24px 32px;margin:-32px -32px 32px}',
      '.hdr h1{margin:0;font-size:20px}.hdr p{margin:4px 0 0;font-size:13px;opacity:.8}',
      'table{width:100%;border-collapse:collapse}',
      'th{background:#f8fafc;padding:10px 12px;text-align:left;font-size:12px;color:#64748b;border-bottom:2px solid #e2e8f0}',
      '.ftr{margin-top:32px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:16px}',
      '</style></head><body>',
      `<div class="hdr"><h1>LAFERLINS CORRETORA</h1><p>Histórico de Atividades — Exportado em ${new Date().toLocaleString('pt-BR')}</p></div>`,
      '<table><thead><tr><th>Data/Hora</th><th>Usuário</th><th>Entidade</th><th>Ação</th><th>Detalhes</th></tr></thead>',
      `<tbody>${rows}</tbody></table>`,
      '<div class="ftr">Gerado pelo sistema Agenda TakeUp — Laferlins Corretora</div>',
      '</body></html>',
    ].join('')

    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const win  = window.open(url, '_blank')
    if (win) { win.onload = () => { win.print(); URL.revokeObjectURL(url) } }
    setExportOpen(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Histórico de Atividades</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} registro(s)</p>
        </div>
        <Button onClick={() => { setExportItems(filtered.slice(0, 50).map(l => l.id)); setExportOpen(true) }}
          variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Exportar Relatório
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4" /> Filtros
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative col-span-2 md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{ENTITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{ACTION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={contractFilter} onValueChange={setContractFilter}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos os contratos</SelectItem>
              {contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.contract_number}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <span className="text-xs text-slate-500">Período:</span>
          <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="De" />
          <span className="text-xs text-slate-400">até</span>
          <DatePicker value={dateTo} onChange={setDateTo} placeholder="Até" />
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-slate-100" />
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-slate-400">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum registro encontrado</p>
            </motion.div>
          ) : (
            <div className="space-y-1 pb-8">
              {filtered.map((log, i) => {
                const cfg        = ACTION_CONFIG[log.action]
                const ActionIcon = cfg.icon
                const diffs      = diffValues(log.old_values as Record<string,unknown>, log.new_values as Record<string,unknown>)
                return (
                  <motion.div key={log.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.4) }}
                    className="flex gap-4 pl-1">
                    <div className="relative z-10 flex items-start pt-3.5">
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shadow-sm border-2 border-white', cfg.dot)}>
                        <ActionIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl border border-slate-100 p-3.5 mb-2 hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5 font-semibold', cfg.color)}>{cfg.label}</Badge>
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-700">
                            <EntityIcon type={log.entity_type} className="text-slate-400" />
                            {entityLabel(log.entity_type)}
                          </span>
                          {log.user?.name && (
                            <span className="text-xs text-slate-500">por <span className="font-semibold text-slate-700">{log.user.name}</span></span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      {diffs.length > 0 && (
                        <div className="mt-2 space-y-0.5">
                          {diffs.slice(0, 5).map((d, idx) => (
                            <p key={idx} className="text-[11px] text-slate-500 font-mono bg-slate-50 rounded px-2 py-0.5 truncate">{d}</p>
                          ))}
                          {diffs.length > 5 && <p className="text-[10px] text-slate-400 pl-2">+{diffs.length - 5} mais alterações</p>}
                        </div>
                      )}
                      {!diffs.length && log.new_values && (
                        <p className="mt-1.5 text-[11px] text-slate-400 truncate font-mono bg-slate-50 rounded px-2 py-0.5">
                          {JSON.stringify(log.new_values).slice(0, 120)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Exportar Relatório de Histórico</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Selecione os registros a incluir:</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setExportItems(filtered.map(l => l.id))}>Todos</Button>
              <Button size="sm" variant="outline" onClick={() => setExportItems([])}>Limpar</Button>
              <span className="ml-auto text-xs text-slate-400 self-center">{exportItems.length} selecionado(s)</span>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-0.5 border rounded-lg p-2">
              {filtered.map(log => {
                const cfg = ACTION_CONFIG[log.action]
                return (
                  <label key={log.id} className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer">
                    <Checkbox checked={exportItems.includes(log.id)} onCheckedChange={() => toggleExportItem(log.id)} />
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold border', cfg.color)}>{cfg.label}</span>
                    <span className="text-xs text-slate-600 flex-1 truncate">{entityLabel(log.entity_type)} — {log.user?.name ?? '—'}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleDateString('pt-BR')}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setExportOpen(false)}>Cancelar</Button>
              <Button onClick={handleExport} disabled={exportItems.length === 0} className="bg-blue-700 hover:bg-blue-800">
                <Download className="h-4 w-4 mr-1.5" /> Gerar e Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
