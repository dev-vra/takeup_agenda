'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText, Plus, Search, Eye, EyeOff, Download,
  ChevronRight, FileSpreadsheet
} from 'lucide-react'
import { formatDate } from '@/lib/utils/date-format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Report } from '@/types'

const REPORT_TYPE_LABEL: Record<string, string> = {
  contrato: 'Contrato',
  analise: 'Análise',
  parcela: 'Parcela',
  conjunto_analises: 'Conjunto de Análises',
  personalizado: 'Personalizado',
}

interface RelatoriosListProps {
  reports: Report[]
  contracts: { id: string; contract_number: string }[]
  showInactive: boolean
}

export function RelatoriosList({ reports, contracts, showInactive }: RelatoriosListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [contractFilter, setContractFilter] = useState('__all__')

  const filtered = reports.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !search || r.title.toLowerCase().includes(q)
    const matchContract = !contractFilter || contractFilter === '__all__' || r.related_contract_id === contractFilter
    return matchSearch && matchContract
  })

  async function toggleActive(report: Report) {
    const { error } = await supabase
      .from('reports')
      .update({ is_active: !report.is_active })
      .eq('id', report.id)

    if (error) {
      toast.error('Erro ao alterar status do relatório.')
      return
    }
    toast.success(report.is_active ? 'Relatório desativado.' : 'Relatório ativado.')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-slate-500 text-sm mt-0.5">{reports.length} relatório(s) gerado(s)</p>
        </div>
        <Button asChild className="bg-blue-700 hover:bg-blue-800">
          <Link href="/relatorios/gerar">
            <Plus className="h-4 w-4 mr-1.5" /> Gerar Relatório
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar relatório..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={contractFilter} onValueChange={(v) => setContractFilter(v ?? '__all__')}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filtrar por contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os contratos</SelectItem>
            {contracts.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.contract_number}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(showInactive ? '/relatorios' : '/relatorios?active=false')}
        >
          {showInactive ? <Eye className="h-4 w-4 mr-1.5" /> : <EyeOff className="h-4 w-4 mr-1.5" />}
          {showInactive ? 'Ver ativos' : 'Ver inativos'}
        </Button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <FileText className="h-12 w-12" />
          <p className="text-sm">Nenhum relatório encontrado</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/relatorios/gerar">Gerar primeiro relatório</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <Card key={r.id} className={cn(!r.is_active && 'opacity-60')}>
              <CardContent className="py-3.5 px-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-800 truncate">{r.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {REPORT_TYPE_LABEL[r.report_type]}
                    </Badge>
                    {!r.is_active && (
                      <Badge variant="secondary" className="text-[10px]">Inativo</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>{formatDate(r.created_at)}</span>
                    {(r as any).contract && (
                      <span>· {(r as any).contract.contract_number}</span>
                    )}
                    {(r as any).creator && (
                      <span>· {(r as any).creator.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.file_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={r.file_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 text-slate-500" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(r)}
                    title={r.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {r.is_active
                      ? <EyeOff className="h-4 w-4 text-slate-400" />
                      : <Eye className="h-4 w-4 text-slate-400" />
                    }
                  </Button>
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/relatorios/${r.id}`}>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
