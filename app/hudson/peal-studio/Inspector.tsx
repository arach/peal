'use client'

import { useCallback } from 'react'
import { ParametersIcon } from '@/components/icons/PealStudioIcon'
import { PealMusicInspector } from './music/PealMusicInspector'
import { PealVoiceInspector } from './voice/PealVoiceInspector'
import { usePealStudioHudson } from './Provider'

export function PealStudioInspector() {
  const { currentTool, setInspectorElement, sfxSummary } = usePealStudioHudson()
  const setRef = useCallback((node: HTMLDivElement | null) => {
    setInspectorElement(node)
  }, [setInspectorElement])

  if (currentTool === 'music') {
    return <PealMusicInspector />
  }

  if (currentTool === 'voice') {
    return <PealVoiceInspector />
  }

  return (
    <div ref={setRef} className="relative h-full min-h-0 overflow-hidden bg-transparent text-[var(--peal-surface-text,#d1d5db)]">
      {!sfxSummary.mounted ? (
        <div className="p-4 text-xs leading-5 text-[var(--peal-surface-text-muted,#9ca3af)]">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#4a9eff]">
            <ParametersIcon size={13} />
            Inspector
          </div>
          <p>Loading the SFX parameter and AI design inspector…</p>
        </div>
      ) : null}
    </div>
  )
}
