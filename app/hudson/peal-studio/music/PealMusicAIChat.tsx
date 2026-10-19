'use client'

import { PealAIComposer, PealAIThread } from '../shared/PealAIPanel'
import { usePealMusicAIContext } from './PealMusicAIContext'

export function PealMusicAIChat({ placeholder }: { placeholder: string }) {
  const { chat } = usePealMusicAIContext()
  return <PealAIThread chat={chat} placeholder={placeholder} pendingLabel="Writing pattern…" />
}

export function PealMusicAIComposer({ placeholder }: { placeholder: string }) {
  const { chat, sendPrompt, isBusy } = usePealMusicAIContext()
  return (
    <PealAIComposer
      label="Live code"
      placeholder={placeholder}
      isBusy={isBusy}
      onSend={sendPrompt}
      onStop={() => chat.stop()}
    />
  )
}
