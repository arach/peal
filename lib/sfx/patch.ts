/**
 * Layered SFX patch — the design space the AI composes in.
 *
 * A patch is a short stack of layers. Each layer is a tone (oscillator) or a
 * noise source, shaped by an envelope, an optional moving filter, an optional
 * pitch glide and optional grains (many short randomized bursts — the basis of
 * rustles, crackles, rain, gravel, shuffles). That covers UI tones and chimes
 * as well as foley: page turns, paper, cloth, wood knocks, glass, whooshes.
 *
 * Rendered offline with Web Audio into one mono buffer. Deterministic per
 * `seed` so the same patch always sounds the same.
 */
import { z } from 'zod'

const envelopeSchema = z.object({
  attack: z.number().describe('Seconds to peak, e.g. 0.002 for a tick, 0.08 for a soft swell'),
  decay: z.number().describe('Seconds from peak down to sustain'),
  sustain: z.number().describe('Level 0–1 held until release'),
  release: z.number().describe('Seconds to fade at the end of the layer'),
})

const filterSchema = z.object({
  type: z.enum(['lowpass', 'highpass', 'bandpass', 'notch', 'peaking']),
  frequency: z.number().describe('Cutoff/centre Hz at layer start'),
  frequencyEnd: z.number().optional().describe('Cutoff Hz at layer end — filter sweep'),
  q: z.number().optional().describe('Resonance, 0.5 gentle … 12 sharp/whistly'),
})

const grainsSchema = z.object({
  count: z.number().describe('Bursts across the layer, e.g. 6 for a page flick, 40 for crumpling'),
  length: z.number().describe('Seconds per burst, e.g. 0.004–0.03'),
  jitter: z.number().optional().describe('0–1 timing/level randomness; ~0.6 sounds organic'),
  density: z.enum(['even', 'front', 'back', 'middle']).optional().describe('Where bursts cluster in time'),
})

export const sfxLayerSchema = z.object({
  name: z.string().describe('Short role, e.g. "paper body", "spine creak", "air"'),
  source: z.enum(['tone', 'noise']),
  waveform: z.enum(['sine', 'triangle', 'square', 'sawtooth']).optional().describe('tone only'),
  frequency: z.number().optional().describe('tone only: start Hz'),
  frequencyEnd: z.number().optional().describe('tone only: end Hz — pitch glide'),
  harmonics: z.array(z.number()).optional().describe('tone only: extra partial amplitudes, [0.4, 0.15] adds 2× and 3×'),
  noiseColor: z.enum(['white', 'pink', 'brown']).optional().describe('noise only: white bright, pink natural, brown dark/rumbly'),
  start: z.number().optional().describe('Seconds offset into the sound'),
  duration: z.number().optional().describe('Seconds; defaults to the rest of the sound'),
  gain: z.number().optional().describe('0–1 layer level, default 0.6'),
  envelope: envelopeSchema,
  filter: filterSchema.optional(),
  grains: grainsSchema.optional(),
  pan: z.number().optional().describe('Stereo position −1 left … 1 right at layer start, default 0'),
  panEnd: z.number().optional().describe('Stereo position at layer end — motion across the field (page turning L→R)'),
  flutter: z.object({
    rate: z.number().describe('Tremolo Hz: 8–20 paper flutter, 25–60 friction/buzz'),
    rateEnd: z.number().optional().describe('Tremolo Hz at layer end — speeding up or slowing down'),
    depth: z.number().describe('0–1 modulation depth'),
  }).optional().describe('Amplitude flutter: page flutter, felt-tip friction, ribbon shimmer'),
  contour: z.array(z.number()).optional().describe('Level multipliers 0–1 spread evenly over the layer, on top of the envelope — e.g. a stroke that speeds up then lifts: [0.4, 1, 0.8, 0.2]'),
})

export const sfxPatchSchema = z.object({
  summary: z.string().describe('Short label, e.g. "hardcover book opening"'),
  duration: z.number().describe('Total seconds, 0.03–3'),
  layers: z.array(sfxLayerSchema).min(1).max(8),
  notes: z.string().optional().describe('One line of craft notes for the user'),
  room: z.object({
    size: z.number().describe('0–1: 0.1 desk/close, 0.4 room, 0.8 hall'),
    mix: z.number().describe('0–1 wet level; 0.08–0.2 keeps UI sounds close'),
    damping: z.number().optional().describe('0–1 high-frequency absorption; soft furnishings ~0.7'),
  }).optional().describe('Small synthetic space around the sound'),
  variation: z.number().optional().describe('0–1 per-play humanization for sounds that repeat (page turns, keys); 0.2–0.4 typical'),
  seed: z.number().optional(),
})

export type SfxLayer = z.infer<typeof sfxLayerSchema>
export type SfxPatch = z.infer<typeof sfxPatchSchema>

const SAMPLE_RATE = 44100
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function noiseBuffer(ctx: BaseAudioContext, seconds: number, color: SfxLayer['noiseColor'], rand: () => number) {
  const length = Math.max(1, Math.ceil(seconds * ctx.sampleRate))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0
  for (let i = 0; i < length; i++) {
    const white = rand() * 2 - 1
    if (color === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    } else if (color === 'brown') {
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    } else {
      data[i] = white
    }
  }
  return buffer
}

/** Burst onset times (seconds, relative to layer start). */
function grainTimes(grains: NonNullable<SfxLayer['grains']>, span: number, rand: () => number): number[] {
  const count = clamp(Math.round(grains.count), 1, 400)
  const jitter = clamp(grains.jitter ?? 0.5, 0, 1)
  const times: number[] = []
  for (let i = 0; i < count; i++) {
    let u = (i + 0.5) / count
    u += (rand() - 0.5) * jitter / count * 2
    u = clamp(u, 0, 1)
    if (grains.density === 'front') u = u * u
    else if (grains.density === 'back') u = Math.sqrt(u)
    else if (grains.density === 'middle') u = 0.5 + (u - 0.5) * Math.abs(u - 0.5) * 2
    times.push(u * span)
  }
  return times.sort((a, b) => a - b)
}

function applyEnvelope(param: AudioParam, env: SfxLayer['envelope'], t0: number, len: number, peak: number) {
  const attack = clamp(env.attack, 0.0005, len)
  const decay = clamp(env.decay, 0.0005, Math.max(0.0005, len - attack))
  const release = clamp(env.release, 0.001, Math.max(0.001, len - attack - decay))
  const sustain = clamp(env.sustain, 0, 1) * peak
  const releaseAt = Math.max(t0 + attack + decay, t0 + len - release)
  param.setValueAtTime(0, t0)
  param.linearRampToValueAtTime(peak, t0 + attack)
  param.linearRampToValueAtTime(Math.max(sustain, 0.0001), t0 + attack + decay)
  param.setValueAtTime(Math.max(sustain, 0.0001), releaseAt)
  param.linearRampToValueAtTime(0, t0 + len)
}

function buildLayer(ctx: OfflineAudioContext, layer: SfxLayer, total: number, rand: () => number, out: AudioNode) {
  const t0 = clamp(layer.start ?? 0, 0, total)
  const len = clamp(layer.duration ?? total - t0, 0.002, total - t0)
  if (len <= 0.001) return
  // Up to 2 so mixer boosts on already-loud layers still register.
  const gainLevel = clamp(layer.gain ?? 0.6, 0, 2)

  const amp = ctx.createGain()
  amp.gain.value = 0
  let tail: AudioNode = amp

  if (layer.filter) {
    const f = ctx.createBiquadFilter()
    f.type = layer.filter.type
    f.Q.value = clamp(layer.filter.q ?? 0.9, 0.0001, 30)
    const fStart = clamp(layer.filter.frequency, 20, 20000)
    f.frequency.setValueAtTime(fStart, t0)
    if (layer.filter.frequencyEnd) {
      f.frequency.exponentialRampToValueAtTime(clamp(layer.filter.frequencyEnd, 20, 20000), t0 + len)
    }
    amp.connect(f)
    tail = f
  }

  if (layer.contour && layer.contour.length > 0) {
    const shape = ctx.createGain()
    const points = layer.contour.map((v) => clamp(v, 0, 1))
    const curve = new Float32Array(points.length > 1 ? points : [points[0], points[0]])
    shape.gain.setValueCurveAtTime(curve, t0, len)
    tail.connect(shape)
    tail = shape
  }

  if (layer.flutter && layer.flutter.depth > 0) {
    // gain = (1 − depth/2) + (depth/2)·sin(2π·rate·t)
    const depth = clamp(layer.flutter.depth, 0, 1)
    const trem = ctx.createGain()
    trem.gain.value = 1 - depth / 2
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(clamp(layer.flutter.rate, 0.1, 200), t0)
    if (layer.flutter.rateEnd) {
      lfo.frequency.linearRampToValueAtTime(clamp(layer.flutter.rateEnd, 0.1, 200), t0 + len)
    }
    const lfoAmt = ctx.createGain()
    lfoAmt.gain.value = depth / 2
    lfo.connect(lfoAmt)
    lfoAmt.connect(trem.gain)
    lfo.start(t0)
    lfo.stop(t0 + len)
    tail.connect(trem)
    tail = trem
  }

  const panner = ctx.createStereoPanner()
  panner.pan.setValueAtTime(clamp(layer.pan ?? 0, -1, 1), t0)
  if (layer.panEnd !== undefined) {
    panner.pan.linearRampToValueAtTime(clamp(layer.panEnd, -1, 1), t0 + len)
  }
  tail.connect(panner)
  panner.connect(out)

  if (layer.source === 'noise') {
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(ctx, len, layer.noiseColor ?? 'white', rand)
    if (layer.grains) {
      // Grains: a gate opened briefly per burst, scaled by the layer envelope.
      const gate = ctx.createGain()
      gate.gain.value = 0
      const grainLen = clamp(layer.grains.length, 0.001, 0.25)
      for (const t of grainTimes(layer.grains, Math.max(0, len - grainLen), rand)) {
        const at = t0 + t
        const level = 1 - rand() * 0.7 * clamp(layer.grains.jitter ?? 0.5, 0, 1)
        gate.gain.setValueAtTime(0, at)
        gate.gain.linearRampToValueAtTime(clamp(level, 0, 1), at + Math.min(0.001, grainLen / 4))
        gate.gain.exponentialRampToValueAtTime(0.0001, at + grainLen)
      }
      src.connect(gate)
      gate.connect(amp)
    } else {
      src.connect(amp)
    }
    src.start(t0)
    src.stop(t0 + len)
  } else {
    const base = clamp(layer.frequency ?? 440, 20, 20000)
    const partials = [1, ...(layer.harmonics ?? [])]
    partials.forEach((level, i) => {
      if (level <= 0) return
      const osc = ctx.createOscillator()
      osc.type = i === 0 ? layer.waveform ?? 'sine' : 'sine'
      const ratio = i + 1
      osc.frequency.setValueAtTime(clamp(base * ratio, 20, 20000), t0)
      if (layer.frequencyEnd) {
        osc.frequency.exponentialRampToValueAtTime(clamp(layer.frequencyEnd * ratio, 20, 20000), t0 + len)
      }
      const g = ctx.createGain()
      g.gain.value = clamp(level, 0, 1) / partials.length ** 0.5
      osc.connect(g)
      g.connect(amp)
      osc.start(t0)
      osc.stop(t0 + len)
    })
  }

  applyEnvelope(amp.gain, layer.envelope, t0, len, gainLevel)
}

/** Stereo impulse response: decaying noise, damped toward the tail. */
function roomImpulse(ctx: BaseAudioContext, room: NonNullable<SfxPatch['room']>, rand: () => number) {
  const size = clamp(room.size, 0, 1)
  const seconds = 0.08 + size * 1.4
  const length = Math.ceil(seconds * ctx.sampleRate)
  const ir = ctx.createBuffer(2, length, ctx.sampleRate)
  const damping = clamp(room.damping ?? 0.5, 0, 0.98)
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < length; i++) {
      const t = i / length
      const white = rand() * 2 - 1
      // One-pole lowpass that closes as the tail decays.
      const k = 1 - damping * t
      lp += (white - lp) * clamp(k, 0.02, 1)
      data[i] = lp * Math.pow(1 - t, 2.5 + (1 - size) * 3)
    }
  }
  return ir
}

/**
 * Per-play humanization: nudges layer timing, level and filter cutoffs by up
 * to `variation`, so a repeated sound (page turn) never fires identically.
 */
export function varySfxPatch(patch: SfxPatch, seed = Math.floor(Math.random() * 1e9)): SfxPatch {
  const amount = clamp(patch.variation ?? 0, 0, 1)
  if (amount === 0) return patch
  const rand = rng(seed)
  const wobble = (scale: number) => 1 + (rand() * 2 - 1) * amount * scale
  return {
    ...patch,
    seed,
    layers: patch.layers.map((layer) => ({
      ...layer,
      start: Math.max(0, (layer.start ?? 0) + (rand() * 2 - 1) * amount * 0.01),
      gain: clamp((layer.gain ?? 0.6) * wobble(0.18), 0, 1),
      filter: layer.filter
        ? {
            ...layer.filter,
            frequency: layer.filter.frequency * wobble(0.1),
            frequencyEnd: layer.filter.frequencyEnd ? layer.filter.frequencyEnd * wobble(0.1) : undefined,
          }
        : undefined,
      frequency: layer.frequency ? layer.frequency * wobble(0.02) : undefined,
      pan: layer.pan !== undefined ? clamp(layer.pan + (rand() * 2 - 1) * amount * 0.15, -1, 1) : undefined,
    })),
  }
}

export async function renderSfxPatch(patch: SfxPatch): Promise<AudioBuffer> {
  const total = clamp(patch.duration, 0.03, 3)
  const tail = patch.room ? 0.08 + clamp(patch.room.size, 0, 1) * 1.4 * clamp(patch.room.mix, 0, 1) : 0
  const ctx = new OfflineAudioContext(2, Math.ceil(Math.min(4, total + tail) * SAMPLE_RATE), SAMPLE_RATE)
  const rand = rng(patch.seed ?? 1)

  // Gentle bus compression keeps stacked layers from clipping.
  const bus = ctx.createDynamicsCompressor()
  bus.threshold.value = -14
  bus.ratio.value = 3
  bus.attack.value = 0.002
  bus.release.value = 0.08
  const master = ctx.createGain()
  master.gain.value = 0.9
  bus.connect(master)
  master.connect(ctx.destination)

  // Layers sum into a dry bus; the room (if any) feeds off the same bus.
  const dry = ctx.createGain()
  dry.connect(bus)
  if (patch.room && patch.room.mix > 0) {
    const convolver = ctx.createConvolver()
    convolver.buffer = roomImpulse(ctx, patch.room, rng((patch.seed ?? 1) + 7))
    const wet = ctx.createGain()
    wet.gain.value = clamp(patch.room.mix, 0, 1)
    dry.connect(convolver)
    convolver.connect(wet)
    wet.connect(bus)
  }

  for (const layer of patch.layers.slice(0, 8)) buildLayer(ctx, layer, total, rand, dry)

  const buffer = await ctx.startRendering()
  // Normalize both channels together to −1 dBFS so quiet foley is still audible.
  let peak = 0
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]))
  }
  if (peak > 0) {
    const scale = 0.89 / peak
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < data.length; i++) data[i] *= scale
    }
  }
  return buffer
}
