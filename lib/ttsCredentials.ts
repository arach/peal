import { getEnvApiKey } from '@earendil-works/pi-ai'

export type TtsProvider = 'openai' | 'groq'

const PROVIDER_ENV: Record<TtsProvider, string> = {
  openai: 'OPENAI_API_KEY',
  groq: 'GROQ_API_KEY',
}

/** Resolve TTS API keys — process.env first, then pi-ai provider mapping. */
export function resolveTtsApiKey(provider: TtsProvider): string | undefined {
  const envVar = PROVIDER_ENV[provider]
  const fromEnv = process.env[envVar]?.trim()
  if (fromEnv) return fromEnv
  return getEnvApiKey(provider)?.trim() || undefined
}

export function isTtsProviderConfigured(provider: TtsProvider): boolean {
  return Boolean(resolveTtsApiKey(provider))
}

export function ttsProviderForModel(model: string): TtsProvider {
  return model.startsWith('playai-') ? 'groq' : 'openai'
}

export function providerSetupHint(provider: TtsProvider): string {
  const envVar = PROVIDER_ENV[provider]
  return `Add ${envVar} to .env.local in the Peal repo root, then restart the dev server (port 3001).`
}