'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PasteImport } from '@/components/contracts/paste-import'

export default function ImportarContratosPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Importar Contratos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Copie as linhas da planilha Excel (Ctrl+C) e cole aqui (Ctrl+V). O cabeçalho deve estar incluído.
        </p>
      </div>
      <PasteImport />
    </div>
  )
}
