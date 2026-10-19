'use client'

import { PealAIHeader } from '../shared/PealAIPanel'
import { PealMusicAICopilotShell } from './PealMusicAIProvider'

/** Right panel — Music copilot (AI live code). */
export function PealMusicInspector() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--peal-surface-0)] text-[var(--peal-surface-text)]">
      <PealAIHeader title="Copilot" hint="Writes into the editor — Route syncs it to the REPL." />
      <PealMusicAICopilotShell />
    </div>
  )
}
