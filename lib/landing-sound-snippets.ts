export type LandingSoundSnippetInput = {
  id: string
  name: string
  type: string
  file?: string
}

/** Drop-in usage — load the asset and play. */
export function buildPlaySnippet(sound: LandingSoundSnippetInput): string {
  const wavPath = sound.file?.replace(/^\//, '') ?? `sounds/${sound.id}.wav`

  return `import Peal from '@peal-sounds/peal'

const peal = new Peal()
peal.load('${sound.id}', '${wavPath}')

peal.play('${sound.id}')
peal.play('${sound.id}', { volume: 0.8 })`
}

/** How the sound is built — Web Audio synthesis. */
export function buildConstructSnippet(sound: LandingSoundSnippetInput): string {
  const fn = sound.name.replace(/\s+/g, '')
  const builder = CONSTRUCT_SNIPPETS[sound.id]
  if (builder) return builder(fn)

  return `// ${sound.name} — oscillator + envelope
export function play${fn}(volume = 0.5) {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, ctx.currentTime)

  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.4)
}`
}

const CONSTRUCT_SNIPPETS: Record<string, (fn: string) => string> = {
  'neural-pulse': (fn) => `// ${fn} — 7 neurons fire in sequence + sub hum
export function play${fn}(volume = 0.35) {
  const ctx = new AudioContext()
  const duration = 0.5
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate
    let signal = 0

    // Neural firing bursts
    for (let n = 0; n < 7; n++) {
      const fireTime = n * 0.06 + Math.sin(n * 2) * 0.01
      if (t >= fireTime && t < fireTime + 0.04) {
        const localT = t - fireTime
        const freq = 400 + n * 150 + Math.sin(n * 3) * 50
        signal += Math.sin(2 * Math.PI * freq * localT) *
                  Math.exp(-localT * 30) * 0.3
      }
    }

    // Background hum
    signal += Math.sin(2 * Math.PI * 100 * t) * 0.05
    signal += Math.sin(2 * Math.PI * 150 * t) * 0.03

    data[i] = signal * volume
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
}`,

  'quantum-cascade': (fn) => `// ${fn} — 5 quantum states collapse in cascade
export function play${fn}(volume = 0.35) {
  const ctx = new AudioContext()
  const duration = 0.4
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate
    let signal = 0

    for (let state = 0; state < 5; state++) {
      const stateTime = state * 0.06
      const stateFreq = 800 + state * 300

      if (t >= stateTime && t < stateTime + 0.08) {
        const localT = t - stateTime
        // Detuned oscillators — quantum uncertainty
        for (let osc = 0; osc < 3; osc++) {
          const detune = 1 + (osc - 1) * 0.01
          signal += Math.sin(2 * Math.PI * stateFreq * detune * localT) * 0.1
        }
        signal *= Math.exp(-localT * 30) * (1 - state * 0.15)
      }
    }

    data[i] = signal * volume
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
}`,

  'ripple-cascade': (fn) => `// ${fn} — 4 water drops: splash + ripple rings
export function play${fn}(volume = 0.35) {
  const ctx = new AudioContext()
  const duration = 0.6
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate
    let signal = 0

    for (let drop = 0; drop < 4; drop++) {
      const dropTime = drop * 0.12
      if (t >= dropTime) {
        const localT = t - dropTime
        const splashFreq = 2000 - drop * 300

        // Initial splash (high freq, fast decay)
        if (localT < 0.02) {
          signal += Math.sin(2 * Math.PI * splashFreq * localT) *
                    Math.exp(-localT * 100) * (1 - drop * 0.2)
        }

        // Ripple ring (lower freq, slower decay)
        const rippleFreq = 600 + drop * 100
        signal += Math.sin(2 * Math.PI * rippleFreq * localT) *
                  Math.exp(-localT * 5) * 0.2 * (1 - drop * 0.15)
      }
    }

    data[i] = signal * volume
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
}`,

  'resonant-pulse': (fn) => `// ${fn} — modulated resonance, deep fundamental
export function play${fn}(volume = 0.4) {
  const ctx = new AudioContext()
  const duration = 1.4
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate
    const phase = (i / data.length) * Math.PI * 2

    // Dual-modulation resonance
    const resonance = Math.sin(phase) * Math.sin(phase * 8)
    const fundamental = Math.sin(2 * Math.PI * 120 * t)
    const harmonic = Math.sin(2 * Math.PI * 240 * t) * 0.4

    const env = Math.exp(-t * 2.5) * (0.6 + Math.abs(resonance) * 0.4)
    data[i] = (fundamental + harmonic) * Math.abs(resonance) * env * volume
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
}`,

  'ethereal-chime': (fn) => `// ${fn} — harmonic chime with ambient decay
export function play${fn}(volume = 0.35) {
  const ctx = new AudioContext()
  const duration = 1.3
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate
    let signal = 0

    notes.forEach((freq, n) => {
      const onset = n * 0.08
      if (t >= onset) {
        const localT = t - onset
        const env = Math.sin((localT / duration) * Math.PI) *
                    Math.exp(-localT * 1.5)
        signal += Math.sin(2 * Math.PI * freq * localT) * env * 0.35
        // Harmonic shimmer
        signal += Math.sin(2 * Math.PI * freq * 2 * localT) * env * 0.1
      }
    })

    data[i] = signal * volume
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
}`,

  'crystal-pulse': (fn) => `// ${fn} — sharp attack, bright decay oscillation
export function play${fn}(volume = 0.5) {
  const ctx = new AudioContext()
  const duration = 0.3
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate
    const decay = Math.exp(-t * 8)
    const oscillation = Math.sin(t * 0.7 * Math.PI * 2) * 0.2
    const carrier = Math.sin(2 * Math.PI * (1200 - t * 400) * t)

    // Hard attack in first 3ms
    const attack = t < 0.003 ? t / 0.003 : 1
    data[i] = carrier * (0.6 + oscillation) * decay * attack * volume
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start()
}`,
}