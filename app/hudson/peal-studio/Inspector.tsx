'use client'

import { useCallback } from 'react'
import { AiDesignIcon, ParametersIcon } from '@/components/icons/PealStudioIcon'
import { usePealStudioHudson } from './Provider'

export function PealStudioInspector() {
  const { currentTool, setInspectorElement, sfxSummary, runSfxAction } = usePealStudioHudson()
  const setRef = useCallback((node: HTMLDivElement | null) => {
    setInspectorElement(node)
  }, [setInspectorElement])

  return (
    <div ref={setRef} className="relative h-full min-h-0 overflow-hidden bg-transparent text-gray-300">
      {currentTool === 'sfx' && !sfxSummary.mounted ? (
        <div className="p-4 text-xs leading-5 text-gray-400">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#4a9eff]">
            <ParametersIcon size={13} />
            Inspector
          </div>
          <p>Loading the SFX parameter and AI design inspector…</p>
        </div>
      ) : null}

      {currentTool === 'voice' ? (
        <div className="p-4 text-xs leading-5 text-gray-400">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#4a9eff]">
            <AiDesignIcon size={13} />
            Voice tools
          </div>
          <p>Voice generation controls and provider choices are in the center workspace.</p>
        </div>
      ) : null}

      {currentTool === 'sfx' && sfxSummary.mounted && !sfxSummary.soundId ? (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded border border-[#4a9eff]/20 bg-[#4a9eff]/10 p-3 text-[11px] text-gray-300">
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
              className="rounded border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-gray-300 hover:bg-white/5"
            >
              Library
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
