'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Printer, Filter, PlusCircle, RefreshCcw, Trash2, History } from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
  user?: { name: string; email: string }
}

interface HistoricoPageProps {
  logs: AuditLog[]
  contracts: { id: string; contract_number: string }[]
}

const ACTION_LABEL: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
}

const ACTION_COLOR: Record<string, string> = {
  create: 'bg-green-100 text-green-700 border-green-200',
  update: 'bg-blue-100 text-blue-700 border-blue-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
}

const ACTION_ICON_COLOR: Record<string, string> = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
}

const ENTITY_LABEL: Record<string, string> = {
  contract: 'Contrato',
  analysis: 'Análise',
  agenda_entry: 'Agenda',
  report: 'Relatório',
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const mon = months[d.getMonth()]
  const year = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${mon}/${year} ${hh}:${mm}`
}

function diffValues(
  oldVals: Record<string, unknown> | null,
  newVals: Record<string, unknown> | null,
): { key: string; from: string; to: string }[] {
  const changes: { key: string; from: string; to: string }[] = []
  const allKeys = new Set([
    ...Object.keys(oldVals || {}),
    ...Object.keys(newVals || {}),
  ])
  for (const key of allKeys) {
    const oldV = (oldVals || {})[key]
    const newV = (newVals || {})[key]
    const oldStr = oldV == null ? '—' : String(oldV)
    const newStr = newV == null ? '—' : String(newV)
    if (oldStr !== newStr) {
      changes.push({ key, from: oldStr, to: newStr })
    }
  }
  return changes
}

const REPORT_FIELDS = [
  { id: 'user', label: 'Usuário responsável' },
  { id: 'action', label: 'Tipo de ação' },
  { id: 'entity', label: 'Entidade afetada' },
  { id: 'diff', label: 'Valores alterados' },
  { id: 'date', label: 'Data e hora' },
]

export function HistoricoPage({ logs, contracts }: HistoricoPageProps) {
  const [entityFilter, setEntityFilter] = useState('__all__')
  const [contractFilter, setContractFilter] = useState('__all__')
  const [actionFilter, setActionFilter] = useState('__all__')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>(REPORT_FIELDS.map(f => f.id))

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (entityFilter !== '__all__' && log.entity_type !== entityFilter) return false
      if (actionFilter !== '__all__' && log.action !== actionFilter) return false
      if (contractFilter !== '__all__') {
        const contract = contracts.find(c => c.id === contractFilter)
        if (!contract) return false
        const vals = { ...log.old_values, ...log.new_values }
        if (!JSON.stringify(vals).includes(contract.contract_number)) return false
      }
      if (dateFrom && log.created_at < dateFrom) return false
      if (dateTo && log.created_at > dateTo + 'T23:59:59Z') return false
      return true
    })
  }, [logs, entityFilter, actionFilter, contractFilter, dateFrom, dateTo, contracts])

  function toggleField(id: string) {
    setSelectedFields(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  function handleExport() {
    const now = new Date()
    const todayFormatted = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    const show = (id: string) => selectedFields.includes(id)

    const rows = filtered.map(log => {
      const changes = diffValues(log.old_values, log.new_values)
      const diffHtml = changes.length === 0
        ? '<span style="color:#94a3b8">—</span>'
        : changes.map(c =>
            `<span style="color:#475569"><strong>${c.key}</strong>: <span style="color:#ef4444">${c.from}</span> → <span style="color:#22c55e">${c.to}</span></span>`
          ).join('<br/>')

      const cells = []
      if (show('date')) cells.push(`<td>${formatDateTime(log.created_at)}</td>`)
      if (show('user')) cells.push(`<td>${log.user?.name || log.user_id}</td>`)
      if (show('action')) cells.push(`<td>${ACTION_LABEL[log.action] || log.action}</td>`)
      if (show('entity')) cells.push(`<td>${ENTITY_LABEL[log.entity_type] || log.entity_type}</td>`)
      if (show('diff')) cells.push(`<td style="font-size:11px;line-height:1.6">${diffHtml}</td>`)

      return `<tr>${cells.join('')}</tr>`
    }).join('')

    const headers = []
    if (show('date')) headers.push('<th>Data/Hora</th>')
    if (show('user')) headers.push('<th>Usuário</th>')
    if (show('action')) headers.push('<th>Ação</th>')
    if (show('entity')) headers.push('<th>Entidade</th>')
    if (show('diff')) headers.push('<th>Alterações</th>')

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Histórico de Atividades — Laferlins</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;color:#1e293b;font-size:12px;padding:32px;max-width:900px;margin:0 auto}
  .header{background:#1e3a5f;color:white;padding:20px 24px;border-radius:8px;margin-bottom:24px}
  .header h1{font-size:18px;font-weight:bold;letter-spacing:0.02em}
  .header p{font-size:11px;opacity:0.8;margin-top:4px}
  .meta{display:flex;justify-content:space-between;margin-bottom:16px;font-size:11px;color:#64748b}
  table{width:100%;border-collapse:collapse}
  th{background:#f1f5f9;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;padding:8px 10px;text-align:left;border-bottom:2px solid #e2e8f0}
  td{padding:8px 10px;border-bottom:1px solid #f1f5f9;vertical-align:top}
  tr:hover td{background:#f8fafc}
  .footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between}
  @media print{body{padding:16px}}
</style>
</head>
<body>
  <div class="header">
    <h1>LAFERLINS CORRETORA</h1>
    <p>Histórico de Atividades — ${filtered.length} registros exportados</p>
  </div>
  <div class="meta">
    <span>Gerado em: ${todayFormatted}</span>
    <span>Período: ${dateFrom || 'início'} até ${dateTo || 'hoje'}</span>
  </div>
  <table>
    <thead><tr>${headers.join('')}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <span>LAFERLINS CORRETORA DE ALGODÃO — Documento interno</span>
    <span>Total: ${filtered.length} registros</span>
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
    setExportOpen(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Histórico de Atividades</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} registros encontrados</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} className="gap-1.5">
          <Printer className="h-4 w-4" /> Exportar Relatório
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs mb-1.5 block">Tipo de Entidade</Label>
          <Select value={entityFilter} onValueChange={v => setEntityFilter(v ?? '__all__')}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              <SelectItem value="contract">Contrato</SelectItem>
              <SelectItem value="analysis">Análise</SelectItem>
              <SelectItem value="agenda_entry">Agenda</SelectItem>
              <SelectItem value="report">Relatório</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Ação</Label>
          <Select value={actionFilter} onValueChange={v => setActionFilter(v ?? '__all__')}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              <SelectItem value="create">Criação</SelectItem>
              <SelectItem value="update">Atualização</SelectItem>
              <SelectItem value="delete">Exclusão</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">De</Label>
          <Input type="date" className="h-8 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Até</Label>
          <Input type="date" className="h-8 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <History className="h-12 w-12" />
          <p className="text-sm">Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

          <div className="space-y-1">
            {filtered.map((log, i) => {
              const changes = diffValues(log.old_values, log.new_values)
              return (
                <div key={log.id} className="flex gap-4 relative pl-12 pb-6">
                  {/* Dot */}
                  <div className={cn(
                    'absolute left-3.5 top-1 w-3 h-3 rounded-full border-2 border-white',
                    ACTION_ICON_COLOR[log.action]
                  )} />

                  {/* Content */}
                  <div className="flex-1 bg-white border rounded-xl p-4 space-y-2 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn('text-[10px] px-1.5', ACTION_COLOR[log.action])}>
                          {log.action === 'create' ? <PlusCircle className="h-3 w-3 mr-1 inline" /> :
                           log.action === 'update' ? <RefreshCcw className="h-3 w-3 mr-1 inline" /> :
                           <Trash2 className="h-3 w-3 mr-1 inline" />}
                          {ACTION_LABEL[log.action]}
                        </Badge>
                        <span className="text-xs font-medium text-slate-700">
                          {ENTITY_LABEL[log.entity_type] || log.entity_type}
                        </span>
                        {log.new_values?.contract_number != null && (
                          <span className="text-xs text-blue-600 font-medium">
                            {String(log.new_values.contract_number)}
                          </span>
                        )}
                        {log.old_values?.contract_number != null && log.new_values?.contract_number == null && (
                          <span className="text-xs text-blue-600 font-medium">
                            {String(log.old_values.contract_number)}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">{formatDateTime(log.created_at)}</p>
                        {log.user?.name && (
                          <p className="text-[10px] text-slate-400">{log.user.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Diff */}
                    {changes.length > 0 && (
                      <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t">
                        {changes.slice(0, 5).map(c => (
                          <div key={c.key} className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-600 shrink-0">{c.key}:</span>
                            <span className="text-red-500 line-through truncate max-w-32">{c.from}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-green-600 truncate max-w-32">{c.to}</span>
                          </div>
                        ))}
                        {changes.length > 5 && (
                          <p className="text-[10px] text-slate-400">+{changes.length - 5} alterações</p>
                        )}
                      </div>
                    )}

                    {/* New values for create (no old) */}
                    {log.action === 'create' && log.new_values && Object.keys(log.new_values).length > 0 && (
                      <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t">
                        {Object.entries(log.new_values).slice(0, 4).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-2">
                            <span className="font-medium text-slate-600 shrink-0">{k}:</span>
                            <span className="text-slate-700 truncate">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Relatório de Histórico</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mb-4">
            Selecione os campos a incluir no relatório. Serão exportados <strong>{filtered.length}</strong> registros.
          </p>
          <div className="space-y-3">
            {REPORT_FIELDS.map(field => (
              <div key={field.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`field-${field.id}`}
                  checked={selectedFields.includes(field.id)}
                  onChange={() => toggleField(field.id)}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-700 cursor-pointer"
                />
                <Label htmlFor={`field-${field.id}`} className="cursor-pointer">{field.label}</Label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setExportOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleExport}
              disabled={selectedFields.length === 0}
              className="bg-blue-700 hover:bg-blue-800 gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              Gerar e Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
