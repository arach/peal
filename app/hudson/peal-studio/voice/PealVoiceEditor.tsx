'use client'

import { PealVoiceLayoutBar, PealVoiceWorkspace } from './PealVoiceLayout'

export function PealVoiceEditor() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PealVoiceLayoutBar />
      <PealVoiceWorkspace />
    </div>
  )
}