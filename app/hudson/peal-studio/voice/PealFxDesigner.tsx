'use client'

import { PauseIcon, PlayIcon } from '@/components/icons/PealStudioIcon'
import { Waveform } from '@/components/waveform'
import {
  StudioKnob,
  StudioPad,
  StudioPadTray,
  StudioRack,
  StudioScopeWell,
  StudioTransportDeck,
} from '@/components/studio/StudioInstruments'
import {
  FX_KNOBS,
  countMixerKnobTweaks,
  isMixerKnobTweaked,
  readMixerFxValue,
  type MixerFxState,
} from './fxKnobs'
import { PealVoiceAIEditBar } from './PealVoiceAIEditBar'
import { usePealVoiceAIContext } from './PealVoiceAIProvider'
import { usePealVoice } from './PealVoiceProvider'
import { PEAL_VOICE_FX_DRY_ID, VOICE_FX_PRESETS, resolveVoiceFxPresetId, voiceFxLabel } from './voiceFx'

export function PealFxDesigner() {
  const voice = usePealVoice()
  const { aiHighlights } = usePealVoiceAIContext()
  const clip = voice.selectedTake
  const mixer: MixerFxState = {
    genreId: voice.mixerGenreId,
    knobOverrides: voice.mixerKnobOverrides,
  }
  const activeGenre = resolveVoiceFxPresetId(mixer.genreId)
  const tweakCount = countMixerKnobTweaks(mixer)
  const playing = clip != null && voice.currentlyPlayingId === clip.id

  const setKnob = (key: typeof FX_KNOBS[number]['key'], value: number) => {
    voice.setMixerKnob({ [key]: value })
  }

  return (
    <div className="flex h-full min-h-0 flex-col peal-instruments peal-inst-mixer text-gray-200">
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <StudioRack
          label="Programmable mixer"
          readout={activeGenre ? activeGenre.label : 'dry'}
          className="flex min-h-0 flex-1 flex-col"
        >
          <PealVoiceAIEditBar />
          <StudioScopeWell className="peal-inst-fx-scope mb-3 min-h-[9rem] flex-1 p-3">
            {clip ? (
              <>
                <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-gray-500">
                  <span className="text-[#4a9eff]/90">Preview clip</span>
                  <span className="opacity-40">·</span>
                  <span>live to pad</span>
                  <span className="opacity-40">·</span>
                  <span>audition while playing</span>
                </div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[12px] font-semibold text-[#4a9eff]">{clip.label}</p>
                    <p className="mt-1 line-clamp-2 font-mono text-[10px] leading-relaxed text-gray-400">
                      {clip.script ?? clip.prompt ?? clip.filename}
                    </p>
                  </div>
                  <StudioPadTray>
                    <StudioPad
                      title={playing ? 'Pause' : 'Preview clip through mixer'}
                      active={playing}
                      onClick={() => voice.previewClipThroughMixer(clip.id)}
                      className="!min-h-[28px] !px-2.5"
                    >
                      {playing ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
                    </StudioPad>
                  </StudioPadTray>
                </div>
                <Waveform
                  isPlaying={playing}
                  audioUrl={clip.audioUrl}
                  visualOnly
                  className="h-16"
                />
              </>
            ) : (
              <div className="flex h-full min-h-[8rem] flex-col items-center justify-center gap-2 text-center">
                <p className="peal-inst-rack-label">Load a genre below</p>
                <p className="max-w-[22rem] font-mono text-[10px] leading-relaxed text-gray-500">
                  The mixer holds your chain — genres like AM Broadcast or Tower Control load in here. Select a deck pad when you want to preview or apply to a clip.
                </p>
              </div>
            )}
          </StudioScopeWell>

          <div className="mb-3 border-b border-[var(--inst-line-lo)] pb-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="peal-inst-rack-label">Load genre</p>
              <span className="peal-inst-rack-readout">
                {activeGenre ? activeGenre.family : 'neutral'}
              </span>
            </div>
            <p className="mb-2 font-mono text-[9px] leading-relaxed text-gray-500">
              Named chains — mission control, AM radio, walkie, etc. Load into the mixer, then preview with a clip or apply to a pad.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <StudioPad
                active={!mixer.genreId}
                onClick={() => voice.loadMixerGenre(PEAL_VOICE_FX_DRY_ID)}
                className={`!text-[9px]${aiHighlights?.genreChanged && !aiHighlights.genreIdAfter ? ' peal-inst-pad--ai-highlight' : ''}`}
              >
                Dry
              </StudioPad>
              {VOICE_FX_PRESETS.map((preset) => (
                <StudioPad
                  key={preset.id}
                  active={mixer.genreId === preset.id}
                  onClick={() => voice.loadMixerGenre(preset.id)}
                  className={`!text-[9px]${aiHighlights?.genreChanged && aiHighlights.genreIdAfter === preset.id ? ' peal-inst-pad--ai-highlight' : ''}`}
                  title={preset.description}
                >
                  {preset.label}
                </StudioPad>
              ))}
            </div>
            {activeGenre ? (
              <p className="mt-2 font-mono text-[9px] leading-relaxed text-[#4a9eff]/80">
                {activeGenre.description}
                {tweakCount > 0 ? ` · ${tweakCount} knob${tweakCount === 1 ? '' : 's'} off-recipe` : ''}
              </p>
            ) : (
              <p className="mt-2 font-mono text-[9px] leading-relaxed text-gray-500">
                Dry — dial the strip below to program a chain from scratch.
              </p>
            )}
          </div>

          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="peal-inst-rack-label">Channel strip</p>
            <span className="peal-inst-rack-readout">{FX_KNOBS.length} knobs</span>
          </div>
          <p className="mb-3 font-mono text-[9px] leading-relaxed text-gray-500">
            The mixer program — EQ, grit, hiss, presence, level. Changes apply to the selected pad in real time; keep preview playing to hear updates.
          </p>

          <div className="peal-inst-fx-knob-grid min-h-0 flex-1 overflow-y-auto px-1 py-2">
            {FX_KNOBS.map((knob) => (
              <StudioKnob
                key={knob.key}
                label={knob.label}
                min={knob.min}
                max={knob.max}
                step={knob.step}
                value={readMixerFxValue(mixer, knob.key)}
                format={knob.format}
                tweaked={isMixerKnobTweaked(mixer, knob.key)}
                className={aiHighlights?.knobKeys.has(knob.key) ? 'peal-inst-knob--ai-highlight' : undefined}
                onChange={(value) => setKnob(knob.key, value)}
              />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--inst-line-lo)] pt-3">
            <StudioPad
              onClick={voice.resetMixerKnobs}
              className="!text-[9px]"
              disabled={tweakCount === 0}
            >
              {activeGenre ? 'Reset to genre' : 'Reset strip'}
            </StudioPad>
            <StudioPad
              onClick={voice.applySelectedFxAsDefault}
              className="!text-[9px]"
            >
              Default for capture
            </StudioPad>
          </div>
        </StudioRack>
      </div>

      <div className="shrink-0 border-t border-[var(--inst-line-lo)] px-3 py-3">
        <StudioTransportDeck
          onStop={voice.stopPlayback}
          onPlay={() => voice.previewClipThroughMixer()}
          onPause={voice.stopPlayback}
          isPlaying={Boolean(voice.currentlyPlayingId)}
          disabled={!clip}
        />
      </div>
    </div>
  )
}