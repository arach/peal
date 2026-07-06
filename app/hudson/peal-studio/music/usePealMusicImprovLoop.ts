'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildImprovUserMessage,
  DEFAULT_MUSIC_IMPROV_INTERVAL_SEC,
  type MusicImprovStyle,
} from '@/lib/ai/musicImprovPrompts'

export interface PealMusicImprovLoopState {
  enabled: boolean
  intervalSec: number
  style: MusicImprovStyle
  tick: number
  waiting: boolean
  nextFireAt: number | null
}

export function usePealMusicImprovLoop(input: {
  enabled: boolean
  intervalSec: number
  style: MusicImprovStyle
  active: boolean
  canRun: boolean
  isBusy: boolean
  patternCode: string
  isPlaying: boolean
  sendPrompt: (text: string) => void
  onTurnComplete: (handler: (() => void) | null) => void
}) {
  const {
    enabled,
    intervalSec,
    style,
    active,
    canRun,
    isBusy,
    patternCode,
    isPlaying,
    sendPrompt,
    onTurnComplete,
  } = input

  const [tick, setTick] = useState(0)
  const [waiting, setWaiting] = useState(false)
  const [nextFireAt, setNextFireAt] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickRef = useRef(0)
  const sendPromptRef = useRef(sendPrompt)
  const isBusyRef = useRef(isBusy)
  const patternRef = useRef(patternCode)
  const isPlayingRef = useRef(isPlaying)
  const styleRef = useRef(style)

  sendPromptRef.current = sendPrompt
  isBusyRef.current = isBusy
  patternRef.current = patternCode
  isPlayingRef.current = isPlaying
  styleRef.current = style

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setWaiting(false)
    setNextFireAt(null)
  }, [])

  const fireImprov = useCallback(() => {
    if (!enabled || !active || !canRun || isBusyRef.current) return false

    const nextTick = tickRef.current + 1
    tickRef.current = nextTick
    setTick(nextTick)

    sendPromptRef.current(buildImprovUserMessage({
      tick: nextTick,
      style: styleRef.current,
      patternCode: patternRef.current,
      isPlaying: isPlayingRef.current,
    }))
    return true
  }, [enabled, active, canRun])

  const scheduleNext = useCallback((delayMs: number) => {
    clearTimer()
    if (!enabled || !active || !canRun) return

    const fireAt = Date.now() + delayMs
    setWaiting(true)
    setNextFireAt(fireAt)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setNextFireAt(null)
      if (fireImprov()) {
        setWaiting(false)
        return
      }
      scheduleNext(Math.min(delayMs, 5000))
    }, delayMs)
  }, [enabled, active, canRun, clearTimer, fireImprov])

  const handleTurnComplete = useCallback(() => {
    if (!enabled || !active || !canRun) return
    scheduleNext(Math.max(5, intervalSec) * 1000)
  }, [enabled, active, canRun, intervalSec, scheduleNext])

  useEffect(() => {
    onTurnComplete(enabled && active && canRun ? handleTurnComplete : null)
    return () => onTurnComplete(null)
  }, [enabled, active, canRun, handleTurnComplete, onTurnComplete])

  useEffect(() => {
    if (!enabled || !active || !canRun) {
      clearTimer()
      if (!enabled) {
        tickRef.current = 0
        setTick(0)
      }
      return
    }

    if (!waiting && !isBusy && tickRef.current === 0) {
      // Short warmup on Start so the first pass lands quickly; later passes use the full interval.
      scheduleNext(3000)
    }
  }, [enabled, active, canRun, intervalSec, waiting, isBusy, clearTimer, scheduleNext])

  useEffect(() => () => clearTimer(), [clearTimer])

  return {
    tick,
    waiting,
    nextFireAt,
    clearTimer,
  }
}

export function defaultImprovLoopState(): PealMusicImprovLoopState {
  return {
    enabled: false,
    intervalSec: DEFAULT_MUSIC_IMPROV_INTERVAL_SEC,
    style: 'subtle',
    tick: 0,
    waiting: false,
    nextFireAt: null,
  }
}