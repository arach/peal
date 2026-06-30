'use client'

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { VoiceFxParams } from '@voxd/client/fx'
import type { useHudsonAI } from 'hudsonkit'
import {
  usePealVoiceAI,
  type EditCompareSide,
  type PealVoiceAIActivity,
  type PealVoiceLastEdit,
} from './usePealVoiceAI'

type HudsonAIChat = ReturnType<typeof useHudsonAI>

export interface PealVoiceAIHighlights {
  knobKeys: Set<keyof VoiceFxParams>
  genreIdAfter: string
  genreChanged: boolean
  compareSide: EditCompareSide
}

interface PealVoiceAIContextValue {
  chat: HudsonAIChat
  activity: PealVoiceAIActivity[]
  lastEdit: PealVoiceLastEdit | null
  lastEditExpanded: boolean
  compareSide: EditCompareSide
  toggleLastEdit: () => void
  dismissLastEdit: () => void
  previewEditCompare: (side: EditCompareSide) => void
  aiHighlights: PealVoiceAIHighlights | null
  sendPrompt: (text: string) => void
  availableVoices: string[]
  isBusy: boolean
}

const PealVoiceAIContext = createContext<PealVoiceAIContextValue | null>(null)

export function PealVoiceAIProvider({ children }: { children: ReactNode }) {
  const ai = usePealVoiceAI()

  const isBusy = ai.chat.status === 'streaming' || ai.chat.status === 'submitted'

  const sendPrompt = useCallback((text: string) => {
    if (ai.chat.status === 'streaming' || ai.chat.status === 'submitted') return
    ai.chat.sendMessage({ text })
  }, [ai.chat])

  const dismissLastEdit = useCallback(() => {
    ai.clearLastEdit()
  }, [ai.clearLastEdit])

  const value = useMemo<PealVoiceAIContextValue>(() => ({
    chat: ai.chat,
    activity: ai.activity,
    lastEdit: ai.lastEdit,
    lastEditExpanded: ai.lastEditExpanded,
    compareSide: ai.compareSide,
    toggleLastEdit: ai.toggleLastEdit,
    dismissLastEdit,
    previewEditCompare: ai.previewEditCompare,
    aiHighlights: ai.aiHighlights,
    sendPrompt,
    availableVoices: ai.availableVoices,
    isBusy,
  }), [ai, sendPrompt, dismissLastEdit, isBusy])

  return (
    <PealVoiceAIContext.Provider value={value}>
      {children}
    </PealVoiceAIContext.Provider>
  )
}

export function usePealVoiceAIContext() {
  const context = useContext(PealVoiceAIContext)
  if (!context) {
    throw new Error('usePealVoiceAIContext must be used inside PealVoiceAIProvider')
  }
  return context
}