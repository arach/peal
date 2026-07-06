'use client'

import { useCallback, useRef } from 'react'
import type { PealAISession } from '@/lib/ai/pealAiSessions'
import { PealMusicAIDesign } from './PealMusicAIDesign'
import { PealMusicAISessionContextProvider } from './PealMusicAIContext'
import { usePealMusicAI } from './usePealMusicAI'

interface PealMusicAISessionHostProps {
  session: PealAISession
  visible: boolean
}

export function PealMusicAISessionHost({ session, visible }: PealMusicAISessionHostProps) {
  const ai = usePealMusicAI(session)
  const isBusy = ai.chat.status === 'streaming' || ai.chat.status === 'submitted'
  const isBusyRef = useRef(isBusy)
  isBusyRef.current = isBusy

  const sendPrompt = useCallback((text: string) => {
    if (isBusyRef.current) return
    void ai.chat.sendMessage({ text })
  }, [ai.chat])

  if (!visible) {
    return <div className="hidden" aria-hidden />
  }

  return (
    <PealMusicAISessionContextProvider
      chat={ai.chat}
      activity={ai.activity}
      lastEdit={ai.lastEdit}
      isBusy={isBusy}
      sendPrompt={sendPrompt}
      sessionLabel={session.label}
    >
      <PealMusicAIDesign />
    </PealMusicAISessionContextProvider>
  )
}