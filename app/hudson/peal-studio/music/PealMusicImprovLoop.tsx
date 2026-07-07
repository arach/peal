'use client'

import { useEffect, useState } from 'react'
import {
  MUSIC_IMPROV_INTERVAL_OPTIONS,
  type MusicImprovStyle,
} from '@/lib/ai/musicImprovPrompts'

interface PealMusicImprovLoopProps {
  enabled: boolean
  intervalSec: number
  style: MusicImprovStyle
  tick: number
  waiting: boolean
  nextFireAt: number | null
  canRun: boolean
  isBusy: boolean
  onEnabledChange: (enabled: boolean) => void
  onIntervalChange: (seconds: number) => void
  onStyleChange: (style: MusicImprovStyle) => void
}

function secondsUntil(target: number | null) {
  if (!target) return null
  return Math.max(0, Math.ceil((target - Date.now()) / 1000))
}

export function PealMusicImprovLoopControls({
  enabled,
  intervalSec,
  style,
  tick,
  waiting,
  nextFireAt,
  canRun,
  isBusy,
  onEnabledChange,
  onIntervalChange,
  onStyleChange,
}: PealMusicImprovLoopProps) {
  const [countdown, setCountdown] = useState<number | null>(secondsUntil(nextFireAt))

  useEffect(() => {
    if (!enabled || !waiting || !nextFireAt) {
      setCountdown(null)
      return
    }

    setCountdown(secondsUntil(nextFireAt))
    const timer = window.setInterval(() => {
      setCountdown(secondsUntil(nextFireAt))
    }, 500)
    return () => window.clearInterval(timer)
  }, [enabled, waiting, nextFireAt])

  const statusLabel = !canRun
    ? 'Add a live pattern first'
    : enabled && isBusy
      ? `Pass #${tick || 1} running…`
      : enabled && waiting && countdown != null
        ? `Next improv in ${countdown}s`
        : enabled && tick > 0
          ? `Pass #${tick} done`
          : enabled
            ? 'Armed'
            : 'Off'

  return (
    <div className="shrink-0 border-t border-[var(--peal-surface-3)] px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4a9eff]">Improv loop</p>
          <p className="mt-0.5 font-mono text-[9px] text-gray-500">{statusLabel}</p>
        </div>
        <button
          type="button"
          disabled={!canRun && !enabled}
          onClick={() => onEnabledChange(!enabled)}
          className={`rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition ${
            enabled
              ? 'border-[#4a9eff]/35 bg-[#4a9eff]/12 text-[#4a9eff]'
              : 'border-[var(--peal-surface-3)] text-gray-500 hover:border-[#4a9eff]/25 hover:text-gray-300'
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {enabled ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <label className="flex items-center gap-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-gray-600">Every</span>
          <select
            aria-label="Improv interval"
            value={intervalSec}
            disabled={enabled}
            onChange={(e) => onIntervalChange(Number.parseInt(e.target.value, 10))}
            className="rounded border border-[var(--peal-surface-3)] bg-[var(--peal-surface-2)] px-1.5 py-0.5 font-mono text-[9px] text-gray-300 outline-none hover:border-[#4a9eff]/25 focus:border-[#4a9eff]/40 disabled:opacity-50"
          >
            {MUSIC_IMPROV_INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 items-center gap-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-gray-600">Style</span>
          <select
            aria-label="Improv style"
            value={style}
            disabled={enabled}
            onChange={(e) => onStyleChange(e.target.value as MusicImprovStyle)}
            className="min-w-0 flex-1 rounded border border-[var(--peal-surface-3)] bg-[var(--peal-surface-2)] px-1.5 py-0.5 font-mono text-[9px] text-gray-300 outline-none hover:border-[#4a9eff]/25 focus:border-[#4a9eff]/40 disabled:opacity-50"
          >
            <option value="subtle">Subtle</option>
            <option value="bold">Bold</option>
            <option value="arc">Build → twist → breathe → strip</option>
          </select>
        </label>
      </div>
    </div>
  )
}