'use client'

import { WaveformIcon } from '@/components/icons/PealStudioIcon'
import { PealMusicEngineControls } from './PealMusicEngineControls'
import { PealMusicPatternHistory } from './PealMusicPatternHistory'
import { usePealMusic } from './PealMusicProvider'

export function PealMusicSidebar() {
  const {
    tempoCps,
    tempoBpm,
    setTempo,
    strudelMountStatus,
    isPatternDirty,
    isPlaying,
  } = usePealMusic()

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-gray-300">
      <div className="shrink-0 border-b border-[var(--peal-surface-border)] px-3 py-2">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#4a9eff]">
          <WaveformIcon size={13} />
          Transport
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 text-xs">
        <PealMusicEngineControls />

        <div className="space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-gray-500">Tempo</p>
          <label className="flex items-center justify-between gap-2">
            <span className="text-gray-400">CPS</span>
            <input
              type="number"
              min={0.25}
              max={16}
              step={0.25}
              value={tempoCps ?? ''}
              onChange={(event) => {
                const value = Number.parseFloat(event.target.value)
                if (Number.isFinite(value)) setTempo({ cps: value })
              }}
              className="w-20 rounded border border-[var(--peal-surface-border)] bg-[var(--peal-surface-1)] px-2 py-1 text-right font-mono text-[11px] text-[var(--peal-surface-text)] outline-none focus:border-[#4a9eff]/40"
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span className="text-gray-400">BPM</span>
            <input
              type="number"
              min={15}
              max={960}
              step={1}
              value={tempoBpm ?? ''}
              onChange={(event) => {
                const value = Number.parseFloat(event.target.value)
                if (Number.isFinite(value)) setTempo({ bpm: value })
              }}
              className="w-20 rounded border border-[var(--peal-surface-border)] bg-[var(--peal-surface-1)] px-2 py-1 text-right font-mono text-[11px] text-[var(--peal-surface-text)] outline-none focus:border-[#4a9eff]/40"
            />
          </label>
        </div>

        <div className="space-y-1.5 border-t border-[var(--peal-surface-border)] pt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-gray-500">Pattern</p>
          <p className="font-mono text-[11px] text-gray-300">
            {isPlaying ? 'Playing' : isPatternDirty ? 'Edits pending' : strudelMountStatus === 'routed' ? 'Routed' : 'Ready'}
          </p>
        </div>

        <PealMusicPatternHistory />
      </div>
    </div>
  )
}