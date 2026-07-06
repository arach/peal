export const MUSIC_PATTERN_EXAMPLE_PROMPTS = [
  'Instrumental lo-fi beat — dusty drums, Rhodes chords, no vocals, 82 bpm',
  'House groove with alternating hat patterns every 2 bars, 124 bpm',
  'Downtempo trip-hop — heavy kick, filtered pad, bass roots, 90 bpm',
  'Boom-bap instrumental — punchy kick/snare, short sample stabs, varied hats',
  'Minimal techno — evolving filter on one layer, not a static loop',
] as const

export const MUSIC_EDIT_EXAMPLE_PROMPTS = [
  'Add a sub bass under the kick — keep it instrumental',
  'Vary the hi-hat pattern with <a b c> alternation',
  'Add a 2-bar breakdown mask on the busiest layer',
  'Swap chord voicing every 4 bars — no melody that needs lyrics',
  'Euclidean fill on the rim — rotate placement',
  'Slow filter sweep on the pad layer',
] as const

export const STRUDEL_PATTERN_GROUNDING = `
## Strudel mini-notation (write runnable code)
- **Synth pitch:** \`note("c3 e3 g3").scale('C:minor').s('sawtooth')\` — use \`note()\`, not \`n()\`, for melodies/bass on waveforms
- **Samples:** \`s("bd ~ sd ~").bank('RolandTR909')\` — \`n\` is only for sample variant indices
- Tempo: \`setcps(1)\` (global) · \`stack(part1, part2)\` for layers
- Euclidean: \`s("bd").euclid(3,8)\` · Polyrhythm: \`[kick, hat*8]\` · Alt: \`<a b>\` · Rests: \`~\`
- Effects: \`.gain(0.4).lpf(800).room(0.3)\` per layer

Always emit complete runnable Strudel — prefer \`stack(...)\` with one role per child.
`.trim()

export function formatMusicExamplesForPrompt(): string {
  return [
    '## Example live-code prompts',
    ...MUSIC_PATTERN_EXAMPLE_PROMPTS.map((p) => `- "${p}"`),
    '',
    '## Example edit prompts',
    ...MUSIC_EDIT_EXAMPLE_PROMPTS.map((p) => `- "${p}"`),
    '',
    STRUDEL_PATTERN_GROUNDING,
  ].join('\n')
}