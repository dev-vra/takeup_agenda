import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MONTH_ABBR: Record<string, string> = {
  '01': 'jan', '02': 'fev', '03': 'mar', '04': 'abr',
  '05': 'mai', '06': 'jun', '07': 'jul', '08': 'ago',
  '09': 'set', '10': 'out', '11': 'nov', '12': 'dez',
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTH_ABBR[String(d.getMonth() + 1).padStart(2, '0')]
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatMonth(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, 'MMM/yy', { locale: ptBR })
}

export function toISODate(date: string): string {
  // Accepts dd/mm/yyyy or yyyy-mm-dd
  if (date.includes('/') && date.length === 10) {
    const [day, month, year] = date.split('/')
    return `${year}-${month}-${day}`
  }
  return date
}

export function monthKeyToDate(key: string): string | null {
  // "Jun/25 (t)" -> "2025-06-01"
  const match = key.match(/^(\w+)\/(\d{2})/)
  if (!match) return null
  const monthMap: Record<string, string> = {
    jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
    jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
  }
  const monthStr = match[1].toLowerCase().substring(0, 3)
  const month = monthMap[monthStr]
  if (!month) return null
  const year = `20${match[2]}`
  return `${year}-${month}-01`
}

export function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

export function nextBusinessDay(date: Date): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + 1)
  while (!isBusinessDay(next)) {
    next.setDate(next.getDate() + 1)
  }
  return next
}
