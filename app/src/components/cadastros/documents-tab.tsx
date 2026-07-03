'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Loader2, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/date-format'
import { createClient } from '@/lib/supabase/client'
import { partnerDocPath } from '@/lib/partners/config'
import { useCollection } from '@/lib/partners/use-collection'
import type { Document } from '@/types'

const BUCKET = 'partner-documents'

interface DocumentsTabProps {
  entityType: 'seller' | 'buyer' | 'laboratory' | 'warehouse' | 'carrier'
  entityId: string
  canWrite: boolean
}

function fmtSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsTab({ entityType, entityId, canWrite }: DocumentsTabProps) {
  const supabase = createClient()
  const { data: docs, loading, reload } = useCollection<Document>(
    `/api/partners/documents?entity_type=${entityType}&entity_id=${entityId}`,
  )
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const path = partnerDocPath(entityType, entityId, file.name)
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
      if (upErr) throw new Error(upErr.message)

      const res = await fetch('/api/partners/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType, entity_id: entityId,
          file_url: path, file_name: file.name, file_type: file.type, file_size: file.size,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao registrar documento')
      toast.success('Documento anexado!')
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao anexar documento')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function openDoc(doc: Document) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_url, 3600)
    if (error || !data) { toast.error('Não foi possível abrir o documento.'); return }
    window.open(data.signedUrl, '_blank')
  }

  async function remove(doc: Document) {
    if (!confirm(`Remover "${doc.file_name}"?`)) return
    try {
      const res = await fetch(`/api/partners/documents/${doc.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Erro ao remover')
      toast.success('Documento removido.')
      reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover')
    }
  }

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className="flex justify-end">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
          />
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Anexar documento
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : docs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhum documento anexado.</p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{d.file_name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(d.created_at)} {fmtSize(d.file_size) && `· ${fmtSize(d.file_size)}`}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDoc(d)}><Download className="h-4 w-4" /></Button>
              {canWrite && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(d)}><Trash2 className="h-4 w-4" /></Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
