'use client'

import { CodeIcon, MicIcon } from '@/components/icons/PealStudioIcon'
import PealSfxCodeEditorSurface from '@/components/PealSfxCodeEditorSurface'
import { usePealStudioHudson, type PealStudioTool } from './Provider'

const TOOL_COPY: Record<PealStudioTool, { title: string; body: string; icon: typeof CodeIcon }> = {
  sfx: {
    title: 'Live Web Audio code',
    body: 'The SFX editor mounts its generated Web Audio implementation here. Select or design a sound to keep code in sync with the waveform and inspector.',
    icon: CodeIcon,
  },
  voice: {
    title: 'Voice Studio',
    body: 'Generate spoken UI assets in the center workspace. Provider settings and generated files stay in the voice surface for this pass.',
    icon: MicIcon,
  },
}

export function PealStudioLeftPanel() {
  const { currentTool, sfxSummary, sfxEditor } = usePealStudioHudson()
  const copy = TOOL_COPY[currentTool]
  const Icon = copy.icon

  return (
    <div className="h-full min-h-0 overflow-hidden bg-transparent text-gray-300">
      {currentTool === 'sfx' && sfxSummary.mounted ? (
        <PealSfxCodeEditorSurface
          currentSound={sfxEditor.currentSound}
          tracks={sfxEditor.tracks}
          onSoundChange={sfxEditor.onSoundChange}
        />
      ) : (
        <div className="p-4 text-xs leading-5 text-gray-400">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#4a9eff]">
            <Icon size={13} />
            {copy.title}
          </div>
          <p>{copy.body}</p>
        </div>
      )}
    </div>
  )
}
