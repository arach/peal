'use client'

import { useCallback, useRef } from 'react'
import type { PealAISession } from '@/lib/ai/pealAiSessions'
import { PealMusicAIDesign } from './PealMusicAIDesign'
import { PealMusicAISessionContextProvider } from './PealMusicAIContext'
import { usePealMusic } from './PealMusicProvider'
import { usePealMusicAI } from './usePealMusicAI'

interface PealMusicAISessionHostProps {
  session: PealAISession
  visible: boolean
}

export function PealMusicAISessionHost({ session, visible }: PealMusicAISessionHostProps) {
  const music = usePealMusic()
  const ai = usePealMusicAI(session, { visible })
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
      improvLoop={ai.improvLoop}
      improvTick={ai.improvRuntime.tick}
      improvWaiting={ai.improvRuntime.waiting}
      improvNextFireAt={ai.improvRuntime.nextFireAt}
      improvCanRun={music.patternCode.trim().length > 0 && music.lane === 'live'}
      setImprovEnabled={ai.setImprovEnabled}
      setImprovIntervalSec={ai.setImprovIntervalSec}
      setImprovStyle={ai.setImprovStyle}
    >
      <PealMusicAIDesign />
    </PealMusicAISessionContextProvider>
  )
}