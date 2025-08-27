import { NextResponse } from 'next/server'

export async function GET() {
  // Check which API keys are configured (without exposing the actual keys)
  const providers = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY,
    FAL_API_KEY: !!process.env.FAL_API_KEY,
    HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
  }

  return NextResponse.json(providers)
}