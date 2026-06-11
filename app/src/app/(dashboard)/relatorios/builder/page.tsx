'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus, Trash2, GripVertical, Save, FileDown, ChevronDown, ChevronUp,
  BookTemplate, Pencil, Check, X, Eye, FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

// ─── Types ─────────────────────────────────────────────────────────────────

type FieldSource = 'contract' | 'analysis' | 'installment' | 'custom'
type GroupBy = 'none' | 'contract' | 'status' | 'month' | 'seller' | 'buyer'
type SortOrder = 'asc' | 'desc'

interface ReportField {
  id: string
  source: FieldSource
  field: string
  label: string
  visible: boolean
  bold?: boolean
  order: number
}

interface ReportSection {
  id: string
  title: string
  fields: ReportField[]
  groupBy: GroupBy
  sortField: string
  sortOrder: SortOrder
  showTotals: boolean
  collapsed: boolean
}

interface ReportConfig {
  title: string
  subtitle: string
  showDate: boolean
  showPageNumbers: boolean
  orientation: 'portrait' | 'landscape'
  sections: ReportSection[]
  footerText: string
}

interface SavedTemplate {
  id: string
  name: string
  description?: string
  config: ReportConfig
  created_by: string
  created_at: string
}

// ─── Constants ─────────────────────────────────────────────────────────────

const AVAILABLE_FIELDS: Record<FieldSource, { field: string; label: string }[]> = {
  contract: [
    { field: 'contract_number', label: 'Número do Contrato' },
    { field: 'reference', label: 'Referência' },
    { field: 'seller', label: 'Vendedor' },
    { field: 'buyer', label: 'Comprador' },
    { field: 'total_quantity', label: 'Quantidade Total' },
    { field: 'total_takeup', label: 'TakeUp Total' },
    { field: 'balance_pending', label: 'Saldo Pendente' },
    { field: 'origin', label: 'Origem' },
    { field: 'currency', label: 'Moeda' },
    { field: 'price', label: 'Preço' },
    { field: 'terms', label: 'Termos' },
    { field: 'responsible', label: 'Responsável' },
    { field: 'observation', label: 'Observação' },
  ],
  analysis: [
    { field: 'status', label: 'Status' },
    { field: 'hvi_received_date', label: 'Data Recebimento HVI' },
    { field: 'hvi_responsible', label: 'Responsável HVI' },
    { field: 'hvi_approved', label: 'HVI Aprovado' },
    { field: 'takeup_scheduled_date', label: 'Data TakeUp Agendado' },
    { field: 'takeup_actual_date', label: 'Data TakeUp Realizado' },
    { field: 'takeup_responsible', label: 'Responsável TakeUp' },
    { field: 'approved_tons', label: 'Toneladas Aprovadas' },
    { field: 'report_delivery_date', label: 'Data Entrega Relatório' },
    { field: 'final_observation', label: 'Observação Final' },
    { field: 'takeup_reschedule_count', label: 'Qtd. Reagendamentos' },
  ],
  installment: [
    { field: 'reference_month', label: 'Mês de Referência' },
    { field: 'scheduled_quantity', label: 'Qtd. Programada' },
    { field: 'delivered_quantity', label: 'Qtd. Entregue' },
    { field: 'remaining_quantity', label: 'Qtd. Restante' },
    { field: 'due_date', label: 'Data de Vencimento' },
    { field: 'status', label: 'Status Parcela' },
  ],
  custom: [
    { field: 'separator', label: 'Separador' },
    { field: 'spacer', label: 'Espaço em Branco' },
  ],
}

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  none: 'Sem agrupamento',
  contract: 'Por Contrato',
  status: 'Por Status',
  month: 'Por Mês',
  seller: 'Por Vendedor',
  buyer: 'Por Comprador',
}

const DEFAULT_CONFIG: ReportConfig = {
  title: 'Relatório de TakeUp',
  subtitle: '',
  showDate: true,
  showPageNumbers: true,
  orientation: 'portrait',
  footerText: 'Laferlins — Agenda TakeUp',
  sections: [
    {
      id: crypto.randomUUID(),
      title: 'Informações do Contrato',
      fields: [
        { id: crypto.randomUUID(), source: 'contract', field: 'contract_number', label: 'Contrato', visible: true, bold: true, order: 0 },
        { id: crypto.randomUUID(), source: 'contract', field: 'seller', label: 'Vendedor', visible: true, order: 1 },
        { id: crypto.randomUUID(), source: 'contract', field: 'buyer', label: 'Comprador', visible: true, order: 2 },
        { id: crypto.randomUUID(), source: 'contract', field: 'total_quantity', label: 'Qtd. Total', visible: true, order: 3 },
        { id: crypto.randomUUID(), source: 'contract', field: 'balance_pending', label: 'Saldo', visible: true, order: 4 },
      ],
      groupBy: 'none',
      sortField: 'contract_number',
      sortOrder: 'asc',
      showTotals: false,
      collapsed: false,
    },
  ],
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ReportBuilderPage() {
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG)
  const [templates, setTemplates] = useState<SavedTemplate[]>([])
  const [savingName, setSavingName] = useState('')
  const [savingDesc, setSavingDesc] = useState('')
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingXlsx, setGeneratingXlsx] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [addFieldDialogSection, setAddFieldDialogSection] = useState<string | null>(null)
  const [selectedFieldSource, setSelectedFieldSource] = useState<FieldSource>('contract')
  const [selectedField, setSelectedField] = useState('')

  const fetchTemplates = useCallback(async () => {
    const res = await fetch('/api/report-templates')
    if (res.ok) {
      const data = await res.json()
      setTemplates(data.templates || [])
    }
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  // ─ Config helpers ────────────────────────────────────────────────────────

  function updateConfig(patch: Partial<ReportConfig>) {
    setConfig(c => ({ ...c, ...patch }))
  }

  function addSection() {
    const section: ReportSection = {
      id: crypto.randomUUID(),
      title: `Seção ${config.sections.length + 1}`,
      fields: [],
      groupBy: 'none',
      sortField: '',
      sortOrder: 'asc',
      showTotals: false,
      collapsed: false,
    }
    setConfig(c => ({ ...c, sections: [...c.sections, section] }))
  }

  function removeSection(id: string) {
    setConfig(c => ({ ...c, sections: c.sections.filter(s => s.id !== id) }))
  }

  function updateSection(id: string, patch: Partial<ReportSection>) {
    setConfig(c => ({
      ...c,
      sections: c.sections.map(s => s.id === id ? { ...s, ...patch } : s),
    }))
  }

  function toggleSectionCollapse(id: string) {
    setConfig(c => ({
      ...c,
      sections: c.sections.map(s => s.id === id ? { ...s, collapsed: !s.collapsed } : s),
    }))
  }

  function moveSection(id: string, direction: 'up' | 'down') {
    setConfig(c => {
      const idx = c.sections.findIndex(s => s.id === id)
      if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === c.sections.length - 1)) return c
      const newSections = [...c.sections]
      const swap = direction === 'up' ? idx - 1 : idx + 1
      ;[newSections[idx], newSections[swap]] = [newSections[swap], newSections[idx]]
      return { ...c, sections: newSections }
    })
  }

  function openAddField(sectionId: string) {
    setAddFieldDialogSection(sectionId)
    setSelectedFieldSource('contract')
    setSelectedField('')
  }

  function confirmAddField() {
    if (!addFieldDialogSection || !selectedField) return
    const fieldDef = AVAILABLE_FIELDS[selectedFieldSource].find(f => f.field === selectedField)
    if (!fieldDef) return

    const newField: ReportField = {
      id: crypto.randomUUID(),
      source: selectedFieldSource,
      field: selectedField,
      label: fieldDef.label,
      visible: true,
      order: 999,
    }

    setConfig(c => ({
      ...c,
      sections: c.sections.map(s => {
        if (s.id !== addFieldDialogSection) return s
        return { ...s, fields: [...s.fields, newField] }
      }),
    }))
    setAddFieldDialogSection(null)
  }

  function removeField(sectionId: string, fieldId: string) {
    setConfig(c => ({
      ...c,
      sections: c.sections.map(s =>
        s.id !== sectionId ? s : { ...s, fields: s.fields.filter(f => f.id !== fieldId) }
      ),
    }))
  }

  function updateField(sectionId: string, fieldId: string, patch: Partial<ReportField>) {
    setConfig(c => ({
      ...c,
      sections: c.sections.map(s =>
        s.id !== sectionId ? s : {
          ...s,
          fields: s.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f),
        }
      ),
    }))
  }

  function moveField(sectionId: string, fieldId: string, direction: 'up' | 'down') {
    setConfig(c => ({
      ...c,
      sections: c.sections.map(s => {
        if (s.id !== sectionId) return s
        const idx = s.fields.findIndex(f => f.id === fieldId)
        if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === s.fields.length - 1)) return s
        const newFields = [...s.fields]
        const swap = direction === 'up' ? idx - 1 : idx + 1
        ;[newFields[idx], newFields[swap]] = [newFields[swap], newFields[idx]]
        return { ...s, fields: newFields }
      }),
    }))
  }

  // ─ Save / Load ───────────────────────────────────────────────────────────

  async function handleSaveTemplate() {
    if (!savingName.trim()) return toast.error('Informe um nome para o template')
    setSaving(true)
    try {
      const res = await fetch('/api/report-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: savingName, description: savingDesc, config }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Template salvo!')
      setSaveDialogOpen(false)
      setSavingName('')
      setSavingDesc('')
      fetchTemplates()
    } catch (e: unknown) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function loadTemplate(template: SavedTemplate) {
    setConfig(template.config)
    setLoadDialogOpen(false)
    toast.success(`Template "${template.name}" carregado!`)
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/report-templates/${id}`, { method: 'DELETE' })
    fetchTemplates()
    toast.success('Template excluído')
  }

  // ─ Generate DOCX ─────────────────────────────────────────────────────────

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/reports/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erro ao gerar documento')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${config.title.replace(/\s+/g, '_')}.docx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Documento gerado!')
    } catch (e: unknown) {
      toast.error((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleGenerateXlsx() {
    setGeneratingXlsx(true)
    try {
      const res = await fetch('/api/reports/generate-xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erro ao gerar planilha')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${config.title.replace(/\s+/g, '_')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Planilha gerada!')
    } catch (e: unknown) {
      toast.error((e as Error).message)
    } finally {
      setGeneratingXlsx(false)
    }
  }

  // ─ Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* Left panel — settings */}
      <div className="w-80 border-r bg-white flex flex-col overflow-hidden shrink-0">
        <div className="px-4 py-4 border-b">
          <h1 className="text-base font-semibold text-slate-800">Builder de Relatórios</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure a estrutura do seu relatório</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Global settings */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configurações Gerais</p>

            <div className="space-y-1.5">
              <Label className="text-xs">Título</Label>
              <Input
                value={config.title}
                onChange={e => updateConfig({ title: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Subtítulo</Label>
              <Input
                value={config.subtitle}
                onChange={e => updateConfig({ subtitle: e.target.value })}
                placeholder="Opcional"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Rodapé</Label>
              <Input
                value={config.footerText}
                onChange={e => updateConfig({ footerText: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Orientação</Label>
              <Select
                value={config.orientation}
                onValueChange={v => updateConfig({ orientation: v as 'portrait' | 'landscape' })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Retrato</SelectItem>
                  <SelectItem value="landscape">Paisagem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <Checkbox
                  checked={config.showDate}
                  onCheckedChange={v => updateConfig({ showDate: !!v })}
                />
                Mostrar data
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <Checkbox
                  checked={config.showPageNumbers}
                  onCheckedChange={v => updateConfig({ showPageNumbers: !!v })}
                />
                Nº de página
              </label>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={() => setLoadDialogOpen(true)}>
              <BookTemplate className="h-3.5 w-3.5" />
              Carregar Template Salvo
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={() => setSaveDialogOpen(true)}>
              <Save className="h-3.5 w-3.5" />
              Salvar como Template
            </Button>
          </div>
        </div>

        <div className="border-t px-4 py-3 space-y-2">
          <Button
            variant="outline" size="sm"
            className="w-full gap-2 text-xs"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" />
            Pré-visualizar
          </Button>
          <Button
            size="sm"
            className="w-full gap-2 text-xs bg-emerald-600 hover:bg-emerald-700"
            onClick={handleGenerateXlsx}
            disabled={generatingXlsx}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {generatingXlsx ? 'Gerando...' : 'Exportar Excel (.xlsx)'}
          </Button>
          <Button
            size="sm"
            className="w-full gap-2 text-xs"
            onClick={handleGenerate}
            disabled={generating}
          >
            <FileDown className="h-3.5 w-3.5" />
            {generating ? 'Gerando...' : 'Gerar Relatório (.docx)'}
          </Button>
        </div>
      </div>

      {/* Right panel — sections editor */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Seções do Relatório</h2>
            <Button size="sm" variant="outline" onClick={addSection} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Nova Seção
            </Button>
          </div>

          {config.sections.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center text-slate-400 text-sm">
              Nenhuma seção. Clique em "Nova Seção" para começar.
            </div>
          )}

          {config.sections.map((section, sIdx) => (
            <div key={section.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
                <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />

                <Input
                  value={section.title}
                  onChange={e => updateSection(section.id, { title: e.target.value })}
                  className="h-7 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0 flex-1"
                />

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={sIdx === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={sIdx === config.sections.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-6 w-6"
                    onClick={() => toggleSectionCollapse(section.id)}
                  >
                    {section.collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeSection(section.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {!section.collapsed && (
                <div className="p-4 space-y-4">
                  {/* Section options */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Agrupar por</Label>
                      <Select
                        value={section.groupBy}
                        onValueChange={v => updateSection(section.id, { groupBy: v as GroupBy })}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(GROUP_BY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Ordenar por campo</Label>
                      <Input
                        value={section.sortField}
                        onChange={e => updateSection(section.id, { sortField: e.target.value })}
                        placeholder="ex: contract_number"
                        className="h-7 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Ordem</Label>
                      <Select
                        value={section.sortOrder}
                        onValueChange={v => updateSection(section.id, { sortOrder: v as SortOrder })}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc" className="text-xs">Crescente</SelectItem>
                          <SelectItem value="desc" className="text-xs">Decrescente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <Checkbox
                      checked={section.showTotals}
                      onCheckedChange={v => updateSection(section.id, { showTotals: !!v })}
                    />
                    Mostrar totais/subtotais nesta seção
                  </label>

                  {/* Fields list */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-600">Campos ({section.fields.length})</p>
                      <Button
                        variant="outline" size="sm"
                        className="h-6 text-xs gap-1 px-2"
                        onClick={() => openAddField(section.id)}
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar campo
                      </Button>
                    </div>

                    {section.fields.length === 0 && (
                      <p className="text-xs text-slate-400 py-2 text-center">
                        Nenhum campo. Clique em "Adicionar campo".
                      </p>
                    )}

                    {section.fields.map((field, fIdx) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0" />

                        <div className="flex-1 min-w-0">
                          <Input
                            value={field.label}
                            onChange={e => updateField(section.id, field.id, { label: e.target.value })}
                            className="h-6 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                          />
                        </div>

                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-normal">
                          {field.source}
                        </Badge>

                        <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer shrink-0">
                          <Checkbox
                            checked={field.bold}
                            onCheckedChange={v => updateField(section.id, field.id, { bold: !!v })}
                            className="h-3 w-3"
                          />
                          Negrito
                        </label>

                        <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer shrink-0">
                          <Checkbox
                            checked={field.visible}
                            onCheckedChange={v => updateField(section.id, field.id, { visible: !!v })}
                            className="h-3 w-3"
                          />
                          Visível
                        </label>

                        <div className="flex shrink-0">
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6"
                            onClick={() => moveField(section.id, field.id, 'up')}
                            disabled={fIdx === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6"
                            onClick={() => moveField(section.id, field.id, 'down')}
                            disabled={fIdx === section.fields.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-600"
                            onClick={() => removeField(section.id, field.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Field Dialog */}
      <Dialog open={!!addFieldDialogSection} onOpenChange={open => !open && setAddFieldDialogSection(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar Campo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Origem dos dados</Label>
              <Select value={selectedFieldSource} onValueChange={v => { setSelectedFieldSource(v as FieldSource); setSelectedField('') }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="analysis">Análise</SelectItem>
                  <SelectItem value="installment">Parcela</SelectItem>
                  <SelectItem value="custom">Elemento customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Campo</Label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Selecione um campo" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FIELDS[selectedFieldSource].map(f => (
                    <SelectItem key={f.field} value={f.field} className="text-sm">{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFieldDialogSection(null)}>Cancelar</Button>
            <Button onClick={confirmAddField} disabled={!selectedField}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Salvar Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome do template *</Label>
              <Input
                placeholder="Ex: Relatório Mensal Padrão"
                value={savingName}
                onChange={e => setSavingName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição</Label>
              <Textarea
                placeholder="Descrição opcional..."
                value={savingDesc}
                onChange={e => setSavingDesc(e.target.value)}
                className="resize-none h-20 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Templates Salvos</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto py-2">
            {templates.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum template salvo ainda.</p>
            )}
            {templates.map(t => (
              <div key={t.id} className="flex items-start justify-between gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{t.name}</p>
                  {t.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{t.description}</p>}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(t.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => loadTemplate(t)}>
                    Carregar
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-400 hover:text-red-600"
                    onClick={() => deleteTemplate(t.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-6 bg-white space-y-4 text-sm">
            <div className="text-center border-b pb-4">
              <h1 className="text-lg font-bold text-slate-800">{config.title || 'Título do Relatório'}</h1>
              {config.subtitle && <p className="text-slate-500 text-sm mt-1">{config.subtitle}</p>}
              {config.showDate && (
                <p className="text-xs text-slate-400 mt-1">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            {config.sections.map(section => (
              <div key={section.id}>
                <h2 className="font-semibold text-slate-700 mb-2 border-b pb-1">{section.title}</h2>
                <div className="space-y-1">
                  {section.fields.filter(f => f.visible).map(f => (
                    <div key={f.id} className="flex gap-2 text-xs">
                      <span className={`text-slate-500 w-40 shrink-0 ${f.bold ? 'font-semibold' : ''}`}>{f.label}:</span>
                      <span className="text-slate-400 italic">[{f.source}.{f.field}]</span>
                    </div>
                  ))}
                  {section.fields.filter(f => f.visible).length === 0 && (
                    <p className="text-xs text-slate-300">Nenhum campo visível nesta seção</p>
                  )}
                  {section.groupBy !== 'none' && (
                    <p className="text-xs text-blue-500 mt-1">↳ Agrupado por: {GROUP_BY_LABELS[section.groupBy]}</p>
                  )}
                  {section.showTotals && (
                    <p className="text-xs text-emerald-500">↳ Exibe totais/subtotais</p>
                  )}
                </div>
              </div>
            ))}

            <div className="border-t pt-3 text-xs text-slate-400 text-center">
              {config.footerText}
              {config.showPageNumbers && ' — Página 1'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
