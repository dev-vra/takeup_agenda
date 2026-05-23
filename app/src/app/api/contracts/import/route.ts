import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { PasteImportRow } from '@/types'

export async function POST(request: Request) {
  const supabase = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { rows }: { rows: PasteImportRow[] } = await request.json()

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: 'Nenhuma linha para importar' }, { status: 400 })
  }

  let imported = 0
  const errors: string[] = []

  for (const row of rows) {
    try {
      // 1. Upsert seller
      let { data: seller } = await supabase
        .from('sellers').select('id').ilike('name', row.seller_name.trim()).single()

      if (!seller) {
        const { data: newSeller, error } = await supabase
          .from('sellers').insert({ name: row.seller_name.trim() }).select('id').single()
        if (error) throw new Error(`Seller: ${error.message}`)
        seller = newSeller
      }

      // 2. Upsert buyer
      let { data: buyer } = await supabase
        .from('buyers').select('id').ilike('name', row.buyer_name.trim()).single()

      if (!buyer) {
        const { data: newBuyer, error } = await supabase
          .from('buyers').insert({ name: row.buyer_name.trim() }).select('id').single()
        if (error) throw new Error(`Buyer: ${error.message}`)
        buyer = newBuyer
      }

      // 3. Upsert contract
      const contractPayload = {
        contract_number: row.contract_number.trim(),
        reference: row.reference?.trim(),
        seller_id: seller!.id,
        buyer_id: buyer!.id,
        total_quantity: row.total_quantity || 0,
        origin: row.origin,
        currency: row.currency,
        indexation: row.indexation,
        price: row.price,
        price_unit: row.price_unit,
        terms: row.terms,
        quality_spec: row.quality_spec,
        contract_subtype: row.contract_subtype,
        responsible: row.responsible,
        observation: row.observation,
        total_takeup: row.total_takeup || 0,
        balance_pending: row.balance_pending || 0,
        created_by: user.id,
      }

      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .upsert(contractPayload, { onConflict: 'contract_number', ignoreDuplicates: false })
        .select('id').single()

      if (contractError) throw new Error(`Contract: ${contractError.message}`)

      // 4. Upsert installments
      for (const inst of row.installments) {
        await supabase.from('contract_installments').upsert({
          contract_id: contract!.id,
          reference_month: inst.month,
          scheduled_quantity: inst.quantity,
          due_date: inst.month,
        }, { onConflict: 'contract_id,reference_month' })
      }

      // 5. Upsert takeup monthly
      for (const tk of row.takeup_monthly) {
        await supabase.from('contract_takeup_monthly').upsert({
          contract_id: contract!.id,
          reference_month: tk.month,
          takeup_quantity: tk.quantity,
        }, { onConflict: 'contract_id,reference_month' })
      }

      // 6. Audit log
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'create',
        entity_type: 'contract',
        entity_id: contract!.id,
        new_values: contractPayload,
      })

      imported++
    } catch (e) {
      errors.push(`Contrato ${row.contract_number}: ${String(e)}`)
    }
  }

  return NextResponse.json({ imported, errors })
}
