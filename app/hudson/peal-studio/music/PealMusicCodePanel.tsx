'use client'

import { useCallback } from 'react'
import { CodeIcon, PlayIcon, RefreshIcon } from '@/components/icons/PealStudioIcon'
import { usePealMusic } from './PealMusicProvider'

function footerStatus(
  dirty: boolean,
  status: string,
  playing: boolean,
  engineRunning: boolean,
): string {
  if (playing) return 'Playing routed pattern.'
  if (dirty) return 'Unrouted edits — Route (⌘↵) evaluates and plays in the REPL.'
  if (status === 'routed') return 'Pattern synced. Edit and Route again to update.'
  if (status === 'loading') return 'Connecting Strudel engine…'
  if (status === 'error') return 'Engine not reachable — Start engine in Transport (left panel).'
  if (!engineRunning) return 'Start the Strudel engine, then Route (⌘↵) to load the pattern.'
  return 'Strudel pattern · Route (⌘↵) loads into the REPL below.'
}

export function PealMusicCodePanel({
  engineRunning = false,
}: {
  engineRunning?: boolean
}) {
  const {
    patternCode,
    setPatternCode,
    resetPattern,
    routeToStrudel,
    pushPatternVersion,
    markActiveVersionRouted,
    rollbackPatternVersion,
    canRollbackPattern,
    strudelMountStatus,
    isPatternDirty,
    isPlaying,
  } = usePealMusic()

  const handleRoute = useCallback(() => {
    if (isPatternDirty) {
      pushPatternVersion({
        code: patternCode,
        label: 'Manual edit',
        source: 'manual',
        routed: true,
      })
    } else {
      markActiveVersionRouted()
    }
    routeToStrudel()
  }, [
    isPatternDirty,
    patternCode,
    pushPatternVersion,
    markActiveVersionRouted,
    routeToStrudel,
  ])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      routeToStrudel()
    }
  }, [routeToStrudel])

  const routeDisabled = !patternCode.trim() || !engineRunning

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-gray-300">
      <div className="flex shrink-0 items-center justify-between border-b border-white/6 px-3 py-2">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#4a9eff]">
          <CodeIcon size={13} />
          Strudel editor
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRoute}
            disabled={routeDisabled}
            className="inline-flex items-center gap-1 rounded border border-[#4a9eff]/35 bg-[#4a9eff]/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#4a9eff] hover:border-[#4a9eff]/55 hover:bg-[#4a9eff]/15 disabled:cursor-not-allowed disabled:opacity-40"
            title="Route pattern to Strudel engine (⌘↵)"
          >
            <PlayIcon size={11} />
            Route
          </button>
          <button
            type="button"
            disabled={!canRollbackPattern}
            onClick={() => rollbackPatternVersion({ route: true })}
            className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-gray-400 hover:border-[#4a9eff]/30 hover:text-[#4a9eff] disabled:cursor-not-allowed disabled:opacity-40"
            title="Restore previous version"
          >
            Roll back
          </button>
          <button
            type="button"
            onClick={resetPattern}
            className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-gray-400 hover:border-[#4a9eff]/30 hover:text-[#4a9eff]"
          >
            <RefreshIcon size={11} />
            Reset
          </button>
        </div>
      </div>
      <textarea
        value={patternCode}
        onChange={(event) => setPatternCode(event.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none border-0 bg-[#0d0d0f] p-3 font-mono text-[11px] leading-relaxed text-gray-200 outline-none selection:bg-[#4a9eff]/25"
        aria-label="Strudel pattern code"
      />
      <p className="shrink-0 border-t border-white/6 px-3 py-2 text-[10px] leading-relaxed text-gray-500">
        {footerStatus(isPatternDirty, strudelMountStatus, isPlaying, engineRunning)}
      </p>
    </div>
  )
}