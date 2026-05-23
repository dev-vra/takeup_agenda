'use client'

import { useState, useCallback } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const MONTHS_SHORT_PT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function formatDisplay(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${MONTHS_SHORT_PT[parseInt(month, 10) - 1]}/${year}`
}

function parseISO(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// Returns 0=Mon ... 6=Sun for day-of-week index
function getFirstDayOfWeek(year: number, month: number): number {
  // getDay() returns 0=Sun...6=Sat, convert to Mon-first
  const raw = new Date(year, month, 1).getDay()
  return raw === 0 ? 6 : raw - 1
}

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({ value, onChange, placeholder = 'dd/mmm/aaaa', disabled }: DatePickerProps) {
  const today = new Date()
  const parsed = value ? parseISO(value) : null

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth())

  const handleSelect = useCallback((day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
    setOpen(false)
  }, [viewYear, viewMonth, onChange])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm shadow-sm transition-colors',
            'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'w-full text-left',
            disabled && 'opacity-50 cursor-not-allowed',
            !value && 'text-slate-400'
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 truncate">
            {value ? formatDisplay(value) : placeholder}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 bg-white rounded-xl border border-slate-200 shadow-lg p-3 w-72 animate-in fade-in-0 zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              {MONTHS_PT[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const mm = String(viewMonth + 1).padStart(2, '0')
              const dd = String(day).padStart(2, '0')
              const dayStr = `${viewYear}-${mm}-${dd}`
              const isSelected = value === dayStr
              const isToday = todayStr === dayStr

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'w-full aspect-square rounded-md text-xs font-medium transition-colors flex items-center justify-center',
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : isToday
                      ? 'border border-blue-400 text-blue-700 hover:bg-blue-50'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer: limpar */}
          {value && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false) }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Limpar data
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
