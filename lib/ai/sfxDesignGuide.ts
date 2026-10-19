/**
 * Sound design guide for the peal-studio AI toolset: what a Peal sound can
 * be, how to build each family from layers, and worked compose_sound recipes.
 * Recipes are real patches — keep them valid against sfxPatchSchema.
 */
import type { SfxPatch } from '@/lib/sfx/patch'

export const SFX_DESIGN_SPACE = `## The design space
A Peal sound is a layered patch (compose_sound). Think like a foley artist and a synth designer at once — most good UI sounds are 2–4 layers, each with a job:
- **Transient** — the first 2–15ms that says "something happened": a filtered noise tick, a short high partial, a grain burst.
- **Body** — what the sound *is*: a tone, a resonant bandpass on noise (wood, paper, cloth), a chord of partials (glass, bell).
- **Motion** — how it moves: pitch glide (frequencyEnd), filter sweep (filter.frequencyEnd), grains clustered front/back.
- **Air / tail** — soft highpassed or pink noise, or a quiet upper partial, fading out.

### Space, motion and repetition
- **Stereo** — every layer has pan (−1 left … 1 right) and panEnd. Use motion that matches the gesture: a forward page turn sweeps left→right (pan −0.4 → 0.5), backward right→left. Keep transients and thuds near centre.
- **Flutter** — amplitude tremolo per layer (rate Hz, depth 0–1, optional rateEnd). Paper flutter 10–22Hz, felt-tip/marker friction 30–60Hz at depth 0.3–0.6, ribbon shimmer 6–10Hz.
- **Contour** — a list of level multipliers spread across a layer, on top of its envelope. Use it for gestures with speed: a stroke that accelerates and lifts [0.3, 0.8, 1, 0.7, 0.15]; a page that whips then settles [1, 0.6, 0.25].
- **Room** — patch-level { size, mix, damping }. Foley sounds placed in a room feel real: desk 0.1–0.2 size at 0.08–0.15 mix, damping 0.6–0.8 for soft rooms. Leave crisp UI ticks dry.
- **Variation** — patch-level 0–1. Anything that repeats (page turns, keys, taps) should set 0.2–0.4 so each play is slightly different and never fatiguing.

### Families and how to build them
- **Tones & chimes** (success, notify, badge): sine/triangle body + harmonics [0.3, 0.1]; bells use inharmonic-feeling stacks — two tone layers a non-octave apart (e.g. 880 + 1320).
- **Clicks & taps** (buttons, toggles, keys): 3–20ms bandpassed noise transient (1.5–5kHz, q 2–6) + optional 20–40ms low tone thump (120–250Hz) for weight.
- **Paper & books** (page turn, book open, document, receipt): pink/white noise through bandpass 1.2–4kHz with *grains* (8–40, length 0.004–0.02, jitter 0.6–0.8) for crinkle; a soft lowpassed noise "breath" body; for a hardcover add a brief low thud (brown noise lowpass 300Hz) and a tiny spine creak (bandpass q 8 sweeping 900→600Hz).
- **Writing & drawing** (pen, pencil, highlighter, signature): continuous pink noise bandpassed 1.2–3kHz with flutter 30–60Hz for friction, a contour following stroke speed, fine white-noise grains for paper tooth, a soft contact tick at the start and a lift at the end; pencil is brighter and grainier, felt-tip duller and smoother.
- **Cloth & soft motion** (sheet, drawer liner, pocket): pink noise, lowpass 2–3kHz, slow attack 40–120ms, few long grains.
- **Wood & knocks** (card drop, tile place, cabinet): bandpassed noise q 4–10 at 300–900Hz, very short (40–120ms), plus a decaying tone near the same frequency.
- **Glass & ceramic** (sparkle, cup, delicate success): high tone partials 2–6kHz with fast decay + a tiny white-noise transient.
- **Water & drops** (pop, bubble, sync): sine with an upward glide (e.g. 400→1400Hz over 40ms) + short soft noise.
- **Whooshes & sweeps** (panel open/close, swipe, send): white/pink noise through bandpass q 1–3 sweeping (filter.frequencyEnd) 600→4000Hz for open/up, reverse for close/down; envelope swells (attack ≈ half the length).
- **Mechanical** (switch, latch, lock, camera): two clicks 15–40ms apart (two layers with start offsets) + a resonant metallic ping (tone 2–4kHz, decay 30ms).
- **Digital & sci-fi** (scan, power up, error): square/saw tones with lowpass and glides, quantized steps via several short tone layers.
- **Errors & warnings**: lower (180–400Hz), two quick pulses or a falling glide; avoid harsh clipping.

### Craft rules
- Match the material the user names. "Book", "page", "paper", "cloth", "wood" mean *noise-based foley*, not a tonal ding — only add a tone if they ask for something musical.
- UI sounds are short: 30–800ms (foley can run to ~1.2s). Every layer needs its own envelope.
- Grains make things organic; filters make them material; glides make them move. Use at least one of the three in anything that isn't a plain tone.
- Keep gains balanced (body ~0.6–0.8, transient ~0.4–0.7, air ~0.15–0.3). The renderer normalizes the mix.
`

interface Recipe {
  ask: string
  patch: SfxPatch
}

export const SFX_DESIGN_RECIPES: Recipe[] = [
  {
    ask: 'hardcover book opening',
    patch: {
      summary: 'Hardcover book opening',
      duration: 0.9,
      layers: [
        { name: 'cover thud', source: 'noise', noiseColor: 'brown', start: 0, duration: 0.12, gain: 0.7,
          envelope: { attack: 0.003, decay: 0.06, sustain: 0.1, release: 0.05 },
          filter: { type: 'lowpass', frequency: 320, q: 0.8 } },
        { name: 'spine creak', source: 'noise', noiseColor: 'white', start: 0.04, duration: 0.18, gain: 0.25,
          envelope: { attack: 0.02, decay: 0.08, sustain: 0.3, release: 0.06 },
          filter: { type: 'bandpass', frequency: 900, frequencyEnd: 600, q: 9 } },
        { name: 'page fan', source: 'noise', noiseColor: 'pink', start: 0.1, duration: 0.75, gain: 0.65,
          envelope: { attack: 0.05, decay: 0.25, sustain: 0.35, release: 0.3 },
          filter: { type: 'bandpass', frequency: 2400, frequencyEnd: 1500, q: 1.4 },
          grains: { count: 28, length: 0.012, jitter: 0.75, density: 'front' } },
        { name: 'air', source: 'noise', noiseColor: 'pink', start: 0.08, duration: 0.8, gain: 0.15,
          envelope: { attack: 0.12, decay: 0.2, sustain: 0.4, release: 0.35 },
          filter: { type: 'highpass', frequency: 3500, q: 0.7 } },
      ],
    },
  },
  {
    ask: 'single page turn',
    patch: {
      summary: 'Paper page turn',
      duration: 0.45,
      layers: [
        { name: 'flick', source: 'noise', noiseColor: 'white', start: 0, duration: 0.05, gain: 0.5,
          envelope: { attack: 0.002, decay: 0.02, sustain: 0.2, release: 0.02 },
          filter: { type: 'bandpass', frequency: 3200, q: 2.5 } },
        { name: 'sheet swish', source: 'noise', noiseColor: 'pink', start: 0.02, duration: 0.4, gain: 0.7,
          envelope: { attack: 0.08, decay: 0.12, sustain: 0.3, release: 0.18 },
          filter: { type: 'bandpass', frequency: 1400, frequencyEnd: 2600, q: 1.2 },
          grains: { count: 14, length: 0.015, jitter: 0.7, density: 'middle' },
          pan: -0.4, panEnd: 0.5, flutter: { rate: 16, rateEnd: 9, depth: 0.35 }, contour: [0.5, 1, 0.6, 0.2] },
      ],
      room: { size: 0.15, mix: 0.1, damping: 0.7 },
      variation: 0.3,
    },
  },
  {
    ask: 'felt-tip pen stroke',
    patch: {
      summary: 'Felt-tip stroke on paper',
      duration: 0.6,
      layers: [
        { name: 'tip contact', source: 'noise', noiseColor: 'pink', duration: 0.02, gain: 0.35,
          envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.008 },
          filter: { type: 'bandpass', frequency: 1800, q: 1.5 } },
        { name: 'friction', source: 'noise', noiseColor: 'pink', start: 0.01, duration: 0.57, gain: 0.75,
          envelope: { attack: 0.03, decay: 0.1, sustain: 0.8, release: 0.08 },
          filter: { type: 'bandpass', frequency: 1500, frequencyEnd: 1900, q: 0.9 },
          flutter: { rate: 38, rateEnd: 48, depth: 0.45 }, contour: [0.4, 0.9, 1, 0.8, 0.3],
          pan: -0.2, panEnd: 0.25 },
        { name: 'paper tooth', source: 'noise', noiseColor: 'white', start: 0.02, duration: 0.54, gain: 0.18,
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.08 },
          filter: { type: 'highpass', frequency: 3200, q: 0.8 },
          grains: { count: 60, length: 0.004, jitter: 0.8, density: 'even' } },
      ],
      room: { size: 0.1, mix: 0.08, damping: 0.75 },
    },
  },
  {
    ask: 'soft success chime',
    patch: {
      summary: 'Soft success chime',
      duration: 0.55,
      layers: [
        { name: 'glass tick', source: 'noise', noiseColor: 'white', duration: 0.012, gain: 0.3,
          envelope: { attack: 0.001, decay: 0.006, sustain: 0, release: 0.004 },
          filter: { type: 'highpass', frequency: 5000 } },
        { name: 'body', source: 'tone', waveform: 'sine', frequency: 784, harmonics: [0.25, 0.08], gain: 0.7,
          envelope: { attack: 0.006, decay: 0.18, sustain: 0.25, release: 0.3 } },
        { name: 'lift', source: 'tone', waveform: 'sine', frequency: 1175, start: 0.07, gain: 0.45,
          envelope: { attack: 0.006, decay: 0.15, sustain: 0.2, release: 0.25 } },
      ],
    },
  },
  {
    ask: 'tactile button click',
    patch: {
      summary: 'Tactile button click',
      duration: 0.06,
      layers: [
        { name: 'snap', source: 'noise', noiseColor: 'white', duration: 0.012, gain: 0.7,
          envelope: { attack: 0.0005, decay: 0.006, sustain: 0, release: 0.005 },
          filter: { type: 'bandpass', frequency: 3800, q: 4 } },
        { name: 'thump', source: 'tone', waveform: 'sine', frequency: 190, frequencyEnd: 120, duration: 0.05, gain: 0.5,
          envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.015 } },
      ],
    },
  },
  {
    ask: 'panel open whoosh',
    patch: {
      summary: 'Panel open whoosh',
      duration: 0.35,
      layers: [
        { name: 'sweep', source: 'noise', noiseColor: 'pink', gain: 0.8,
          envelope: { attack: 0.16, decay: 0.08, sustain: 0.4, release: 0.11 },
          filter: { type: 'bandpass', frequency: 600, frequencyEnd: 3800, q: 1.8 } },
      ],
    },
  },
]

export function formatSfxDesignGuideForPrompt(): string {
  const recipes = SFX_DESIGN_RECIPES.map((r) => `- "${r.ask}" → ${JSON.stringify(r.patch)}`)
  return [SFX_DESIGN_SPACE, '### Worked recipes (adapt, don\'t copy)', ...recipes].join('\n')
}
