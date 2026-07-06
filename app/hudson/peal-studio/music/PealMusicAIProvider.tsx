'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { PealAISessionChrome } from '../shared/PealAISessionChrome'
import { usePealAISessions } from '../shared/usePealAISessions'
import { DEFAULT_PEAL_AI_PRESET, PEAL_AI_MODEL_PRESETS } from '@/lib/ai/pealModelPresets'
import { PealMusicAISessionHost } from './PealMusicAISessionHost'

const MUSIC_SESSIONS_KEY = 'peal-music-ai-sessions.v1'

type PealAISessionsApi = ReturnType<typeof usePealAISessions>

const PealMusicAISessionsContext = createContext<PealAISessionsApi | null>(null)

export function PealMusicAIProvider({ children }: { children: ReactNode }) {
  const sessions = usePealAISessions(MUSIC_SESSIONS_KEY)

  return (
    <PealMusicAISessionsContext.Provider value={sessions}>
      {children}
    </PealMusicAISessionsContext.Provider>
  )
}

export function PealMusicAICopilotShell() {
  const sessions = usePealMusicAISessionsContext()

  const handleAddSession = useCallback(() => {
    const preset = PEAL_AI_MODEL_PRESETS.find((p) => p.provider === 'openai-codex')
      ?? DEFAULT_PEAL_AI_PRESET
    sessions.addSession(preset)
  }, [sessions])

  const showSplit = sessions.splitEnabled && sessions.splitSessionId

  const visibleSessions = useMemo(
    () => sessions.sessions.filter((s) => sessions.visibleSessionIds.has(s.id)),
    [sessions.sessions, sessions.visibleSessionIds],
  )

  const backgroundSessions = useMemo(
    () => sessions.sessions.filter((s) => !sessions.visibleSessionIds.has(s.id)),
    [sessions.sessions, sessions.visibleSessionIds],
  )

  if (!sessions.hydrated) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-white/6 bg-[#111113] px-2 py-5">
          <div className="h-3 w-28 animate-pulse rounded bg-white/5" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <span className="font-mono text-[9px] text-gray-600">Loading AI sessions…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PealAISessionChrome
        sessions={sessions.sessions}
        activeId={sessions.activeId}
        splitEnabled={sessions.splitEnabled}
        splitSessionId={sessions.splitSessionId}
        onSelect={sessions.setActiveId}
        onAdd={handleAddSession}
        onClose={sessions.closeSession}
        onToggleSplit={sessions.toggleSplit}
        onSplitPartnerChange={sessions.setSplitSessionId}
        onConfigChange={(id, patch) => sessions.updateSessionConfig(id, patch)}
        configSessionId={sessions.activeId}
      />

      {backgroundSessions.map((session) => (
        <PealMusicAISessionHost key={session.id} session={session} visible={false} />
      ))}

      <div className={`min-h-0 flex-1 ${showSplit ? 'peal-ai-split-panes' : 'flex flex-col'}`}>
        {visibleSessions.map((session) => (
          <div key={session.id} className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {showSplit ? (
              <div className="shrink-0 border-b border-white/4 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-gray-600">
                {session.label} · {session.config.provider}/{session.config.model}
              </div>
            ) : null}
            <PealMusicAISessionHost session={session} visible />
          </div>
        ))}
      </div>
    </div>
  )
}

function usePealMusicAISessionsContext() {
  const context = useContext(PealMusicAISessionsContext)
  if (!context) {
    throw new Error('usePealMusicAISessionsContext must be used inside PealMusicAIProvider')
  }
  return context
}