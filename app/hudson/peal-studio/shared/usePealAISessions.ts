'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createPealAISession,
  defaultMusicSessions,
  loadPealAISessions,
  savePealAISessions,
  type PealAISession,
  type PealAISessionConfig,
  type PealAISessionWorkspace,
} from '@/lib/ai/pealAiSessions'
import { presetForValue, type PealAIModelPreset } from '@/lib/ai/pealModelPresets'

export function usePealAISessions(storageKey: string) {
  const [workspace, setWorkspace] = useState<PealAISessionWorkspace>(defaultMusicSessions)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setWorkspace(loadPealAISessions(storageKey))
    setHydrated(true)
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    savePealAISessions(storageKey, workspace)
  }, [hydrated, storageKey, workspace])

  const activeSession = useMemo(
    () => workspace.sessions.find((s) => s.id === workspace.activeId) ?? workspace.sessions[0],
    [workspace],
  )

  const splitSession = useMemo(() => {
    if (!workspace.splitSessionId) return null
    return workspace.sessions.find((s) => s.id === workspace.splitSessionId) ?? null
  }, [workspace])

  const visibleSessionIds = useMemo(() => {
    const ids = new Set<string>([workspace.activeId])
    if (workspace.splitEnabled && workspace.splitSessionId) {
      ids.add(workspace.splitSessionId)
    }
    return ids
  }, [workspace.activeId, workspace.splitEnabled, workspace.splitSessionId])

  const setActiveId = useCallback((id: string) => {
    setWorkspace((prev) => ({ ...prev, activeId: id }))
  }, [])

  const toggleSplit = useCallback(() => {
    setWorkspace((prev) => {
      const partner = prev.splitSessionId
        ?? prev.sessions.find((s) => s.id !== prev.activeId)?.id
        ?? null
      return { ...prev, splitEnabled: !prev.splitEnabled, splitSessionId: partner }
    })
  }, [])

  const addSession = useCallback((preset?: PealAIModelPreset) => {
    setWorkspace((prev) => {
      const session = createPealAISession(
        preset ? preset.label.split(' ')[0] : `Session ${prev.sessions.length + 1}`,
        preset,
      )
      return {
        ...prev,
        sessions: [...prev.sessions, session],
        activeId: session.id,
      }
    })
  }, [])

  const closeSession = useCallback((id: string) => {
    setWorkspace((prev) => {
      if (prev.sessions.length <= 1) return prev
      const nextSessions = prev.sessions.filter((s) => s.id !== id)
      const nextActive = prev.activeId === id ? nextSessions[0].id : prev.activeId
      const nextSplit = prev.splitSessionId === id
        ? nextSessions.find((s) => s.id !== nextActive)?.id ?? null
        : prev.splitSessionId
      return {
        ...prev,
        sessions: nextSessions,
        activeId: nextActive,
        splitSessionId: nextSplit,
        splitEnabled: prev.splitEnabled && nextSplit !== null,
      }
    })
  }, [])

  const updateSessionConfig = useCallback((id: string, patch: Partial<PealAISessionConfig>) => {
    setWorkspace((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => {
        if (s.id !== id) return s
        const next = { ...s.config, ...patch }
        if (patch.presetValue) {
          const preset = presetForValue(patch.presetValue)
          next.provider = preset.provider
          next.model = preset.model
        }
        return { ...s, config: next }
      }),
    }))
  }, [])

  const renameSession = useCallback((id: string, label: string) => {
    setWorkspace((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === id ? { ...s, label: label.trim() || s.label } : s)),
    }))
  }, [])

  const setSplitSessionId = useCallback((id: string | null) => {
    setWorkspace((prev) => ({ ...prev, splitSessionId: id }))
  }, [])

  return {
    hydrated,
    sessions: workspace.sessions,
    activeId: workspace.activeId,
    activeSession,
    splitEnabled: workspace.splitEnabled,
    splitSessionId: workspace.splitSessionId,
    splitSession,
    visibleSessionIds,
    setActiveId,
    toggleSplit,
    addSession,
    closeSession,
    updateSessionConfig,
    renameSession,
    setSplitSessionId,
  }
}