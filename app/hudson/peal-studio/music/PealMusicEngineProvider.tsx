'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useStrudelManage, type StrudelManageStatusResponse } from './useStrudelManage'

export interface PealMusicEngineContextValue {
  status: StrudelManageStatusResponse | null
  busy: boolean
  error: string | null
  refresh: () => Promise<void>
  install: (path?: string) => Promise<void>
  start: () => Promise<void>
  stop: () => Promise<void>
  setPath: (path: string) => Promise<void>
}

const PealMusicEngineContext = createContext<PealMusicEngineContextValue | null>(null)

export function PealMusicEngineProvider({ children }: { children: ReactNode }) {
  const manage = useStrudelManage(3000)

  const value = useMemo<PealMusicEngineContextValue>(() => ({
    status: manage.status,
    busy: manage.busy,
    error: manage.error,
    refresh: manage.refresh,
    install: manage.install,
    start: manage.start,
    stop: manage.stop,
    setPath: manage.setPath,
  }), [
    manage.status,
    manage.busy,
    manage.error,
    manage.refresh,
    manage.install,
    manage.start,
    manage.stop,
    manage.setPath,
  ])

  return (
    <PealMusicEngineContext.Provider value={value}>
      {children}
    </PealMusicEngineContext.Provider>
  )
}

export function usePealMusicEngine() {
  const context = useContext(PealMusicEngineContext)
  if (!context) {
    throw new Error('usePealMusicEngine must be used inside PealMusicEngineProvider')
  }
  return context
}

export function useOptionalPealMusicEngine() {
  return useContext(PealMusicEngineContext)
}