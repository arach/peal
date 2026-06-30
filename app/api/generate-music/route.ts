import { type NextRequest, NextResponse } from 'next/server'
import {
  isPealCredentialConfigured,
  pealCredentialSetupHint,
  resolvePealCredential,
} from '@/lib/credentials'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, isInstrumental } = await request.json()

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!isPealCredentialConfigured('MINIMAX_API_KEY')) {
      return NextResponse.json(
        {
          error: 'Minimax API key not configured',
          envVar: 'MINIMAX_API_KEY',
          hint: pealCredentialSetupHint('MINIMAX_API_KEY'),
        },
        { status: 500 },
      )
    }

    const apiKey = resolvePealCredential('MINIMAX_API_KEY')!
    const musicModel = model || 'music-2.6-free'

    const response = await fetch('https://api.minimax.io/v1/music_generation', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: musicModel,
        prompt: prompt.trim(),
        is_instrumental: isInstrumental !== false,
        output_format: 'hex',
        audio_setting: {
          sample_rate: 44100,
          bitrate: 256000,
          format: 'mp3',
        },
      }),
    })

    const payload = await response.json().catch(() => ({})) as {
      data?: { audio?: string; status?: number }
      base_resp?: { status_code?: number; status_msg?: string }
      extra_info?: { music_duration?: number }
    }

    const statusCode = payload.base_resp?.status_code ?? (response.ok ? 0 : response.status)
    if (!response.ok || statusCode !== 0) {
      throw new Error(
        payload.base_resp?.status_msg
        || `Minimax music API error (${response.status})`,
      )
    }

    const hexAudio = payload.data?.audio
    if (!hexAudio) {
      throw new Error('Minimax returned no audio data')
    }

    const audioBase64 = Buffer.from(hexAudio, 'hex').toString('base64')

    return NextResponse.json({
      audio: audioBase64,
      mimeType: 'audio/mpeg',
      format: 'mp3',
      durationMs: payload.extra_info?.music_duration ?? null,
      model: musicModel,
    })
  } catch (error) {
    console.error('Music generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate music'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}