'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Sound } from '@/store/soundStore'
import {
  applyPealStudioToolParam,
  parsePealStudioTool,
  type PealStudioTool,
} from './routing'
import { PealVoiceLayoutProvider } from './voice/PealVoiceLayout'
import { PealVoiceAIProvider } from './voice/PealVoiceAIProvider'
import { PealVoiceProvider } from './voice/PealVoiceProvider'

export type { PealStudioTool } from './routing'

export interface PealSfxEditorTrack {
  id: string
  name: string
  muted: boolean
  solo: boolean
  volume: number
  startPosition?: number
  endPosition?: number
}

export interface PealSfxSummary {
  mounted: boolean
  soundId: string | null
  soundType: string | null
  durationMs: number | null
  frequencyHz: number | null
  trackCount: number
  isPlaying: boolean
  isPaused: boolean
  isGenerating: boolean
  hasUnappliedChanges: boolean
  previewReady: boolean
  mode: 'design' | 'edit' | 'insert' | 'trim'
}

export interface PealSfxActions {
  play?: () => void | Promise<void>
  pause?: () => void
  stop?: () => void
  saveProject?: () => void | Promise<void>
  openProject?: () => void | Promise<void>
  openLibrary?: () => void
  openAIDesigner?: () => void
  showParameters?: () => void
  applyChanges?: () => void | Promise<void>
}

export interface PealSfxEditorRuntime {
  currentSound: Sound | null
  tracks: PealSfxEditorTrack[]
  onSoundChange?: (sound: Sound) => void | Promise<void>
}

interface PealSfxRuntimeUpdate {
  summary: PealSfxSummary
  actions: PealSfxActions
}

interface PealStudioHudsonValue {
  currentTool: PealStudioTool
  setCurrentTool: (tool: PealStudioTool) => void
  inspectorElement: HTMLElement | null
  setInspectorElement: (element: HTMLElement | null) => void
  sfxSummary: PealSfxSummary
  sfxEditor: PealSfxEditorRuntime
  publishSfxRuntime: (runtime: PealSfxRuntimeUpdate) => void
  clearSfxRuntime: () => void
  publishSfxEditor: (runtime: PealSfxEditorRuntime) => void
  clearSfxEditor: () => void
  runSfxAction: (name: keyof PealSfxActions) => void
}

const EMPTY_SFX_SUMMARY: PealSfxSummary = {
  mounted: false,
  soundId: null,
  soundType: null,
  durationMs: null,
  frequencyHz: null,
  trackCount: 0,
  isPlaying: false,
  isPaused: false,
  isGenerating: false,
  hasUnappliedChanges: false,
  previewReady: false,
  mode: 'design',
}

const EMPTY_SFX_EDITOR: PealSfxEditorRuntime = {
  currentSound: null,
  tracks: [],
}

const PealStudioHudsonContext = createContext<PealStudioHudsonValue | null>(null)

function sameSfxSummary(a: PealSfxSummary, b: PealSfxSummary) {
  return (
    a.mounted === b.mounted &&
    a.soundId === b.soundId &&
    a.soundType === b.soundType &&
    a.durationMs === b.durationMs &&
    a.frequencyHz === b.frequencyHz &&
    a.trackCount === b.trackCount &&
    a.isPlaying === b.isPlaying &&
    a.isPaused === b.isPaused &&
    a.isGenerating === b.isGenerating &&
    a.hasUnappliedChanges === b.hasUnappliedChanges &&
    a.previewReady === b.previewReady &&
    a.mode === b.mode
  )
}

export function usePealStudioHudson() {
  const context = useContext(PealStudioHudsonContext)
  if (!context) {
    throw new Error('usePealStudioHudson must be used inside PealStudioProvider')
  }
  return context
}

export function useOptionalPealStudioHudson() {
  return useContext(PealStudioHudsonContext)
}

export function PealStudioProvider({ children }: { children: ReactNode; disabled?: boolean; visible?: boolean; focused?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawTool = searchParams.get('tool')
  const currentTool = parsePealStudioTool(rawTool)
  const [inspectorElement, setInspectorElement] = useState<HTMLElement | null>(null)
  const [sfxSummary, setSfxSummary] = useState<PealSfxSummary>(EMPTY_SFX_SUMMARY)
  const [sfxEditor, setSfxEditor] = useState<PealSfxEditorRuntime>(EMPTY_SFX_EDITOR)
  const sfxActionsRef = useRef<PealSfxActions>({})

  const setCurrentTool = useCallback((tool: PealStudioTool) => {
    const params = new URLSearchParams(searchParams.toString())
    applyPealStudioToolParam(params, tool)

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  useEffect(() => {
    if (!rawTool) return
    if (rawTool === currentTool && currentTool !== 'sfx') return

    const params = new URLSearchParams(searchParams.toString())
    applyPealStudioToolParam(params, currentTool)

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [currentTool, pathname, rawTool, router, searchParams])

  const publishSfxRuntime = useCallback((runtime: PealSfxRuntimeUpdate) => {
    sfxActionsRef.current = runtime.actions
    setSfxSummary((previous) => (sameSfxSummary(previous, runtime.summary) ? previous : runtime.summary))
  }, [])

  const clearSfxRuntime = useCallback(() => {
    sfxActionsRef.current = {}
    setSfxSummary((previous) => (sameSfxSummary(previous, EMPTY_SFX_SUMMARY) ? previous : EMPTY_SFX_SUMMARY))
  }, [])

  const publishSfxEditor = useCallback((runtime: PealSfxEditorRuntime) => {
    setSfxEditor(runtime)
  }, [])

  const clearSfxEditor = useCallback(() => {
    setSfxEditor(EMPTY_SFX_EDITOR)
  }, [])

  const runSfxAction = useCallback((name: keyof PealSfxActions) => {
    const action = sfxActionsRef.current[name]
    if (action) void action()
  }, [])

  const value = useMemo<PealStudioHudsonValue>(() => ({
    currentTool,
    setCurrentTool,
    inspectorElement,
    setInspectorElement,
    sfxSummary,
    sfxEditor,
    publishSfxRuntime,
    clearSfxRuntime,
    publishSfxEditor,
    clearSfxEditor,
    runSfxAction,
  }), [
    currentTool,
    inspectorElement,
    sfxSummary,
    sfxEditor,
    publishSfxRuntime,
    clearSfxRuntime,
    publishSfxEditor,
    clearSfxEditor,
    runSfxAction,
    setCurrentTool,
  ])

  return (
    <PealStudioHudsonContext.Provider value={value}>
      <PealVoiceLayoutProvider>
        <PealVoiceProvider>
          <PealVoiceAIProvider>
            {children}
          </PealVoiceAIProvider>
        </PealVoiceProvider>
      </PealVoiceLayoutProvider>
    </PealStudioHudsonContext.Provider>
  )
}
