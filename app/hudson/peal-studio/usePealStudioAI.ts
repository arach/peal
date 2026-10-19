'use client'

import { useCallback, useMemo, useState } from 'react'
import type { HudsonAIChat } from 'hudsonkit'
import { usePealChat } from '@/lib/ai/usePealChat'
import { useByok, useByokChatTarget } from '@/lib/useByok'
import type { Sound } from '@/store/soundStore'
import { soundFromPatch } from '@/lib/ai/soundProposal'
import { sfxPatchSchema, type SfxPatch } from '@/lib/sfx/patch'
import { useCompositionStore } from '@/store/compositionStore'
import type { PealSfxSummary } from './Provider'

export interface PealStudioAIActivity {
  id: string
  tool: string
  summary: string
  timestamp: number
}

export interface UsePealStudioAIOptions {
  sfxSummary: PealSfxSummary
  /** Render + load a composition in place (replaces the current sound). */
  onApplyComposition: (sound: Sound) => void | Promise<void>
  onOpenLibrary: () => void
  onFocusAIDesign?: () => void
  provider?: string
  model?: string
}

export type UsePealStudioAIResult = {
  chat: HudsonAIChat
  activity: PealStudioAIActivity[]
  composition: SfxPatch | null
  canBack: boolean
  canForward: boolean
  position: { index: number; total: number }
  stepComposition: (delta: -1 | 1) => Promise<void>
  replayComposition: () => Promise<void>
  log: (tool: string, summary: string) => void
}

function nextId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function usePealStudioAI({
  sfxSummary,
  onApplyComposition,
  onOpenLibrary,
  onFocusAIDesign,
  provider,
  model,
}: UsePealStudioAIOptions): UsePealStudioAIResult {
  const [activity, setActivity] = useState<PealStudioAIActivity[]>([])
  const history = useCompositionStore((s) => s.history)
  const index = useCompositionStore((s) => s.index)
  const composition = history[index] ?? null
  const byok = useByok()

  // BYOK: visitor-selected provider+model wins; else any stored key's provider;
  // else the server-env default (openai).
  const target = useByokChatTarget(provider ?? 'openai')
  const resolvedProvider = provider ?? target.provider
  const resolvedModel = model ?? target.model

  const log = useCallback((tool: string, summary: string) => {
    setActivity((prev) => [...prev.slice(-9), { id: nextId(), tool, summary, timestamp: Date.now() }])
  }, [])

  const context = useMemo(() => ({
    currentTool: 'sfx' as const,
    soundId: sfxSummary.soundId,
    soundType: sfxSummary.soundType,
    isPlaying: sfxSummary.isPlaying,
    composition,
    ...(byok.hasAny ? { byok: byok.keys } : {}),
  }), [sfxSummary.soundId, sfxSummary.soundType, sfxSummary.isPlaying, composition, byok.hasAny, byok.keys])

  const apply = useCallback(async (patch: SfxPatch) => {
    await onApplyComposition(soundFromPatch(patch))
  }, [onApplyComposition])

  const chat = usePealChat({
    toolset: 'peal-studio',
    chatId: 'peal-studio-ai-design',
    context,
    provider: resolvedProvider,
    model: resolvedModel,
    agentTrace: {
      source: 'peal-studio-ai-design',
      appId: 'peal-studio',
      appName: 'Sound Studio',
    },
    onToolCall: async (name, args) => {
      try {
        switch (name) {
          case 'compose_sound': {
            const parsed = sfxPatchSchema.safeParse(args)
            if (!parsed.success) {
              log('compose_sound', 'ignored — invalid patch')
              break
            }
            // Pin a seed so back/forward re-render the exact same take.
            const patch = { ...parsed.data, seed: parsed.data.seed ?? Math.floor(Math.random() * 1e6) }
            useCompositionStore.getState().push(patch)
            log('compose_sound', patch.summary)
            await apply(patch)
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

  const stepComposition = useCallback(async (delta: -1 | 1) => {
    const patch = useCompositionStore.getState().go(delta)
    if (patch) await apply(patch)
  }, [apply])

  const replayComposition = useCallback(async () => {
    if (composition) await apply(composition)
  }, [apply, composition])

  return {
    chat,
    activity,
    composition,
    canBack: index > 0,
    canForward: index >= 0 && index < history.length - 1,
    position: { index, total: history.length },
    stepComposition,
    replayComposition,
    log,
  }
}