'use client'

import { CodeIcon } from '@/components/icons/PealStudioIcon'
import PealSfxCodeEditorSurface from '@/components/PealSfxCodeEditorSurface'
import { PealMusicSidebar } from './music/PealMusicSidebar'
import { PealDeck } from './voice/PealDeck'
import { usePealStudioHudson } from './Provider'

export function PealStudioLeftPanel() {
  const { currentTool, sfxSummary, sfxEditor } = usePealStudioHudson()

  if (currentTool === 'music') {
    return <PealMusicSidebar />
  }

  if (currentTool === 'voice') {
    return <PealDeck compact />
  }

  return (
    <div className="h-full min-h-0 overflow-hidden bg-transparent text-[var(--peal-surface-text,#d1d5db)]">
      {sfxSummary.mounted ? (
        <PealSfxCodeEditorSurface
          currentSound={sfxEditor.currentSound}
          tracks={sfxEditor.tracks}
          onSoundChange={sfxEditor.onSoundChange}
        />
      ) : (
        <div className="p-4 text-xs leading-5 text-[var(--peal-surface-text-muted,#9ca3af)]">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#4a9eff]">
            <CodeIcon size={13} />
            Live Web Audio code
          </div>
          <p>
            The SFX editor mounts its generated Web Audio implementation here. Select or design
            a sound to keep code in sync with the waveform and inspector.
          </p>
        </div>
      )}
    </div>
  )
}