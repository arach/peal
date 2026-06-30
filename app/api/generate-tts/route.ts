import { type NextRequest, NextResponse } from 'next/server'
import {
  isTtsProviderConfigured,
  providerSetupHint,
  resolveTtsApiKey,
  ttsProviderForModel,
} from '@/lib/ttsCredentials'

export async function POST(request: NextRequest) {
  try {
    const { text, model, voice, speed } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const provider = ttsProviderForModel(model ?? 'tts-1')

    if (!isTtsProviderConfigured(provider)) {
      const envVar = provider === 'groq' ? 'GROQ_API_KEY' : 'OPENAI_API_KEY'
      return NextResponse.json(
        {
          error: `${provider === 'groq' ? 'Groq' : 'OpenAI'} API key not configured`,
          provider,
          envVar,
          hint: providerSetupHint(provider),
        },
        { status: 500 },
      )
    }

    const apiKey = resolveTtsApiKey(provider)!

    if (provider === 'groq') {
      const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          input: text,
          voice: voice || 'Fritz-PlayAI',
          response_format: 'wav',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Groq TTS API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`,
        )
      }

      const audioBuffer = await response.arrayBuffer()
      const audioBase64 = Buffer.from(audioBuffer).toString('base64')

      return NextResponse.json({
        audio: audioBase64,
        mimeType: 'audio/wav',
        format: 'wav',
      })
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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
        `OpenAI TTS API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`,
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')

    return NextResponse.json({
      audio: audioBase64,
      mimeType: 'audio/mpeg',
      format: 'mp3',
    })
  } catch (error) {
    console.error('TTS generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate speech'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}