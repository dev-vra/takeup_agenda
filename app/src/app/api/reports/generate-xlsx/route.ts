import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'

// Mapeia rótulos amigáveis dos campos
const FIELD_LABELS: Record<string, string> = {
  contract_number: 'Contrato',
  reference: 'Referência',
  seller: 'Vendedor',
  buyer: 'Comprador',
  total_quantity: 'Qtd. Total',
  total_takeup: 'TakeUp Total',
  balance_pending: 'Saldo Pendente',
  origin: 'Origem',
  currency: 'Moeda',
  price: 'Preço',
  terms: 'Termos',
  responsible: 'Responsável',
  observation: 'Observação',
  status: 'Status',
  hvi_received_date: 'Recebimento HVI',
  hvi_responsible: 'Resp. HVI',
  hvi_approved: 'HVI Aprovado',
  takeup_scheduled_date: 'TakeUp Agendado',
  takeup_actual_date: 'TakeUp Realizado',
  takeup_responsible: 'Resp. TakeUp',
  approved_tons: 'Ton. Aprovadas',
  report_delivery_date: 'Entrega Relatório',
  final_observation: 'Obs. Final',
  reference_month: 'Mês Referência',
  scheduled_quantity: 'Qtd. Programada',
  delivered_quantity: 'Qtd. Entregue',
  remaining_quantity: 'Qtd. Restante',
  due_date: 'Vencimento',
}

const STATUS_LABELS: Record<string, string> = {
  aguardando_hvi: 'Aguardando HVI',
  aguardando_aprovacao_hvi: 'Aguardando Aprovação HVI',
  hvi_aprovado: 'HVI Aprovado',
  analise_interrompida: 'Análise Interrompida',
  takeup_agendado: 'TakeUp Agendado',
  takeup_reagendado: 'TakeUp Reagendado',
  takeup_finalizado: 'TakeUp Finalizado',
  takeup_cancelado: 'TakeUp Cancelado',
  finalizada: 'Finalizada',
}

function fmt(value: unknown): string | number {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (typeof value === 'number') return value
  const str = String(value)
  if (STATUS_LABELS[str]) return STATUS_LABELS[str]
  // datas ISO -> dd/mm/yyyy
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR')
  }
  return str
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { config } = await request.json()
  if (!config) return NextResponse.json({ error: 'Config ausente' }, { status: 400 })

  // Busca dados: contratos com vendedor, comprador, parcelas, análises e comentários
  const { data: contracts } = await supabase
    .from('contracts')
    .select(`
      *,
      seller:sellers(name),
      buyer:buyers(name),
      installments:contract_installments(*),
      analyses(*, comments:analysis_comments(content, created_at, creator:created_by(name)))
    `)
    .eq('is_active', true)
    .order('contract_number')

  const rows = contracts || []

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Agenda TakeUp — Laferlins'
  wb.created = new Date()

  const BRAND = '1D4ED8'        // azul
  const HEADER_BG = '1E293B'    // slate-800
  const GROUP_BG = 'EFF6FF'     // azul claro
  const SUBHEAD_BG = 'F1F5F9'   // slate-100

  // ───────────────────────────────────────────────────────────────────────
  // ABA 1: Relatório principal (agrupado por contrato)
  // ───────────────────────────────────────────────────────────────────────
  const ws = wb.addWorksheet('Relatório', {
    properties: { defaultColWidth: 18 },
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: {
      orientation: config.orientation === 'landscape' ? 'landscape' : 'portrait',
      fitToPage: true, fitToWidth: 1,
    },
  })

  // Campos de contrato a exibir na linha do grupo (extraídos das seções de origem 'contract')
  const contractFields: { field: string; label: string }[] = []
  const detailFields: { source: string; field: string; label: string }[] = []

  for (const section of config.sections) {
    for (const f of section.fields) {
      if (!f.visible) continue
      if (f.source === 'contract') {
        if (!contractFields.find(cf => cf.field === f.field)) {
          contractFields.push({ field: f.field, label: f.label || FIELD_LABELS[f.field] || f.field })
        }
      } else if (f.source === 'analysis' || f.source === 'installment') {
        detailFields.push({ source: f.source, field: f.field, label: f.label || FIELD_LABELS[f.field] || f.field })
      }
    }
  }

  // Fallback de colunas de detalhe se nenhuma foi configurada
  if (detailFields.length === 0) {
    detailFields.push(
      { source: 'analysis', field: 'status', label: 'Status' },
      { source: 'analysis', field: 'takeup_scheduled_date', label: 'TakeUp Agendado' },
      { source: 'analysis', field: 'approved_tons', label: 'Ton. Aprovadas' },
    )
  }
  if (contractFields.length === 0) {
    contractFields.push(
      { field: 'contract_number', label: 'Contrato' },
      { field: 'seller', label: 'Vendedor' },
      { field: 'buyer', label: 'Comprador' },
      { field: 'balance_pending', label: 'Saldo' },
    )
  }

  const totalCols = Math.max(detailFields.length, 4)

  // Título
  ws.mergeCells(1, 1, 1, totalCols)
  const titleCell = ws.getCell(1, 1)
  titleCell.value = config.title || 'Relatório de TakeUp'
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFF' } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND } }
  ws.getRow(1).height = 28

  // Subtítulo / data
  ws.mergeCells(2, 1, 2, totalCols)
  const subCell = ws.getCell(2, 1)
  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  subCell.value = [config.subtitle, config.showDate ? `Gerado em ${dateStr}` : '']
    .filter(Boolean).join('  •  ')
  subCell.font = { size: 10, color: { argb: '64748B' } }
  subCell.alignment = { horizontal: 'left', indent: 1 }
  ws.getRow(2).height = 16

  ws.addRow([]) // linha 3 vazia

  // Cabeçalho das colunas de detalhe (linha 4)
  const headerRow = ws.getRow(4)
  detailFields.forEach((f, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = f.label
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } }
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    cell.border = { bottom: { style: 'thin', color: { argb: 'CBD5E1' } } }
  })
  headerRow.height = 22

  // Dados agrupados por contrato
  let totalTons = 0
  let totalBalance = 0

  for (const c of rows) {
    // Linha do grupo (contrato)
    const groupParts = contractFields.map(cf => {
      let v: unknown = c[cf.field]
      if (cf.field === 'seller') v = c.seller?.name
      else if (cf.field === 'buyer') v = c.buyer?.name
      return `${cf.label}: ${fmt(v)}`
    })
    const groupRow = ws.addRow([groupParts.join('   |   ')])
    ws.mergeCells(groupRow.number, 1, groupRow.number, totalCols)
    const gc = groupRow.getCell(1)
    gc.font = { bold: true, size: 11, color: { argb: BRAND } }
    gc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GROUP_BG } }
    gc.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    gc.border = { top: { style: 'thin', color: { argb: BRAND } } }
    groupRow.height = 20

    const analyses = c.analyses || []
    const installments = c.installments || []

    if (analyses.length === 0 && detailFields.some(f => f.source === 'analysis')) {
      const empty = ws.addRow(['Nenhuma análise registrada'])
      ws.mergeCells(empty.number, 1, empty.number, totalCols)
      empty.getCell(1).font = { italic: true, color: { argb: '94A3B8' }, size: 10 }
      empty.getCell(1).alignment = { indent: 2 }
      empty.outlineLevel = 1
    }

    // Linhas de detalhe (análises ou parcelas)
    const detailItems = detailFields.some(f => f.source === 'analysis') ? analyses : installments
    for (const item of detailItems) {
      const dataRow = ws.addRow(
        detailFields.map(f => fmt((item as Record<string, unknown>)[f.field]))
      )
      dataRow.outlineLevel = 1
      dataRow.eachCell((cell, col) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
        cell.font = { size: 10, color: { argb: '334155' } }
        cell.border = { bottom: { style: 'hair', color: { argb: 'E2E8F0' } } }
        if (col <= detailFields.length && detailFields[col - 1]?.field?.includes('tons')) {
          cell.alignment = { horizontal: 'right', indent: 1 }
        }
      })
      // zebra
      if (dataRow.number % 2 === 0) {
        dataRow.eachCell(cell => {
          if (!cell.fill || (cell.fill as ExcelJS.FillPattern).fgColor?.argb !== GROUP_BG) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAFAFA' } }
          }
        })
      }

      // Comentários agrupados (linhas recolhíveis nível 2)
      if (detailFields.some(f => f.source === 'analysis')) {
        const comments = (item as Record<string, unknown>).comments as
          | { content: string; created_at: string; creator?: { name?: string } }[]
          | undefined
        if (comments && comments.length > 0) {
          for (const cm of comments) {
            const when = cm.created_at ? new Date(cm.created_at).toLocaleDateString('pt-BR') : ''
            const who = cm.creator?.name || 'Usuário'
            const commentRow = ws.addRow([`💬 [${when}] ${who}: ${cm.content}`])
            ws.mergeCells(commentRow.number, 1, commentRow.number, totalCols)
            const cc = commentRow.getCell(1)
            cc.font = { size: 9, italic: true, color: { argb: '64748B' } }
            cc.alignment = { indent: 3, wrapText: true }
            commentRow.outlineLevel = 2
          }
        }
      }
    }

    // Acumula totais
    for (const a of analyses) {
      if (a.approved_tons) totalTons += Number(a.approved_tons)
    }
    if (c.balance_pending) totalBalance += Number(c.balance_pending)

    // Subtotal por contrato
    if (config.sections.some((s: { showTotals: boolean }) => s.showTotals)) {
      const subTons = analyses.reduce((acc: number, a: Record<string, unknown>) =>
        acc + (Number(a.approved_tons) || 0), 0)
      const subRow = ws.addRow([`Subtotal — Ton. Aprovadas: ${subTons.toLocaleString('pt-BR')}`])
      ws.mergeCells(subRow.number, 1, subRow.number, totalCols)
      subRow.getCell(1).font = { bold: true, size: 10, color: { argb: '047857' } }
      subRow.getCell(1).alignment = { horizontal: 'right', indent: 1 }
      subRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ECFDF5' } }
      subRow.outlineLevel = 1
    }
  }

  // Linha de total geral
  ws.addRow([])
  const totalRow = ws.addRow([
    `TOTAL GERAL — Ton. Aprovadas: ${totalTons.toLocaleString('pt-BR')}  |  Saldo Pendente: ${totalBalance.toLocaleString('pt-BR')}`,
  ])
  ws.mergeCells(totalRow.number, 1, totalRow.number, totalCols)
  const trc = totalRow.getCell(1)
  trc.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } }
  trc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND } }
  trc.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
  totalRow.height = 24

  // Rodapé
  const footRow = ws.addRow([config.footerText || 'Laferlins — Agenda TakeUp'])
  ws.mergeCells(footRow.number, 1, footRow.number, totalCols)
  footRow.getCell(1).font = { size: 9, italic: true, color: { argb: '94A3B8' } }
  footRow.getCell(1).alignment = { horizontal: 'center' }

  // Larguras de colunas
  detailFields.forEach((f, i) => {
    const col = ws.getColumn(i + 1)
    col.width = f.field.includes('observation') || f.field.includes('reference') ? 32 : 20
  })

  // Configura agrupamento (outline) recolhível com botão de resumo embaixo desativado
  ws.properties.outlineLevelRow = 2

  // ───────────────────────────────────────────────────────────────────────
  // ABA 2: Listagem simples de contratos
  // ───────────────────────────────────────────────────────────────────────
  const ws2 = wb.addWorksheet('Contratos', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })
  const cols2 = ['Contrato', 'Vendedor', 'Comprador', 'Qtd. Total', 'TakeUp Total', 'Saldo', 'Origem', 'Responsável']
  const hr2 = ws2.addRow(cols2)
  hr2.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } }
    cell.alignment = { vertical: 'middle', indent: 1 }
  })
  hr2.height = 20
  for (const c of rows) {
    const r = ws2.addRow([
      c.contract_number, c.seller?.name ?? '—', c.buyer?.name ?? '—',
      Number(c.total_quantity) || 0, Number(c.total_takeup) || 0,
      Number(c.balance_pending) || 0, c.origin ?? '—', c.responsible ?? '—',
    ])
    r.eachCell(cell => { cell.alignment = { indent: 1 }; cell.font = { size: 10 } })
  }
  ws2.columns.forEach(col => { col.width = 22 })
  // Filtro automático
  ws2.autoFilter = { from: 'A1', to: `H1` }

  // ───────────────────────────────────────────────────────────────────────
  // ABA 3: Comentários consolidados
  // ───────────────────────────────────────────────────────────────────────
  const ws3 = wb.addWorksheet('Comentários', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })
  const cols3 = ['Contrato', 'Data', 'Autor', 'Comentário']
  const hr3 = ws3.addRow(cols3)
  hr3.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } }
    cell.alignment = { vertical: 'middle', indent: 1 }
  })
  hr3.height = 20
  for (const c of rows) {
    for (const a of (c.analyses || [])) {
      for (const cm of ((a.comments as { content: string; created_at: string; creator?: { name?: string } }[]) || [])) {
        const r = ws3.addRow([
          c.contract_number,
          cm.created_at ? new Date(cm.created_at).toLocaleDateString('pt-BR') : '—',
          cm.creator?.name || 'Usuário',
          cm.content,
        ])
        r.getCell(4).alignment = { wrapText: true }
        r.eachCell(cell => { cell.font = { size: 10 } })
      }
    }
  }
  ws3.getColumn(1).width = 18
  ws3.getColumn(2).width = 14
  ws3.getColumn(3).width = 22
  ws3.getColumn(4).width = 70
  ws3.autoFilter = { from: 'A1', to: 'D1' }

  // ───────────────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(config.title || 'relatorio')}.xlsx"`,
    },
  })
}
