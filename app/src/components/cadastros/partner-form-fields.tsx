'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { FieldDef } from '@/lib/partners/config'

export type FormValues = Record<string, string>

interface PartnerFormFieldsProps {
  fields: FieldDef[]
  values: FormValues
  onChange: (key: string, value: string) => void
  disabled?: boolean
}

export function PartnerFormFields({ fields, values, onChange, disabled }: PartnerFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => {
        const v = values[f.key] ?? ''
        return (
          <div key={f.key} className={cn('space-y-1.5', f.colSpan === 2 && 'sm:col-span-2')}>
            <Label htmlFor={`field-${f.key}`}>{f.label}</Label>
            {f.type === 'textarea' ? (
              <Textarea
                id={`field-${f.key}`}
                value={v}
                disabled={disabled}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.key, e.target.value)}
                rows={3}
              />
            ) : f.type === 'select' ? (
              <Select value={v || '__none__'} disabled={disabled} onValueChange={(val) => onChange(f.key, val === '__none__' ? '' : val)}>
                <SelectTrigger id={`field-${f.key}`} className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {f.options?.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={`field-${f.key}`}
                type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : 'text'}
                inputMode={f.type === 'number' ? 'decimal' : undefined}
                value={v}
                disabled={disabled}
                placeholder={f.placeholder}
                onChange={(e) => onChange(f.key, e.target.value)}
                className={cn(f.type === 'number' && 'tabular-nums')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Converte valores do form (string) para o payload da API. */
export function toPayload(fields: FieldDef[], values: FormValues): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    const raw = values[f.key]
    if (raw === undefined) continue
    if (f.type === 'number') {
      out[f.key] = raw === '' ? null : Number(raw)
    } else {
      out[f.key] = raw === '' ? null : raw
    }
  }
  return out
}
