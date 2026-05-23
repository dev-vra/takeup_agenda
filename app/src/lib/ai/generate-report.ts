import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Contract, Analysis, ContractInstallment, Report } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_CONTEXT = `Você é um assistente especializado em análise de contratos de algodão para a corretora Laferlins.
Analise os dados fornecidos e gere um relatório profissional em português brasileiro.
O relatório deve ser claro, objetivo e bem estruturado com seções bem definidas.
Use linguagem formal e técnica adequada ao mercado de commodities agrícolas.
Formate o relatório em Markdown com títulos, subtítulos e listas quando apropriado.`

interface ReportInput {
  type: Report['report_type']
  contract?: Contract
  installment?: ContractInstallment
  analyses?: Analysis[]
  userPrompt?: string
}

export async function generateReport(input: ReportInput): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const contextData = buildContext(input)
  const prompt = `${SYSTEM_CONTEXT}

## Dados para análise:
${contextData}

## Solicitação específica:
${input.userPrompt || 'Gere um relatório completo e detalhado sobre os dados acima.'}

---
Gere agora o relatório completo:`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

function buildContext(input: ReportInput): string {
  const parts: string[] = []

  if (input.contract) {
    const c = input.contract
    parts.push(`### Contrato
- Número: ${c.contract_number}
- Referência: ${c.reference || '—'}
- Vendedor (Produtor): ${c.seller?.name || '—'}
- Comprador: ${c.buyer?.name || '—'}
- Quantidade Contratada: ${c.total_quantity} toneladas
- Origem: ${c.origin || '—'}
- Moeda: ${c.currency || '—'}
- Indexação: ${c.indexation || '—'}
- Preço: ${c.price ? `${c.price} ${c.price_unit || ''}` : '—'}
- Condições (TERMS): ${c.terms || '—'}
- Subtipo: ${c.contract_subtype || '—'}
- Total TakeUp Realizado: ${c.total_takeup || 0} toneladas
- Saldo Pendente: ${c.balance_pending || 0} toneladas
- Responsável: ${c.responsible || '—'}
- Observação: ${c.observation || '—'}
- Especificação de Qualidade: ${c.quality_spec || '—'}`)
  }

  if (input.installment) {
    const inst = input.installment
    parts.push(`### Parcela de Referência
- Mês: ${inst.reference_month}
- Quantidade Programada: ${inst.scheduled_quantity} toneladas
- Quantidade Entregue: ${inst.delivered_quantity} toneladas
- Saldo Restante: ${inst.remaining_quantity} toneladas
- Status: ${inst.status}
- Vencimento: ${inst.due_date || '—'}`)
  }

  if (input.analyses && input.analyses.length > 0) {
    parts.push(`### Análises (${input.analyses.length} no total)`)
    for (const a of input.analyses) {
      parts.push(`#### Análise #${a.id.substring(0, 8)}
- Status: ${a.status}
- HVI Recebido em: ${a.hvi_received_date || '—'}
- Responsável HVI: ${a.hvi_responsible || '—'}
- HVI Aprovado: ${a.hvi_approved === true ? 'Sim' : a.hvi_approved === false ? 'Não' : 'Pendente'}
- Data Aprovação HVI: ${a.hvi_approval_date || '—'}
- Observação HVI: ${a.hvi_observation || '—'}
- TakeUp Previsto: ${a.takeup_scheduled_date || '—'}
- Responsável TakeUp: ${a.takeup_responsible || '—'}
- TakeUp Realizado em: ${a.takeup_actual_date || '—'}
- Reagendamentos: ${a.takeup_reschedule_count}
- Toneladas Aprovadas: ${a.approved_tons || '—'}
- Data Entrega Relatório: ${a.report_delivery_date || '—'}
- Observação Final: ${a.final_observation || '—'}
${a.comments && a.comments.length > 0 ? `- Comentários:\n${a.comments.map(c => `  - ${c.created_at}: ${c.content}`).join('\n')}` : ''}`)
    }
  }

  return parts.join('\n\n')
}
