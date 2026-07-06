/**
 * Grounded music curriculum for the Peal Music AI agent.
 *
 * Distilled from open, reputable sources — not LLM pretraining. Teach the agent
 * composition heuristics, theory basics, and Strudel pedagogy explicitly.
 *
 * Primary references (CC / open access):
 * - Open Music Theory 2e (Gotham et al.) — https://viva.pressbooks.pub/openmusictheory/
 * - Learning TidalCycles (Alex McLean) — https://tidalcycles.org/docs/patternlib/tutorials/course1/
 * - Strudel Workshop — https://strudel.cc/workshop/getting-started/
 */

export const MUSIC_CURRICULUM_SOURCES = [
  {
    id: 'omt2',
    title: 'Open Music Theory Version 2',
    authors: 'Gotham, Gullings, Hamm, Hughes, Jarvis, Lavengood, Peterson',
    license: 'CC BY-SA 4.0',
    url: 'https://viva.pressbooks.pub/openmusictheory/',
    use: 'Rhythm, harmony, melody, form, pop/jazz units',
  },
  {
    id: 'tidal-course',
    title: 'Learning TidalCycles',
    authors: 'Alex McLean (Tidal creator)',
    license: 'Open access (TidalCycles community)',
    url: 'https://tidalcycles.org/docs/patternlib/tutorials/course1/',
    use: 'Mini-notation, polyrhythm, Euclidean rhythms, effects, time',
  },
  {
    id: 'strudel-workshop',
    title: 'Strudel Workshop',
    authors: 'Strudel contributors (Tidal port to JavaScript)',
    license: 'AGPL (Strudel) / docs open',
    url: 'https://strudel.cc/workshop/getting-started/',
    use: 'Runnable Strudel patterns, stack layers, samples, chord voicing',
  },
] as const

/** Peal Music default output: instrumental beds — no vocals unless asked. */
export const INSTRUMENTAL_BEAT_FOCUS = `
## Instrumental beats (default output)

Peal Music targets **lyricless, varied beats** — drums, bass, chords, arps, textures. No vocals, chants,
speech, or lyrical hooks unless the user explicitly asks.

**Interest without lyrics** comes from:
- Rhythmic variation (fills, Euclidean rotation, hat pattern swaps)
- Timbral movement (filter sweeps, room/delay, waveform or sample swaps)
- Harmonic color (chord alternation, bass root motion, short melodic cells — not “songs”)
- Arrangement masks (intro / body / breakdown within the same \`stack\`)

**Anti-boring checklist** (every pattern should hit at least 3):
1. Two+ layers with **different cycle lengths** (e.g. 4-beat kick, 6-beat hat phrase via \`<a b c>\`).
2. At least one **parameter moves over time** — \`.lpf(sine.range(...).slow(8))\`, \`.gain("<0.4 0.6>")\`, or \`.mask()\`.
3. A **fill or dropout** somewhere — \`~\`, \`.struct()\`, or a one-bar thinner \`.mask()\`.
4. **Register spread** — sub/bass low, chords mid, percussion/air high.

Avoid: static 1-bar loop with identical layers, four-on-floor + nothing else for 32 bars, or “lead melody”
that sounds like it needs lyrics. Prefer **motifs** (2–4 notes) and **texture** over singable phrases.
`.trim()

/** Strudel-native ways to keep instrumental loops evolving. */
export const BEAT_VARIATION_TECHNIQUES = `
## Beat variation toolkit (Strudel)

Use these so loops **change across cycles** without rewriting everything:

| Technique | Example | Effect |
|-----------|---------|--------|
| Cycle alternation | \`s("bd sd ~ bd, ~ ~ rim ~")\` or \`"<hatA hatB hatC>"\` | New accent every cycle |
| Mask / arrangement | \`.mask("<1 1 0 0>/8")\` on one layer | Dropout / breakdown |
| Struct reshape | \`.struct("x ~ x ~")\` on drums | Syncopated grid |
| Euclidean rotate | \`s("rim").euclid(3,8,1)\` then \`euclid(3,8,2)\` on edit | Same density, new placement |
| Slow LFO filters | \`.lpf(sine.range(400,2400).slow(8))\` | Motion without new notes |
| Polyrhythm layer | \`[kick*2, hat*16]\` as separate stack child | Complexity from alignment |
| Bass variation | \`note("<c2 eb2 g2 bb2>").scale('C:minor')\` | Root motion, not a vocal line |
| Chord rotation | \`chord("<Am7 Dm7 G7 Cmaj7>/2").voicing()\` | Harmonic variety |
| Late / early | \`.late(0.01)\` on hats | Human pocket |
| Rarely / sometimes | \`.sometimes(fast(2))\` on a fill layer | Surprise hits |

**Improv / edit rule:** change **one variation dimension** per pass — rhythm OR timbre OR harmony OR arrangement,
not all four. The groove should stay recognizable but not identical bar-to-bar.
`.trim()

/** Actionable heuristics — what “good” tends to mean in short-form grooves. */
export const MUSIC_COMPOSITION_HEURISTICS = `
## What makes a groove work (apply on every edit)

**Roles, not clutter.** A strong loop usually has clear jobs per layer:
- **Pulse** — kick or equivalent downbeat anchor (often quarters or four-on-floor).
- **Backbeat / motion** — snare, rim, or clap; hi-hats or shakers for continuous energy.
- **Harmony bed** — bass root + pad or chord layer; melody or arp on top sparingly.
- **Space** — rests (\`~\`), masks, lower gain, or filters so layers breathe.

**Repetition + variation.** Lock a 1–2 bar cell listeners can latch onto; vary one dimension per pass:
density, timbre, register, or harmony — not everything at once.

**Tension and release.** Build via added layers, opened filters, or busier hats; release via drops,
mutes, or thinner stacks. Even 8-bar loops benefit from a micro-arc.

**Register and spectrum.** Sub/bass below ~120 Hz, kick and bass not fighting (sidechain or pattern offset),
mids for body, highs for air. When dense, **subtract** before adding.

**Downbeat honesty.** First audible hit should telegraph tempo; sparse intros are fine but the pulse must
arrive when the listener expects it.

**Gain staging.** Typical per-layer \`.gain(0.25–0.6)\`; drums ~0.5–0.8; leave headroom before \`.room()\` /
\`.delay()\`.

**Call and response.** Alternate drum fill ↔ melodic phrase, or hat pattern A ↔ pattern B using \`<a b>\`.

**Form in live code.** Think intro (sparse) → body (full stack) → breakdown (strip busiest layer) → return.
Use \`.mask()\`, \`.struct()\`, or fewer \`stack\` layers to imply sections without a DAW.
`.trim()

/** Core theory units distilled from Open Music Theory 2e — enough to compose, not to lecture. */
export const MUSIC_THEORY_CORE = `
## Music theory core (OMT2-grounded)

**Rhythm.** Meter organizes beats into groups (4/4 common for dance). **Syncopation** places accents off the
grid — use Euclidean or \`~\` rests, not only straight divisions. **Subdivision** (8ths, 16ths, triplets)
should relate to tempo: faster tempos → sparser hats; slower → room for swing.

**Pitch & scales.** Pick a **tonic** and mode early (\`C:minor\`, \`F:major\`, etc.). Melodies move mostly by
step with occasional leaps; large leaps often resolve by step. **Chord tones** (1-3-5-7) on strong beats sound
intentional; passing tones on weak beats.

**Harmony (practical).** Common pop/electronic motion: i–VI–III–VII (minor), I–V–vi–IV (major), or static
pedal with moving upper lines. **Root in bass** defines harmony; pads spell extensions; lead avoids clashing
with bass on downbeats.

**Melody.** Contour matters: arch (up then down), wave, or question-answer. **Range**: stay within ~1.5 octaves
for a single hook; wider only for deliberate drama. Phrase length often 4 or 8 beats.

**Texture (map to \`stack\`).**
- Monophony — one melodic line alone.
- Homophony — chords + bass (most electronic beds).
- Polyphony — independent rhythms (\`[a,b]\` or separate stack children).

**20th-c / pop techniques useful in Strudel.** Ostinato (repeating cell), pedal point, sequence (repeat pattern
up/down), and **timbral contrast** (filter / waveform change) as stand-in for orchestration.
`.trim()

/** Strudel / Tidal pedagogy — official workshop + Learning TidalCycles progression. */
export const STRUDEL_PEDAGOGY = `
## Strudel pedagogy (workshop + Tidal course)

**Always runnable.** Top-level \`setcps(n)\` then \`stack(...)\`. Complete patterns only — no fragments.

**Pitch on synths — use \`note()\`, not \`n()\`.**
- Samples: \`s("bd sd").bank('RolandTR909')\` — \`n\` is sample variant index.
- Synths: \`note("c2 eb2 g2").scale('C:minor').s('sawtooth')\` — never \`n("c2").s('sawtooth')\` (breaks oscillators).
- Chords: \`chord("<Am7 Dm7>/4").voicing().s("gm_epiano1")\` (Strudel workshop style).

**Mini-notation (Tidal course week 1).**
- Sequence: \`"bd sd ~ hh"\` — more events in one cycle = faster subdivision.
- Rests: \`~\` · Subseq: \`[bd bd] sd\` · Polyphony: \`[bd, hh*8]\` · Alternation: \`<a b c>\`.
- Speed: \`*2\` denser, \`/2\` sparser, \`!\` repeat step · Euclidean: \`s("bd").euclid(3,8)\` or \`bd(3,8)\`.

**Layers (workshop).** \`stack(drums, bass, chords, melody)\` — each child is one role. Use \`.bank()\` for
sample packs; \`.gain()\`, \`.lpf()\`, \`.hpf()\`, \`.room()\`, \`.delay()\` per layer.

**Time (Tidal course week 2).** Global \`setcps\`; local \`slow(n)\` / \`fast(n)\` on a layer; \`.mask("<1 1 0 0>")\`
for arrangement.

**Harmony (workshop advanced).** \`chord(...).dict('ireal')\`, \`.voicing()\`, \`.anchor()\` for voiced pads;
bass follows \`.mode("root:g1")\` or root motion.

**Phrasing.** \`.struct()\` reshapes accents; \`.early()\` / \`.late()\` humanize; \`.clip()\` shortens tails for
tighter grids.

**Never unless intentional.** \`.partials()\` only with \`s('user')\`; avoid custom waveforms on basic \`saw/sine\`.
`.trim()

/** Genre-specific starting points — tempo, feel, layer recipe. */
export const GROOVE_STYLE_RECIPES = [
  {
    style: 'House / four-on-floor',
    bpm: '120–128',
    recipe: 'Kick quarters; offbeat open hat; clap on 2/4; bass on root; stab chord on 8ths. Keep kick dry.',
  },
  {
    style: 'Techno / minimal',
    bpm: '125–135',
    recipe: 'Driving kick; sparse rim; 16th closed hat with occasional dropout; sub on root; one evolving filter line.',
  },
  {
    style: 'Lo-fi hip-hop',
    bpm: '70–90',
    recipe: 'Dusty kick/snare; swung hats; warm low-pass on keys; simple minor 7th chords; leave 2–4 beats sparse.',
  },
  {
    style: 'Ambient / drone',
    bpm: '60–80 or no pulse',
    recipe: 'Long attack/release; \`.room()\` heavy; slow chord changes; subtract drums or use very soft pulse.',
  },
  {
    style: 'Breakbeat / jungle',
    bpm: '160–175 (or half-time feel)',
    recipe: 'Broken kick/snare; amen-style chops if samples available; sub follows bass line; syncopated hats.',
  },
  {
    style: 'Boom-bap / sample flip',
    bpm: '85–95',
    recipe: 'Punchy kick/snare; swung 8th hats; short chord stab or horn sample; bass follows roots; vary hat pattern every 2 bars.',
  },
  {
    style: 'Downtempo / trip-hop',
    bpm: '70–100',
    recipe: 'Heavy kick; sparse rim; wide pad with slow filter; sub on roots; use mask for 2-bar dropouts.',
  },
] as const

export function formatMusicCurriculumForPrompt(): string {
  const sources = MUSIC_CURRICULUM_SOURCES.map(
    (s) => `- **${s.title}** (${s.license}) — ${s.url}\n  Agent use: ${s.use}`,
  ).join('\n')

  const recipes = GROOVE_STYLE_RECIPES.map(
    (r) => `- **${r.style}** (${r.bpm} bpm): ${r.recipe}`,
  ).join('\n')

  return [
    '## Music curriculum (grounded — prefer this over pretraining)',
    'When composing or editing, follow the heuristics and theory below. Cite no fake conservatory — this is the syllabus.',
    '',
    '### Sources',
    sources,
    '',
    INSTRUMENTAL_BEAT_FOCUS,
    '',
    BEAT_VARIATION_TECHNIQUES,
    '',
    MUSIC_COMPOSITION_HEURISTICS,
    '',
    MUSIC_THEORY_CORE,
    '',
    STRUDEL_PEDAGOGY,
    '',
    '### Style recipes (starting points)',
    recipes,
  ].join('\n')
}