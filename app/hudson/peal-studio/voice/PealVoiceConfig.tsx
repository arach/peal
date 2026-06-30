'use client'

import { MagicWandIcon } from '@/components/icons/PealStudioIcon'
import { StudioPad, StudioPadTray, StudioRack } from '@/components/studio/StudioInstruments'
import type { DeckSfxType } from './types'
import { PEAL_VOICE_MODELS, PEAL_VOICE_OPTIONS } from './constants'
import { usePealVoice } from './PealVoiceProvider'
import { PealMessageBeds } from './PealMessageBeds'
import { PEAL_VOICE_FX_DRY_ID, VOICE_FX_PRESETS, resolveVoiceFxPresetId } from './voiceFx'

const BANK_LABELS = ['A', 'B', 'C', 'D'] as const

export function PealVoiceConfig() {
  const voice = usePealVoice()
  const voices = PEAL_VOICE_OPTIONS[voice.selectedModel] ?? []
  const editingTake = voice.selectedTake
  const fxPresetId = editingTake?.fxPresetId ?? voice.defaultFxPresetId
  const setFxPresetId = (presetId: string) => {
    if (editingTake) voice.setTakeFxPreset(editingTake.id, presetId)
    else voice.setDefaultFxPresetId(presetId)
  }

  const captureInput = voice.captureSource === 'music'
    ? voice.musicPrompt
    : voice.captureSource === 'sfx'
      ? voice.sfxBrief
      : voice.script

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto peal-instruments bg-transparent p-3 text-gray-200">
      <StudioRack label="Capture" className="space-y-3 p-3">
        <StudioPadTray className="w-full">
          <StudioPad
            active={voice.captureSource === 'tts'}
            onClick={() => voice.setCaptureSource('tts')}
            className="flex-1"
          >
            Speech
          </StudioPad>
          <StudioPad
            active={voice.captureSource === 'music'}
            onClick={() => voice.setCaptureSource('music')}
            className="flex-1"
          >
            Music
          </StudioPad>
          <StudioPad
            active={voice.captureSource === 'sfx'}
            onClick={() => voice.setCaptureSource('sfx')}
            className="flex-1"
          >
            SFX
          </StudioPad>
        </StudioPadTray>

        <p className="font-mono text-[9px] leading-relaxed text-gray-500">
          Three legs: spoken UI · Minimax instrumentals · Web Audio one-shots. Clips land on the deck; load a genre in the programmable mixer and apply to pads.
        </p>

        <p className="font-mono text-[9px] leading-relaxed text-gray-500">
          Target: bank {BANK_LABELS[voice.activeBank]}
          {voice.targetSlot != null ? ` · pad ${voice.targetSlot + 1}` : ' · next free pad'}
        </p>

        {voice.captureSource === 'tts' && (
          <textarea
            value={voice.script}
            onChange={(e) => voice.setScript(e.target.value)}
            placeholder="Spoken UI copy…"
            rows={4}
            className="peal-inst-field resize-none"
          />
        )}
        {voice.captureSource === 'music' && (
          <textarea
            value={voice.musicPrompt}
            onChange={(e) => voice.setMusicPrompt(e.target.value)}
            placeholder="Violin melody, dramatic beat, ambient loading bed…"
            rows={4}
            className="peal-inst-field resize-none"
          />
        )}
        {voice.captureSource === 'sfx' && (
          <>
            <textarea
              value={voice.sfxBrief}
              onChange={(e) => voice.setSfxBrief(e.target.value)}
              placeholder="UI one-shot — e.g. soft success chime, sharp error tap"
              rows={3}
              className="peal-inst-field resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="peal-inst-rack-label mb-1 block">Type</label>
                <select
                  value={voice.sfxType}
                  onChange={(e) => voice.setSfxType(e.target.value as DeckSfxType)}
                  className="peal-inst-select"
                >
                  <option value="click">Click</option>
                  <option value="tone">Tone</option>
                  <option value="sweep">Sweep</option>
                  <option value="noise">Noise</option>
                </select>
              </div>
              <div>
                <div className="mb-1 flex justify-between">
                  <label className="peal-inst-rack-label">Duration</label>
                  <span className="peal-inst-rack-readout">{voice.sfxDuration.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min={0.03}
                  max={1.5}
                  step={0.01}
                  value={voice.sfxDuration}
                  onChange={(e) => voice.setSfxDuration(Number(e.target.value))}
                />
              </div>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => void voice.captureToDeck()}
          disabled={!captureInput.trim() || voice.isGenerating || !voice.captureReady}
          className="peal-inst-pad peal-inst-pad--active flex w-full items-center justify-center gap-2 py-2.5 text-[10px] disabled:opacity-40"
        >
          {voice.isGenerating ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0a0a0c]/30 border-t-[#0a0a0c]" />
              Capturing…
            </>
          ) : (
            <>
              <MagicWandIcon size={12} />
              Capture to deck
              <kbd className="rounded border border-black/40 bg-black/25 px-1.5 py-0.5 font-mono text-[9px] normal-case tracking-normal text-[#0a0a0c]/70">
                {voice.isMac ? '⌘' : 'Ctrl'}+Enter
              </kbd>
            </>
          )}
        </button>
      </StudioRack>

      <StudioRack label="Project" className="mt-3 p-3">
        <label htmlFor="peal-deck-project" className="peal-inst-rack-label mb-2 block">Project name</label>
        <input
          id="peal-deck-project"
          type="text"
          value={voice.projectName}
          onChange={(e) => voice.setProjectName(e.target.value)}
          className="peal-inst-field w-full"
        />
      </StudioRack>

      {voice.captureSource === 'tts' && (
        <StudioRack label="Speech provider" className="mt-3 space-y-4 p-3">
          <div>
            <label htmlFor="peal-voice-model" className="peal-inst-rack-label mb-2 block">Model</label>
            <select
              id="peal-voice-model"
              value={voice.selectedModel}
              onChange={(e) => voice.setSelectedModel(e.target.value)}
              className="peal-inst-select"
            >
              {PEAL_VOICE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — {model.provider}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="peal-voice-voice" className="peal-inst-rack-label mb-2 block">Voice</label>
            <select
              id="peal-voice-voice"
              value={voice.selectedVoice}
              onChange={(e) => voice.setSelectedVoice(e.target.value)}
              className="peal-inst-select"
            >
              {voices.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor="peal-voice-speed" className="peal-inst-rack-label">Speed</label>
              <span className="peal-inst-rack-readout">{voice.speed.toFixed(2)}x</span>
            </div>
            <input
              id="peal-voice-speed"
              type="range"
              min={0.25}
              max={2}
              step={0.25}
              value={voice.speed}
              onChange={(e) => voice.setSpeed(Number(e.target.value))}
            />
          </div>
        </StudioRack>
      )}

      {voice.captureSource === 'music' && (
        <>
          <StudioRack label="Minimax music" className="mt-3 space-y-2 p-3">
            <p className="font-mono text-[10px] text-gray-400">Model: {voice.musicModel}</p>
            <p className="font-mono text-[9px] leading-relaxed text-gray-500">
              Instrumentals — beds under spoken messages, violin lines, dramatic beats.
            </p>
          </StudioRack>
          <PealMessageBeds />
        </>
      )}

      {voice.captureSource === 'sfx' && (
        <StudioRack label="Web Audio SFX" className="mt-3 space-y-2 p-3">
          <p className="font-mono text-[9px] leading-relaxed text-gray-500">
            Synthesized locally — same engine as SFX Studio. Use AI Design for richer proposals.
          </p>
        </StudioRack>
      )}

      <StudioRack label="Default genre" className="mt-3 space-y-3 p-3">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label htmlFor="peal-voice-fx" className="peal-inst-rack-label">
              {editingTake ? 'Pad genre' : 'Capture default'}
            </label>
            <span className="peal-inst-rack-readout">{editingTake ? 'selected pad' : 'new clips'}</span>
          </div>
          <select
            id="peal-voice-fx"
            value={fxPresetId}
            onChange={(e) => setFxPresetId(e.target.value)}
            className="peal-inst-select"
          >
            <option value={PEAL_VOICE_FX_DRY_ID}>Dry — no FX</option>
            {VOICE_FX_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label} — {preset.family}
              </option>
            ))}
          </select>
          <p className="mt-2 font-mono text-[9px] leading-relaxed text-gray-500">
            {resolveVoiceFxPresetId(fxPresetId)?.description
              ?? 'Vox radio FX chain on playback — mix per pad on the deck.'}
          </p>
        </div>
      </StudioRack>
    </div>
  )
}