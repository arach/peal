'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHudsonAI } from 'hudsonkit'
import {
  buildMusicLastEdit,
  finalizeMusicLastEdit,
  type PealMusicLastEdit,
} from '@/lib/ai/musicAiFollowUps'
import type { MusicImprovStyle } from '@/lib/ai/musicImprovPrompts'
import type { PealAISession } from '@/lib/ai/pealAiSessions'
import type { MusicLane } from './types'
import { usePealMusic } from './PealMusicProvider'
import {
  defaultImprovLoopState,
  usePealMusicImprovLoop,
  type PealMusicImprovLoopState,
} from './usePealMusicImprovLoop'

export type { PealMusicLastEdit } from '@/lib/ai/musicAiFollowUps'

export interface PealMusicAIActivity {
  id: string
  tool: string
  summary: string
  timestamp: number
}

function nextId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

const PATTERN_ROUTE_TOOLS = new Set([
  'describe_to_pattern',
  'write_pattern',
  'edit_pattern',
  'layer_track',
])

function versionLabelForTool(tool: string): string {
  switch (tool) {
    case 'describe_to_pattern':
      return 'AI pattern'
    case 'write_pattern':
      return 'New pattern'
    case 'edit_pattern':
      return 'AI edit'
    case 'layer_track':
      return 'Layer added'
    default:
      return 'AI change'
  }
}

export function usePealMusicAI(session: PealAISession, options?: { visible?: boolean }) {
  const music = usePealMusic()
  const { config, id: sessionId } = session
  const visible = options?.visible ?? true
  const [activity, setActivity] = useState<PealMusicAIActivity[]>([])
  const [lastEdit, setLastEdit] = useState<PealMusicLastEdit | null>(null)
  const [improvLoop, setImprovLoop] = useState<PealMusicImprovLoopState>(defaultImprovLoopState)
  const [improvTick, setImprovTick] = useState(0)
  const turnCompleteRef = useRef<(() => void) | null>(null)
  const registerTurnComplete = useCallback((handler: (() => void) | null) => {
    turnCompleteRef.current = handler
  }, [])
  const musicRef = useRef(music)
  const lastEditRef = useRef(lastEdit)
  const turnStartPatternRef = useRef('')
  const turnToolsRef = useRef<string[]>([])
  const prevChatStatusRef = useRef<string>('ready')

  musicRef.current = music
  lastEditRef.current = lastEdit

  const log = useCallback((tool: string, summary: string) => {
    setActivity((prev) => [...prev.slice(-9), { id: nextId(), tool, summary, timestamp: Date.now() }])
  }, [])

  const commitEdit = useCallback((input: {
    tool: string
    summary: string
    patternBefore: string
    patternAfter: string
    routed?: boolean
    isDirty?: boolean
  }) => {
    setLastEdit(buildMusicLastEdit({
      tool: input.tool,
      summary: input.summary,
      patternBefore: input.patternBefore,
      patternAfter: input.patternAfter,
      routed: input.routed ?? music.lastRoutedCode.trim() === input.patternAfter.trim(),
      isDirty: input.isDirty ?? input.patternAfter.trim() !== music.lastRoutedCode.trim(),
      tempoCps: music.tempoCps,
      tempoBpm: music.tempoBpm,
    }))
  }, [music.lastRoutedCode, music.tempoCps, music.tempoBpm])

  const clearLastEdit = useCallback(() => {
    setLastEdit(null)
  }, [])

  const finishTurn = useCallback((input?: { isAbort?: boolean; isDisconnect?: boolean; isError?: boolean }) => {
    if (input?.isAbort || input?.isDisconnect || input?.isError) return

    const m = musicRef.current
    const code = m.patternCode.trim()
    if (!code) return

    const hadPatternTool = turnToolsRef.current.some((tool) => PATTERN_ROUTE_TOOLS.has(tool))
    const shouldRoute = m.isPatternDirty || hadPatternTool
    if (!shouldRoute) return

    m.routeToStrudel()
    m.markActiveVersionRouted()

    setLastEdit(finalizeMusicLastEdit(lastEditRef.current, {
      patternBefore: turnStartPatternRef.current,
      patternAfter: code,
      tempoCps: m.tempoCps,
      tempoBpm: m.tempoBpm,
      summary: lastEditRef.current?.summary ?? 'Playing in Strudel',
    }))
    log('auto_route', 'routed to Strudel at end of turn')
  }, [log])

  const setImprovEnabled = useCallback((enabled: boolean) => {
    setImprovLoop((prev) => ({ ...prev, enabled }))
  }, [])

  const setImprovIntervalSec = useCallback((intervalSec: number) => {
    setImprovLoop((prev) => ({ ...prev, intervalSec }))
  }, [])

  const setImprovStyle = useCallback((style: MusicImprovStyle) => {
    setImprovLoop((prev) => ({ ...prev, style }))
  }, [])

  const context = useMemo(() => ({
    patternCode: music.patternCode,
    lane: music.lane,
    engineId: music.engineId,
    tempoCps: music.tempoCps,
    tempoBpm: music.tempoBpm,
    isPlaying: music.isPlaying,
    strudelMountStatus: music.strudelMountStatus,
    isPatternDirty: music.isPatternDirty,
    minimaxAvailable: false,
    musicPrompt: music.musicPrompt,
    improvLoop: improvLoop.enabled
      ? {
          active: true,
          tick: improvTick,
          style: improvLoop.style,
          intervalSec: improvLoop.intervalSec,
        }
      : null,
  }), [
    music.patternCode,
    music.lane,
    music.engineId,
    music.tempoCps,
    music.tempoBpm,
    music.isPlaying,
    music.strudelMountStatus,
    music.isPatternDirty,
    music.musicPrompt,
    improvLoop.enabled,
    improvLoop.style,
    improvLoop.intervalSec,
    improvTick,
  ])

  const chat = useHudsonAI({
    toolset: 'peal-music',
    chatId: `peal-music-ai-${sessionId}`,
    context,
    provider: config.provider,
    model: config.model,
    effort: config.effort,
    mode: config.harness === 'pi-cli' ? 'cli' : 'api',
    agentTrace: {
      source: 'peal-music-ai',
      appId: 'peal-studio',
      appName: 'Music Studio',
    },
    onFinish: (event) => {
      finishTurn({
        isAbort: event.isAbort,
        isDisconnect: event.isDisconnect,
        isError: event.isError,
      })
      turnToolsRef.current = []
      // Keep improv loop alive after errors; only user abort should pause the chain.
      if (!event.isAbort) {
        turnCompleteRef.current?.()
      }
    },
    onToolCall: async (name, args) => {
      try {
        turnToolsRef.current.push(name)
        const record = args as Record<string, unknown>
        const patternBefore = music.patternCode

        switch (name) {
          case 'describe_to_pattern':
          case 'write_pattern':
          case 'edit_pattern':
          case 'layer_track': {
            const code = String(record.code ?? '').trim()
            if (!code) {
              log(name, 'ignored — empty code')
              break
            }
            music.setPatternCode(code)
            music.setLane('live')
            music.pushPatternVersion({
              code,
              label: versionLabelForTool(name),
              source: 'ai',
              tool: name,
              summary: code.slice(0, 64),
            })
            log(name, code.slice(0, 48))
            commitEdit({
              tool: name,
              summary: code.slice(0, 64),
              patternBefore,
              patternAfter: code,
            })
            break
          }
          case 'set_tempo': {
            const cps = typeof record.cps === 'number' ? record.cps : undefined
            const bpm = typeof record.bpm === 'number' ? record.bpm : undefined
            if (cps == null && bpm == null) {
              log('set_tempo', 'ignored — no tempo')
              break
            }
            music.setTempo({ cps, bpm })
            const label = cps != null ? `${cps} cps` : bpm != null ? `${bpm} bpm` : 'updated'
            log('set_tempo', label)
            commitEdit({
              tool: name,
              summary: label,
              patternBefore,
              patternAfter: patternBefore,
            })
            break
          }
          case 'evaluate_pattern': {
            music.routeToStrudel()
            music.markActiveVersionRouted()
            log('evaluate_pattern', 'routed to Strudel mount')
            commitEdit({
              tool: name,
              summary: 'routed to Strudel REPL',
              patternBefore,
              patternAfter: patternBefore,
              routed: true,
              isDirty: false,
            })
            break
          }
          case 'explain_pattern': {
            const summary = String(record.summary ?? '').slice(0, 64)
            log('explain_pattern', summary)
            commitEdit({
              tool: name,
              summary,
              patternBefore,
              patternAfter: patternBefore,
            })
            break
          }
          case 'set_lane': {
            const lane = record.lane as MusicLane | undefined
            if (!lane) break
            music.setLane(lane)
            log('set_lane', lane)
            commitEdit({
              tool: name,
              summary: `lane → ${lane}`,
              patternBefore,
              patternAfter: patternBefore,
            })
            break
          }
          case 'set_music_prompt': {
            const text = String(record.text ?? '').trim()
            if (!text) break
            music.setMusicPrompt(text)
            music.setLane('generate')
            log('set_music_prompt', text.slice(0, 48))
            commitEdit({
              tool: name,
              summary: text.slice(0, 64),
              patternBefore,
              patternAfter: patternBefore,
            })
            break
          }
          case 'generate_music': {
            const prompt = typeof record.prompt === 'string' ? record.prompt.trim() : music.musicPrompt.trim()
            if (!prompt) {
              log('generate_music', 'ignored — empty prompt')
              break
            }
            music.setMusicPrompt(prompt)
            music.setLane('generate')
            log('generate_music', 'queued — deck capture ships in Phase 2')
            commitEdit({
              tool: name,
              summary: prompt.slice(0, 64),
              patternBefore,
              patternAfter: patternBefore,
            })
            break
          }
          case 'render_capture': {
            log('render_capture', 'unavailable — native Strudel engine required')
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

  const chatStatus = chat.status
  const isBusy = chatStatus === 'streaming' || chatStatus === 'submitted'

  const sendImprovPrompt = useCallback((text: string) => {
    if (isBusy) return
    void chat.sendMessage({ text })
  }, [chat, isBusy])

  const improvRuntime = usePealMusicImprovLoop({
    enabled: improvLoop.enabled,
    intervalSec: improvLoop.intervalSec,
    style: improvLoop.style,
    active: visible,
    canRun: music.patternCode.trim().length > 0 && music.lane === 'live',
    isBusy,
    patternCode: music.patternCode,
    isPlaying: music.isPlaying,
    sendPrompt: sendImprovPrompt,
    onTurnComplete: registerTurnComplete,
  })

  useEffect(() => {
    setImprovTick(improvRuntime.tick)
  }, [improvRuntime.tick])

  useEffect(() => {
    if (prevChatStatusRef.current !== 'submitted' && chatStatus === 'submitted') {
      turnStartPatternRef.current = music.patternCode
      turnToolsRef.current = []
    }
    prevChatStatusRef.current = chatStatus
  }, [chatStatus, music.patternCode])

  return {
    chat,
    activity,
    lastEdit,
    clearLastEdit,
    log,
    improvLoop,
    improvRuntime,
    setImprovEnabled,
    setImprovIntervalSec,
    setImprovStyle,
  }
}