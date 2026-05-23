'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { formatMonth } from '@/lib/utils/date-format'
import { ANALYSIS_STATUS_LABEL } from '@/lib/utils/ui'
import type { AgendaEntryType } from '@/types'

interface NovaAgendaFormProps {
  contracts: { id: string; contract_number: string; seller: { name: string }; buyer: { name: string } }[]
  analyses: { id: string; status: string; contract: { contract_number: string } | null; installment: { reference_month: string } | null }[]
}

const ENTRY_TYPE_LABELS: Record<AgendaEntryType, string> = {
  analise: 'Análise',
  takeup: 'TakeUp',
  entrega: 'Entrega',
  outro: 'Outro',
}

export function NovaAgendaForm({ contracts, analyses }: NovaAgendaFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [entryType, setEntryType] = useState<AgendaEntryType>('outro')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [relatedAnalysisId, setRelatedAnalysisId] = useState('')
  const [relatedContractId, setRelatedContractId] = useState('')

  async function handleSubmit() {
    if (!title || !scheduledDate) {
      toast.error('Preencha o título e a data.')
      return
    }

    setLoading(true)
    try {
      const { data: entry, error } = await supabase
        .from('agenda_entries')
        .insert({
          title,
          description: description || null,
          entry_type: entryType,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime || null,
          status: 'pendente',
          related_analysis_id: relatedAnalysisId || null,
          related_contract_id: relatedContractId || null,
        })
        .select('id')
        .single()

      if (error) throw error

      toast.success('Lançamento criado!')
      router.push(`/agenda/${entry.id}`)
      router.refresh()
    } catch (e) {
      toast.error(`Erro ao criar lançamento: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Novo Lançamento</h1>
        <p className="text-slate-500 text-sm mt-0.5">Adicione um evento à agenda operacional</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Detalhes do Lançamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              placeholder="Ex: TakeUp contrato AG-26367"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={entryType} onValueChange={v => setEntryType(v as AgendaEntryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ENTRY_TYPE_LABELS) as [AgendaEntryType, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <DateInput
                value={scheduledDate}
                onChange={setScheduledDate}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Observações adicionais..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Vincular à Análise (opcional)</Label>
            <Select value={relatedAnalysisId} onValueChange={v => setRelatedAnalysisId(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma análise..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {analyses.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.contract?.contract_number} · {a.installment ? formatMonth(a.installment.reference_month) : ''} · {(ANALYSIS_STATUS_LABEL as Record<string, string>)[a.status] || a.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vincular ao Contrato (opcional)</Label>
            <Select value={relatedContractId} onValueChange={v => setRelatedContractId(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contrato..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {contracts.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.contract_number} — {c.seller.name} → {c.buyer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          className="gap-2 bg-blue-700 hover:bg-blue-800"
          disabled={loading || !title || !scheduledDate}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? 'Salvando...' : 'Salvar Lançamento'}
        </Button>
      </div>
    </div>
  )
}
