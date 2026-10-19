'use client'

import { PealAIComposer, PealAIThread } from '../shared/PealAIPanel'
import { usePealVoiceAIContext } from './PealVoiceAIProvider'

export function PealVoiceAIChat({ placeholder }: { placeholder: string }) {
  const { chat } = usePealVoiceAIContext()
  return <PealAIThread chat={chat} placeholder={placeholder} pendingLabel="Applying to mixer…" />
}

export function PealVoiceAIComposer({ placeholder }: { placeholder: string }) {
  const { chat, sendPrompt, isBusy } = usePealVoiceAIContext()
  return (
    <PealAIComposer
      label="Your idea"
      placeholder={placeholder}
      isBusy={isBusy}
      onSend={sendPrompt}
      onStop={() => chat.stop()}
    />
  )
}
