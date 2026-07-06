'use client'

import { Columns2, Plus, X } from 'lucide-react'
import {
  PEAL_AI_EFFORT_OPTIONS,
  PEAL_AI_HARNESS_OPTIONS,
  PEAL_AI_MODEL_PRESETS,
  presetsForProvider,
  type PealAIHarness,
  type PealAIEffort,
} from '@/lib/ai/pealModelPresets'
import type { PealAISession } from '@/lib/ai/pealAiSessions'

interface PealAISessionChromeProps {
  sessions: PealAISession[]
  activeId: string
  splitEnabled: boolean
  splitSessionId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onClose: (id: string) => void
  onToggleSplit: () => void
  onSplitPartnerChange: (id: string) => void
  onConfigChange: (id: string, patch: {
    harness?: PealAIHarness
    presetValue?: string
    effort?: PealAIEffort
  }) => void
  /** Which session's config row to show (active tab). */
  configSessionId: string
}

function selectClassName(disabled?: boolean) {
  return `max-w-full min-w-0 rounded border border-[#2c2c2e] bg-[#1c1c1e]/80 px-1.5 py-0.5 font-mono text-[9px] text-gray-300 outline-none hover:border-[#4a9eff]/25 focus:border-[#4a9eff]/40 disabled:cursor-not-allowed disabled:opacity-40`
}

export function PealAISessionChrome({
  sessions,
  activeId,
  splitEnabled,
  splitSessionId,
  onSelect,
  onAdd,
  onClose,
  onToggleSplit,
  onSplitPartnerChange,
  onConfigChange,
  configSessionId,
}: PealAISessionChromeProps) {
  const configSession = sessions.find((s) => s.id === configSessionId) ?? sessions[0]
  const providerPresets = presetsForProvider(configSession.config.provider)
  const presetValue = providerPresets.some((p) => p.value === configSession.config.presetValue)
    ? configSession.config.presetValue
    : `${configSession.config.provider}:${configSession.config.model}`

  const splitPartners = sessions.filter((s) => s.id !== activeId)

  return (
    <div className="shrink-0 border-b border-white/6 bg-[#111113]">
      <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5">
        {sessions.map((session) => {
          const active = session.id === activeId
          return (
            <div key={session.id} className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => onSelect(session.id)}
                className={`rounded-l border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] transition ${
                  active
                    ? 'border-[#4a9eff]/35 bg-[#4a9eff]/12 text-[#4a9eff]'
                    : 'border-[#2c2c2e] bg-[#1c1c1e]/60 text-gray-500 hover:text-gray-300'
                }`}
              >
                {session.label}
              </button>
              {sessions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onClose(session.id)}
                  className="rounded-r border border-l-0 border-[#2c2c2e] bg-[#1c1c1e]/60 px-1 py-1 text-gray-600 hover:border-red-400/30 hover:text-red-300"
                  title="Close session"
                >
                  <X size={10} />
                </button>
              ) : null}
            </div>
          )
        })}
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 rounded border border-dashed border-[#2c2c2e] px-1.5 py-1 text-gray-500 hover:border-[#4a9eff]/30 hover:text-[#4a9eff]"
          title="New session"
        >
          <Plus size={12} />
        </button>
        {sessions.length > 1 ? (
          <button
            type="button"
            onClick={onToggleSplit}
            className={`ml-auto shrink-0 rounded border px-1.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition ${
              splitEnabled
                ? 'border-[#4a9eff]/35 bg-[#4a9eff]/10 text-[#4a9eff]'
                : 'border-[#2c2c2e] text-gray-500 hover:text-gray-300'
            }`}
            title="Side-by-side sessions"
          >
            <Columns2 size={12} className="inline" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-white/4 px-2 py-1.5">
        <label className="flex min-w-0 items-center gap-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-gray-600">Harness</span>
          <select
            aria-label="AI harness"
            value={configSession.config.harness}
            disabled={configSession.config.harness === 'pi-cli'}
            onChange={(e) => onConfigChange(configSession.id, { harness: e.target.value as PealAIHarness })}
            className={selectClassName()}
            title={PEAL_AI_HARNESS_OPTIONS.find((h) => h.value === configSession.config.harness)?.hint}
          >
            {PEAL_AI_HARNESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === 'pi-cli'}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-1 items-center gap-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-gray-600">Model</span>
          <select
            aria-label="AI model preset"
            value={presetValue}
            onChange={(e) => onConfigChange(configSession.id, { presetValue: e.target.value })}
            className={`${selectClassName()} flex-1`}
          >
            {providerPresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 items-center gap-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-gray-600">Effort</span>
          <select
            aria-label="Reasoning effort"
            value={configSession.config.effort}
            onChange={(e) => onConfigChange(configSession.id, { effort: e.target.value as PealAIEffort })}
            className={selectClassName()}
          >
            {PEAL_AI_EFFORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {splitEnabled && splitPartners.length > 0 ? (
          <label className="flex min-w-0 items-center gap-1">
            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-gray-600">Split</span>
            <select
              aria-label="Split session partner"
              value={splitSessionId ?? ''}
              onChange={(e) => onSplitPartnerChange(e.target.value)}
              className={selectClassName()}
            >
              {splitPartners.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  )
}