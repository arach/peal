'use client'

/**
 * TTS generation that works on both runtimes.
 *
 * Hosted app: POST /api/generate-tts (server env keys + BYOK override).
 * Static export: OpenAI's speech endpoint is called directly with the
 * visitor's BYOK key (CORS-enabled — works on GitHub Pages with no backend).
 * Groq PlayAI voices stay hosted-only since Groq is not a BYOK provider.
 */
import { sanitizeByok, type ByokKeys } from '@/lib/byok'
import { isPealStaticRuntime } from './runtime'
import { ttsProviderForModel } from '@/lib/ttsModels'

export interface GenerateSpeechInput {
  text: string
  model?: string
  voice?: string
  speed?: number
  byok?: ByokKeys
}

export interface GenerateSpeechResult {
  audio: string
  mimeType: string
  format: string
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function directOpenAiTts(
  apiKey: string,
  { text, model, voice, speed }: GenerateSpeechInput,
): Promise<GenerateSpeechResult> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'tts-1',
      input: text,
      voice: voice || 'alloy',
      speed: speed || 1.0,
      response_format: 'mp3',
    }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `OpenAI TTS API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`,
    )
  }
  return { audio: bufferToBase64(await response.arrayBuffer()), mimeType: 'audio/mpeg', format: 'mp3' }
}

export async function generateSpeech(input: GenerateSpeechInput): Promise<GenerateSpeechResult> {
  const byok = sanitizeByok(input.byok)

  if (isPealStaticRuntime()) {
    if (ttsProviderForModel(input.model ?? 'tts-1') !== 'openai') {
      throw new Error(
        'PlayAI voices need the hosted Peal app — pick an OpenAI voice on the static build.',
      )
    }
    const apiKey = byok.openai
    if (!apiKey) {
      throw new Error(
        'OpenAI key required — add one via the API Keys dialog (keys stay in this browser).',
      )
    }
    return directOpenAiTts(apiKey, input)
  }

  const response = await fetch('/api/generate-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, byok }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const parts = [errorData.error || 'Speech generation failed', errorData.hint].filter(Boolean)
    throw new Error(parts.join(' '))
  }
  return response.json() as Promise<GenerateSpeechResult>
}
