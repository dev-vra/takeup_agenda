'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatMonth } from '@/lib/utils/date-format'
import { ANALYSIS_STATUS_LABEL } from '@/lib/utils/ui'
import type { ReportType } from '@/types'

const REPORT_TYPES: { value: ReportType; label: string; desc: string }[] = [
  { value: 'contrato', label: 'Relatório de Contrato', desc: 'Visão geral de um contrato: parcelas, entregas, análises.' },
  { value: 'analise', label: 'Relatório de Análise', desc: 'Detalhe de uma análise específica com histórico completo.' },
  { value: 'conjunto_analises', label: 'Conjunto de Análises', desc: 'Relatório sobre múltiplas análises selecionadas.' },
  { value: 'personalizado', label: 'Personalizado', desc: 'Relatório livre baseado no seu prompt.' },
]

interface GerarRelatorioProps {
  contracts: { id: string; contract_number: string; seller: any; buyer: any }[]
  analyses: { id: string; status: string; contract: any; installment: any }[]
}

export function GerarRelatorio({ contracts, analyses }: GerarRelatorioProps) {
  const router = useRouter()
  const [reportType, setReportType] = useState<ReportType>('contrato')
  const [title, setTitle] = useState('')
  const [contractId, setContractId] = useState('')
  const [analysisId, setAnalysisId] = useState('')
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([])
  const [userPrompt, setUserPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<{ id: string; content: string } | null>(null)

  function toggleAnalysis(id: string) {
    setSelectedAnalyses(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  async function handleGenerate() {
    if (!title.trim()) return toast.error('Informe o título do relatório.')
    if (reportType === 'contrato' && !contractId) return toast.error('Selecione o contrato.')
    if (reportType === 'analise' && !analysisId) return toast.error('Selecione a análise.')
    if (reportType === 'conjunto_analises' && selectedAnalyses.length === 0) return toast.error('Selecione ao menos uma análise.')

    setLoading(true)
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          reportType,
          contractId: contractId || undefined,
          analysisId: analysisId || undefined,
          analysisIds: selectedAnalyses.length > 0 ? selectedAnalyses : undefined,
          userPrompt: userPrompt.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setGenerated({ id: data.id, content: data.content })
      toast.success('Relatório gerado com sucesso!')
    } catch (e) {
      toast.error(`Erro ao gerar relatório: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  if (generated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Relatório Gerado!</h2>
        </div>
        <Card>
          <CardContent className="py-4 px-4 prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm font-sans text-slate-700 leading-relaxed">
              {generated.content}
            </pre>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button asChild className="bg-blue-700 hover:bg-blue-800">
            <a href={`/relatorios/${generated.id}`}>Ver Relatório Completo</a>
          </Button>
          <Button variant="outline" onClick={() => { setGenerated(null); setTitle(''); setUserPrompt('') }}>
            Gerar Novo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gerar Relatório com IA</h1>
        <p className="text-slate-500 text-sm mt-0.5">A IA analisa os dados e gera um relatório profissional no padrão Laferlins</p>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-2 gap-2">
        {REPORT_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setReportType(t.value)}
            className={`text-left p-3 rounded-xl border-2 transition-all text-sm ${
              reportType === t.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="font-semibold text-slate-800">{t.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="py-5 px-5 space-y-4">
          <div className="space-y-2">
            <Label>Título do Relatório *</Label>
            <Input placeholder="Ex: Relatório Operacional — Contrato AG-26367/10" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {(reportType === 'contrato') && (
            <div className="space-y-2">
              <Label>Contrato *</Label>
              <Select value={contractId} onValueChange={setContractId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contrato..." />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.contract_number} — {c.seller?.name} → {c.buyer?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reportType === 'analise' && (
            <div className="space-y-2">
              <Label>Análise *</Label>
              <Select value={analysisId} onValueChange={setAnalysisId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a análise..." />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.contract?.contract_number} · {formatMonth(a.installment?.reference_month)} · {(ANALYSIS_STATUS_LABEL as Record<string, string>)[a.status] || a.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reportType === 'conjunto_analises' && (
            <div className="space-y-2">
              <Label>Selecione as Análises * ({selectedAnalyses.length} selecionadas)</Label>
              <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
                {analyses.map(a => (
                  <button
                    key={a.id}
                    onClick={() => toggleAnalysis(a.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      selectedAnalyses.includes(a.id)
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {a.contract?.contract_number} · {formatMonth(a.installment?.reference_month)} · {(ANALYSIS_STATUS_LABEL as Record<string, string>)[a.status]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Instrução Adicional para a IA (opcional)</Label>
            <Textarea
              placeholder="Ex: Destaque os atrasos, compare o planejado com o realizado, sugira ações..."
              value={userPrompt}
              onChange={e => setUserPrompt(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-slate-400">
              A IA já recebe contexto completo do sistema. Use este campo para orientar o foco do relatório.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-700 hover:bg-blue-800 gap-2"
        size="lg"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando relatório com IA...</>
          : <><Sparkles className="h-4 w-4" /> Gerar Relatório</>
        }
      </Button>
    </div>
  )
}
