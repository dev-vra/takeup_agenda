'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileText, Printer } from 'lucide-react'
import { formatDate } from '@/lib/utils/date-format'
import type { Report } from '@/types'

const REPORT_TYPE_LABEL: Record<string, string> = {
  contrato: 'Contrato', analise: 'Análise', parcela: 'Parcela',
  conjunto_analises: 'Conjunto de Análises', personalizado: 'Personalizado',
}

interface RelatorioViewerProps {
  report: Report & {
    contract?: { contract_number: string; seller: { name: string }; buyer: { name: string } }
    creator?: { name: string }
  }
}

export function RelatorioViewer({ report: r }: RelatorioViewerProps) {
  return (
    <div className="space-y-6">
      <Link href="/relatorios" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para Relatórios
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{r.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <Badge variant="outline">{REPORT_TYPE_LABEL[r.report_type]}</Badge>
            {r.contract && <span>{r.contract.contract_number}</span>}
            <span>·</span>
            <span>{formatDate(r.created_at)}</span>
            {r.creator && <span>· {r.creator.name}</span>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {r.file_url && (
            <Button asChild variant="outline" size="sm">
              <a href={r.file_url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1.5" /> Baixar
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Timbrado preview */}
      <Card className="border-2">
        {/* Header timbrado simulado */}
        <div className="border-b px-8 py-4 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl">L</div>
            <div>
              <p className="font-bold text-lg">LAFERLINS</p>
              <p className="text-xs text-slate-400">Corretora de Algodão</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-300">
            <p>{r.title}</p>
            <p>{formatDate(r.created_at)}</p>
          </div>
        </div>

        {/* Content */}
        <CardContent className="px-8 py-6">
          {r.user_prompt && (
            <div className="mb-6 p-3 rounded-lg bg-slate-50 border-l-4 border-blue-400">
              <p className="text-xs text-slate-500 font-medium">Solicitação:</p>
              <p className="text-sm text-slate-700 mt-0.5">{r.user_prompt}</p>
            </div>
          )}

          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">
              {r.content || 'Conteúdo não disponível.'}
            </div>
          </div>
        </CardContent>

        {/* Footer timbrado */}
        <div className="border-t px-8 py-3 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
          <span>Laferlins Corretora de Algodão — Documento Gerado por IA</span>
          <span>{formatDate(r.created_at)}</span>
        </div>
      </Card>
    </div>
  )
}
