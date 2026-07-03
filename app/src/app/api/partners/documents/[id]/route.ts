import { NextRequest, NextResponse } from 'next/server'
import { getAuth, canWrite } from '@/lib/partners/crud'

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, userId, role } = await getAuth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!canWrite(role)) return NextResponse.json({ error: 'Sem permissão para excluir documentos' }, { status: 403 })

  const { data: doc } = await supabase.from('documents').select('*').eq('id', id).single()
  if (!doc) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })

  // Remove o arquivo do bucket privado (file_url guarda o path)
  if (doc.file_url) {
    await supabase.storage.from('partner-documents').remove([doc.file_url])
  }

  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('audit_log').insert({
    user_id: userId, action: 'delete', entity_type: 'document', entity_id: id, old_values: doc,
  })
  return NextResponse.json({ success: true })
}
