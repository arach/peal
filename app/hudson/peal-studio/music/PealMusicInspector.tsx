'use client'

import { AiDesignIcon } from '@/components/icons/PealStudioIcon'
import { PealMusicAICopilotShell } from './PealMusicAIProvider'

/** Right panel — Music copilot (AI live code). */
export function PealMusicInspector() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-gray-300">
      <div className="shrink-0 border-b border-[var(--peal-surface-border)] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="peal-inst-led peal-inst-led--on" aria-hidden />
          <AiDesignIcon size={13} className="text-[#4a9eff]" />
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4a9eff]">
              Copilot
            </p>
            <p className="mt-0.5 font-mono text-[9px] leading-relaxed text-gray-500">
              Writes into the editor above — Route syncs to the REPL.
            </p>
          </div>
        </div>
      </div>
      <PealMusicAICopilotShell />
    </div>
  )
}