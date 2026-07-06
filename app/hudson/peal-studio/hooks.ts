'use client'

import { createElement, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { CommandOption, StatusColor } from 'hudsonkit'
import {
  AiDesignIcon,
  LibraryIcon,
  ParametersIcon,
  PauseIcon,
  PlayIcon,
  SaveIcon,
  MicIcon,
  MusicIcon,
  VolumeIcon,
} from '@/components/icons/PealStudioIcon'
import { usePealStudioHudson, type PealStudioTool } from './Provider'
import { useOptionalPealMusicEngine } from './music/PealMusicEngineProvider'
import { useOptionalPealMusic } from './music/PealMusicProvider'
import { useOptionalPealVoice } from './voice/PealVoiceProvider'

const TOOL_LABELS: Record<PealStudioTool, string> = {
  sfx: 'SFX',
  voice: 'Deck',
  music: 'Music',
}

const TOOL_DESCRIPTIONS: Record<PealStudioTool, string> = {
  sfx: 'Sound effects creation',
  voice: 'Deck · mixer · capture',
  music: 'Live code · generate · bridge',
}

const TOOL_ORDER: PealStudioTool[] = ['sfx', 'voice', 'music']

function toolSwitchIcon(tool: PealStudioTool) {
  if (tool === 'sfx') return VolumeIcon
  if (tool === 'voice') return MicIcon
  return MusicIcon
}

export function usePealStudioCommands(): CommandOption[] {
  const router = useRouter()
  const { currentTool, setCurrentTool, runSfxAction } = usePealStudioHudson()

  return useMemo(() => [
    {
      id: 'peal-studio:play',
      label: 'Play sound',
      shortcut: 'Space',
      icon: createElement(PlayIcon, { size: 14 }),
      action: () => runSfxAction('play'),
    },
    {
      id: 'peal-studio:pause',
      label: 'Pause sound',
      icon: createElement(PauseIcon, { size: 14 }),
      action: () => runSfxAction('pause'),
    },
    {
      id: 'peal-studio:save',
      label: 'Save project',
      shortcut: 'Cmd+S',
      icon: createElement(SaveIcon, { size: 14 }),
      action: () => runSfxAction('saveProject'),
    },
    {
      id: 'peal-studio:open-library',
      label: 'Open Library',
      icon: createElement(LibraryIcon, { size: 14 }),
      action: () => {
        if (currentTool === 'sfx') runSfxAction('openLibrary')
        else router.push('/library')
      },
    },
    {
      id: 'peal-studio:ai-design',
      label: 'Open AI Design',
      icon: createElement(AiDesignIcon, { size: 14 }),
      action: () => {
        if (currentTool === 'voice') {
          setCurrentTool('voice')
          return
        }
        setCurrentTool('sfx')
        window.setTimeout(() => runSfxAction('openAIDesigner'), 0)
      },
    },
    {
      id: 'peal-studio:show-parameters',
      label: 'Show Parameters',
      icon: createElement(ParametersIcon, { size: 14 }),
      action: () => {
        setCurrentTool('sfx')
        window.setTimeout(() => runSfxAction('showParameters'), 0)
      },
    },
    ...TOOL_ORDER.map((tool) => ({
      id: `peal-studio:switch-${tool}`,
      label: `Switch tool: ${TOOL_LABELS[tool]}`,
      icon: createElement(toolSwitchIcon(tool), { size: 14 }),
      action: () => setCurrentTool(tool),
    })),
  ], [currentTool, router, runSfxAction, setCurrentTool])
}

export function usePealStudioStatus(): { label: string; color: StatusColor } {
  const { currentTool, sfxSummary } = usePealStudioHudson()
  const voice = useOptionalPealVoice()
  const music = useOptionalPealMusic()
  const musicEngine = useOptionalPealMusicEngine()

  if (currentTool === 'voice' && voice) {
    if (voice.isGenerating) return { label: 'generating', color: 'amber' }
    if (voice.currentlyPlayingId) return { label: 'playing', color: 'emerald' }
    if (voice.takes.length) return { label: `${voice.takes.length} takes`, color: 'emerald' }
    return { label: 'ready', color: 'neutral' }
  }

  if (currentTool === 'music' && music) {
    const engineRunning = musicEngine?.status?.phase === 'running' && musicEngine.status.reachable
    if (!engineRunning) return { label: 'engine stopped', color: 'amber' }
    if (music.isPlaying || music.strudelMountStatus === 'playing') {
      return { label: 'playing', color: 'emerald' }
    }
    if (music.isPatternDirty) return { label: 'edits pending', color: 'amber' }
    if (music.strudelMountStatus === 'routed') return { label: 'routed', color: 'emerald' }
    if (music.strudelMountStatus === 'loading') return { label: 'connecting', color: 'amber' }
    if (music.strudelMountStatus === 'error') return { label: 'mount error', color: 'amber' }
    return { label: 'strudel', color: 'neutral' }
  }

  if (currentTool !== 'sfx') {
    return { label: `${TOOL_LABELS[currentTool]} ready`, color: 'neutral' }
  }

  if (sfxSummary.isGenerating) return { label: 'generating', color: 'amber' }
  if (sfxSummary.isPlaying) return { label: 'playing', color: 'emerald' }
  if (sfxSummary.isPaused) return { label: 'paused', color: 'amber' }
  if (sfxSummary.hasUnappliedChanges) return { label: 'edits pending', color: 'amber' }
  if (sfxSummary.previewReady) return { label: 'preview ready', color: 'emerald' }
  if (sfxSummary.soundId) return { label: 'ready', color: 'emerald' }
  return { label: 'ready', color: 'neutral' }
}

function PealNavCenter() {
  const { currentTool, sfxSummary } = usePealStudioHudson()
  const voice = useOptionalPealVoice()
  const music = useOptionalPealMusic()
  const detail = currentTool === 'sfx'
    ? sfxSummary.soundId
      ? `${sfxSummary.soundType ?? 'sound'} · ${sfxSummary.durationMs ?? 0}ms · ${sfxSummary.frequencyHz ?? 0}Hz`
      : 'design UI sounds'
    : currentTool === 'voice' && voice
      ? `${voice.selectedVoice} · ${voice.selectedModel} · ${voice.speed}x`
      : currentTool === 'music' && music
        ? `strudel · ${music.lane}${music.isPlaying ? ' · playing' : music.isPatternDirty ? ' · edits pending' : music.strudelMountStatus === 'routed' ? ' · routed' : ''}`
        : TOOL_DESCRIPTIONS[currentTool]

  return createElement('div', {
    className: 'flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-mono text-[var(--hud-ink-3)]',
  },
    createElement('span', { className: 'text-[#4a9eff]' }, TOOL_LABELS[currentTool]),
    createElement('span', { className: 'opacity-30' }, '·'),
    createElement('span', null, detail),
  )
}

function PealNavActions() {
  const { currentTool, runSfxAction, sfxSummary } = usePealStudioHudson()
  const voice = useOptionalPealVoice()
  const music = useOptionalPealMusic()
  const musicEngine = useOptionalPealMusicEngine()

  const voicePlayTarget = voice?.selectedTakeId ?? voice?.takes[0]?.id ?? null
  const voiceIsPlaying = voicePlayTarget != null && voice?.currentlyPlayingId === voicePlayTarget
  const musicIsPlaying = music?.isPlaying ?? false
  const musicEngineRunning = musicEngine?.status?.phase === 'running' && musicEngine.status.reachable

  return createElement('div', { className: 'flex items-center gap-2' },
    currentTool === 'music' && musicEngine && !musicEngineRunning
      ? createElement('button', {
          type: 'button',
          onClick: () => void musicEngine.start(),
          disabled: musicEngine.busy,
          className: 'peal-inst-nav-transport',
          title: 'Start Strudel engine',
        },
          createElement(PlayIcon, { size: 12 }),
          musicEngine.busy ? 'Starting…' : 'Start engine',
        )
      : null,
    createElement('button', {
      type: 'button',
      onClick: () => {
        if (currentTool === 'music' && music) {
          if (musicIsPlaying) {
            music.stopStrudel()
          } else {
            music.routeToStrudel()
          }
          return
        }
        if (currentTool === 'voice' && voice && voicePlayTarget) {
          voice.togglePlay(voicePlayTarget)
          return
        }
        runSfxAction(sfxSummary.isPlaying ? 'pause' : 'play')
      },
      className: 'peal-inst-nav-transport',
      disabled: currentTool === 'sfx'
        ? !sfxSummary.mounted
        : currentTool === 'voice'
          ? !voicePlayTarget
          : currentTool === 'music'
            ? !musicEngineRunning
            : false,
      title: (currentTool === 'voice'
        ? voiceIsPlaying
        : currentTool === 'music'
          ? musicIsPlaying
          : sfxSummary.isPlaying) ? 'Pause' : 'Play',
    },
      createElement((currentTool === 'voice'
        ? voiceIsPlaying
        : currentTool === 'music'
          ? musicIsPlaying
          : sfxSummary.isPlaying) ? PauseIcon : PlayIcon, { size: 12 }),
      (currentTool === 'voice'
        ? voiceIsPlaying
        : currentTool === 'music'
          ? musicIsPlaying
          : sfxSummary.isPlaying) ? 'Pause' : 'Play',
    ),
  )
}

export function usePealStudioNavCenter() {
  return createElement(PealNavCenter)
}

export function usePealStudioNavActions() {
  return createElement(PealNavActions)
}

export function usePealStudioStatusLeft() {
  const { currentTool, sfxSummary } = usePealStudioHudson()
  const voice = useOptionalPealVoice()
  if (currentTool === 'voice' && voice) {
    return voice.takes.length ? `deck ${voice.takes.length} clips` : 'Deck · HudsonApp'
  }
  if (currentTool === 'music') return 'Music · Transport · editor + REPL'
  if (currentTool !== 'sfx') return `${TOOL_LABELS[currentTool]} · HudsonApp`
  return sfxSummary.soundId ? `tracks ${sfxSummary.trackCount} · ${sfxSummary.mode}` : 'SFX · HudsonApp'
}

export function usePealStudioStatusRight() {
  return '44.1 kHz · mono · #4a9eff'
}

export function usePealStudioLayoutMode(): 'panel' {
  return 'panel'
}
