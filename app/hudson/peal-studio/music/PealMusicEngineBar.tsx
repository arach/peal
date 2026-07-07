'use client'

import { PlayIcon, StopIcon } from '@/components/icons/PealStudioIcon'
import { strudelMountIndexPath, strudelReplUrlForUpstream } from '@/lib/strudel/mount'
import { usePealMusic } from './PealMusicProvider'
import type { StrudelManageStatusResponse } from './useStrudelManage'

interface PealMusicEngineBarProps {
  engine: StrudelManageStatusResponse | null
  engineBusy: boolean
  engineError?: string | null
  onStart: () => void
  onStop: () => void
}

export function PealMusicEngineBar({
  engine,
  engineBusy,
  engineError,
  onStart,
  onStop,
}: PealMusicEngineBarProps) {
  const {
    patternCode,
    routeToStrudel,
    isPatternDirty,
    strudelMountStatus,
    isPlaying,
    lastRoutedCode,
  } = usePealMusic()

  const running = engine?.phase === 'running' && engine.reachable
  const openHref = running && engine?.upstream
    ? strudelReplUrlForUpstream(engine.upstream, lastRoutedCode || patternCode)
    : strudelMountIndexPath(patternCode)

  return (
    <div className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--peal-surface-border)] bg-[var(--peal-surface-0)] px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${running ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-gray-600'}`}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-gray-300">
            {running ? 'Strudel engine running' : engine?.phase === 'installed' ? 'Installed — start engine' : 'Engine stopped'}
          </p>
          <p className="truncate font-mono text-[9px] text-gray-500">
            {engineBusy
              ? 'Starting Strudel — this can take up to 30s…'
              : engineError
                ? engineError
                : running
                  ? 'Route (⌘↵) to play · drag divider to resize'
                  : engine?.phase === 'starting'
                    ? 'Process started — waiting for Strudel to respond…'
                    : 'Start engine in Transport (left) or below'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!running ? (
          <button
            type="button"
            disabled={engineBusy}
            onClick={onStart}
            className="inline-flex items-center gap-1 rounded border border-[#4a9eff]/35 bg-[#4a9eff]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#4a9eff] hover:bg-[#4a9eff]/15 disabled:opacity-40"
          >
            <PlayIcon size={10} />
            {engineBusy ? 'Starting…' : engine?.phase === 'starting' ? 'Retry' : 'Start engine'}
          </button>
        ) : (
          <button
            type="button"
            disabled={engineBusy}
            onClick={onStop}
            className="inline-flex items-center gap-1 rounded border border-[var(--peal-surface-border)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-400 hover:border-amber-400/30 hover:text-amber-300 disabled:opacity-40"
          >
            <StopIcon size={10} />
            Stop
          </button>
        )}
        <button
          type="button"
          onClick={() => routeToStrudel()}
          disabled={!patternCode.trim() || !running}
          className="inline-flex items-center gap-1 rounded border border-[#4a9eff]/35 bg-[#4a9eff]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#4a9eff] hover:bg-[#4a9eff]/15 disabled:opacity-40"
        >
          <PlayIcon size={10} />
          Route
        </button>
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-[var(--peal-surface-border)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-500 hover:border-[#4a9eff]/30 hover:text-[#4a9eff]"
        >
          New tab
        </a>
      </div>

      <div className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-gray-600 xl:block">
        {isPlaying || strudelMountStatus === 'playing'
          ? 'playing'
          : isPatternDirty
            ? 'edits pending'
            : strudelMountStatus === 'routed'
              ? 'routed'
              : 'idle'}
      </div>
    </div>
  )
}