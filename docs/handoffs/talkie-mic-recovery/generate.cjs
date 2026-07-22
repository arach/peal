#!/usr/bin/env node
/**
 * Talkie mic-recovery earcon family — bespoke, synthesized, no samples.
 * A cohesive "soft glass bell" voice (shared timbre) across 4 stages:
 *   1 begin     — soft ascending P4  (E5 -> A5)          "noticed, working"
 *   2 succeed   — ascending maj triad (A5 -> C#6 -> E6)  "resolved, up"
 *   3 degraded  — success onset, then hangs + wavers     "fixed, but still shaky"
 *   4 fail      — descending, dark   (F#5 -> D5 -> A4)   "didn't work" (not alarming)
 *
 * All four share: the same additive-bell voice, the same A-major-pentatonic
 * pitch set, the same envelope family and light air tail -> they read as a family.
 * Output: 48 kHz / mono / 16-bit WAV. AIFF is produced by afconvert (see run below).
 */
const fs = require('fs')
const path = require('path')

const SR = 48000

// ---- WAV encode (mono 16-bit PCM), mirrors assets/sounds/generate-sounds.cjs ----
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

// ---- shared "glass bell" voice ---------------------------------------------
// mild inharmonicity (2.01, 2.76, 5.41) => glassy shimmer; higher partials
// decay faster; short raised-cosine attack; exponential body decay.
const PARTIALS = [
  { r: 1.00, g: 1.00 },
  { r: 2.01, g: 0.42 },
  { r: 2.76, g: 0.22 },
  { r: 3.94, g: 0.10 },
  { r: 5.41, g: 0.05 },
]

function addBell(out, { startSec, freq, durSec, amp, bright = 1.0, tau = 0.14, detune = 0 }) {
  const start = Math.floor(startSec * SR)
  const atk = Math.floor(0.004 * SR)          // 4 ms attack
  const n = Math.floor(durSec * SR)
  const voices = detune ? [1.0, detune] : [1.0]
  for (let i = 0; i < n; i++) {
    const idx = start + i
    if (idx >= out.length) break
    const t = i / SR
    // attack (raised cosine) * exponential decay
    const env = (i < atk ? 0.5 - 0.5 * Math.cos((Math.PI * i) / atk) : 1) * Math.exp(-t / tau)
    let s = 0
    for (const vf of voices) {
      for (let p = 0; p < PARTIALS.length; p++) {
        const { r, g } = PARTIALS[p]
        const pg = p >= 2 ? g * bright : g              // "bright" shapes upper partials
        const pTau = tau / Math.pow(r, 0.6)             // upper partials die sooner
        const pEnv = Math.exp(-t / pTau) / Math.exp(-t / tau)
        s += pg * pEnv * Math.sin(2 * Math.PI * freq * r * vf * t)
      }
    }
    out[idx] += amp * env * s
  }
}

// light, click-free "air" — two low early reflections, keeps the family produced
function addAir(buf) {
  const taps = [{ d: 0.037, g: 0.10 }, { d: 0.071, g: 0.06 }]
  const dry = Float32Array.from(buf)
  for (const { d, g } of taps) {
    const off = Math.floor(d * SR)
    for (let i = 0; i < dry.length; i++) {
      if (i + off < buf.length) buf[i + off] += dry[i] * g
    }
  }
}

function master(buf, peakTarget = 0.72) {
  // 3 ms fade-in, 30 ms fade-out (anti-click), then peak-normalize
  const fi = Math.floor(0.003 * SR)
  const fo = Math.floor(0.030 * SR)
  for (let i = 0; i < fi; i++) buf[i] *= i / fi
  for (let i = 0; i < fo; i++) buf[buf.length - 1 - i] *= i / fo
  let peak = 0
  for (const s of buf) peak = Math.max(peak, Math.abs(s))
  const g = peak > 0 ? peakTarget / peak : 1
  for (let i = 0; i < buf.length; i++) buf[i] *= g
  return { peak, gain: g }
}

// ---- pitches (A-major pentatonic) ----
const A4 = 440, D5 = 587.33, Fs5 = 739.99, E5 = 659.25, A5 = 880.0
const B5 = 987.77, Cs6 = 1108.73, E6 = 1318.51

const EARCONS = {
  'reset-begin': {                          // soft ascending P4, rounded
    lenSec: 0.34,
    notes: [
      { startSec: 0.000, freq: E5, durSec: 0.15, amp: 0.55, bright: 0.80, tau: 0.10 },
      { startSec: 0.085, freq: A5, durSec: 0.22, amp: 0.62, bright: 0.85, tau: 0.13 },
    ],
  },
  'reset-succeed': {                        // ascending major triad, bright, resolved up
    lenSec: 0.50,
    notes: [
      { startSec: 0.000, freq: A5,  durSec: 0.13, amp: 0.58, bright: 1.00, tau: 0.10 },
      { startSec: 0.075, freq: Cs6, durSec: 0.13, amp: 0.60, bright: 1.05, tau: 0.11 },
      { startSec: 0.150, freq: E6,  durSec: 0.32, amp: 0.70, bright: 1.10, tau: 0.20 },
    ],
  },
  'reset-degraded': {                       // success onset, then hangs on 2nd + wavers, veiled
    lenSec: 0.54,
    notes: [
      { startSec: 0.000, freq: A5,  durSec: 0.13, amp: 0.58, bright: 1.00, tau: 0.10 },
      { startSec: 0.075, freq: Cs6, durSec: 0.13, amp: 0.58, bright: 1.00, tau: 0.11 },
      { startSec: 0.155, freq: B5,  durSec: 0.36, amp: 0.60, bright: 0.55, tau: 0.24, detune: 0.9965 },
    ],
  },
  'reset-fail': {                           // descending, dark, soft (not alarming)
    lenSec: 0.58,
    notes: [
      { startSec: 0.000, freq: Fs5, durSec: 0.14, amp: 0.56, bright: 0.75, tau: 0.11 },
      { startSec: 0.100, freq: D5,  durSec: 0.16, amp: 0.60, bright: 0.70, tau: 0.13 },
      { startSec: 0.220, freq: A4,  durSec: 0.34, amp: 0.66, bright: 0.60, tau: 0.28 },
    ],
  },
}

const outDir = __dirname
const report = []
for (const [name, def] of Object.entries(EARCONS)) {
  const buf = new Float32Array(Math.floor(def.lenSec * SR))
  for (const note of def.notes) addBell(buf, note)
  addAir(buf)
  const m = master(buf, 0.72)
  const file = path.join(outDir, `talkie-mic-${name}.wav`)
  fs.writeFileSync(file, encodeWav(buf))
  report.push(`${name.padEnd(15)} ${(def.lenSec * 1000).toFixed(0)}ms  rawPeak=${m.peak.toFixed(3)}  -> ${path.basename(file)}`)
}
console.log(report.join('\n'))
