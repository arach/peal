export const MUSIC_PATTERN_EXAMPLE_PROMPTS = [
  'Lo-fi hip-hop bed, dusty drums, 78 bpm, 8 bars',
  'Four-on-the-floor house kick with offbeat hats at 128 bpm',
  'Ambient pad in C minor — slow evolution, lots of room',
  'Minimal techno groove — tight kick, sparse percussion',
] as const

export const MUSIC_EDIT_EXAMPLE_PROMPTS = [
  'Add a sub bass under the current pattern',
  'Make it darker — lower the filter and add room',
  'Double the hi-hat density',
  'Slow to 70 bpm and simplify the drums',
] as const

export const STRUDEL_PATTERN_GROUNDING = `
## Strudel mini-notation (write runnable code)
- Notes: \`n("c3 e3 g3")\`, scales: \`.scale('C:minor')\`, sounds: \`.s('sawtooth')\` or \`.s("bd sd")\`
- Samples: \`.bank('RolandTR909')\`, \`s("bd ~ sd ~")\`
- Tempo: \`setcps(1)\` or pattern \`.cpm(120/4)\` / \`.cps(2)\`
- Combine: \`stack(part1, part2)\`
- Euclidean: \`s("bd").euclid(3,8)\`
- Effects: \`.gain(0.4).lpf(800).room(0.3)\`
- Polyrhythm: \`<a b>\`, repeats: \`a*2\`, slows: \`a/2\`

Always emit complete runnable Strudel — prefer \`stack(...)\` for multi-part grooves.
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