import {
  ensurePealCredentialsLoaded,
  isPealCredentialConfigured,
  pealCredentialSetupHint,
  resolvePealCredential,
} from '@/lib/credentials'

export type TtsProvider = 'openai' | 'groq'

const PROVIDER_CREDENTIAL: Record<TtsProvider, 'OPENAI_API_KEY' | 'GROQ_API_KEY'> = {
  openai: 'OPENAI_API_KEY',
  groq: 'GROQ_API_KEY',
}

export function resolveTtsApiKey(provider: TtsProvider): string | undefined {
  ensurePealCredentialsLoaded()
  return resolvePealCredential(PROVIDER_CREDENTIAL[provider])
}

export function isTtsProviderConfigured(provider: TtsProvider): boolean {
  return isPealCredentialConfigured(PROVIDER_CREDENTIAL[provider])
}

export function ttsProviderForModel(model: string): TtsProvider {
  return model.startsWith('playai-') ? 'groq' : 'openai'
}

export function providerSetupHint(provider: TtsProvider): string {
  return pealCredentialSetupHint(PROVIDER_CREDENTIAL[provider])
}