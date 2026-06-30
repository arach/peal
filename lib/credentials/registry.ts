import type { KnownProvider } from '@earendil-works/pi-ai'

export type PealCredentialFeature =
  | 'ai-studio'
  | 'music-generation'
  | 'tts'
  | 'tts-fallback'
  | 'voice-legacy'

export interface PealCredentialDef {
  /** Primary environment variable name (also returned by /api/check-providers). */
  envVar: string
  /** pi-ai provider id for getEnvApiKey fallback. */
  piProvider?: KnownProvider | string
  /** Optional alternate env var names (checked after primary). */
  aliases?: string[]
  features: PealCredentialFeature[]
  label: string
}

/**
 * Single registry for Peal server credentials.
 * Add new keys here — routes and status checks read from this list.
 */
export const PEAL_CREDENTIALS = {
  MINIMAX_API_KEY: {
    envVar: 'MINIMAX_API_KEY',
    piProvider: 'minimax',
    features: ['ai-studio', 'music-generation'],
    label: 'Minimax (AI Sound Designer + Music)',
  },
  OPENAI_API_KEY: {
    envVar: 'OPENAI_API_KEY',
    piProvider: 'openai',
    features: ['tts'],
    label: 'OpenAI (TTS)',
  },
  GROQ_API_KEY: {
    envVar: 'GROQ_API_KEY',
    piProvider: 'groq',
    features: ['tts', 'tts-fallback'],
    label: 'Groq (PlayAI TTS)',
  },
  ELEVENLABS_API_KEY: {
    envVar: 'ELEVENLABS_API_KEY',
    features: ['voice-legacy'],
    label: 'ElevenLabs',
  },
  FAL_API_KEY: {
    envVar: 'FAL_API_KEY',
    features: ['voice-legacy'],
    label: 'Fal',
  },
  HUGGINGFACE_API_KEY: {
    envVar: 'HUGGINGFACE_API_KEY',
    aliases: ['HF_TOKEN'],
    features: ['voice-legacy'],
    label: 'Hugging Face',
  },
} as const satisfies Record<string, PealCredentialDef>

export type PealCredentialId = keyof typeof PEAL_CREDENTIALS

export const PEAL_CREDENTIAL_IDS = Object.keys(PEAL_CREDENTIALS) as PealCredentialId[]