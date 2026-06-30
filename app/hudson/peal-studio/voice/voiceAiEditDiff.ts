import type { VoiceFxParams } from '@voxd/client/fx'
import type { DeckClip } from './types'
import { FX_KNOBS, readMixerFxValue, type MixerFxState } from './fxKnobs'
import { voiceFxLabel } from './voiceFx'

export interface VoiceAiKnobChange {
  key: keyof VoiceFxParams
  label: string
  before: string
  after: string
  beforeRaw: number
  afterRaw: number
}

export interface MixerSnapshot {
  genreId: string
  values: Record<string, number>
}

export function snapshotMixer(state: MixerFxState): MixerSnapshot {
  const values: Record<string, number> = {}
  for (const knob of FX_KNOBS) {
    values[knob.key] = readMixerFxValue(state, knob.key)
  }
  return { genreId: state.genreId, values }
}

export function diffMixerSnapshots(before: MixerSnapshot, after: MixerSnapshot): VoiceAiKnobChange[] {
  const changes: VoiceAiKnobChange[] = []
  for (const knob of FX_KNOBS) {
    const beforeRaw = before.values[knob.key]
    const afterRaw = after.values[knob.key]
    if (beforeRaw === undefined || afterRaw === undefined) continue
    if (Math.abs(beforeRaw - afterRaw) <= 0.0001) continue
    changes.push({
      key: knob.key,
      label: knob.label,
      before: knob.format(beforeRaw),
      after: knob.format(afterRaw),
      beforeRaw,
      afterRaw,
    })
  }
  return changes
}

export function mixerAfterGenre(genreId: string): MixerFxState {
  return { genreId, knobOverrides: undefined }
}

export function mixerAfterTweak(state: MixerFxState, params: Partial<VoiceFxParams>): MixerFxState {
  return {
    genreId: state.genreId,
    knobOverrides: { ...(state.knobOverrides ?? {}), ...params },
  }
}

export function mixerAfterReset(state: MixerFxState): MixerFxState {
  return { genreId: state.genreId, knobOverrides: undefined }
}

export interface AppliedParamEntry {
  key: keyof VoiceFxParams
  label: string
  value: string
}

const PARAM_LABELS: Partial<Record<keyof VoiceFxParams, string>> = {
  lowCutHz: 'Low cut',
  highCutHz: 'High cut',
  bandQ: 'Band Q',
  saturationAmount: 'Saturation',
  bitcrushAmount: 'Bitcrush',
  hissGain: 'Hiss',
  hissCutoffHz: 'Hiss cutoff',
  presencePeakDb: 'Presence',
  presenceCenterHz: 'Presence center',
  presenceQ: 'Presence Q',
  compressorThresholdDb: 'Compressor threshold',
  compressorRatio: 'Compressor ratio',
  clickEnabled: 'Click',
  clickGain: 'Click gain',
  clickDurationMs: 'Click duration',
  squelchTailEnabled: 'Squelch tail',
  squelchTailGain: 'Squelch gain',
  squelchTailDurationMs: 'Squelch duration',
  playbackRate: 'Rate',
  outputGain: 'Output',
  wetMix: 'Wet mix',
}

export function formatAppliedParamValue(key: keyof VoiceFxParams, value: unknown): string {
  if (typeof value === 'boolean') return value ? 'on' : 'off'
  if (typeof value !== 'number') return String(value)
  const knob = FX_KNOBS.find((entry) => entry.key === key)
  if (knob) return knob.format(value)
  if (key.endsWith('Hz')) return `${value.toFixed(0)} Hz`
  if (key.endsWith('Db')) return `${value.toFixed(1)} dB`
  if (key.endsWith('Ms')) return `${value.toFixed(0)} ms`
  if (key.endsWith('Ratio')) return `${value.toFixed(1)}:1`
  return String(value)
}

export function formatAppliedParams(params?: Partial<VoiceFxParams>): AppliedParamEntry[] {
  if (!params) return []
  return (Object.keys(params) as Array<keyof VoiceFxParams>)
    .filter((key) => params[key] !== undefined)
    .map((key) => ({
      key,
      label: PARAM_LABELS[key] ?? key,
      value: formatAppliedParamValue(key, params[key]),
    }))
}

export function summarizeAppliedEdit(edit: Pick<PealVoiceLastEdit, 'appliedParams' | 'appliedGenreId' | 'genreLabel' | 'knobChanges' | 'genreChanged'>): string {
  const parts: string[] = []
  if (edit.appliedGenreId !== undefined) {
    parts.push(voiceFxLabel(edit.appliedGenreId))
  } else if (edit.genreChanged) {
    parts.push(edit.genreLabel)
  }
  if (edit.appliedParams.length > 0) {
    parts.push(edit.appliedParams.map((entry) => `${entry.label} ${entry.value}`).join(', '))
  } else if (edit.knobChanges.length > 0) {
    parts.push(edit.knobChanges.map((change) => `${change.label} ${change.before}→${change.after}`).join(', '))
  }
  return parts.join(' · ')
}

export interface PealVoiceLastEdit {
  id: string
  summary: string
  tool: 'apply_fx_preset' | 'tweak_fx' | 'reset' | 'other'
  genreLabel: string
  genreIdBefore: string
  genreIdAfter: string
  genreChanged: boolean
  appliedGenreId?: string
  appliedParams: AppliedParamEntry[]
  mixerBefore: MixerFxState
  mixerAfter: MixerFxState
  knobChanges: VoiceAiKnobChange[]
  tweakCount: number
  clipLabel?: string
  clipId?: string
  timestamp: number
  followUpSuggestions: string[]
}

export function buildLastEdit(input: {
  summary: string
  tool: PealVoiceLastEdit['tool']
  beforeState: MixerFxState
  afterState: MixerFxState
  appliedGenreId?: string
  appliedParams?: Partial<VoiceFxParams>
  clipLabel?: string
  clipId?: string
  clip?: DeckClip | null
}): PealVoiceLastEdit {
  const before = snapshotMixer(input.beforeState)
  const afterSnapshot = snapshotMixer(input.afterState)
  const knobChanges = diffMixerSnapshots(before, afterSnapshot)
  const genreIdBefore = before.genreId
  const genreIdAfter = afterSnapshot.genreId
  const genreChanged = genreIdBefore !== genreIdAfter

  const edit: PealVoiceLastEdit = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    summary: input.summary,
    tool: input.tool,
    genreLabel: voiceFxLabel(genreIdAfter),
    genreIdBefore,
    genreIdAfter,
    genreChanged,
    appliedGenreId: input.appliedGenreId,
    appliedParams: formatAppliedParams(input.appliedParams),
    mixerBefore: input.beforeState,
    mixerAfter: input.afterState,
    knobChanges,
    tweakCount: knobChanges.length,
    clipLabel: input.clipLabel,
    clipId: input.clipId,
    timestamp: Date.now(),
    followUpSuggestions: [],
  }

  edit.followUpSuggestions = getFollowUpSuggestions(edit, input.clip ?? null)
  return edit
}

export function getFollowUpSuggestions(edit: PealVoiceLastEdit, clip: DeckClip | null): string[] {
  const suggestions: string[] = []

  if (edit.genreChanged) {
    suggestions.push('Preview through the new genre')
    suggestions.push('Add subtle radio hiss on the strip')
    suggestions.push('Push presence so it cuts through')
  }

  for (const change of edit.knobChanges) {
    if (change.key === 'hissGain' && change.afterRaw > change.beforeRaw) {
      suggestions.push('Band-limit it — raise low cut')
      suggestions.push('Add saturation for more grit')
    }
    if (change.key === 'playbackRate') {
      suggestions.push('Preview at this pacing')
      suggestions.push('Add presence for intelligibility')
    }
    if (change.key === 'outputGain' && change.afterRaw < change.beforeRaw) {
      suggestions.push('Duck a bit more for voice-over')
    }
    if (change.key === 'saturationAmount' || change.key === 'bitcrushAmount') {
      suggestions.push('Push the same direction a little more')
      suggestions.push('Preview and compare to dry')
    }
    if (change.key === 'presencePeakDb') {
      suggestions.push('Preview — does it cut through?')
    }
  }

  if (edit.tool === 'tweak_fx' && edit.knobChanges.length > 0) {
    suggestions.push('Preview the tweak')
    if (edit.knobChanges.length >= 2) {
      suggestions.push('Reset strip back to genre recipe')
    }
  }

  if (edit.tool === 'reset') {
    suggestions.push('Load tower control genre')
    suggestions.push('Start with walkie pacing')
  }

  if (clip?.source === 'tts' && edit.genreChanged) {
    suggestions.push('Slow it to dispatcher pacing')
  }
  if (clip?.source === 'music' && edit.knobChanges.some((c) => c.key === 'outputGain')) {
    suggestions.push('Set this as default for capture')
  }
  if (clip?.source === 'sfx' && edit.knobChanges.length > 0) {
    suggestions.push('Make it punchier — presence up')
  }

  if (suggestions.length === 0) {
    suggestions.push('Preview the selected pad')
    suggestions.push('Push more radio hiss on the strip')
    suggestions.push('Load a different genre to compare')
  }

  return [...new Set(suggestions)].slice(0, 4)
}