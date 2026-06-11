import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, Header, Footer,
  PageNumber, NumberFormat,
} from 'docx'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { config } = await request.json()
  if (!config) return NextResponse.json({ error: 'Config ausente' }, { status: 400 })

  // Fetch data for all sections
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, seller:sellers(name), buyer:buyers(name), installments:contract_installments(*), analyses(*)')
    .eq('is_active', true)
    .order('contract_number')

  const dataRows = contracts || []

  // Build document children
  const children: Paragraph[] = []

  // Title
  children.push(
    new Paragraph({
      text: config.title || 'Relatório',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  if (config.subtitle) {
    children.push(
      new Paragraph({
        text: config.subtitle,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        runs: [new TextRun({ text: config.subtitle, size: 24, color: '555555' })],
      })
    )
  }

  if (config.showDate) {
    children.push(
      new Paragraph({
        text: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        runs: [new TextRun({ text: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), size: 18, color: '888888' })],
      })
    )
  }

  // Sections
  for (const section of config.sections) {
    const visibleFields = section.fields.filter((f: { visible: boolean }) => f.visible)
    if (visibleFields.length === 0) continue

    // Section title
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
      })
    )

    // Build table for the section
    const headerCells = visibleFields.map((f: { label: string }) =>
      new TableCell({
        children: [new Paragraph({
          runs: [new TextRun({ text: f.label, bold: true, size: 18 })],
        })],
        shading: { fill: 'F1F5F9' },
      })
    )

    const tableRows: TableRow[] = [new TableRow({ children: headerCells, tableHeader: true })]

    // Data rows
    const sortedData = [...dataRows].sort((a, b) => {
      if (!section.sortField) return 0
      const av = String(a[section.sortField] ?? '')
      const bv = String(b[section.sortField] ?? '')
      return section.sortOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

    for (const row of sortedData) {
      const cells = visibleFields.map((f: { source: string; field: string; bold?: boolean }) => {
        let value = ''
        if (f.source === 'contract') {
          if (f.field === 'seller') value = row.seller?.name ?? ''
          else if (f.field === 'buyer') value = row.buyer?.name ?? ''
          else value = String(row[f.field] ?? '')
        } else if (f.source === 'analysis') {
          const analyses = row.analyses || []
          value = analyses.map((a: Record<string, unknown>) => String(a[f.field] ?? '')).join(', ')
        } else if (f.source === 'installment') {
          const installments = row.installments || []
          value = installments.map((i: Record<string, unknown>) => String(i[f.field] ?? '')).join(', ')
        }

        return new TableCell({
          children: [new Paragraph({
            runs: [new TextRun({ text: value, bold: f.bold, size: 18 })],
          })],
        })
      })
      tableRows.push(new TableRow({ children: cells }))
    }

    if (tableRows.length > 1) {
      // Use Table properly
      const table = new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          insideH: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          insideV: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
        },
      })
      // @ts-expect-error docx Table is a valid child
      children.push(table)
    } else {
      children.push(new Paragraph({ text: 'Sem dados para exibir.', runs: [new TextRun({ text: 'Sem dados para exibir.', italics: true, color: '999999', size: 18 })] }))
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: config.orientation === 'landscape'
            ? { width: 15840, height: 12240 }
            : { width: 12240, height: 15840 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              text: config.title,
              alignment: AlignmentType.RIGHT,
              runs: [new TextRun({ text: config.title, size: 16, color: '888888' })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${config.footerText || 'Laferlins — Agenda TakeUp'}`, size: 16, color: '888888' }),
                ...(config.showPageNumbers ? [
                  new TextRun({ text: '  —  Página ', size: 16, color: '888888' }),
                  new PageNumber({ format: NumberFormat.DECIMAL } as Parameters<typeof PageNumber>[0]),
                ] : []),
              ],
            }),
          ],
        }),
      },
      children,
    }],
  })

  const buffer = await Packer.toBuffer(doc)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(config.title || 'relatorio')}.docx"`,
    },
  })
}
