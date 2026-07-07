'use client'

import { useMemo } from 'react'
import { formatPatternVersionLabel } from './musicPatternVersions'
import { usePealMusic } from './PealMusicProvider'

export function PealMusicPatternHistory() {
  const {
    patternVersions,
    activeVersionId,
    canRollbackPattern,
    restorePatternVersion,
    rollbackPatternVersion,
  } = usePealMusic()

  const rows = useMemo(
    () => [...patternVersions].reverse().map((version, reverseIndex) => ({
      version,
      index: patternVersions.length - 1 - reverseIndex,
    })),
    [patternVersions],
  )

  if (patternVersions.length === 0) return null

  return (
    <div className="space-y-2 border-t border-[var(--peal-surface-border)] pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-gray-500">Versions</p>
        <button
          type="button"
          disabled={!canRollbackPattern}
          onClick={() => rollbackPatternVersion({ route: true })}
          className="rounded border border-[var(--peal-surface-border)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-400 transition hover:border-[#4a9eff]/30 hover:text-[#4a9eff] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Roll back
        </button>
      </div>

      <div className="max-h-40 space-y-1 overflow-y-auto">
        {rows.map(({ version, index }) => {
          const active = version.id === activeVersionId
          return (
            <button
              key={version.id}
              type="button"
              onClick={() => restorePatternVersion(version.id, { route: true })}
              className={`flex w-full items-start justify-between gap-2 rounded border px-2 py-1.5 text-left transition ${
                active
                  ? 'border-[#4a9eff]/35 bg-[#4a9eff]/10 text-[var(--peal-surface-text-strong)]'
                  : 'border-[var(--peal-surface-3)] bg-[var(--peal-surface-2)] text-gray-400 hover:border-[#4a9eff]/25 hover:text-[var(--peal-surface-text)]'
              }`}
            >
              <span className="min-w-0 truncate font-mono text-[10px]">
                {formatPatternVersionLabel(version, index)}
              </span>
              {active ? (
                <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-[#4a9eff]">
                  now
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}