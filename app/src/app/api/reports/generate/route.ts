import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateReport } from '@/lib/ai/generate-report'
import type { ReportType } from '@/types'

export async function POST(request: Request) {
  const supabase = await createClient()
  const admin = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { title, reportType, contractId, analysisId, analysisIds, userPrompt } = await request.json()

  try {
    let contract, installment, analyses

    if (contractId) {
      const { data } = await admin.from('contracts').select(`
        *, seller:seller_id(*), buyer:buyer_id(*),
        installments:contract_installments(*)
      `).eq('id', contractId).single()
      contract = data
    }

    if (analysisId) {
      const { data } = await admin.from('analyses').select(`
        *, contract:contract_id(*, seller:seller_id(*), buyer:buyer_id(*)),
        installment:installment_id(*),
        comments:analysis_comments(*),
        reschedules:takeup_reschedules(*)
      `).eq('id', analysisId).single()
      analyses = data ? [data] : []
    }

    if (analysisIds?.length > 0) {
      const { data } = await admin.from('analyses').select(`
        *, contract:contract_id(*, seller:seller_id(*), buyer:buyer_id(*)),
        installment:installment_id(*),
        comments:analysis_comments(*),
        reschedules:takeup_reschedules(*)
      `).in('id', analysisIds)
      analyses = data || []
    }

    const content = await generateReport({
      type: reportType as ReportType,
      contract: contract as any,
      installment: installment as any,
      analyses: analyses as any,
      userPrompt,
    })

    // Save report
    const { data: report, error } = await admin.from('reports').insert({
      title,
      report_type: reportType,
      content,
      related_contract_id: contractId || null,
      related_analysis_ids: analysisIds || (analysisId ? [analysisId] : null),
      user_prompt: userPrompt || null,
      created_by: user.id,
    }).select('id').single()

    if (error) throw error

    // Audit log
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'create',
      entity_type: 'report',
      entity_id: report.id,
      new_values: { title, report_type: reportType, related_contract_id: contractId || null },
    })

    return NextResponse.json({ id: report.id, content })
  } catch (e) {
    console.error('Report generation error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
