import { DEFAULT_VOICE_FX, type VoiceFxParams } from '@voxd/client/fx'
import { resolveVoiceFxPresetId } from './voiceFx'
import type { DeckClip } from './types'

export interface MixerFxState {
  genreId: string
  knobOverrides?: Partial<VoiceFxParams>
}

export type FxKnobSpec = {
  key: keyof VoiceFxParams
  label: string
  min: number
  max: number
  step: number
  format: (value: number) => string
}

export const FX_KNOBS: FxKnobSpec[] = [
  { key: 'lowCutHz', label: 'Low cut', min: 80, max: 1200, step: 10, format: (v) => `${v.toFixed(0)} Hz` },
  { key: 'highCutHz', label: 'High cut', min: 1500, max: 6000, step: 50, format: (v) => `${v.toFixed(0)} Hz` },
  { key: 'saturationAmount', label: 'Saturation', min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) },
  { key: 'hissGain', label: 'Hiss', min: 0, max: 0.25, step: 0.005, format: (v) => v.toFixed(3) },
  { key: 'presencePeakDb', label: 'Presence', min: 0, max: 12, step: 0.5, format: (v) => `${v.toFixed(1)} dB` },
  { key: 'playbackRate', label: 'Rate', min: 0.7, max: 1.4, step: 0.01, format: (v) => `${v.toFixed(2)}x` },
  { key: 'outputGain', label: 'Output', min: 0.5, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
  { key: 'wetMix', label: 'Wet mix', min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) },
]

export function readMixerFxBaseline(state: MixerFxState, key: keyof VoiceFxParams): number {
  const preset = resolveVoiceFxPresetId(state.genreId)
  if (preset?.params[key] !== undefined) return Number(preset.params[key])
  return Number(DEFAULT_VOICE_FX[key])
}

export function readMixerFxValue(state: MixerFxState, key: keyof VoiceFxParams): number {
  const override = state.knobOverrides ?? {}
  if (override[key] !== undefined) return Number(override[key])
  return readMixerFxBaseline(state, key)
}

export function isMixerKnobTweaked(state: MixerFxState, key: keyof VoiceFxParams): boolean {
  const override = state.knobOverrides ?? {}
  if (override[key] === undefined) return false
  return Math.abs(Number(override[key]) - readMixerFxBaseline(state, key)) > 0.0001
}

export function countMixerKnobTweaks(state: MixerFxState): number {
  return FX_KNOBS.filter((knob) => isMixerKnobTweaked(state, knob.key)).length
}

export function readClipFxBaseline(
  clip: DeckClip,
  key: keyof VoiceFxParams,
): number {
  return readMixerFxBaseline({ genreId: clip.fxPresetId }, key)
}

export function readClipFxValue(
  clip: DeckClip,
  key: keyof VoiceFxParams,
): number {
  const override = clip.fxParamsOverride ?? {}
  if (override[key] !== undefined) return Number(override[key])
  return readClipFxBaseline(clip, key)
}

export function isClipFxKnobTweaked(clip: DeckClip, key: keyof VoiceFxParams): boolean {
  const override = clip.fxParamsOverride ?? {}
  if (override[key] === undefined) return false
  return Math.abs(Number(override[key]) - readClipFxBaseline(clip, key)) > 0.0001
}

export function countClipFxKnobTweaks(clip: DeckClip): number {
  return FX_KNOBS.filter((knob) => isClipFxKnobTweaked(clip, knob.key)).length
}