import type { VoiceFxParams } from '@voxd/client/fx'

export type DeckClipSource = 'tts' | 'music' | 'sfx'

export const DECK_PADS_PER_BANK = 8
export const DECK_BANK_COUNT = 4

/** @deprecated alias */
export type PealVoiceTake = DeckClip

export interface DeckClip {
  id: string
  source: DeckClipSource
  bank: number
  slot: number
  label: string
  script?: string
  prompt?: string
  model: string
  voice?: string
  speed?: number
  filename: string
  createdAt: string
  mimeType: string
  audioBase64: string
  audioUrl: string
  fxPresetId: string
  fxParamsOverride?: Partial<VoiceFxParams>
  /** Links bed + speech clips from the same message preset. */
  messageBedId?: string
}

export interface PealVoiceModel {
  id: string
  name: string
  provider: string
  tier: string
  envKey: 'OPENAI_API_KEY' | 'GROQ_API_KEY'
}

export type DeckCaptureSource = 'tts' | 'music' | 'sfx'
export type DeckSfxType = 'click' | 'tone' | 'noise' | 'sweep'