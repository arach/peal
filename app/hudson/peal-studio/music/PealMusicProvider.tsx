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
}

const PealMusicContext = createContext<PealMusicContextValue | null>(null)

const STORAGE_KEY = 'peal-music-pattern-v1'

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

  useEffect(() => {
    setPatternCodeState(readStoredPattern())
    setPatternReady(true)
  }, [])
  const [lane, setLane] = useState<MusicLane>('live')
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempoCps, setTempoCps] = useState<number | null>(1)
  const [tempoBpm, setTempoBpm] = useState<number | null>(60)
  const [musicPrompt, setMusicPrompt] = useState('')
  const [strudelMountStatus, setStrudelMountStatus] = useState<StrudelMountStatus>('idle')
  const [lastRoutedCode, setLastRoutedCode] = useState('')
  const [routeGeneration, setRouteGeneration] = useState(0)
  const strudelFrameRef = useRef<HTMLIFrameElement | null>(null)
  const engineId: MusicEngineId = 'strudel'

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

  const resetPattern = useCallback(() => {
    setPatternCode(DEFAULT_STRUDEL_PATTERN)
  }, [setPatternCode])

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