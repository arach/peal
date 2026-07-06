'use client'

import { useCallback, useMemo, useState } from 'react'
import { useHudsonAI } from 'hudsonkit'
import { buildMusicLastEdit, type PealMusicLastEdit } from '@/lib/ai/musicAiFollowUps'
import type { PealAISession } from '@/lib/ai/pealAiSessions'
import type { MusicLane } from './types'
import { usePealMusic } from './PealMusicProvider'

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

export function usePealMusicAI(session: PealAISession) {
  const music = usePealMusic()
  const { config, id: sessionId } = session
  const [activity, setActivity] = useState<PealMusicAIActivity[]>([])
  const [lastEdit, setLastEdit] = useState<PealMusicLastEdit | null>(null)

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
    onToolCall: async (name, args) => {
      try {
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

  return { chat, activity, lastEdit, clearLastEdit, log }
}