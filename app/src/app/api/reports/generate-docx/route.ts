import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, Header, Footer,
  PageNumber,
} from 'docx'

type FileChild = Paragraph | Table

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { config } = await request.json()
  if (!config) return NextResponse.json({ error: 'Config ausente' }, { status: 400 })

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, seller:sellers(name), buyer:buyers(name), installments:contract_installments(*), analyses(*)')
    .eq('is_active', true)
    .order('contract_number')

  const dataRows = contracts || []
  const children: FileChild[] = []

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: config.title || 'Relatório', bold: true })],
    })
  )

  if (config.subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: config.subtitle, size: 24, color: '555555' })],
      })
    )
  }

  if (config.showDate) {
    const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: dateStr, size: 18, color: '888888' })],
      })
    )
  }

  for (const section of config.sections) {
    const visibleFields = section.fields.filter((f: { visible: boolean }) => f.visible)
    if (visibleFields.length === 0) continue

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        children: [new TextRun({ text: section.title, bold: true })],
      })
    )

    const headerCells = visibleFields.map((f: { label: string }) =>
      new TableCell({
        shading: { fill: 'F1F5F9' },
        children: [new Paragraph({ children: [new TextRun({ text: f.label, bold: true, size: 18 })] })],
      })
    )

    const tableRows: TableRow[] = [new TableRow({ children: headerCells, tableHeader: true })]

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
          value = (row.analyses || []).map((a: Record<string, unknown>) => String(a[f.field] ?? '')).join(', ')
        } else if (f.source === 'installment') {
          value = (row.installments || []).map((i: Record<string, unknown>) => String(i[f.field] ?? '')).join(', ')
        }
        return new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: value, bold: f.bold, size: 18 })] })],
        })
      })
      tableRows.push(new TableRow({ children: cells }))
    }

    if (tableRows.length > 1) {
      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      )
    } else {
      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Sem dados para exibir.', italics: true, color: '999999', size: 18 })] })
      )
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
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: config.title, size: 16, color: '888888' })],
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
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888' }),
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

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(config.title || 'relatorio')}.docx"`,
    },
  })
}
