import type { SoundPreset } from './modernAppSounds'

type PresetParams = SoundPreset['parameters']

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeEnvelope(parameters: PresetParams, duration: number) {
  const envelope = parameters.envelope ?? {}
  const attack = envelope.attack ?? parameters.attack ?? 0.01
  const decay = envelope.decay ?? parameters.decay ?? 0.05
  const sustain = envelope.sustain ?? parameters.sustain ?? 0.25
  const release = envelope.release ?? parameters.release ?? Math.min(0.08, duration * 0.25)
  const volume = parameters.volume ?? 0.4

  let safeAttack = clamp(attack, 0.001, duration * 0.35)
  let safeDecay = clamp(decay, 0.001, duration * 0.35)
  let safeRelease = clamp(release, 0.001, duration * 0.35)

  const used = safeAttack + safeDecay + safeRelease
  if (used >= duration * 0.95) {
    const scale = (duration * 0.9) / used
    safeAttack *= scale
    safeDecay *= scale
    safeRelease *= scale
  }

  const sustainTime = Math.max(0, duration - safeAttack - safeDecay - safeRelease)
  const peak = Math.max(volume, 0.08)
  const sustainLevel = Math.max(sustain * peak, 0.001)

  return { safeAttack, safeDecay, safeRelease, sustainTime, sustainLevel, peak }
}

function applyGainEnvelope(
  gain: GainNode,
  envelope: ReturnType<typeof normalizeEnvelope>,
  start: number,
  end: number,
) {
  const { safeAttack, safeDecay, safeRelease, sustainTime, sustainLevel, peak } = envelope

  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), start + safeAttack)
  gain.gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), start + safeAttack + safeDecay)

  const sustainEnd = start + safeAttack + safeDecay + sustainTime
  if (sustainTime > 0) {
    gain.gain.setValueAtTime(Math.max(sustainLevel, 0.0001), sustainEnd)
  }

  gain.gain.exponentialRampToValueAtTime(0.0001, end)
}

function applyPitchEnvelope(
  param: AudioParam,
  baseFrequency: number,
  pitchEnvelope: Array<{ time: number; value: number }>,
  duration: number,
  start: number,
) {
  const points = [...pitchEnvelope].sort((a, b) => a.time - b.time)
  if (points.length === 0) return

  const first = points[0]
  param.setValueAtTime(baseFrequency * first.value, start)

  for (let i = 1; i < points.length; i++) {
    const point = points[i]
    const time = start + clamp(point.time, 0, duration)
    param.linearRampToValueAtTime(baseFrequency * point.value, time)
  }
}

function applyFilterEnvelope(
  filter: BiquadFilterNode,
  envelope: Array<{ time: number; value: number }>,
  duration: number,
  start: number,
) {
  const points = [...envelope].sort((a, b) => a.time - b.time)
  if (points.length === 0) return

  filter.frequency.setValueAtTime(points[0].value, start)
  for (let i = 1; i < points.length; i++) {
    const time = start + clamp(points[i].time, 0, duration)
    filter.frequency.linearRampToValueAtTime(points[i].value, time)
  }
}

function createNoiseBuffer(ctx: OfflineAudioContext, duration: number) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 6)
  }

  return buffer
}

function connectFilterChain(
  ctx: OfflineAudioContext,
  source: AudioNode,
  params: PresetParams,
  duration: number,
  start: number,
  destination: AudioNode,
) {
  let node: AudioNode = source

  if (params.filter) {
    const filter = ctx.createBiquadFilter()
    filter.type = params.filter.type || 'lowpass'
    filter.frequency.value = params.filter.frequency || 1000
    filter.Q.value = params.filter.Q ?? 1

    if (params.filter.envelope) {
      applyFilterEnvelope(filter, params.filter.envelope, duration, start)
    }

    node.connect(filter)
    node = filter
  }

  node.connect(destination)
}

function renderNoiseLayer(
  ctx: OfflineAudioContext,
  params: PresetParams,
  duration: number,
  destination: AudioNode,
) {
  const start = 0
  const end = duration
  const envelope = normalizeEnvelope(params, duration)

  const noise = ctx.createBufferSource()
  noise.buffer = createNoiseBuffer(ctx, duration)

  const gain = ctx.createGain()
  applyGainEnvelope(gain, envelope, start, end)

  noise.connect(gain)
  connectFilterChain(ctx, gain, params, duration, start, destination)

  noise.start(start)
  noise.stop(end)
}

function renderHarmonicLayers(
  ctx: OfflineAudioContext,
  params: PresetParams,
  duration: number,
  destination: AudioNode,
) {
  const start = 0
  const end = duration
  const baseFrequency = params.oscillator?.frequency || params.frequency || 440
  const waveform = params.oscillator?.waveform || params.type || 'sine'
  const harmonics = params.harmonics as Array<{ ratio: number; amplitude: number }>
  const envelope = normalizeEnvelope(params, duration)

  for (const harmonic of harmonics) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = waveform === 'noise' ? 'sine' : (waveform as OscillatorType)
    const freq = baseFrequency * harmonic.ratio
    osc.frequency.setValueAtTime(freq, start)

    if (params.pitch?.envelope) {
      applyPitchEnvelope(osc.frequency, freq, params.pitch.envelope, duration, start)
    }

    if (params.oscillator?.detune) {
      osc.detune.value = params.oscillator.detune
    }

    const layerEnvelope = {
      ...envelope,
      peak: envelope.peak * harmonic.amplitude,
      sustainLevel: envelope.sustainLevel * harmonic.amplitude,
    }
    applyGainEnvelope(gain, layerEnvelope, start, end)

    osc.connect(gain)
    connectFilterChain(ctx, gain, params, duration, start, destination)

    osc.start(start)
    osc.stop(end)
  }
}

function renderSingleOscillator(
  ctx: OfflineAudioContext,
  params: PresetParams,
  duration: number,
  destination: AudioNode,
) {
  const start = 0
  const end = duration
  const baseFrequency = params.oscillator?.frequency || params.frequency || 440
  const waveform = params.oscillator?.waveform || params.type || 'sine'
  const envelope = normalizeEnvelope(params, duration)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = waveform === 'noise' ? 'sine' : (waveform as OscillatorType)
  osc.frequency.setValueAtTime(baseFrequency, start)

  if (params.pitch?.envelope) {
    applyPitchEnvelope(osc.frequency, baseFrequency, params.pitch.envelope, duration, start)
  }

  if (params.oscillator?.detune) {
    osc.detune.value = params.oscillator.detune
  }

  if (params.modulation?.type === 'frequency') {
    const depth = params.modulation.amount || 20
    const rate = params.modulation.speed || 5
    const steps = Math.max(4, Math.floor(duration * rate))
    for (let i = 0; i <= steps; i++) {
      const t = start + (i / steps) * duration
      const mod = Math.sin((i / steps) * Math.PI * 2 * rate) * depth
      osc.frequency.setValueAtTime(baseFrequency + mod, t)
    }
  }

  applyGainEnvelope(gain, envelope, start, end)

  osc.connect(gain)
  connectFilterChain(ctx, gain, params, duration, start, destination)

  osc.start(start)
  osc.stop(end)
}

export async function renderPresetAudioBuffer(preset: SoundPreset): Promise<AudioBuffer> {
  const params = preset.parameters
  const duration = Math.max(params.duration || 0.2, 0.01)
  const sampleRate = 44100
  const ctx = new OfflineAudioContext(1, Math.ceil(sampleRate * duration), sampleRate)

  const master = ctx.createGain()
  master.gain.value = 1
  master.connect(ctx.destination)

  if (params.type === 'noise') {
    renderNoiseLayer(ctx, params, duration, master)
  } else if (Array.isArray(params.harmonics) && params.harmonics.length > 0) {
    renderHarmonicLayers(ctx, params, duration, master)
  } else {
    renderSingleOscillator(ctx, params, duration, master)
  }

  return ctx.startRendering()
}