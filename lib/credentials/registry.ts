import type { KnownProvider } from '@earendil-works/pi-ai'

export type PealCredentialFeature =
  | 'ai-studio'
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
  OPENAI_API_KEY: {
    envVar: 'OPENAI_API_KEY',
    piProvider: 'openai',
    features: ['ai-studio', 'tts'],
    label: 'OpenAI (TTS)',
  },
  GROQ_API_KEY: {
    envVar: 'GROQ_API_KEY',
    piProvider: 'groq',
    features: ['ai-studio', 'tts', 'tts-fallback'],
    label: 'Groq (PlayAI TTS)',
  },
  ANTHROPIC_API_KEY: {
    envVar: 'ANTHROPIC_API_KEY',
    aliases: ['ANTHROPIC_OAUTH_TOKEN'],
    piProvider: 'anthropic',
    features: ['ai-studio'],
    label: 'Anthropic (AI Design)',
  },
  GEMINI_API_KEY: {
    envVar: 'GEMINI_API_KEY',
    piProvider: 'google',
    features: ['ai-studio'],
    label: 'Google Gemini (AI Design)',
  },
  OPENROUTER_API_KEY: {
    envVar: 'OPENROUTER_API_KEY',
    piProvider: 'openrouter',
    features: ['ai-studio'],
    label: 'OpenRouter (AI Design)',
  },
  XAI_API_KEY: {
    envVar: 'XAI_API_KEY',
    piProvider: 'xai',
    features: ['ai-studio'],
    label: 'xAI (AI Design)',
  },
  DEEPSEEK_API_KEY: {
    envVar: 'DEEPSEEK_API_KEY',
    piProvider: 'deepseek',
    features: ['ai-studio'],
    label: 'DeepSeek (AI Design)',
  },
  OPENCODE_API_KEY: {
    envVar: 'OPENCODE_API_KEY',
    piProvider: 'opencode',
    features: ['ai-studio'],
    label: 'Opencode (AI Design)',
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