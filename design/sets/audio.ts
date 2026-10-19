'use client'

import { renderSfxPatch, varySfxPatch, type SfxPatch } from '@/lib/sfx/patch'

/** Rendered patch cache — patches are deterministic, so render each once. */
const cache = new Map<string, Promise<AudioBuffer>>()
let context: AudioContext | null = null
let current: AudioBufferSourceNode | null = null

export function renderCached(patch: SfxPatch): Promise<AudioBuffer> {
  const key = JSON.stringify(patch)
  let pending = cache.get(key)
  if (pending) {
    // LRU: refresh recency.
    cache.delete(key)
    cache.set(key, pending)
  } else {
    pending = renderSfxPatch(patch)
    cache.set(key, pending)
    // Mixer edits render a lot of variants; keep the cache bounded.
    while (cache.size > 160) cache.delete(cache.keys().next().value!)
  }
  return pending
}

/** Per-channel min/max peaks for drawing. */
export function peaks(buffer: AudioBuffer, columns: number): { min: number; max: number }[][] {
  const out: { min: number; max: number }[][] = []
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    const step = Math.max(1, Math.floor(data.length / columns))
    const lane: { min: number; max: number }[] = []
    for (let c = 0; c < columns; c++) {
      let min = 1
      let max = -1
      for (let i = c * step; i < Math.min(data.length, (c + 1) * step); i++) {
        if (data[i] < min) min = data[i]
        if (data[i] > max) max = data[i]
      }
      lane.push({ min: min > max ? 0 : min, max: min > max ? 0 : max })
    }
    out.push(lane)
  }
  return out
}

/** RMS level in dBFS — for the set's loudness balance. */
export function loudnessDb(buffer: AudioBuffer): number {
  let sum = 0
  let n = 0
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < data.length; i++) sum += data[i] * data[i]
    n += data.length
  }
  return 20 * Math.log10(Math.sqrt(sum / Math.max(1, n)) || 1e-6)
}

/**
 * One shared transport: only one sound plays at a time, any player can
 * pause/resume/seek its own take. Players subscribe and read `active`.
 */
export interface ActiveTake {
  id: string
  buffer: AudioBuffer
  playing: boolean
  /** Seconds — the paused/seek position when not playing. */
  offset: number
  startedAt: number
}

let active: ActiveTake | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((fn) => fn())

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export const getActive = () => active

export async function audioContext() {
  context ??= new AudioContext()
  if (context.state === 'suspended') await context.resume()
  return context
}

function halt() {
  const source = current
  current = null
  source?.stop()
}

/** Start `buffer` for player `id` at `offset` seconds. */
export async function startTake(id: string, buffer: AudioBuffer, offset = 0) {
  const ctx = await audioContext()
  halt()
  const at = Math.min(Math.max(0, offset), Math.max(0, buffer.duration - 0.001))
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.onended = () => {
    if (current !== source) return
    current = null
    if (active?.id === id) active = { ...active, playing: false, offset: 0 }
    emit()
  }
  source.start(0, at)
  current = source
  active = { id, buffer, playing: true, offset: at, startedAt: ctx.currentTime - at }
  emit()
}

export function pauseTake() {
  if (!active?.playing || !context) return
  const offset = context.currentTime - active.startedAt
  halt()
  active = { ...active, playing: false, offset }
  emit()
}

/** Park the playhead for `id` without playing (seek while stopped). */
export function cueTake(id: string, buffer: AudioBuffer, offset: number) {
  if (active?.playing) halt()
  active = { id, buffer, playing: false, offset: Math.max(0, Math.min(offset, buffer.duration)), startedAt: 0 }
  emit()
}

export function stopTake() {
  halt()
  if (active) active = { ...active, playing: false, offset: 0 }
  emit()
}

/** 0..1 position of player `id` (0 when another player owns the transport). */
export function positionOf(id: string): number {
  if (!active || active.id !== id) return 0
  const seconds = active.playing && context ? context.currentTime - active.startedAt : active.offset
  return Math.min(1, Math.max(0, seconds / active.buffer.duration))
}

/** A fresh humanized take when the patch asks for variation. */
export function takeFor(patch: SfxPatch, vary: boolean): Promise<AudioBuffer> {
  return vary && patch.variation ? renderSfxPatch(varySfxPatch(patch)) : renderCached(patch)
}
