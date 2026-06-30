'use client'

import Studio from '@/components/Studio'
import TTSStudio from '@/components/TTSStudio'
import { usePealStudioHudson } from './Provider'
import { usePealStudioShellLayout } from './usePealStudioShellLayout'

export function PealStudioContent() {
  const { currentTool } = usePealStudioHudson()
  usePealStudioShellLayout()

  if (currentTool === 'voice') {
    return (
      <div className="h-full bg-[#111113] text-gray-100">
        <TTSStudio />
      </div>
    )
  }

  return <Studio hudsonLayout />
}
