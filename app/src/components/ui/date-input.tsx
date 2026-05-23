'use client'

import { forwardRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DateInputProps {
  value?: string          // yyyy-mm-dd
  onChange?: (value: string) => void  // emits yyyy-mm-dd
  min?: string            // yyyy-mm-dd
  max?: string            // yyyy-mm-dd
  disabled?: boolean
  className?: string
  placeholder?: string
  id?: string
}

// Converts yyyy-mm-dd → dd/mm/aaaa for display
function toDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

// Converts dd/mm/aaaa → yyyy-mm-dd for storage
function toISO(display: string): string {
  const clean = display.replace(/\D/g, '')
  if (clean.length < 8) return ''
  const d = clean.slice(0, 2)
  const m = clean.slice(2, 4)
  const y = clean.slice(4, 8)
  return `${y}-${m}-${d}`
}

// Applies dd/mm/aaaa mask as user types
function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, min, max, disabled, className, placeholder = 'dd/mm/aaaa', id }, ref) => {
    const [display, setDisplay] = useState(() => toDisplay(value || ''))

    useEffect(() => {
      setDisplay(toDisplay(value || ''))
    }, [value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const masked = applyMask(e.target.value)
      setDisplay(masked)
      const iso = toISO(masked)
      if (iso && onChange) onChange(iso)
      else if (!masked && onChange) onChange('')
    }

    return (
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
    )
  }
)
DateInput.displayName = 'DateInput'
