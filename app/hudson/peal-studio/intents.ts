import type { AppIntent } from 'hudsonkit'

export const pealStudioIntents: AppIntent[] = [
  {
    commandId: 'peal-studio:play',
    title: 'Play Sound',
    description: 'Play the current SFX sound preview.',
    category: 'tool',
    keywords: ['play', 'preview', 'sound', 'transport'],
    shortcut: 'Space',
  },
  {
    commandId: 'peal-studio:pause',
    title: 'Pause Sound',
    description: 'Pause the current sound playback.',
    category: 'tool',
    keywords: ['pause', 'stop', 'transport'],
  },
  {
    commandId: 'peal-studio:open-library',
    title: 'Open Library',
    description: 'Open the sound library or library picker.',
    category: 'navigation',
    keywords: ['library', 'browse', 'sounds', 'open'],
  },
  {
    commandId: 'peal-studio:ai-design',
    title: 'Open AI Design',
    description: 'Open the plain-English sound designer panel.',
    category: 'tool',
    keywords: ['ai', 'design', 'vibe', 'generate', 'sound'],
  },
  {
    commandId: 'peal-studio:switch-voice',
    title: 'Switch to Voice Studio',
    description: 'Switch Peal Studio to text-to-speech without leaving /studio.',
    category: 'view',
    keywords: ['voice', 'tts', 'speech'],
  },
]
