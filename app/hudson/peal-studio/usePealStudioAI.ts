'use client'

import { useCallback, useMemo, useState } from 'react'
import { useHudsonAI } from 'hudsonkit'
import type { Sound } from '@/store/soundStore'
import { coerceProposeSoundInput, type ProposeSoundInput } from '@/lib/ai/soundProposal'
import type { PealSfxSummary } from './Provider'

export interface PealStudioAIActivity {
  id: string
  tool: string
  summary: string
  timestamp: number
}

export interface UsePealStudioAIOptions {
  sfxSummary: PealSfxSummary
  onProposeSound: (input: ProposeSoundInput) => Promise<Sound | null>
  onOpenLibrary: () => void
  onFocusAIDesign?: () => void
  provider?: string
  model?: string
}

export type UsePealStudioAIResult = {
  chat: ReturnType<typeof useHudsonAI>
  activity: PealStudioAIActivity[]
  lastProposal: { input: ProposeSoundInput; sound: Sound } | null
  clearProposal: () => void
  log: (tool: string, summary: string) => void
}

function nextId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function usePealStudioAI({
  sfxSummary,
  onProposeSound,
  onOpenLibrary,
  onFocusAIDesign,
  provider = 'minimax',
  model,
}: UsePealStudioAIOptions): UsePealStudioAIResult {
  const [activity, setActivity] = useState<PealStudioAIActivity[]>([])
  const [lastProposal, setLastProposal] = useState<{ input: ProposeSoundInput; sound: Sound } | null>(null)

  const log = useCallback((tool: string, summary: string) => {
    setActivity((prev) => [...prev.slice(-9), { id: nextId(), tool, summary, timestamp: Date.now() }])
  }, [])

  const context = useMemo(() => ({
    currentTool: 'sfx' as const,
    soundId: sfxSummary.soundId,
    soundType: sfxSummary.soundType,
    isPlaying: sfxSummary.isPlaying,
    prompt: lastProposal?.input.summary,
  }), [sfxSummary.soundId, sfxSummary.soundType, sfxSummary.isPlaying, lastProposal?.input.summary])

  const chat = useHudsonAI({
    toolset: 'peal-studio',
    chatId: 'peal-studio-ai-design',
    context,
    provider,
    model,
    agentTrace: {
      source: 'peal-studio-ai-design',
      appId: 'peal-studio',
      appName: 'Sound Studio',
    },
    onToolCall: async (name, args) => {
      try {
        switch (name) {
          case 'propose_sound': {
            const input = coerceProposeSoundInput(args as Record<string, unknown>)
            if (!input) {
              log('propose_sound', 'ignored — invalid parameters')
              break
            }
            log('propose_sound', input.summary)
            const sound = await onProposeSound(input)
            if (sound) setLastProposal({ input, sound })
            break
          }
          case 'open_library':
            onOpenLibrary()
            log('open_library', 'Opened library')
            break
          case 'open_ai_design':
            onFocusAIDesign?.()
            log('open_ai_design', 'Focused AI Design')
            break
          default:
            log(name, 'unknown tool')
        }
      } catch (err) {
        log('error', err instanceof Error ? err.message : String(err))
      }
    },
  })

  const clearProposal = useCallback(() => setLastProposal(null), [])

  return {
    chat,
    activity,
    lastProposal,
    clearProposal,
    log,
  }
}