import {
  ensurePealCredentialsLoaded,
  isPealCredentialConfigured,
  pealCredentialSetupHint,
  resolvePealCredential,
} from '@/lib/credentials'
import { type TtsProvider, ttsProviderForModel } from '@/lib/ttsModels'

export type { TtsProvider }
export { ttsProviderForModel }

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

export function providerSetupHint(provider: TtsProvider): string {
  return pealCredentialSetupHint(PROVIDER_CREDENTIAL[provider])
}