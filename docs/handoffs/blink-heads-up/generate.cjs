#!/usr/bin/env node
/**
 * Blink "visible hand" heads-up cues — v2, PHYSICAL edition.
 * -------------------------------------------------------------------------
 * A signature pre-reveal cue: plays right before Blink's typed "visible hand"
 * starts typing, so the user looks. Must feel premium, acoustic, warm, TACTILE
 * — the restraint of Apple / Teenage Engineering / Things / Linear — and sit
 * UNDER a quiet typing reveal. A nudge, not a ping.
 *
 * v1 (glass-bell additive) read too "synthy". This set throws that out and
 * models genuinely DIFFERENT physical bodies, each with a real excitation +
 * resonator, tape-warm saturation, and a short plate "air" so they feel
 * recorded rather than generated:
 *
 *   1 harp-pluck   Karplus–Strong waveguide STRING, soft fingered pluck,
 *                  rising two-note E4→B4 — the retained "watch, it's appearing"
 *                  gesture, elevated onto a real plucked-string body.        ★ pick
 *   2 marimba-lift modal-synthesis wooden BAR (tuned 1 : 4 : 10 partials) +
 *                  soft mallet-contact noise, rising fifth F4→C5. Woody, dry.
 *   3 felt-piano   inharmonic stiff-STRING partials (stretched by B·n²) with a
 *                  low hammer thump and una-corda felt rolloff; warm rising 3rd.
 *   4 soft-bell    modal small BELL with TRUE bell partials (hum·prime·tierce·
 *                  quint·nominal — the minor-third tierce is the "bell"), struck
 *                  with a felt mallet. One warm strike that hums.
 *   5 breath-bloom pure sine that BLOOMS in (40 ms swell) with a bed of airy
 *                  breath-noise that recedes as the tone arrives + slow vibrato
 *                  and a detuned chorus voice. Calm, expensive, TE-ish.
 *
 * Techniques: seeded PRNG (deterministic regen), Karplus–Strong string,
 * modal resonator banks, RBJ biquads (shelf/bandpass/HP), bandpassed noise
 * exciters, tanh tape saturation, compact Freeverb-style plate. No samples.
 * Output: 48 kHz / mono / 16-bit WAV; AIFF (BEI16) + M4A (AAC) via afconvert.
 */
const fs = require('fs')
const path = require('path')

const SR = 48000

// ---------- deterministic noise ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- WAV encode (mono 16-bit PCM), mirrors assets/sounds/generate-sounds.cjs ----------
function encodeWav(samples) {
  const length = samples.length * 2 + 44
  const buf = Buffer.alloc(length)
  let o = 0
  buf.write('RIFF', o); o += 4
  buf.writeUInt32LE(length - 8, o); o += 4
  buf.write('WAVE', o); o += 4
  buf.write('fmt ', o); o += 4
  buf.writeUInt32LE(16, o); o += 4
  buf.writeUInt16LE(1, o); o += 2          // PCM
  buf.writeUInt16LE(1, o); o += 2          // mono
  buf.writeUInt32LE(SR, o); o += 4
  buf.writeUInt32LE(SR * 2, o); o += 4     // byte rate
  buf.writeUInt16LE(2, o); o += 2          // block align
  buf.writeUInt16LE(16, o); o += 2         // bits
  buf.write('data', o); o += 4
  buf.writeUInt32LE(samples.length * 2, o); o += 4
  const max = 32767
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(s * max), o); o += 2
  }
  return buf
}

// ---------- RBJ biquad ----------
function biquad(type, f0, Q, gainDB = 0) {
  const A = Math.pow(10, gainDB / 40)
  const w0 = (2 * Math.PI * f0) / SR
  const cs = Math.cos(w0), sn = Math.sin(w0)
  const alpha = sn / (2 * Q)
  const sq = 2 * Math.sqrt(A) * alpha
  let b0, b1, b2, a0, a1, a2
  switch (type) {
    case 'lowshelf':
      b0 = A * ((A + 1) - (A - 1) * cs + sq); b1 = 2 * A * ((A - 1) - (A + 1) * cs); b2 = A * ((A + 1) - (A - 1) * cs - sq)
      a0 = (A + 1) + (A - 1) * cs + sq; a1 = -2 * ((A - 1) + (A + 1) * cs); a2 = (A + 1) + (A - 1) * cs - sq; break
    case 'highshelf':
      b0 = A * ((A + 1) + (A - 1) * cs + sq); b1 = -2 * A * ((A - 1) + (A + 1) * cs); b2 = A * ((A + 1) + (A - 1) * cs - sq)
      a0 = (A + 1) - (A - 1) * cs + sq; a1 = 2 * ((A - 1) - (A + 1) * cs); a2 = (A + 1) - (A - 1) * cs - sq; break
    case 'lowpass':
      b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = (1 - cs) / 2; a0 = 1 + alpha; a1 = -2 * cs; a2 = 1 - alpha; break
    case 'highpass':
      b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = (1 + cs) / 2; a0 = 1 + alpha; a1 = -2 * cs; a2 = 1 - alpha; break
    case 'bandpass':
      b0 = alpha; b1 = 0; b2 = -alpha; a0 = 1 + alpha; a1 = -2 * cs; a2 = 1 - alpha; break
    default: throw new Error('bad biquad ' + type)
  }
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 }
}
function applyBiquad(buf, c) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i]
    const y = c.b0 * x + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2
    x2 = x1; x1 = x; y2 = y1; y1 = y
    buf[i] = y
  }
}

// raised-cosine attack, unit-gain sustain
function atkEnv(i, atk) { return i < atk ? 0.5 - 0.5 * Math.cos((Math.PI * i) / atk) : 1 }

// ---------- exciters ----------
// soft mallet / hammer contact: a short noise burst, band-limited, swelled in
// (no click) then gone. This is the "physical contact" layer under a resonator.
function addContactNoise(out, { startSec, durSec, amp, centerHz, Q = 0.9, atkSec = 0.004, lpHz = null, seed = 1 }) {
  const start = Math.floor(startSec * SR)
  const n = Math.floor(durSec * SR)
  const rnd = mulberry32(seed)
  const tmp = new Float32Array(n)
  for (let i = 0; i < n; i++) tmp[i] = rnd() * 2 - 1
  applyBiquad(tmp, biquad('bandpass', centerHz, Q))
  if (lpHz) applyBiquad(tmp, biquad('lowpass', lpHz, 0.707))
  const atk = Math.max(1, Math.floor(atkSec * SR))
  const tau = durSec * 0.35
  for (let i = 0; i < n; i++) {
    const idx = start + i; if (idx >= out.length) break
    const t = i / SR
    out[idx] += amp * atkEnv(i, atk) * Math.exp(-t / tau) * tmp[i]
  }
}

// ---------- modal resonator bank (percussion: marimba bar, bell) ----------
// sum of exponentially decaying inharmonic partials; upper modes decay faster.
function addModal(out, { startSec, f0, amp, atkSec, modes, detune = 0 }) {
  const start = Math.floor(startSec * SR)
  let maxDur = 0
  for (const m of modes) maxDur = Math.max(maxDur, m.tau * 6)
  const n = Math.floor(maxDur * SR)
  const atk = Math.max(1, Math.floor(atkSec * SR))
  const voices = detune ? [1.0, detune] : [1.0]
  for (let i = 0; i < n; i++) {
    const idx = start + i; if (idx >= out.length) break
    const t = i / SR
    const a = atkEnv(i, atk)
    let s = 0
    for (const vf of voices) {
      for (const m of modes) s += m.gain * Math.exp(-t / m.tau) * Math.sin(2 * Math.PI * f0 * m.ratio * vf * t)
    }
    out[idx] += amp * a * s * (voices.length > 1 ? 0.7 : 1)
  }
}

// ---------- inharmonic stiff string (felt piano) ----------
// piano partials stretch: f_n = n·f0·sqrt(1 + B·n²). Felt = strong HF rolloff,
// two-stage decay (fast initial + slower body), highs die sooner.
function addStiffString(out, { startSec, f0, amp, atkSec, B = 0.0005, nPartials = 12, tauBody = 0.5, feltHz = 5 }) {
  const start = Math.floor(startSec * SR)
  const n = Math.floor(tauBody * 6 * SR)
  const atk = Math.max(1, Math.floor(atkSec * SR))
  const parts = []
  for (let k = 1; k <= nPartials; k++) {
    const fk = k * f0 * Math.sqrt(1 + B * k * k)
    if (fk > SR * 0.45) break
    const g = (1 / Math.pow(k, 1.15)) * Math.exp(-k / feltHz)   // felt HF rolloff
    const tau = tauBody / (1 + 0.18 * k)                        // highs die sooner
    parts.push({ fk, g, tau })
  }
  for (let i = 0; i < n; i++) {
    const idx = start + i; if (idx >= out.length) break
    const t = i / SR
    const a = atkEnv(i, atk)
    const twoStage = 0.72 * Math.exp(-t / 0.09) + 0.28          // fast initial bite + body
    let s = 0
    for (const p of parts) s += p.g * Math.exp(-t / p.tau) * Math.sin(2 * Math.PI * p.fk * t)
    out[idx] += amp * a * twoStage * s
  }
}

// ---------- Karplus–Strong plucked string (real waveguide) ----------
// delay line seeded with a soft (pre-lowpassed) pluck; loop lowpass = HF decay.
function addKS(out, { startSec, freq, durSec, amp, damp = 0.996, loopLpHz = 3600, pluckPos = 0.18, atkSec = 0.010, seed = 1 }) {
  const start = Math.floor(startSec * SR)
  const N = Math.max(2, Math.round(SR / freq))
  const rnd = mulberry32(seed)
  const line = new Float32Array(N)
  for (let i = 0; i < N; i++) line[i] = rnd() * 2 - 1
  applyBiquad(line, biquad('lowpass', 2400, 0.707))              // soft, finger-plucked (not bright)
  const pOff = Math.max(1, Math.round(N * pluckPos))             // pluck-position comb
  const combed = new Float32Array(N)
  for (let i = 0; i < N; i++) combed[i] = line[i] - line[(i - pOff + N) % N]
  let peak = 0; for (const v of combed) peak = Math.max(peak, Math.abs(v))
  if (peak > 0) for (let i = 0; i < N; i++) combed[i] /= peak

  const n = Math.floor(durSec * SR)
  const atk = Math.max(1, Math.floor(atkSec * SR))
  const lpA = 1 - Math.exp((-2 * Math.PI * loopLpHz) / SR)       // one-pole loop lowpass
  let idx = 0, prev = 0, lp = 0
  for (let i = 0; i < n; i++) {
    const oi = start + i; if (oi >= out.length) break
    const cur = line[idx]
    out[oi] += amp * atkEnv(i, atk) * cur
    let f = (cur + prev) * 0.5                                   // string averaging lowpass
    lp += lpA * (f - lp); f = lp                                 // extra warmth in loop
    line[idx] = damp * f
    prev = cur
    idx = (idx + 1) % N
  }
}

// ---------- blooming breath tone ----------
function addBreath(out, { startSec, f0, amp, durSec, atkSec = 0.040, vibHz = 5.2, vibDepth = 0.004, detune = 1.003, seed = 3 }) {
  const start = Math.floor(startSec * SR)
  const n = Math.floor(durSec * SR)
  const atk = Math.max(1, Math.floor(atkSec * SR))
  // airy breath bed: bandpassed noise that recedes as the tone blooms
  const rnd = mulberry32(seed)
  const air = new Float32Array(n)
  for (let i = 0; i < n; i++) air[i] = rnd() * 2 - 1
  applyBiquad(air, biquad('bandpass', 2600, 0.5))
  applyBiquad(air, biquad('lowpass', 5200, 0.707))
  const partials = [{ r: 1, g: 1.0 }, { r: 2, g: 0.18 }, { r: 3, g: 0.06 }]
  for (let i = 0; i < n; i++) {
    const idx = start + i; if (idx >= out.length) break
    const t = i / SR
    const bloom = atkEnv(i, atk) * Math.exp(-t / (durSec * 0.7))
    const vib = 1 + vibDepth * Math.sin(2 * Math.PI * vibHz * t) * atkEnv(i, atk)
    let tone = 0
    for (const p of partials) {
      tone += p.g * Math.sin(2 * Math.PI * f0 * p.r * vib * t)
      tone += p.g * 0.5 * Math.sin(2 * Math.PI * f0 * detune * p.r * vib * t)  // chorus voice
    }
    const airEnv = Math.exp(-t / 0.10) * (i < atk ? i / atk : 1) * 0.22        // breath present early, recedes
    out[idx] += amp * (bloom * tone + airEnv * air[i])
  }
}

// ---------- compact Freeverb-style plate (mono) for "air" ----------
function reverb(dry, { wet = 0.12, roomFb = 0.62, damp = 0.35 }) {
  const s = SR / 44100
  const combLens = [1116, 1188, 1277, 1356].map((d) => Math.round(d * s))
  const apLens = [556, 441].map((d) => Math.round(d * s))
  const out = new Float32Array(dry.length)
  for (const L of combLens) {
    const buf = new Float32Array(L); let fstore = 0, idx = 0
    for (let i = 0; i < dry.length; i++) {
      const o = buf[idx]
      fstore = o * (1 - damp) + fstore * damp
      buf[idx] = dry[i] + fstore * roomFb
      idx = (idx + 1) % L
      out[i] += o
    }
  }
  for (const L of apLens) {
    const buf = new Float32Array(L); let idx = 0
    for (let i = 0; i < out.length; i++) {
      const bo = buf[idx]
      const o = -out[i] + bo
      buf[idx] = out[i] + bo * 0.5
      idx = (idx + 1) % L
      out[i] = o
    }
  }
  const mix = new Float32Array(dry.length)
  for (let i = 0; i < dry.length; i++) mix[i] = dry[i] + wet * out[i]
  return mix
}

// ---------- master chain ----------
function master(buf, { warmthDB = 1.5, tameDB = -5, sat = 1.15, wet = 0.12, peakTarget = 0.52, foSec = 0.05 }) {
  applyBiquad(buf, biquad('highpass', 55, 0.707))              // clear rumble/DC
  applyBiquad(buf, biquad('lowshelf', 220, 0.7, warmthDB))     // body warmth
  applyBiquad(buf, biquad('highshelf', 8500, 0.7, tameDB))     // tame synthy top
  // pre-normalize to a consistent drive so tanh adds *gentle* tape glue, not
  // hard clipping — percussive hits and sustained tones hit the curve the same.
  let dpk = 0; for (const s of buf) dpk = Math.max(dpk, Math.abs(s))
  const dg = dpk > 0 ? 0.5 / dpk : 1
  const tn = Math.tanh(sat)
  for (let i = 0; i < buf.length; i++) buf[i] = Math.tanh(sat * buf[i] * dg) / tn  // tape glue
  let out = reverb(buf, { wet })
  const fi = Math.floor(0.004 * SR), fo = Math.floor(foSec * SR)
  for (let i = 0; i < fi; i++) out[i] *= i / fi
  for (let i = 0; i < fo; i++) out[out.length - 1 - i] *= i / fo
  let peak = 0; for (const s of out) peak = Math.max(peak, Math.abs(s))
  const g = peak > 0 ? peakTarget / peak : 1
  for (let i = 0; i < out.length; i++) out[i] *= g
  return { out, peak }
}

// ---------- pitches ----------
const D4 = 293.66, E4 = 329.63, F4 = 349.23, Fs4 = 369.99, G4 = 392.0, A4 = 440.0
const B4 = 493.88, C5 = 523.25, Cs5 = 554.37, A3 = 220.0, E5 = 659.25

// ---------- the cues ----------
const CUES = {
  // ★ real plucked-string body + retained rising two-note "watch" gesture
  'harp-pluck': { lenSec: 0.62, foSec: 0.06, wet: 0.14, sat: 1.1, build(buf) {
    addContactNoise(buf, { startSec: 0.000, durSec: 0.02, amp: 0.06, centerHz: 2200, atkSec: 0.004, seed: 11 })
    addKS(buf, { startSec: 0.000, freq: E4, durSec: 0.42, amp: 0.42, damp: 0.9955, loopLpHz: 3200, pluckPos: 0.16, atkSec: 0.012, seed: 12 })
    addContactNoise(buf, { startSec: 0.130, durSec: 0.02, amp: 0.06, centerHz: 2600, atkSec: 0.004, seed: 13 })
    addKS(buf, { startSec: 0.130, freq: B4, durSec: 0.46, amp: 0.50, damp: 0.9948, loopLpHz: 3600, pluckPos: 0.16, atkSec: 0.012, seed: 14 })
  }},
  // wooden marimba bar (1:4:10 modes) + soft mallet, rising fifth
  'marimba-lift': { lenSec: 0.55, foSec: 0.05, wet: 0.13, sat: 1.2, build(buf) {
    const bar = [{ ratio: 1.0, gain: 1.0, tau: 0.30 }, { ratio: 3.98, gain: 0.30, tau: 0.10 }, { ratio: 9.6, gain: 0.10, tau: 0.045 }, { ratio: 10.8, gain: 0.05, tau: 0.035 }]
    addContactNoise(buf, { startSec: 0.000, durSec: 0.016, amp: 0.10, centerHz: 2000, Q: 0.7, lpHz: 4500, atkSec: 0.003, seed: 21 })
    addModal(buf, { startSec: 0.000, f0: F4, amp: 0.52, atkSec: 0.006, modes: bar })
    addContactNoise(buf, { startSec: 0.120, durSec: 0.016, amp: 0.10, centerHz: 2400, Q: 0.7, lpHz: 5000, atkSec: 0.003, seed: 22 })
    addModal(buf, { startSec: 0.120, f0: C5, amp: 0.58, atkSec: 0.006, modes: bar })
  }},
  // inharmonic felt-piano string + hammer thump, warm rising major third
  'felt-piano': { lenSec: 0.62, foSec: 0.06, wet: 0.11, sat: 1.15, build(buf) {
    addContactNoise(buf, { startSec: 0.000, durSec: 0.03, amp: 0.10, centerHz: 140, Q: 0.6, lpHz: 320, atkSec: 0.006, seed: 31 })  // hammer thump
    addStiffString(buf, { startSec: 0.000, f0: D4, amp: 0.34, atkSec: 0.010, B: 0.0006, nPartials: 12, tauBody: 0.42, feltHz: 4.5 })
    addContactNoise(buf, { startSec: 0.135, durSec: 0.03, amp: 0.09, centerHz: 150, Q: 0.6, lpHz: 340, atkSec: 0.006, seed: 32 })
    addStiffString(buf, { startSec: 0.135, f0: Fs4, amp: 0.38, atkSec: 0.010, B: 0.0006, nPartials: 12, tauBody: 0.46, feltHz: 4.5 })
  }},
  // small struck BELL with true bell partials (hum·prime·tierce·quint·nominal)
  'soft-bell': { lenSec: 0.66, foSec: 0.07, wet: 0.16, sat: 1.1, build(buf) {
    const bell = [
      { ratio: 0.50, gain: 0.55, tau: 0.55 },   // hum (octave below prime)
      { ratio: 1.00, gain: 1.00, tau: 0.42 },   // prime
      { ratio: 1.19, gain: 0.50, tau: 0.34 },   // tierce — the minor third that says "bell"
      { ratio: 1.50, gain: 0.22, tau: 0.24 },   // quint
      { ratio: 2.00, gain: 0.26, tau: 0.26 },   // nominal
      { ratio: 2.55, gain: 0.09, tau: 0.12 },
      { ratio: 3.00, gain: 0.05, tau: 0.09 },
    ]
    addContactNoise(buf, { startSec: 0.000, durSec: 0.02, amp: 0.06, centerHz: 1100, Q: 0.8, lpHz: 3200, atkSec: 0.005, seed: 41 })  // felt mallet
    addModal(buf, { startSec: 0.000, f0: A4, amp: 0.5, atkSec: 0.008, modes: bell, detune: 0.9994 })  // tiny detune = live shimmer
  }},
  // pure sine that BLOOMS in with an airy breath bed + slow vibrato/chorus
  'breath-bloom': { lenSec: 0.70, foSec: 0.09, wet: 0.10, sat: 1.05, warmthDB: 2.2, tameDB: -3, build(buf) {
    addBreath(buf, { startSec: 0.000, f0: A3, amp: 0.62, durSec: 0.62, atkSec: 0.045, vibHz: 5.0, vibDepth: 0.004, detune: 1.004, seed: 51 })
    addBreath(buf, { startSec: 0.010, f0: E5, amp: 0.10, durSec: 0.44, atkSec: 0.060, vibHz: 5.3, vibDepth: 0.003, detune: 1.003, seed: 52 })  // soft fifth shimmer
  }},
}

const outDir = __dirname
const report = []
for (const [name, def] of Object.entries(CUES)) {
  const buf = new Float32Array(Math.floor(def.lenSec * SR))
  def.build(buf)
  const { out, peak } = master(buf, {
    warmthDB: def.warmthDB, tameDB: def.tameDB, sat: def.sat, wet: def.wet, foSec: def.foSec, peakTarget: 0.52,
  })
  const file = path.join(outDir, `${name}.wav`)
  fs.writeFileSync(file, encodeWav(out))
  report.push(`${name.padEnd(14)} ${(def.lenSec * 1000).toFixed(0)}ms  rawPeak=${peak.toFixed(3)}  -> ${path.basename(file)}`)
}
console.log(report.join('\n'))
