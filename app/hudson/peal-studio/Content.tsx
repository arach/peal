'use client'

import Studio from '@/components/Studio'
import { PealMusicEditor } from './music/PealMusicEditor'
import { PealVoiceEditor } from './voice/PealVoiceEditor'
import { usePealStudioHudson } from './Provider'
import { usePealStudioShellLayout } from './usePealStudioShellLayout'

export function PealStudioContent() {
  const { currentTool, sfxSummary } = usePealStudioHudson()
  usePealStudioShellLayout(
    currentTool === 'sfx' && sfxSummary.mounted && !sfxSummary.soundId
  )

  if (currentTool === 'voice') {
    return <PealVoiceEditor />
  }

  if (currentTool === 'music') {
    return <PealMusicEditor />
  }

  return <Studio hudsonLayout />
}
