'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Busca uma coleção da API (`{ data: T[] }`) e expõe `reload()`.
 * O setState roda dentro de callbacks assíncronos (não síncrono no corpo do
 * efeito), evitando renders em cascata.
 */
export function useCollection<T>(url: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => {
    setLoading(true)
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    let active = true
    fetch(url)
      .then(async (r) => ({ ok: r.ok, json: await r.json() }))
      .then(({ ok, json }) => { if (active && ok) setData(json.data ?? []) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [url, tick])

  return { data, setData, loading, reload }
}
