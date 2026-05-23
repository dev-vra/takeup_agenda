'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Loader2, Upload, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatMonth, toISODate } from '@/lib/utils/date-format'
import { cn } from '@/lib/utils'
import type { ContractInstallment } from '@/types'

interface Contract {
  id: string
  contract_number: string
  reference?: string
  seller: { name: string }
  buyer: { name: string }
  installments: ContractInstallment[]
}

interface NovaAnaliseWizardProps {
  contracts: Contract[]
  responsibles: { name: string; type: string }[]
  preselectedContractId?: string
  preselectedInstallmentId?: string
}

const STEPS = ['Contrato & Parcela', 'HVI', 'Revisar']

export function NovaAnaliseWizard({
  contracts, responsibles, preselectedContractId, preselectedInstallmentId
}: NovaAnaliseWizardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [contractId, setContractId] = useState(preselectedContractId || '')
  const [installmentId, setInstallmentId] = useState(preselectedInstallmentId || '')
  const [hviFile, setHviFile] = useState<File | null>(null)
  const [hviReceivedDate, setHviReceivedDate] = useState('')
  const [hviResponsible, setHviResponsible] = useState('')

  const selectedContract = contracts.find(c => c.id === contractId)
  const installments = selectedContract?.installments || []

  // Auto-select nearest installment
  useEffect(() => {
    if (contractId && !preselectedInstallmentId && installments.length > 0) {
      const today = new Date()
      const sorted = [...installments]
        .filter(i => i.status !== 'concluida')
        .sort((a, b) => {
          const da = Math.abs(new Date(a.reference_month).getTime() - today.getTime())
          const db = Math.abs(new Date(b.reference_month).getTime() - today.getTime())
          return da - db
        })
      if (sorted[0]) setInstallmentId(sorted[0].id)
    }
  }, [contractId])

  const hviResponsibles = responsibles.filter(r => r.type === 'hvi' || r.type === 'geral')
  const selectedInstallment = installments.find(i => i.id === installmentId)

  async function handleSubmit() {
    if (!contractId || !installmentId) {
      toast.error('Selecione o contrato e a parcela.')
      return
    }
    if (!hviFile || !hviReceivedDate || !hviResponsible) {
      toast.error('Preencha todos os campos de HVI.')
      return
    }

    setLoading(true)
    try {
      // Upload HVI file
      const ext = hviFile.name.split('.').pop()
      const path = `hvi/${contractId}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('hvi-files').upload(path, hviFile)

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from('hvi-files').getPublicUrl(path)

      // Create analysis
      const { data: analysis, error: analysisErr } = await supabase
        .from('analyses')
        .insert({
          contract_id: contractId,
          installment_id: installmentId,
          status: 'aguardando_aprovacao_hvi',
          hvi_file_url: publicUrl,
          hvi_file_name: hviFile.name,
          hvi_received_date: toISODate(hviReceivedDate),
          hvi_responsible: hviResponsible,
        })
        .select('id').single()

      if (analysisErr) throw analysisErr

      // Save responsible if new
      await supabase.from('known_responsibles')
        .upsert({ name: hviResponsible, type: 'hvi' }, { onConflict: 'name,type', ignoreDuplicates: true })

      // Audit log
      await supabase.from('audit_log').insert({
        action: 'create', entity_type: 'analysis', entity_id: analysis.id,
        new_values: { contract_id: contractId, installment_id: installmentId, status: 'aguardando_aprovacao_hvi' },
      })

      toast.success('Análise criada com sucesso!')
      router.push(`/analises/${analysis.id}`)
      router.refresh()
    } catch (e) {
      toast.error(`Erro ao criar análise: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nova Análise</h1>
        <p className="text-slate-500 text-sm mt-0.5">Registre uma nova análise de HVI e TakeUp</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2',
              i < step ? 'bg-blue-600 border-blue-600 text-white' :
              i === step ? 'border-blue-600 text-blue-600' :
              'border-slate-200 text-slate-400'
            )}>
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-sm hidden sm:block', i === step ? 'font-medium text-slate-800' : 'text-slate-400')}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <Progress value={(step / (STEPS.length - 1)) * 100} className="h-1" />

      {/* Step 0: Contract & Installment */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Selecione o Contrato e Parcela</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contrato *</Label>
              <Select value={contractId} onValueChange={v => { setContractId(v ?? ''); setInstallmentId('') }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contrato..." />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="font-medium">{c.contract_number}</span>
                      <span className="text-slate-400 ml-2 text-xs">{c.seller?.name} → {c.buyer?.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {contractId && (
              <div className="space-y-2">
                <Label>Parcela de Referência *</Label>
                <div className="space-y-1.5">
                  {installments.filter(i => i.status !== 'concluida').map(i => (
                    <button
                      key={i.id}
                      onClick={() => setInstallmentId(i.id)}
                      className={cn(
                        'w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-all',
                        installmentId === i.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{formatMonth(i.reference_month)}</span>
                          <span className="text-xs text-slate-400 ml-2">
                            Saldo: {i.remaining_quantity}t de {i.scheduled_quantity}t
                          </span>
                        </div>
                        {i.due_date && (
                          <span className="text-xs text-slate-500">Venc: {formatDate(i.due_date)}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: HVI */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Dados do HVI</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Arquivo HVI * (PDF, Word, Excel, Imagem)</Label>
              <div className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                hviFile ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              )}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="hidden"
                  id="hvi-file"
                  onChange={e => setHviFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="hvi-file" className="cursor-pointer">
                  {hviFile ? (
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">{hviFile.name}</span>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Clique para selecionar ou arraste o arquivo</p>
                      <p className="text-xs mt-1">PDF, Word, Excel, JPG, PNG</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data de Recebimento *</Label>
              <DateInput
                value={hviReceivedDate}
                onChange={setHviReceivedDate}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsável pelo HVI *</Label>
              <Input
                list="hvi-responsibles"
                placeholder="Nome do responsável..."
                value={hviResponsible}
                onChange={e => setHviResponsible(e.target.value)}
              />
              <datalist id="hvi-responsibles">
                {hviResponsibles.map(r => <option key={r.name} value={r.name} />)}
              </datalist>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Revisar e Confirmar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 space-y-3 text-sm">
              <ReviewRow label="Contrato" value={selectedContract?.contract_number} />
              <ReviewRow label="Vendedor" value={selectedContract?.seller?.name} />
              <ReviewRow label="Comprador" value={selectedContract?.buyer?.name} />
              <ReviewRow label="Parcela" value={selectedInstallment ? formatMonth(selectedInstallment.reference_month) : ''} />
              <ReviewRow label="Arquivo HVI" value={hviFile?.name} />
              <ReviewRow label="Data Recebimento HVI" value={hviReceivedDate ? formatDate(hviReceivedDate) : ''} />
              <ReviewRow label="Responsável HVI" value={hviResponsible} />
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
              Após criar, a análise ficará com status <strong>"HVI em Análise"</strong> e você receberá notificações para aprovar ou reprovar o HVI nos próximos dias úteis.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 0 ? 'Cancelar' : 'Voltar'}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            className="gap-2 bg-blue-700 hover:bg-blue-800"
            disabled={
              (step === 0 && (!contractId || !installmentId)) ||
              (step === 1 && (!hviFile || !hviReceivedDate || !hviResponsible))
            }
          >
            Próximo <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="gap-2 bg-green-700 hover:bg-green-800"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {loading ? 'Criando...' : 'Criar Análise'}
          </Button>
        )}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || '—'}</span>
    </div>
  )
}
