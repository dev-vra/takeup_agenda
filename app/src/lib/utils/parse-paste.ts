import { monthKeyToDate } from './date-format'
import type { PasteImportRow, PasteImportPreview } from '@/types'

const MONTH_COLS = [
  'Jun/25 (t)', 'Jul/25 (t)', 'Ago/25 (t)', 'Set/25 (t)', 'Out/25 (t)', 'Nov/25 (t)',
  'Dez/25 (t)', 'Jan/26 (t)', 'Fev/26 (t)', 'Mar/26 (t)', 'Abr/26 (t)', 'Maio/26 (t)', 'Jun/26 (t)',
]

const TAKEUP_MONTH_COLS = MONTH_COLS.map(c => `${c}.1`)

const COL_MAP: Record<string, keyof PasteImportRow | 'installments' | 'takeup_monthly'> = {
  'CONTRATO': 'contract_number',
  'REF.': 'reference',
  'VENDEDOR': 'seller_name',
  'COMPRADOR': 'buyer_name',
  'Qtd. CONTRATADA \n(tons)': 'total_quantity',
  'ORIGEM': 'origin',
  'MOEDA': 'currency',
  'INDEXAÇÃO': 'indexation',
  'PREÇO': 'price',
  'Unidade': 'price_unit',
  'TERMS': 'terms',
  'QUALIDADE': 'quality_spec',
  'Subtipo do contrato': 'contract_subtype',
  'TOTAL TK UP': 'total_takeup',
  'SALDO P/ FAZER TK': 'balance_pending',
  'Respons.': 'responsible',
  'Observação': 'observation',
}

function normalizeHeader(h: string): string {
  return h.trim().replace(/\s+/g, ' ').replace(/\r\n|\r/g, '\n')
}

export function parsePasteData(raw: string): PasteImportPreview {
  const lines = raw.split('\n').filter(l => l.trim())
  if (lines.length < 2) {
    return { rows: [], errors: [{ row: 0, message: 'Dados insuficientes. Cole o cabeçalho + pelo menos uma linha.' }] }
  }

  const headers = lines[0].split('\t').map(normalizeHeader)
  const rows: PasteImportRow[] = []
  const errors: { row: number; message: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('\t')
    const raw: Record<string, string> = {}
    headers.forEach((h, idx) => { raw[h] = (cells[idx] || '').trim() })

    try {
      const row: PasteImportRow = {
        contract_number: '',
        seller_name: '',
        buyer_name: '',
        total_quantity: 0,
        installments: [],
        takeup_monthly: [],
      }

      for (const [header, field] of Object.entries(COL_MAP)) {
        const val = raw[header] ?? raw[header.replace('COMPRADOR ', 'COMPRADOR')]
        if (!val || val === '.' || val === '') continue

        const rowAny = row as unknown as Record<string, unknown>
        if (field === 'total_quantity' || field === 'price' || field === 'total_takeup' || field === 'balance_pending') {
          const num = parseFloat(val.replace(',', '.'))
          if (!isNaN(num)) rowAny[field] = num
        } else {
          rowAny[field] = val
        }
      }

      // Parse installment months
      for (const col of MONTH_COLS) {
        const val = raw[col]
        if (!val || val === '.' || val === '') continue
        const qty = parseFloat(val.replace(',', '.'))
        if (!isNaN(qty) && qty > 0) {
          const date = monthKeyToDate(col)
          if (date) row.installments.push({ month: date, quantity: qty })
        }
      }

      // Parse takeup months
      for (const col of TAKEUP_MONTH_COLS) {
        const val = raw[col]
        if (!val || val === '.' || val === '') continue
        const qty = parseFloat(val.replace(',', '.'))
        if (!isNaN(qty) && qty > 0) {
          const baseCol = col.replace('.1', '')
          const date = monthKeyToDate(baseCol)
          if (date) row.takeup_monthly.push({ month: date, quantity: qty })
        }
      }

      if (!row.contract_number) {
        errors.push({ row: i, message: `Linha ${i + 1}: número de contrato ausente` })
        continue
      }
      if (!row.seller_name) {
        errors.push({ row: i, message: `Linha ${i + 1}: vendedor ausente` })
        continue
      }
      if (!row.buyer_name) {
        errors.push({ row: i, message: `Linha ${i + 1}: comprador ausente` })
        continue
      }

      rows.push(row)
    } catch (e) {
      errors.push({ row: i, message: `Linha ${i + 1}: erro ao processar — ${String(e)}` })
    }
  }

  return { rows, errors }
}
