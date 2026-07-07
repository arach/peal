'use client'

import { useCallback } from 'react'
import { ParametersIcon } from '@/components/icons/PealStudioIcon'
import { PealMusicInspector } from './music/PealMusicInspector'
import { PealVoiceInspector } from './voice/PealVoiceInspector'
import { usePealStudioHudson } from './Provider'

export function PealStudioInspector() {
  const { currentTool, setInspectorElement, sfxSummary, runSfxAction } = usePealStudioHudson()
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

      {sfxSummary.mounted && !sfxSummary.soundId ? (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded border border-[#4a9eff]/20 bg-[#4a9eff]/10 p-3 text-[11px] text-[var(--peal-surface-text,#d1d5db)]">
          <div className="font-mono uppercase tracking-[0.18em] text-[#4a9eff]">Start</div>
          <div className="mt-1">Open the library or AI designer to create an editable sound.</div>
          <div className="pointer-events-auto mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => runSfxAction('openAIDesigner')}
              className="rounded border border-[#4a9eff]/30 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#4a9eff] hover:bg-[#4a9eff]/10"
            >
              AI Design
            </button>
            <button
              type="button"
              onClick={() => runSfxAction('openLibrary')}
              className="rounded border border-[var(--peal-surface-border,rgba(255,255,255,0.15))] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--peal-surface-text,#d1d5db)] hover:bg-[var(--peal-surface-border,rgba(255,255,255,0.05))]"
            >
              Library
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}