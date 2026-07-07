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
import {
  postToStrudelFrame,
  routeAndPlayInStrudelFrame,
  type StrudelMountStatus,
} from '@/lib/strudel/mount'
import { DEFAULT_STRUDEL_PATTERN } from './constants'
import {
  markPatternVersionRouted,
  pushPatternVersion,
  type PealMusicPatternVersion,
  type PushPatternVersionInput,
  previousPatternVersion,
} from './musicPatternVersions'
import type { MusicEngineId, MusicLane } from './types'

interface PealMusicContextValue {
  patternCode: string
  setPatternCode: (code: string) => void
  lane: MusicLane
  setLane: (lane: MusicLane) => void
  engineId: MusicEngineId
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  tempoCps: number | null
  tempoBpm: number | null
  setTempo: (input: { cps?: number; bpm?: number }) => void
  musicPrompt: string
  setMusicPrompt: (text: string) => void
  resetPattern: () => void
  strudelMountStatus: StrudelMountStatus
  isPatternDirty: boolean
  lastRoutedCode: string
  routeGeneration: number
  patternReady: boolean
  registerStrudelFrame: (iframe: HTMLIFrameElement | null) => void
  onStrudelMessage: (data: unknown) => void
  markStrudelFrameLoading: () => void
  markStrudelFrameLoaded: (kind: 'bootstrap' | 'route') => void
  markStrudelMirrorReady: () => void
  routeToStrudel: (code?: string) => void
  stopStrudel: () => void
  patternVersions: PealMusicPatternVersion[]
  activeVersionId: string | null
  canRollbackPattern: boolean
  pushPatternVersion: (input: PushPatternVersionInput) => string | null
  markActiveVersionRouted: () => void
  restorePatternVersion: (id: string, options?: { route?: boolean }) => void
  rollbackPatternVersion: (options?: { route?: boolean }) => boolean
  applyPatternSnapshot: (
    code: string,
    input: Omit<PushPatternVersionInput, 'code'> & { route?: boolean },
  ) => void
}

const PealMusicContext = createContext<PealMusicContextValue | null>(null)

const STORAGE_KEY = 'peal-music-pattern-v1'
const VERSIONS_STORAGE_KEY = 'peal-music-pattern-versions.v1'

interface StoredPatternVersions {
  versions: PealMusicPatternVersion[]
  activeId: string | null
}

function readStoredVersions(): StoredPatternVersions {
  try {
    const raw = localStorage.getItem(VERSIONS_STORAGE_KEY)
    if (!raw) return { versions: [], activeId: null }
    const parsed = JSON.parse(raw) as StoredPatternVersions
    if (!Array.isArray(parsed.versions)) return { versions: [], activeId: null }
    return {
      versions: parsed.versions,
      activeId: typeof parsed.activeId === 'string' ? parsed.activeId : null,
    }
  } catch {
    return { versions: [], activeId: null }
  }
}

function readStoredPattern(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_STRUDEL_PATTERN
  } catch {
    return DEFAULT_STRUDEL_PATTERN
  }
}

export function PealMusicProvider({ children }: { children: ReactNode }) {
  const [patternCode, setPatternCodeState] = useState(DEFAULT_STRUDEL_PATTERN)
  const [patternReady, setPatternReady] = useState(false)
  const [lane, setLane] = useState<MusicLane>('live')
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempoCps, setTempoCps] = useState<number | null>(1)
  const [tempoBpm, setTempoBpm] = useState<number | null>(60)
  const [musicPrompt, setMusicPrompt] = useState('')
  const [strudelMountStatus, setStrudelMountStatus] = useState<StrudelMountStatus>('idle')
  const [lastRoutedCode, setLastRoutedCode] = useState('')
  const [routeGeneration, setRouteGeneration] = useState(0)
  const [patternVersions, setPatternVersions] = useState<PealMusicPatternVersion[]>([])
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)
  const strudelFrameRef = useRef<HTMLIFrameElement | null>(null)
  const versionsHydratedRef = useRef(false)
  const engineId: MusicEngineId = 'strudel'

  useEffect(() => {
    const storedPattern = readStoredPattern()
    setPatternCodeState(storedPattern)
    const storedVersions = readStoredVersions()
    if (storedVersions.versions.length > 0) {
      setPatternVersions(storedVersions.versions)
      const lastVersion = storedVersions.versions[storedVersions.versions.length - 1]
      setActiveVersionId(storedVersions.activeId ?? lastVersion?.id ?? null)
    } else if (storedPattern.trim()) {
      const seeded = pushPatternVersion([], {
        code: storedPattern,
        label: 'Saved pattern',
        source: 'initial',
        routed: false,
      })
      setPatternVersions(seeded.versions)
      setActiveVersionId(seeded.activeId)
    }
    versionsHydratedRef.current = true
    setPatternReady(true)
  }, [])

  useEffect(() => {
    if (!versionsHydratedRef.current) return
    try {
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify({
        versions: patternVersions,
        activeId: activeVersionId,
      }))
    } catch {
      // ignore quota errors
    }
  }, [patternVersions, activeVersionId])

  const setTempo = useCallback((input: { cps?: number; bpm?: number }) => {
    if (typeof input.cps === 'number') {
      setTempoCps(input.cps)
      setTempoBpm(Math.round(input.cps * 60))
      postToStrudelFrame(strudelFrameRef.current, {
        type: 'peal-strudel',
        action: 'set-tempo',
        cps: input.cps,
      })
    } else if (typeof input.bpm === 'number') {
      setTempoBpm(input.bpm)
      const cps = input.bpm / 60
      setTempoCps(cps)
      postToStrudelFrame(strudelFrameRef.current, {
        type: 'peal-strudel',
        action: 'set-tempo',
        cps,
      })
    }
  }, [])

  const setPatternCode = useCallback((code: string) => {
    setPatternCodeState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // ignore quota errors
    }
  }, [])

  const commitPatternVersion = useCallback((input: PushPatternVersionInput) => {
    let nextId: string | null = null
    setPatternVersions((prev) => {
      const next = pushPatternVersion(prev, input)
      nextId = next.activeId
      return next.versions
    })
    if (nextId) setActiveVersionId(nextId)
    return nextId
  }, [])

  const markActiveVersionRouted = useCallback(() => {
    setPatternVersions((prev) => markPatternVersionRouted(prev, activeVersionId))
  }, [activeVersionId])

  const registerStrudelFrame = useCallback((iframe: HTMLIFrameElement | null) => {
    strudelFrameRef.current = iframe
    if (!iframe) {
      setStrudelMountStatus('idle')
    }
  }, [])

  const markStrudelFrameLoading = useCallback(() => {
    setStrudelMountStatus('loading')
  }, [])

  const markStrudelFrameLoaded = useCallback((kind: 'bootstrap' | 'route') => {
    if (kind === 'route') {
      setStrudelMountStatus('routed')
    }
  }, [])

  const markStrudelMirrorReady = useCallback(() => {
    setStrudelMountStatus((status) => (status === 'playing' ? status : 'ready'))
  }, [])

  const routeToStrudel = useCallback((code?: string) => {
    const payload = (code ?? patternCode).trim()
    if (!payload) return
    setLastRoutedCode(payload)

    if (routeAndPlayInStrudelFrame(strudelFrameRef.current, payload)) {
      setStrudelMountStatus('playing')
      setIsPlaying(true)
      return
    }

    setRouteGeneration((n) => n + 1)
    setStrudelMountStatus('routed')
    setIsPlaying(true)
    postToStrudelFrame(strudelFrameRef.current, {
      type: 'peal-strudel',
      action: 'evaluate',
      code: payload,
    })
  }, [patternCode])

  const restorePatternVersion = useCallback((id: string, options?: { route?: boolean }) => {
    const version = patternVersions.find((entry) => entry.id === id)
    if (!version) return
    setPatternCode(version.code)
    setActiveVersionId(id)
    if (options?.route !== false) {
      routeToStrudel(version.code)
    }
  }, [patternVersions, setPatternCode, routeToStrudel])

  const rollbackPatternVersion = useCallback((options?: { route?: boolean }) => {
    const previous = previousPatternVersion(patternVersions, activeVersionId)
    if (!previous) return false
    restorePatternVersion(previous.id, options)
    return true
  }, [patternVersions, activeVersionId, restorePatternVersion])

  const applyPatternSnapshot = useCallback((
    code: string,
    input: Omit<PushPatternVersionInput, 'code'> & { route?: boolean },
  ) => {
    setPatternCode(code)
    const id = commitPatternVersion({ ...input, code })
    if (input.route !== false) {
      routeToStrudel(code)
    } else if (id) {
      setActiveVersionId(id)
    }
  }, [setPatternCode, commitPatternVersion, routeToStrudel])

  const resetPattern = useCallback(() => {
    applyPatternSnapshot(DEFAULT_STRUDEL_PATTERN, {
      label: 'Default pattern',
      source: 'reset',
      route: false,
    })
  }, [applyPatternSnapshot])

  const stopStrudel = useCallback(() => {
    postToStrudelFrame(strudelFrameRef.current, { type: 'peal-strudel', action: 'stop' })
    setIsPlaying(false)
    if (strudelMountStatus === 'playing') {
      setStrudelMountStatus('routed')
    }
  }, [strudelMountStatus])

  const onStrudelMessage = useCallback((data: unknown) => {
    if (typeof data !== 'object' || data === null) return
    const message = data as { type?: string; action?: string; ok?: boolean; error?: string; playing?: boolean }
    if (message.type !== 'peal-strudel' || !message.action) return

    switch (message.action) {
      case 'ready':
        markStrudelMirrorReady()
        break
      case 'evaluated':
        if (message.ok === false) {
          setStrudelMountStatus('error')
          setIsPlaying(false)
        } else {
          setStrudelMountStatus('routed')
        }
        break
      case 'playing':
        setIsPlaying(message.playing === true)
        setStrudelMountStatus(message.playing ? 'playing' : 'routed')
        break
      default:
        break
    }
  }, [markStrudelMirrorReady])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = strudelFrameRef.current
      if (!frame?.contentWindow || event.source !== frame.contentWindow) return
      onStrudelMessage(event.data)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [onStrudelMessage])

  const isPatternDirty = useMemo(
    () => patternCode.trim() !== lastRoutedCode.trim(),
    [patternCode, lastRoutedCode],
  )

  const canRollbackPattern = useMemo(
    () => previousPatternVersion(patternVersions, activeVersionId) !== null,
    [patternVersions, activeVersionId],
  )

  const value = useMemo<PealMusicContextValue>(() => ({
    patternCode,
    setPatternCode,
    lane,
    setLane,
    engineId,
    isPlaying,
    setIsPlaying,
    tempoCps,
    tempoBpm,
    setTempo,
    musicPrompt,
    setMusicPrompt,
    resetPattern,
    strudelMountStatus,
    isPatternDirty,
    lastRoutedCode,
    routeGeneration,
    patternReady,
    registerStrudelFrame,
    onStrudelMessage,
    markStrudelFrameLoading,
    markStrudelFrameLoaded,
    markStrudelMirrorReady,
    routeToStrudel,
    stopStrudel,
    patternVersions,
    activeVersionId,
    canRollbackPattern,
    pushPatternVersion: commitPatternVersion,
    markActiveVersionRouted,
    restorePatternVersion,
    rollbackPatternVersion,
    applyPatternSnapshot,
  }), [
    patternCode,
    setPatternCode,
    lane,
    engineId,
    isPlaying,
    tempoCps,
    tempoBpm,
    setTempo,
    musicPrompt,
    resetPattern,
    strudelMountStatus,
    isPatternDirty,
    lastRoutedCode,
    routeGeneration,
    patternReady,
    registerStrudelFrame,
    onStrudelMessage,
    markStrudelFrameLoading,
    markStrudelFrameLoaded,
    markStrudelMirrorReady,
    routeToStrudel,
    stopStrudel,
    patternVersions,
    activeVersionId,
    canRollbackPattern,
    commitPatternVersion,
    markActiveVersionRouted,
    restorePatternVersion,
    rollbackPatternVersion,
    applyPatternSnapshot,
  ])

  return (
    <PealMusicContext.Provider value={value}>
      {children}
    </PealMusicContext.Provider>
  )
}

export function usePealMusic() {
  const context = useContext(PealMusicContext)
  if (!context) {
    throw new Error('usePealMusic must be used inside PealMusicProvider')
  }
  return context
}

export function useOptionalPealMusic() {
  return useContext(PealMusicContext)
}