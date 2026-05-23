'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { parsePasteData } from '@/lib/utils/parse-paste'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircle2, AlertCircle, Loader2, ClipboardPaste,
  FileSpreadsheet, ChevronDown, ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'
import type { PasteImportRow, PasteImportPreview } from '@/types'
import { formatMonth } from '@/lib/utils/date-format'

export function PasteImport() {
  const router = useRouter()
  const supabase = createClient()
  const [raw, setRaw] = useState('')
  const [preview, setPreview] = useState<PasteImportPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  function handleParse() {
    if (!raw.trim()) {
      toast.error('Cole os dados da planilha antes de continuar.')
      return
    }
    const result = parsePasteData(raw)
    setPreview(result)
  }

  function toggleExpand(i: number) {
    setExpandedRows(prev => {
      const n = new Set(prev)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })
  }

  async function handleImport() {
    if (!preview || preview.rows.length === 0) return
    setLoading(true)

    try {
      const response = await fetch('/api/contracts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: preview.rows }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erro ao importar contratos.')
        return
      }

      toast.success(`${data.imported} contrato(s) importado(s) com sucesso!`)
      router.push('/contratos')
      router.refresh()
    } catch (e) {
      toast.error('Erro inesperado ao importar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4 px-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-semibold">Como importar:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
                <li>Abra a planilha de contratos no Excel</li>
                <li>Selecione o cabeçalho + todas as linhas desejadas</li>
                <li>Copie com Ctrl+C</li>
                <li>Clique na área abaixo e cole com Ctrl+V</li>
                <li>Clique em "Analisar" para verificar os dados</li>
                <li>Confirme a importação</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paste area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Cole os dados aqui (Ctrl+V)
        </label>
        <Textarea
          placeholder="Cole aqui o conteúdo copiado da planilha Excel (cabeçalho + dados)..."
          className="min-h-32 font-mono text-xs resize-y"
          value={raw}
          onChange={e => { setRaw(e.target.value); setPreview(null) }}
        />
        <Button onClick={handleParse} variant="outline" className="gap-2">
          <ClipboardPaste className="h-4 w-4" />
          Analisar Dados
        </Button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          {preview.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">{preview.errors.length} erro(s) encontrado(s):</p>
                <ul className="list-disc list-inside text-sm space-y-0.5">
                  {preview.errors.map((e, i) => <li key={i}>{e.message}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {preview.rows.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {preview.rows.length} contrato(s) identificado(s) — revise antes de importar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-96">
                  <div className="divide-y">
                    {preview.rows.map((row, i) => (
                      <div key={i} className="px-4 py-3">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleExpand(i)}
                        >
                          <div>
                            <span className="font-semibold text-sm text-slate-800">{row.contract_number}</span>
                            <span className="text-xs text-slate-500 ml-2">{row.seller_name} → {row.buyer_name}</span>
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              {row.total_quantity}t
                            </Badge>
                          </div>
                          {expandedRows.has(i)
                            ? <ChevronUp className="h-4 w-4 text-slate-400" />
                            : <ChevronDown className="h-4 w-4 text-slate-400" />
                          }
                        </div>

                        {expandedRows.has(i) && (
                          <div className="mt-3 text-xs text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
                            <div><span className="text-slate-400">Referência:</span> {row.reference || '—'}</div>
                            <div><span className="text-slate-400">Moeda:</span> {row.currency || '—'}</div>
                            <div><span className="text-slate-400">Indexação:</span> {row.indexation || '—'}</div>
                            <div><span className="text-slate-400">Preço:</span> {row.price ? `${row.price} ${row.price_unit || ''}` : '—'}</div>
                            <div><span className="text-slate-400">Terms:</span> {row.terms || '—'}</div>
                            <div><span className="text-slate-400">Subtipo:</span> {row.contract_subtype || '—'}</div>
                            <div><span className="text-slate-400">Origem:</span> {row.origin || '—'}</div>
                            <div><span className="text-slate-400">Responsável:</span> {row.responsible || '—'}</div>
                            {row.observation && (
                              <div className="col-span-2"><span className="text-slate-400">Observação:</span> {row.observation}</div>
                            )}
                            {row.installments.length > 0 && (
                              <div className="col-span-2">
                                <span className="text-slate-400">Parcelas programadas:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {row.installments.map((inst, j) => (
                                    <span key={j} className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[10px]">
                                      {formatMonth(inst.month)}: {inst.quantity}t
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {preview.rows.length > 0 && (
            <div className="flex gap-3">
              <Button
                onClick={handleImport}
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {loading ? 'Importando...' : `Confirmar Importação (${preview.rows.length} contrato${preview.rows.length > 1 ? 's' : ''})`}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setPreview(null); setRaw('') }}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
