'use client'

import { useCallback, useEffect, useState } from 'react'
import { getPath } from '@/utils/navigation'

export interface StrudelManageStatusResponse {
  phase: string
  config: {
    checkoutPath: string
    port: number
    packageManager: string
  } | null
  upstream: string | null
  reachable: boolean
  pidAlive: boolean
  message: string
  state: { pid: number } | null
}

export function useStrudelManage(pollMs = 5000) {
  const [status, setStatus] = useState<StrudelManageStatusResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = getPath('/api/strudel')

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(payload.error ?? `Status ${response.status}`)
      }
      setStatus(await response.json() as StrudelManageStatusResponse)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [apiUrl])

  const runAction = useCallback(async (action: string, payload?: Record<string, unknown>) => {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      })
      const data = await response.json().catch(() => ({})) as {
        ok?: boolean
        error?: string
        status?: StrudelManageStatusResponse
      }
      if (!response.ok) throw new Error(data.error ?? `Action failed (${response.status})`)
      if (data.status) {
        setStatus(data.status)
        if (action === 'start' && data.status.phase !== 'running') {
          setError(data.status.message || 'Strudel is still starting — wait a few seconds and try Route.')
        }
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }, [apiUrl, refresh])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), pollMs)
    return () => window.clearInterval(timer)
  }, [refresh, pollMs])

  return {
    status,
    busy,
    error,
    refresh,
    install: (path?: string) => runAction('install', path ? { path } : undefined),
    start: () => runAction('start'),
    stop: () => runAction('stop'),
    setPath: (path: string) => runAction('set-path', { path }),
  }
}