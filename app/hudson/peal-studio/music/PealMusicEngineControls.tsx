'use client'

import { PlayIcon, StopIcon } from '@/components/icons/PealStudioIcon'
import { usePealMusicEngine } from './PealMusicEngineProvider'

function phaseLabel(phase: string | undefined, reachable: boolean): string {
  if (phase === 'running' && reachable) return 'Running'
  if (phase === 'starting') return 'Starting…'
  if (phase === 'installed') return 'Installed'
  if (phase === 'missing') return 'Not installed'
  if (phase === 'error') return 'Error'
  if (phase === 'stopped') return 'Stopped'
  return 'Unknown'
}

export function PealMusicEngineControls() {
  const { status, busy, error, install, start, stop } = usePealMusicEngine()

  const running = status?.phase === 'running' && status.reachable
  const missing = status?.phase === 'missing'
  const starting = status?.phase === 'starting'
  const canStart = Boolean(!running && !busy && !missing)
  const checkoutPath = status?.config?.checkoutPath

  return (
    <div className="space-y-3 border-b border-white/6 pb-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-gray-500">Strudel engine</p>
        <span
          className={`inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] ${
            running ? 'text-emerald-400' : busy ? 'text-amber-300' : 'text-gray-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${running ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.55)]' : 'bg-gray-600'}`}
            aria-hidden
          />
          {busy ? 'Working…' : phaseLabel(status?.phase, status?.reachable ?? false)}
        </span>
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-gray-400">
        {status?.message ?? 'Checking Strudel status…'}
      </p>

      {checkoutPath ? (
        <p className="truncate font-mono text-[9px] text-gray-600" title={checkoutPath}>
          {checkoutPath}
        </p>
      ) : null}

      {error ? (
        <p className="rounded border border-amber-400/25 bg-amber-400/8 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-amber-200">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {missing ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void install()}
            className="inline-flex items-center gap-1 rounded border border-[#4a9eff]/35 bg-[#4a9eff]/10 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#4a9eff] hover:bg-[#4a9eff]/15 disabled:opacity-40"
          >
            Install Strudel
          </button>
        ) : null}

        {!running ? (
          <button
            type="button"
            disabled={!canStart && !missing}
            onClick={() => void start()}
            className="inline-flex items-center gap-1 rounded border border-[#4a9eff]/35 bg-[#4a9eff]/10 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#4a9eff] hover:bg-[#4a9eff]/15 disabled:opacity-40"
          >
            <PlayIcon size={10} />
            {busy ? 'Starting…' : starting ? 'Retry start' : 'Start engine'}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void stop()}
            className="inline-flex items-center gap-1 rounded border border-white/10 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-400 hover:border-amber-400/30 hover:text-amber-300 disabled:opacity-40"
          >
            <StopIcon size={10} />
            Stop engine
          </button>
        )}
      </div>

      <p className="text-[10px] leading-relaxed text-gray-600">
        Start here, then Route your pattern in the editor when the REPL shows ready.
      </p>
    </div>
  )
}