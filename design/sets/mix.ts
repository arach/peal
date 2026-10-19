import type { SfxLayer, SfxPatch } from '@/lib/sfx/patch'

/**
 * Non-destructive edits on top of a composed patch: per-layer level, timing
 * and pan (plus mute/solo), and four macros across the whole sound. The base
 * patch never changes; `derive` produces what plays, `bake` what gets kept.
 */
export interface LayerMix {
  /** Level change in dB. */
  db: number
  /** Seconds to move the layer later (negative = earlier). */
  shift: number
  /** Added to the layer's stereo position (keeps any pan motion). */
  pan: number
  mute: boolean
  solo: boolean
}

export interface PatchMix {
  layers: LayerMix[]
  /** Room wet level 0–1 (absolute). */
  room: number
  /** Filter tilt in octaves: brighter / darker. */
  tone: number
  /** Tone layers in semitones. */
  pitch: number
  /** Time scale: 0.5 snappier … 2 slower. */
  length: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function neutralMix(patch: SfxPatch): PatchMix {
  return {
    layers: patch.layers.map(() => ({ db: 0, shift: 0, pan: 0, mute: false, solo: false })),
    room: patch.room?.mix ?? 0,
    tone: 0,
    pitch: 0,
    length: 1,
  }
}

export function isDirty(patch: SfxPatch, mix: PatchMix | undefined): boolean {
  return !!mix && JSON.stringify(mix) !== JSON.stringify(neutralMix(patch))
}

const layerEnd = (l: SfxLayer, total: number) => (l.start ?? 0) + (l.duration ?? total - (l.start ?? 0))

function applyLayer(l: SfxLayer, m: LayerMix, base: SfxPatch, mix: PatchMix, silent: boolean): SfxLayer {
  const k = mix.length
  const start0 = l.start ?? 0
  const start = clamp(start0 + m.shift, 0, 2.95)
  // A moved layer keeps its own length instead of stretching to the end.
  const span = l.duration ?? base.duration - start0
  const out: SfxLayer = {
    ...l,
    start: start * k,
    duration: (m.shift !== 0 || l.duration !== undefined ? span : undefined) !== undefined ? span * k : undefined,
    gain: silent ? 0 : clamp((l.gain ?? 0.6) * 10 ** (m.db / 20), 0, 2),
    envelope: {
      ...l.envelope,
      attack: l.envelope.attack * k,
      decay: l.envelope.decay * k,
      release: l.envelope.release * k,
    },
  }
  if (out.duration === undefined) delete out.duration
  if (m.pan !== 0 || l.pan !== undefined) out.pan = clamp((l.pan ?? 0) + m.pan, -1, 1)
  if (l.panEnd !== undefined) out.panEnd = clamp(l.panEnd + m.pan, -1, 1)
  if (mix.pitch !== 0 && l.source === 'tone') {
    const r = 2 ** (mix.pitch / 12)
    if (l.frequency) out.frequency = clamp(l.frequency * r, 20, 20000)
    if (l.frequencyEnd) out.frequencyEnd = clamp(l.frequencyEnd * r, 20, 20000)
  }
  if (mix.tone !== 0 && l.filter) {
    const r = 2 ** mix.tone
    out.filter = {
      ...l.filter,
      frequency: clamp(l.filter.frequency * r, 20, 20000),
      ...(l.filter.frequencyEnd ? { frequencyEnd: clamp(l.filter.frequencyEnd * r, 20, 20000) } : {}),
    }
  }
  return out
}

/** What plays: base + mix (mute/solo silence layers but keep them in place). */
export function derive(base: SfxPatch, mix: PatchMix | undefined): SfxPatch {
  if (!mix) return base
  const anySolo = mix.layers.some((m) => m.solo)
  const layers = base.layers.map((l, i) => {
    const m = mix.layers[i] ?? { db: 0, shift: 0, pan: 0, mute: false, solo: false }
    return applyLayer(l, m, base, mix, m.mute || (anySolo && !m.solo))
  })
  const ends = base.layers.map((l, i) => (layerEnd(l, base.duration) + (mix.layers[i]?.shift ?? 0)) * mix.length)
  const duration = clamp(Math.max(base.duration * mix.length, ...ends), 0.03, 3)
  const room = mix.room > 0
    ? { size: base.room?.size ?? 0.25, damping: base.room?.damping ?? 0.5, mix: mix.room }
    : undefined
  return { ...base, duration, layers, room }
}

/** What gets kept as a new version: muted layers dropped, solo ignored. */
export function bake(base: SfxPatch, mix: PatchMix): SfxPatch {
  const unsoloed = { ...mix, layers: mix.layers.map((m) => ({ ...m, solo: false })) }
  const patch = derive(base, unsoloed)
  return { ...patch, layers: patch.layers.filter((_, i) => !mix.layers[i]?.mute) }
}

/** Only layer `index` audible — for drawing a layer's own waveform. */
export function soloLayer(patch: SfxPatch, index: number): SfxPatch {
  return { ...patch, variation: 0, layers: patch.layers.map((l, i) => (i === index ? l : { ...l, gain: 0 })) }
}
