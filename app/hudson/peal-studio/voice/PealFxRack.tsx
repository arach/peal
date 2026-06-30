'use client'

import { StudioKnob, StudioRack } from '@/components/studio/StudioInstruments'
import { FX_KNOBS, isClipFxKnobTweaked, readClipFxValue } from './fxKnobs'
import { usePealVoice } from './PealVoiceProvider'
import { PEAL_VOICE_FX_DRY_ID, VOICE_FX_PRESETS, voiceFxLabel } from './voiceFx'

export function PealFxRack() {
  const voice = usePealVoice()
  const clip = voice.selectedTake
  const override = clip?.fxParamsOverride ?? {}

  const setValue = (key: typeof FX_KNOBS[number]['key'], value: number) => {
    if (!clip) return
    voice.setTakeFxOverride(clip.id, { ...override, [key]: value })
  }

  if (!clip) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="peal-inst-rack-label">FX rack</p>
        <p className="mt-2 max-w-[14rem] font-mono text-[10px] leading-relaxed text-gray-500">
          Select a pad on the deck. Inserts and knobs apply to that clip — then capture new audio with the same chain via default FX.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto peal-instruments p-3 text-gray-200">
      <StudioRack label="Insert chain" readout={voiceFxLabel(clip.fxPresetId)} className="mb-3 space-y-3 p-3">
        <p className="line-clamp-2 font-mono text-[10px] text-gray-400">{clip.label}</p>
        <select
          value={clip.fxPresetId}
          onChange={(e) => voice.setTakeFxPreset(clip.id, e.target.value)}
          className="peal-inst-select"
        >
          <option value={PEAL_VOICE_FX_DRY_ID}>Dry — bypass inserts</option>
          {VOICE_FX_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => voice.setTakeFxOverride(clip.id, undefined)}
          className="peal-inst-pad w-full py-2 text-[10px]"
        >
          Reset knob overrides
        </button>
        <button
          type="button"
          onClick={() => voice.previewTake(clip.id)}
          className="peal-inst-pad peal-inst-pad--active w-full py-2 text-[10px]"
        >
          Preview clip
        </button>
        <button
          type="button"
          onClick={voice.applySelectedFxAsDefault}
          className="peal-inst-pad w-full py-2 text-[10px]"
        >
          Use preset for new captures
        </button>
      </StudioRack>

      <StudioRack label="Channel strip" readout={`${clip.source} insert`} className="p-3">
        <div className="peal-inst-fx-knob-grid">
          {FX_KNOBS.map((knob) => (
            <StudioKnob
              key={knob.key}
              label={knob.label}
              min={knob.min}
              max={knob.max}
              step={knob.step}
              value={readClipFxValue(clip, knob.key)}
              format={knob.format}
              tweaked={isClipFxKnobTweaked(clip, knob.key)}
              onChange={(value) => setValue(knob.key, value)}
            />
          ))}
        </div>
      </StudioRack>
    </div>
  )
}