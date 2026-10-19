'use client'

import { useState } from 'react'
import { renderSfxPatch } from '@/lib/sfx/patch'
import { downloadBlob, encodeWav, slugify } from '@/lib/sfx/wav'
import { soundSetToJson, useSoundSetStore } from '@/store/soundSetStore'
import { PealAISection } from './shared/PealAIPanel'

/** Saved sound sets: pick/create the active set, list its sounds, export. */
export function PealSoundSets() {
  const sets = useSoundSetStore((s) => s.sets)
  const activeSetId = useSoundSetStore((s) => s.activeSetId)
  const { createSet, setActive, removeSound } = useSoundSetStore.getState()
  const [naming, setNaming] = useState(false)
  const [draft, setDraft] = useState('')
  const active = sets.find((s) => s.id === activeSetId) ?? null

  const commitName = () => {
    if (draft.trim()) createSet(draft)
    setDraft('')
    setNaming(false)
  }

  const exportWavs = async () => {
    if (!active) return
    for (const entry of active.sounds) {
      const buffer = await renderSfxPatch(entry.patch)
      downloadBlob(encodeWav(buffer), `${slugify(active.name)}-${slugify(entry.name)}.wav`)
    }
  }

  return (
    <PealAISection
      label={active ? `Set · ${active.name} · ${active.sounds.length}` : 'Sets'}
      action={(
        <div className="flex items-center gap-1">
          {active && active.sounds.length > 0 ? (
            <>
              <button
                type="button"
                className="peal-ai-text-btn"
                title="Download the set as JSON"
                onClick={() => downloadBlob(new Blob([soundSetToJson(active)], { type: 'application/json' }), `${slugify(active.name)}.peal-set.json`)}
              >
                JSON
              </button>
              <button type="button" className="peal-ai-text-btn" title="Download every sound as a WAV" onClick={() => void exportWavs()}>
                WAVs
              </button>
            </>
          ) : null}
          <button type="button" className="peal-ai-text-btn" onClick={() => setNaming(true)} title="Start a new set">
            New
          </button>
        </div>
      )}
    >
      {naming ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') commitName()
            if (e.key === 'Escape') { setDraft(''); setNaming(false) }
          }}
          onBlur={commitName}
          placeholder="Set name, e.g. Ebook reader"
          className="peal-ai-composer-input mb-2 w-full !text-[11px]"
        />
      ) : null}

      {sets.length > 1 ? (
        <select
          value={activeSetId ?? ''}
          onChange={(e) => setActive(e.target.value)}
          className="peal-ai-composer-input mb-2 w-full !py-1 !text-[11px]"
          aria-label="Active set"
        >
          {sets.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.sounds.length})</option>)}
        </select>
      ) : null}

      {active && active.sounds.length > 0 ? (
        <ul className="space-y-0.5">
          {active.sounds.map((entry) => (
            <li key={entry.id} className="peal-ai-activity flex items-center justify-between gap-2">
              <span className="truncate">
                <span className="peal-ai-activity-tool">{entry.name}</span>
                {' · '}
                {Math.round(entry.patch.duration * 1000)}ms · {entry.patch.layers.length} layers
              </span>
              <button
                type="button"
                className="shrink-0 text-[var(--peal-surface-text-muted)] hover:text-red-300"
                onClick={() => removeSound(active.id, entry.id)}
                aria-label={`Remove ${entry.name} from set`}
                title="Remove from set"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="peal-ai-activity">
          {active ? 'Empty — use Save to set on a composition.' : 'Save a composition to start a set.'}
        </p>
      )}
    </PealAISection>
  )
}
