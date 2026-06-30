import type { PealVoiceModel } from './types'

export const PEAL_VOICE_MODELS: PealVoiceModel[] = [
  { id: 'tts-1', name: 'OpenAI TTS-1', provider: 'OpenAI', tier: 'Standard', envKey: 'OPENAI_API_KEY' },
  { id: 'tts-1-hd', name: 'OpenAI TTS-1 HD', provider: 'OpenAI', tier: 'Premium', envKey: 'OPENAI_API_KEY' },
  { id: 'playai-tts', name: 'Groq PlayAI TTS (English)', provider: 'Groq', tier: 'Fast', envKey: 'GROQ_API_KEY' },
  { id: 'playai-tts-arabic', name: 'Groq PlayAI TTS (Arabic)', provider: 'Groq', tier: 'Fast', envKey: 'GROQ_API_KEY' },
]

export const PEAL_VOICE_OPTIONS: Record<string, string[]> = {
  'tts-1': ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
  'tts-1-hd': ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
  'playai-tts': [
    'Fritz-PlayAI', 'Arista-PlayAI', 'Atlas-PlayAI', 'Basil-PlayAI', 'Briggs-PlayAI',
    'Calum-PlayAI', 'Celeste-PlayAI', 'Cheyenne-PlayAI', 'Chip-PlayAI', 'Cillian-PlayAI',
    'Deedee-PlayAI', 'Gail-PlayAI', 'Indigo-PlayAI', 'Mamaw-PlayAI', 'Mason-PlayAI',
    'Mikail-PlayAI', 'Mitch-PlayAI', 'Quinn-PlayAI', 'Thunder-PlayAI',
  ],
  'playai-tts-arabic': ['Ahmad-PlayAI', 'Amira-PlayAI', 'Hani-PlayAI', 'Layla-PlayAI'],
}