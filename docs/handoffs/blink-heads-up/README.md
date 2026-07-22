# Blink "visible hand" heads-up cue — v2 (physical)

A signature pre-reveal cue for Blink's typed **visible hand**: plays right before the
text types itself in, so the user looks. Fully **synthesized**, no samples — regenerate
with `node generate.cjs`. Each ships as `.wav`, `.aiff` (BEI16), and `.m4a` (AAC); all
`afplay`-able. 48 kHz / mono, pre-normalized to **−5.7 dBFS** (attenuate in-app).

## Why v2

v1 was one glass-bell *synth* voice restated three ways — it read notification-y. v2
throws that out and models five genuinely different **physical bodies**, each with a real
excitation + resonator, gentle tape-warm saturation, and a short plate "air" so they feel
recorded, not generated. The good instinct from v1 — a gentle **rising two-note** = "watch,
something's appearing" — is kept where it fits (harp, marimba) and elevated onto real bodies.

## The set

| Cue | Physical model | Gesture | Dur | Crest | Feel |
|---|---|---|---|---|---|
| **harp-pluck** ★ | Karplus–Strong waveguide **string**, soft finger pluck | E4 → B4 (rising 5th) | 620 ms | 11.1 dB | plucked, warm, anticipatory — **the pick** |
| marimba-lift | modal wooden **bar** (1 : 4 : 10 modes) + mallet contact | F4 → C5 (rising 5th) | 550 ms | 9.2 dB | woody, dry, tactile tap |
| felt-piano | inharmonic stiff **string** (`f·√(1+B·n²)`) + hammer thump, felt rolloff | D4 → F#4 (rising 3rd) | 620 ms | 11.9 dB | mellow, intimate, una-corda |
| soft-bell | modal **bell**, true partials (hum·prime·**tierce**·quint·nominal), felt mallet | A4 strike + hum | 660 ms | 13.0 dB | one warm struck bell that hums |
| breath-bloom | pure sine that **blooms** in (45 ms swell) + airy breath bed, vibrato + chorus | A3 bloom | 700 ms | 9.1 dB | calm, expensive, TE-ish |

All: soft swell-in onset (starts from zero sample → click-free), −5.7 dBFS peak,
RMS −15…−19 dBFS (sits under a quiet typing reveal), ~0.55–0.70 s.

## The pick — `harp-pluck`

It's the one place the brief's two asks meet: it's a **real plucked-string body** (a
Karplus–Strong digital waveguide — an actual model of a vibrating string with a damped
delay line, pluck-position comb, and in-loop lowpass for natural high-frequency decay), and
it carries the **rising two-note "watch"** gesture you liked. The pluck is pre-lowpassed so
it's fingered, not bright; the two notes (E4→B4, a rising fifth) read as a small, warm
"…here it comes" without ever pinging. Premium and physical, and it stays out of the way of
text. Second choice: **marimba-lift** — same rising gesture, more tactile/woody if you want
the cue to feel like a physical *tap* landing.

```sh
afplay docs/handoffs/blink-heads-up/harp-pluck.aiff
```

## How it's built (`generate.cjs`)

Seeded PRNG (deterministic regen) · Karplus–Strong string · modal resonator banks ·
RBJ biquads (shelf / bandpass / highpass) · bandpassed-noise mallet/hammer exciters ·
consistent-drive tanh tape saturation · compact Freeverb-style mono plate. Every timbre,
pitch, length, and level lives at the top of each cue's `build()` — easy to nudge.

> **Audition note.** These are DSP-designed and measured (levels, onsets, durations are
> deliberate) but I can't ear-check them from here. Play the `.aiff`s and tell me what to
> push — warmer, shorter, lower, softer pluck, different interval — and I'll iterate.
