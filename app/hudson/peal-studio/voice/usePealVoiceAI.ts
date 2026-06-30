'use client'

import { useCallback, useMemo, useState } from 'react'
import { useHudsonAI } from 'hudsonkit'
import type { VoiceFxParams } from '@voxd/client/fx'
import { countMixerKnobTweaks } from './fxKnobs'
import { PEAL_VOICE_OPTIONS } from './constants'
import { usePealVoice } from './PealVoiceProvider'
import { voiceFxLabel } from './voiceFx'
import {
  buildLastEdit,
  mixerAfterGenre,
  mixerAfterReset,
  mixerAfterTweak,
  type PealVoiceLastEdit,
} from './voiceAiEditDiff'

export type { PealVoiceLastEdit, VoiceAiKnobChange } from './voiceAiEditDiff'

export type EditCompareSide = 'before' | 'after'

export interface PealVoiceAIHighlights {
  knobKeys: Set<keyof VoiceFxParams>
  genreIdAfter: string
  genreChanged: boolean
  compareSide: EditCompareSide
}

export interface PealVoiceAIActivity {
  id: string
  tool: string
  summary: string
  timestamp: number
}

function nextId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export type UsePealVoiceAIResult = {
  chat: ReturnType<typeof useHudsonAI>
  activity: PealVoiceAIActivity[]
  lastEdit: PealVoiceLastEdit | null
  lastEditExpanded: boolean
  compareSide: EditCompareSide
  previewEditCompare: (side: EditCompareSide) => void
  toggleLastEdit: () => void
  aiHighlights: PealVoiceAIHighlights | null
  clearLastEdit: () => void
  availableVoices: string[]
  log: (tool: string, summary: string) => void
}

export function usePealVoiceAI(provider = 'openai', model?: string): UsePealVoiceAIResult {
  const voice = usePealVoice()
  const [activity, setActivity] = useState<PealVoiceAIActivity[]>([])
  const [lastEdit, setLastEdit] = useState<PealVoiceLastEdit | null>(null)
  const [lastEditExpanded, setLastEditExpanded] = useState(false)
  const [compareSide, setCompareSide] = useState<EditCompareSide>('after')

  const log = useCallback((tool: string, summary: string) => {
    setActivity((prev) => [...prev.slice(-9), { id: nextId(), tool, summary, timestamp: Date.now() }])
  }, [])

  const commitEdit = useCallback((edit: PealVoiceLastEdit) => {
    setLastEdit(edit)
    setLastEditExpanded(true)
    setCompareSide('after')
  }, [])

  const clearLastEdit = useCallback(() => {
    setLastEdit(null)
    setLastEditExpanded(false)
    setCompareSide('after')
  }, [])

  const toggleLastEdit = useCallback(() => {
    setLastEditExpanded((prev) => !prev)
  }, [])

  const previewEditCompare = useCallback((side: EditCompareSide) => {
    if (!lastEdit) return
    const state = side === 'before' ? lastEdit.mixerBefore : lastEdit.mixerAfter
    setCompareSide(side)
    voice.previewClipWithMixerState(state, lastEdit.clipId)
  }, [lastEdit, voice])

  const currentMixer = useCallback(() => ({
    genreId: voice.mixerGenreId,
    knobOverrides: voice.mixerKnobOverrides,
  }), [voice.mixerGenreId, voice.mixerKnobOverrides])

  const mixerTweakCount = useMemo(
    () => countMixerKnobTweaks({ genreId: voice.mixerGenreId, knobOverrides: voice.mixerKnobOverrides }),
    [voice.mixerGenreId, voice.mixerKnobOverrides],
  )

  const context = useMemo(() => ({
    selectedModel: voice.selectedModel,
    selectedVoice: voice.selectedVoice,
    speed: voice.speed,
    defaultFxPresetId: voice.defaultFxPresetId,
    selectedTakeId: voice.selectedTakeId,
    selectedTakeLabel: voice.selectedTake?.label ?? null,
    selectedTakeSource: voice.selectedTake?.source ?? null,
    selectedTakeScript: voice.selectedTake?.script ?? voice.selectedTake?.prompt ?? null,
    selectedTakeFxPresetId: voice.selectedTake?.fxPresetId ?? null,
    mixerGenreId: voice.mixerGenreId,
    mixerKnobTweakCount: mixerTweakCount,
    takeCount: voice.takes.length,
    activeBank: voice.activeBank,
    captureSource: voice.captureSource,
    script: voice.script,
    musicPrompt: voice.musicPrompt,
    isGenerating: voice.isGenerating,
    currentlyPlayingId: voice.currentlyPlayingId,
  }), [
    voice.selectedModel,
    voice.selectedVoice,
    voice.speed,
    voice.defaultFxPresetId,
    voice.selectedTakeId,
    voice.selectedTake,
    voice.mixerGenreId,
    mixerTweakCount,
    voice.takes.length,
    voice.activeBank,
    voice.captureSource,
    voice.script,
    voice.musicPrompt,
    voice.isGenerating,
    voice.currentlyPlayingId,
  ])

  const chat = useHudsonAI({
    toolset: 'peal-voice',
    chatId: 'peal-voice-ai-design',
    context,
    provider,
    model,
    agentTrace: {
      source: 'peal-voice-ai-design',
      appId: 'peal-studio',
      appName: 'Voice Studio',
    },
    onToolCall: async (name, args) => {
      try {
        const record = args as Record<string, unknown>
        switch (name) {
          case 'apply_fx_preset': {
            const presetId = String(record.presetId ?? '')
            const target = (record.target as 'selected' | 'default' | 'take') ?? 'selected'
            const takeId = typeof record.takeId === 'string' ? record.takeId : undefined

            if (target === 'default') {
              voice.setDefaultFxPresetId(presetId)
              log('apply_fx_preset', `default genre → ${presetId || 'dry'}`)
              break
            }

            const clipId = target === 'take' && takeId
              ? takeId
              : voice.selectedTakeId ?? voice.takes[0]?.id

            if (!clipId) {
              log('apply_fx_preset', 'ignored — no clip')
              break
            }

            const beforeState = currentMixer()
            const clip = voice.takes.find((t) => t.id === clipId) ?? voice.selectedTake

            if (clipId === voice.selectedTakeId) {
              voice.loadMixerGenre(presetId)
              commitEdit(buildLastEdit({
                summary: `Loaded ${voiceFxLabel(presetId)} genre`,
                tool: 'apply_fx_preset',
                beforeState,
                afterState: mixerAfterGenre(presetId),
                appliedGenreId: presetId,
                clipLabel: clip?.label,
                clipId,
                clip,
              }))
            } else {
              voice.setTakeFxPreset(clipId, presetId)
            }
            log('apply_fx_preset', `${voiceFxLabel(presetId)} → ${clipId}`)
            break
          }
          case 'tweak_fx': {
            const takeId = typeof record.takeId === 'string'
              ? record.takeId
              : voice.selectedTakeId ?? voice.takes[0]?.id

            if (!takeId) {
              log('tweak_fx', 'ignored — no clip')
              break
            }

            const beforeState = currentMixer()
            const clip = voice.takes.find((t) => t.id === takeId) ?? voice.selectedTake

            if (record.clearOverrides === true) {
              if (takeId === voice.selectedTakeId) {
                voice.resetMixerKnobs()
                commitEdit(buildLastEdit({
                  summary: 'Reset strip to genre recipe',
                  tool: 'reset',
                  beforeState,
                  afterState: mixerAfterReset(beforeState),
                  clipLabel: clip?.label,
                  clipId: takeId,
                  clip,
                }))
              } else {
                voice.setTakeFxOverride(takeId, undefined)
              }
              log('tweak_fx', `reset strip on ${takeId}`)
              break
            }

            const params = record.params as Partial<VoiceFxParams> | undefined
            if (!params || typeof params !== 'object') {
              log('tweak_fx', 'ignored — invalid params')
              break
            }

            if (takeId === voice.selectedTakeId) {
              voice.setMixerKnob(params)
              const labels = Object.keys(params).join(', ')
              commitEdit(buildLastEdit({
                summary: `Tweaked ${labels}`,
                tool: 'tweak_fx',
                beforeState,
                afterState: mixerAfterTweak(beforeState, params),
                appliedParams: params,
                clipLabel: clip?.label,
                clipId: takeId,
                clip,
              }))
            } else {
              const take = voice.takes.find((t) => t.id === takeId)
              voice.setTakeFxOverride(takeId, { ...(take?.fxParamsOverride ?? {}), ...params })
            }
            log('tweak_fx', `${Object.keys(params).join(', ')} on ${takeId}`)
            break
          }
          case 'set_script': {
            const text = String(record.text ?? '').trim()
            if (!text) break
            voice.setScript(text)
            log('set_script', text.slice(0, 48))
            break
          }
          case 'set_voice_defaults': {
            if (typeof record.model === 'string') voice.setSelectedModel(record.model)
            if (typeof record.voice === 'string') voice.setSelectedVoice(record.voice)
            if (typeof record.speed === 'number') voice.setSpeed(record.speed)
            if (typeof record.defaultFxPresetId === 'string') {
              voice.setDefaultFxPresetId(record.defaultFxPresetId)
            }
            log('set_voice_defaults', 'updated generation defaults')
            break
          }
          case 'set_music_prompt': {
            const text = String(record.text ?? '').trim()
            if (!text) break
            voice.setMusicPrompt(text)
            voice.setCaptureSource('music')
            log('set_music_prompt', text.slice(0, 48))
            break
          }
          case 'generate_voice': {
            const text = typeof record.text === 'string' ? record.text.trim() : ''
            if (!text && !voice.script.trim()) {
              log('generate_voice', 'ignored — empty script')
              break
            }
            if (text) voice.setScript(text)
            voice.setCaptureSource('tts')
            log('generate_voice', 'capturing speech…')
            await voice.generateFromScript(text || undefined)
            break
          }
          case 'generate_sfx': {
            const summary = typeof record.summary === 'string' ? record.summary.trim() : ''
            if (!summary && !voice.sfxBrief.trim()) {
              log('generate_sfx', 'ignored — empty brief')
              break
            }
            if (summary) voice.setSfxBrief(summary)
            if (typeof record.type === 'string') voice.setSfxType(record.type as 'click' | 'tone' | 'noise' | 'sweep')
            if (typeof record.duration === 'number') voice.setSfxDuration(record.duration)
            voice.setCaptureSource('sfx')
            log('generate_sfx', 'capturing one-shot…')
            await voice.generateSfx(summary || undefined)
            break
          }
          case 'generate_music': {
            const prompt = typeof record.prompt === 'string' ? record.prompt.trim() : ''
            if (!prompt && !voice.musicPrompt.trim()) {
              log('generate_music', 'ignored — empty prompt')
              break
            }
            if (prompt) voice.setMusicPrompt(prompt)
            voice.setCaptureSource('music')
            log('generate_music', 'capturing instrumental…')
            await voice.generateMusic(prompt || undefined)
            break
          }
          case 'preview_clip': {
            const takeId = typeof record.takeId === 'string' ? record.takeId : undefined
            voice.previewClipThroughMixer(takeId)
            log('preview_clip', takeId ?? 'selected')
            break
          }
          default:
            log(name, 'unknown tool')
        }
      } catch (err) {
        log('error', err instanceof Error ? err.message : String(err))
      }
    },
  })

  const availableVoices = PEAL_VOICE_OPTIONS[voice.selectedModel] ?? []

  const aiHighlights = useMemo(() => {
    if (!lastEditExpanded || !lastEdit) return null
    const activeGenreId = compareSide === 'before'
      ? lastEdit.genreIdBefore
      : lastEdit.genreIdAfter
    return {
      knobKeys: new Set(lastEdit.knobChanges.map((change) => change.key)),
      genreIdAfter: activeGenreId,
      genreChanged: lastEdit.genreChanged,
      compareSide,
    }
  }, [compareSide, lastEdit, lastEditExpanded])

  return {
    chat,
    activity,
    lastEdit,
    lastEditExpanded,
    compareSide,
    previewEditCompare,
    toggleLastEdit,
    aiHighlights,
    clearLastEdit,
    availableVoices,
    log,
  }
}