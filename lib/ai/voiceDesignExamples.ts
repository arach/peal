import type { DeckClip } from '@/app/hudson/peal-studio/voice/types'

export const VOICE_CAPTURE_EXAMPLE_PROMPTS = [
  'Write UI copy for “saved successfully” and capture it',
  'Capture a 2s dark synth sting to bank A',
  'Generate a lo-fi instrumental bed for a loading screen',
  'Record a calm dispatcher line for order confirmed',
] as const

export const VOICE_EDIT_EXAMPLE_PROMPTS = [
  'Load tower control genre on the selected clip',
  'Push more radio hiss on the strip',
  'Make the selected pad sound like a calm dispatcher',
  'Slow it down — walkie pacing',
  'Reset the strip back to the genre recipe',
] as const

/** @deprecated use VOICE_CAPTURE_EXAMPLE_PROMPTS or VOICE_EDIT_EXAMPLE_PROMPTS */
export const VOICE_STUDIO_EXAMPLE_PROMPTS = [
  ...VOICE_CAPTURE_EXAMPLE_PROMPTS.slice(0, 2),
  ...VOICE_EDIT_EXAMPLE_PROMPTS.slice(0, 3),
] as const

export function getVoiceEditSuggestions(clip: DeckClip | null): string[] {
  if (!clip) return [...VOICE_EDIT_EXAMPLE_PROMPTS]

  switch (clip.source) {
    case 'tts':
      return [
        'Make this line sound like calm mission control',
        'Add more radio hiss and band-limit it',
        'Slow it down slightly — dispatcher pacing',
        'Load walkie-talkie genre on the strip',
      ]
    case 'music':
      return [
        'Duck the bed — lower output on the strip',
        'Add AM broadcast warmth to this bed',
        'More grit and tape saturation',
        'Preview through tower control genre',
      ]
    case 'sfx':
      return [
        'Crush it — more bitcrush on the strip',
        'Make this sting punch through — presence up',
        'Load dry and add subtle hiss only',
        'Preview with walkie genre',
      ]
    default:
      return [...VOICE_EDIT_EXAMPLE_PROMPTS]
  }
}

export function formatVoiceFxPresetsForPrompt(
  presets: Array<{ id: string; label: string; family: string; description: string }>,
) {
  return presets.map((p) => `- **${p.id}** (${p.label}, ${p.family}): ${p.description}`).join('\n')
}