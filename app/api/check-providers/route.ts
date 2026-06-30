import { NextResponse } from 'next/server'
import { isTtsProviderConfigured } from '@/lib/ttsCredentials'

export async function GET() {
  const providers = {
    OPENAI_API_KEY: isTtsProviderConfigured('openai'),
    GROQ_API_KEY: isTtsProviderConfigured('groq'),
    ELEVENLABS_API_KEY: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
    FAL_API_KEY: Boolean(process.env.FAL_API_KEY?.trim()),
    HUGGINGFACE_API_KEY: Boolean(process.env.HUGGINGFACE_API_KEY?.trim()),
    MINIMAX_API_KEY: Boolean(process.env.MINIMAX_API_KEY?.trim()),
  }

  return NextResponse.json(providers)
}