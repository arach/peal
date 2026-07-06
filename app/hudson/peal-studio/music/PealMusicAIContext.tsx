'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { useHudsonAI } from 'hudsonkit'
import type { MusicImprovStyle } from '@/lib/ai/musicImprovPrompts'
import type { PealMusicLastEdit } from '@/lib/ai/musicAiFollowUps'
import type { PealMusicAIActivity } from './usePealMusicAI'
import type { PealMusicImprovLoopState } from './usePealMusicImprovLoop'

type HudsonAIChat = ReturnType<typeof useHudsonAI>

export interface PealMusicAIContextValue {
  chat: HudsonAIChat
  activity: PealMusicAIActivity[]
  lastEdit: PealMusicLastEdit | null
  sendPrompt: (text: string) => void
  isBusy: boolean
  sessionLabel: string
  improvLoop: PealMusicImprovLoopState
  improvTick: number
  improvWaiting: boolean
  improvNextFireAt: number | null
  improvCanRun: boolean
  setImprovEnabled: (enabled: boolean) => void
  setImprovIntervalSec: (seconds: number) => void
  setImprovStyle: (style: MusicImprovStyle) => void
}

const PealMusicAIContext = createContext<PealMusicAIContextValue | null>(null)

export function PealMusicAISessionContextProvider({
  chat,
  activity,
  lastEdit,
  isBusy,
  sendPrompt,
  sessionLabel,
  improvLoop,
  improvTick,
  improvWaiting,
  improvNextFireAt,
  improvCanRun,
  setImprovEnabled,
  setImprovIntervalSec,
  setImprovStyle,
  children,
}: {
  chat: HudsonAIChat
  activity: PealMusicAIActivity[]
  lastEdit: PealMusicLastEdit | null
  isBusy: boolean
  sendPrompt: (text: string) => void
  sessionLabel: string
  improvLoop: PealMusicImprovLoopState
  improvTick: number
  improvWaiting: boolean
  improvNextFireAt: number | null
  improvCanRun: boolean
  setImprovEnabled: (enabled: boolean) => void
  setImprovIntervalSec: (seconds: number) => void
  setImprovStyle: (style: MusicImprovStyle) => void
  children: ReactNode
}) {
  const value = useMemo<PealMusicAIContextValue>(() => ({
    chat,
    activity,
    lastEdit,
    sendPrompt,
    isBusy,
    sessionLabel,
    improvLoop,
    improvTick,
    improvWaiting,
    improvNextFireAt,
    improvCanRun,
    setImprovEnabled,
    setImprovIntervalSec,
    setImprovStyle,
  }), [
    chat,
    activity,
    lastEdit,
    sendPrompt,
    isBusy,
    sessionLabel,
    improvLoop,
    improvTick,
    improvWaiting,
    improvNextFireAt,
    improvCanRun,
    setImprovEnabled,
    setImprovIntervalSec,
    setImprovStyle,
  ])

  return (
    <PealMusicAIContext.Provider value={value}>
      {children}
    </PealMusicAIContext.Provider>
  )
}

export function usePealMusicAIContext() {
  const context = useContext(PealMusicAIContext)
  if (!context) {
    throw new Error('usePealMusicAIContext must be used inside PealMusicAISessionContextProvider')
  }
  return context
}