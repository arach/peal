'use client'

import { PauseIcon, PlayIcon, StopIcon } from '@/components/icons/PealStudioIcon'
import { StudioLed, StudioPad, StudioPadTray, StudioRack, StudioTransportDeck } from '@/components/studio/StudioInstruments'
import { DECK_BANK_COUNT } from './types'
import { usePealVoice } from './PealVoiceProvider'
import { voiceFxLabel } from './voiceFx'

const BANK_LABELS = ['A', 'B', 'C', 'D'] as const

const SOURCE_STYLES = {
  tts: { stripe: 'peal-inst-deck-pad--tts', tag: 'Speech' },
  music: { stripe: 'peal-inst-deck-pad--music', tag: 'Music' },
  sfx: { stripe: 'peal-inst-deck-pad--sfx', tag: 'SFX' },
} as const

export function PealDeck({ compact = false }: { compact?: boolean }) {
  const voice = usePealVoice()
  const filledCount = voice.deckSlots.filter(Boolean).length

  return (
    <div className={`flex h-full min-h-0 flex-col gap-3 p-3 peal-instruments text-gray-200${compact ? ' peal-inst-deck-panel' : ''}`}>
      {(voice.providerBanner || voice.generateError) && (
        <div className="flex shrink-0 items-start gap-2 rounded border border-[rgba(232,163,23,0.35)] bg-[rgba(232,163,23,0.08)] px-3 py-2.5">
          <StudioLed tone="amber" on />
          <p className="font-mono text-[11px] leading-relaxed text-[rgba(255,255,255,0.82)]">
            {voice.generateError ?? voice.providerBanner}
          </p>
        </div>
      )}

      <StudioRack
        label="Peal Deck"
        readout={voice.isGenerating ? 'capturing…' : `clip rack · bank ${BANK_LABELS[voice.activeBank]} · ${filledCount}/8`}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--inst-line-lo)] px-3 py-2">
          <StudioPadTray>
            {Array.from({ length: DECK_BANK_COUNT }, (_, bank) => (
              <StudioPad
                key={bank}
                active={voice.activeBank === bank}
                onClick={() => voice.setActiveBank(bank)}
                className="!min-w-[2rem]"
              >
                {BANK_LABELS[bank]}
              </StudioPad>
            ))}
          </StudioPadTray>
          <StudioPad
            title="Stop all"
            onClick={voice.stopPlayback}
            disabled={!voice.currentlyPlayingId}
            tone="muted"
          >
            <StopIcon size={10} />
          </StudioPad>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="peal-inst-deck-grid">
            {voice.deckSlots.map((clip, slot) => {
              const targeted = voice.targetSlot === slot
              if (!clip) {
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`peal-inst-deck-pad peal-inst-deck-pad--empty${targeted ? ' peal-inst-deck-pad--target' : ''}`}
                    onClick={() => voice.setTargetSlot(targeted ? null : slot)}
                  >
                    <span className="peal-inst-deck-pad-slot">{slot + 1}</span>
                    <span className="peal-inst-deck-pad-empty-label">
                      {targeted ? 'Capture here' : 'Empty'}
                    </span>
                  </button>
                )
              }

              const playing = voice.currentlyPlayingId === clip.id
              const selected = voice.selectedTakeId === clip.id
              const style = SOURCE_STYLES[clip.source]

              return (
                <div
                  key={clip.id}
                  className={`peal-inst-deck-pad ${style.stripe}${playing ? ' peal-inst-deck-pad--playing' : ''}${selected ? ' peal-inst-deck-pad--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => voice.setSelectedTakeId(clip.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      voice.setSelectedTakeId(clip.id)
                    }
                  }}
                >
                  <div className="peal-inst-deck-pad-top">
                    <span className="peal-inst-deck-pad-slot">{slot + 1}</span>
                    <StudioLed on={playing} tone={playing ? 'amber' : 'blue'} />
                    <span className="peal-inst-deck-pad-source">{style.tag}</span>
                  </div>
                  <span className="peal-inst-deck-pad-label">{clip.label}</span>
                  <span className="peal-inst-deck-pad-meta">
                    {clip.source === 'tts' && clip.voice ? clip.voice : clip.model}
                    {clip.fxPresetId ? ` · ${voiceFxLabel(clip.fxPresetId)}` : ''}
                  </span>
                  <button
                    type="button"
                    className="peal-inst-deck-pad-action"
                    title={playing ? 'Pause' : 'Play'}
                    onClick={(e) => {
                      e.stopPropagation()
                      voice.triggerTake(clip.id)
                    }}
                  >
                    {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {voice.isGenerating && (
          <div className="border-t border-[var(--inst-line-lo)] px-3 py-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#4a9eff]">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#4a9eff]/30 border-t-[#4a9eff]" />
              Capturing to bank {BANK_LABELS[voice.activeBank]}
              {voice.targetSlot != null ? ` pad ${voice.targetSlot + 1}` : ''}
            </div>
          </div>
        )}
      </StudioRack>

      {!compact ? (
        <div className="shrink-0">
          <StudioTransportDeck
            onStop={voice.stopPlayback}
            onPlay={() => voice.previewTake()}
            onPause={voice.stopPlayback}
            isPlaying={Boolean(voice.currentlyPlayingId)}
            disabled={!voice.selectedTakeId && !voice.takes.length}
          />
        </div>
      ) : null}
    </div>
  )
}