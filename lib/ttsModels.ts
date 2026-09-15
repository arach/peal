/** Client-safe TTS provider helpers — no credential/env imports. */

export type TtsProvider = 'openai' | 'groq'

export function ttsProviderForModel(model: string): TtsProvider {
  return model.startsWith('playai-') ? 'groq' : 'openai'
}
