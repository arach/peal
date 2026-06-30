'use client'

import Studio from '@/components/Studio'
import { PealVoiceEditor } from './voice/PealVoiceEditor'
import { usePealStudioHudson } from './Provider'
import { usePealStudioShellLayout } from './usePealStudioShellLayout'

export function PealStudioContent() {
  const { currentTool } = usePealStudioHudson()
  usePealStudioShellLayout()

  if (currentTool === 'voice') {
    return <PealVoiceEditor />
  }

  return <Studio hudsonLayout />
}