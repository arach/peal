'use client'

import { useEffect, useRef, useState } from 'react'
import { openByokSettings } from '@/lib/byok'
import { useByok } from '@/lib/useByok'
import { isPealStaticRuntime } from '@/lib/ai/runtime'
import { KeyIcon } from '@/components/icons/PealStudioIcon'
import type { Sound } from '@/store/soundStore'
import { usePealStudioHudson } from './Provider'
import { usePealStudioAI } from './usePealStudioAI'
import { STUDIO_EXAMPLE_PROMPTS } from '@/lib/ai/soundDesignExamples'
import { renderSfxPatch } from '@hudsonkit/sfx/engine'
import { downloadBlob, encodeWav, slugify } from '@hudsonkit/sfx/engine'
import { useSoundSetStore } from '@/store/soundSetStore'
import { PealSoundSets } from './PealSoundSets'
import {
  PealAIChips,
  PealAIComposer,
  PealAIHeader,
  PealAIPanel,
  PealAISection,
  PealAIThread,
} from './shared/PealAIPanel'

export interface PealStudioAIDesignProps {
  /** Load a composition in place, replacing the current sound and tracks. */
  onApplyComposition: (sound: Sound) => void | Promise<void>
  onOpenLibrary: () => void
  initialPrompt?: string
  onInitialPromptConsumed?: () => void
}

export function PealStudioAIDesign({
  onApplyComposition,
  onOpenLibrary,
  initialPrompt = '',
  onInitialPromptConsumed,
}: PealStudioAIDesignProps) {
  const { sfxSummary } = usePealStudioHudson()
  const byok = useByok()
  const {
    chat,
    composition,
    canBack,
    canForward,
    position,
    stepComposition,
    replayComposition,
  } = usePealStudioAI({
    sfxSummary,
    onApplyComposition,
    onOpenLibrary,
  })
  const consumedPrompt = useRef('')
  const [savedNote, setSavedNote] = useState<string | null>(null)
  // The note belongs to the version it was saved from.
  useEffect(() => setSavedNote(null), [position.index])

  useEffect(() => {
    const prompt = initialPrompt.trim()

    if (!prompt) {
      consumedPrompt.current = ''
      return
    }

    if (
      consumedPrompt.current === prompt ||
      chat.status === 'streaming' ||
      chat.status === 'submitted'
    ) {
      return
    }

    consumedPrompt.current = prompt
    chat.sendMessage({ text: prompt })
    onInitialPromptConsumed?.()
  }, [chat, initialPrompt, onInitialPromptConsumed])

  const isBusy = chat.status === 'streaming' || chat.status === 'submitted'
  const sendText = (text: string) => {
    if (isBusy) return
    chat.sendMessage({ text })
  }

  // The hosted app routes keyless requests through Scout; only the static
  // GitHub Pages build (in-browser inference) needs a visitor key.
  const needsKey = isPealStaticRuntime() && !byok.hasAny

  return (
    <PealAIPanel>
      <PealAIHeader
        title="AI Design"
        hint="Each turn recomposes the sound in place — step back and forward through versions."
        action={needsKey ? (
          <button type="button" onClick={openByokSettings} className="peal-ai-text-btn inline-flex items-center gap-1">
            <KeyIcon size={10} />
            Add key
          </button>
        ) : undefined}
      />

      <PealAIThread
        chat={chat}
        placeholder="Describe a sound or a moment — the designer composes it right into the studio."
        pendingLabel="Designing…"
      />

      {composition ? (
        <PealAISection
          label={`Composition · v${position.index + 1} of ${position.total}`}
          action={(
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!canBack || isBusy}
                onClick={() => void stepComposition(-1)}
                className="peal-ai-text-btn"
                title="Previous version"
                aria-label="Previous version"
              >
                ‹
              </button>
              <button
                type="button"
                disabled={!canForward || isBusy}
                onClick={() => void stepComposition(1)}
                className="peal-ai-text-btn"
                title="Next version"
                aria-label="Next version"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => void replayComposition()}
                className="peal-ai-text-btn"
                title="Reload this version into the studio"
              >
                Reload
              </button>
            </div>
          )}
        >
          <p className="text-sm text-[var(--peal-surface-text-strong)]">{composition.summary}</p>
          <p className="peal-ai-activity mt-0.5">
            {Math.round(composition.duration * 1000)}ms · {composition.layers.length} layer{composition.layers.length === 1 ? '' : 's'}
            {composition.room ? ` · room ${composition.room.size.toFixed(2)}` : ''}
            {composition.variation ? ` · varies ${Math.round(composition.variation * 100)}%` : ''}
          </p>
          <ul className="mt-2 space-y-0.5">
            {composition.layers.map((layer, i) => (
              <li key={`${layer.name}-${i}`} className="peal-ai-activity">
                <span className="peal-ai-activity-tool">{layer.name}</span>
                {' · '}
                {layer.source === 'noise' ? `${layer.noiseColor ?? 'white'} noise` : `${layer.waveform ?? 'sine'} ${Math.round(layer.frequency ?? 0)}Hz`}
                {layer.filter ? ` · ${layer.filter.type} ${Math.round(layer.filter.frequency)}${layer.filter.frequencyEnd ? `→${Math.round(layer.filter.frequencyEnd)}` : ''}Hz` : ''}
                {layer.grains ? ` · ${layer.grains.count} grains` : ''}
                {layer.flutter ? ` · flutter ${Math.round(layer.flutter.rate)}Hz` : ''}
                {layer.pan !== undefined || layer.panEnd !== undefined ? ` · pan ${(layer.pan ?? 0).toFixed(1)}${layer.panEnd !== undefined ? `→${layer.panEnd.toFixed(1)}` : ''}` : ''}
              </li>
            ))}
          </ul>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={async () => {
                const buffer = await renderSfxPatch(composition)
                downloadBlob(encodeWav(buffer), `${slugify(composition.summary)}.wav`)
              }}
              className="peal-ai-text-btn"
              title="Download this version as a WAV"
            >
              WAV
            </button>
            <button
              type="button"
              onClick={() => {
                const { setName, replaced } = useSoundSetStore.getState().saveToActive(composition)
                setSavedNote(`${replaced ? 'Updated in' : 'Saved to'} ${setName}`)
              }}
              className="peal-ai-text-btn"
              title="Save this version to the active sound set"
            >
              Save to set
            </button>
            {savedNote ? <span className="peal-ai-activity self-center">{savedNote}</span> : null}
          </div>
          {composition.notes ? (
            <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-[var(--peal-surface-text-muted)]">
              {composition.notes}
            </p>
          ) : null}
        </PealAISection>
      ) : null}

      <PealSoundSets />

      {chat.messages.length === 0 && !composition ? (
        <PealAIChips label="Try" chips={STUDIO_EXAMPLE_PROMPTS.slice(0, 3)} onPick={sendText} disabled={isBusy} />
      ) : null}

      <PealAIComposer
        label="Describe a sound"
        placeholder="e.g. glassy confirmation chime, 200ms"
        isBusy={isBusy}
        onSend={sendText}
        onStop={() => chat.stop()}
      />
    </PealAIPanel>
  )
}
