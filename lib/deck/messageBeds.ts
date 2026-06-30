export type MessageBedId =
  | 'success'
  | 'error'
  | 'notification'
  | 'message'
  | 'mention'
  | 'loading'

export interface MessageBedPreset {
  id: MessageBedId
  label: string
  /** Peal built-in sound family this bed pairs with. */
  pealSound: string
  musicPrompt: string
  suggestedSpeech: string
  /** Soft dispatcher FX works well under spoken UI. */
  suggestedFxPresetId: string
}

export const MESSAGE_BED_PRESETS: MessageBedPreset[] = [
  {
    id: 'success',
    label: 'Success glow',
    pealSound: 'success',
    musicPrompt:
      'Warm ambient UI success bed, soft major pads, gentle upward lift, 6 seconds, minimal, no vocals, sits under a spoken "saved" confirmation',
    suggestedSpeech: 'Saved successfully.',
    suggestedFxPresetId: 'chill-dispatcher',
  },
  {
    id: 'error',
    label: 'Error tension',
    pealSound: 'error',
    musicPrompt:
      'Low subtle error underscore, minor key, tight muted pulse, 5 seconds, restrained tension, no vocals, background for spoken failure message',
    suggestedSpeech: 'Something went wrong. Please try again.',
    suggestedFxPresetId: 'urgent-dispatcher',
  },
  {
    id: 'notification',
    label: 'Notification hum',
    pealSound: 'notification',
    musicPrompt:
      'Neutral notification bed, soft synth hum, light rhythmic pulse, 5 seconds, friendly but unobtrusive, no vocals',
    suggestedSpeech: 'You have a new notification.',
    suggestedFxPresetId: 'chill-dispatcher',
  },
  {
    id: 'message',
    label: 'Message pad',
    pealSound: 'message',
    musicPrompt:
      'Calm conversational background, warm mid-range pads, very subtle movement, 7 seconds, intimate UI message feel, no vocals',
    suggestedSpeech: 'New message received.',
    suggestedFxPresetId: 'chill-dispatcher',
  },
  {
    id: 'mention',
    label: 'Mention sparkle',
    pealSound: 'mention',
    musicPrompt:
      'Light attention bed for mentions, soft bright arpeggio texture, short 4 second loop feel, playful not harsh, no vocals',
    suggestedSpeech: 'You were mentioned.',
    suggestedFxPresetId: 'chill-dispatcher',
  },
  {
    id: 'loading',
    label: 'Loading pulse',
    pealSound: 'loading',
    musicPrompt:
      'Gentle loading loop bed, soft pulsing synth, neutral key, 8 seconds, patient waiting-room energy, no vocals, under progress voiceover',
    suggestedSpeech: 'Loading, please wait.',
    suggestedFxPresetId: '',
  },
]

export function getMessageBedPreset(id: MessageBedId) {
  return MESSAGE_BED_PRESETS.find((bed) => bed.id === id) ?? null
}