'use client'

/**
 * The studio's player, reused: Scope + Timeline canvases from
 * components/studio/studioScope, the instrument transport deck, and
 * click/drag seeking. Inline cards get a compact scope; pages get the full
 * Scope / Timeline / Transport stack.
 */
import { useEffect, useMemo, useReducer, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { SfxPatch } from '@/lib/sfx/patch'
import { drawScope, drawTimeline, waveformData } from '@/components/studio/studioScope'
import { StudioRack, StudioScopeWell, StudioTransportDeck } from '@/components/studio/StudioInstruments'
import { cueTake, getActive, pauseTake, positionOf, renderCached, startTake, stopTake, subscribe, takeFor } from './audio'

/** `value`, settling `ms` after it stops changing (renders lag fader drags). */
export function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(value), ms)
    return () => window.clearTimeout(t)
  }, [value, ms])
  return settled
}

/** 0..1 playhead of player `id`, animated while it plays. */
export function usePlayhead(id: string): number {
  const [, rerender] = useReducer((n: number) => n + 1, 0)
  const [position, setPosition] = useState(0)
  useEffect(() => subscribe(rerender), [])
  const active = getActive()
  const playing = active?.id === id && active.playing
  useEffect(() => {
    if (!playing) {
      setPosition(positionOf(id))
      return
    }
    let frame = 0
    const tick = () => {
      setPosition(positionOf(id))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [id, playing, active?.offset])
  return position
}

function useTransport(id: string, livePatchValue: SfxPatch, vary: boolean) {
  const patch = useDebounced(livePatchValue, 140)
  const [base, setBase] = useState<AudioBuffer | null>(null)
  const [, rerender] = useReducer((n: number) => n + 1, 0)
  const [position, setPosition] = useState(0)

  useEffect(() => {
    let live = true
    renderCached(patch).then((b) => { if (live) setBase(b) })
    return () => { live = false }
  }, [patch])
  useEffect(() => subscribe(rerender), [])

  const active = getActive()
  const mine = active?.id === id ? active : null
  const playing = !!mine?.playing
  // While this player owns the transport, show the take it is playing.
  const buffer = mine?.buffer ?? base

  useEffect(() => {
    if (!playing) {
      setPosition(positionOf(id))
      return
    }
    let frame = 0
    const tick = () => {
      setPosition(positionOf(id))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [id, playing, mine?.offset])

  // A new version or a mixer edit swaps the take in place, at the same
  // position — so edits and A/B are heard live. Card and page share an id
  // (and a playhead), so mounting a second view must not restart the first.
  const lastPatch = useRef(patch)
  useEffect(() => {
    if (JSON.stringify(lastPatch.current) === JSON.stringify(patch)) return
    lastPatch.current = patch
    const now = getActive()
    if (now?.id !== id) return
    const at = positionOf(id)
    void renderCached(patch).then((next) => {
      const still = getActive()
      if (still?.id !== id) return
      if (still.playing) void startTake(id, next, positionOf(id) * next.duration)
      else cueTake(id, next, at * next.duration)
    })
  }, [id, patch])

  return {
    buffer,
    playing,
    position,
    play: async () => {
      if (mine && mine.offset > 0 && mine.offset < mine.buffer.duration) {
        await startTake(id, mine.buffer, mine.offset)
        return
      }
      await startTake(id, await takeFor(patch, vary), 0)
    },
    pause: pauseTake,
    stop: () => { if (mine) stopTake() },
    seek: async (p: number, resume: boolean) => {
      const target = buffer ?? (await renderCached(patch))
      if (resume) await startTake(id, target, p * target.duration)
      else cueTake(id, target, p * target.duration)
    },
  }
}

type Transport = ReturnType<typeof useTransport>

/** Hover ghost + click/drag seek on a canvas. Dragging parks; release resumes. */
function useScrub(transport: Transport) {
  const [hover, setHover] = useState<number | null>(null)
  const drag = useRef<{ resume: boolean } | null>(null)
  const at = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  }
  return {
    hover,
    handlers: {
      onPointerDown: (e: ReactPointerEvent<HTMLCanvasElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = { resume: transport.playing }
        void transport.seek(at(e), false)
      },
      onPointerMove: (e: ReactPointerEvent<HTMLCanvasElement>) => {
        const p = at(e)
        setHover(p)
        if (drag.current) void transport.seek(p, false)
      },
      onPointerUp: (e: ReactPointerEvent<HTMLCanvasElement>) => {
        // A click (or drag) plays from the drop point — that's the seek-ahead.
        drag.current = null
        void transport.seek(at(e), true)
      },
      onPointerLeave: () => { if (!drag.current) setHover(null) },
    },
  }
}

function useCanvasDraw(draw: (canvas: HTMLCanvasElement) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) draw(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const observer = new ResizeObserver(() => draw(canvas))
    observer.observe(canvas)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

const fmt = (seconds: number) => `${Math.round(seconds * 1000)}ms`

function MiniTransport({ transport }: { transport: Transport }) {
  return (
    <button
      type="button"
      className={`peal-inst-transport peal-inst-transport--main pss-mini-transport ${transport.playing ? 'peal-inst-transport--pause' : ''}`}
      aria-label={transport.playing ? 'Pause' : 'Play'}
      onClick={() => void (transport.playing ? transport.pause() : transport.play())}
    >
      <span className="peal-inst-transport-ring" aria-hidden />
      {transport.playing ? (
        <svg width="12" height="12" viewBox="0 0 26 26" fill="currentColor" aria-hidden>
          <rect x="6" y="5" width="5" height="16" rx="1" />
          <rect x="15" y="5" width="5" height="16" rx="1" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 26 26" fill="currentColor" aria-hidden>
          <path d="M9 6.5v13l10-6.5-10-6.5z" />
        </svg>
      )}
    </button>
  )
}

/** Inline in chat cards: compact transport + seekable scope + time readout. */
export function InlinePlayer({ id, patch, vary }: { id: string; patch: SfxPatch; vary: boolean }) {
  const transport = useTransport(id, patch, vary)
  const scrub = useScrub(transport)
  const data = useMemo(() => (transport.buffer ? waveformData(transport.buffer, 120) : null), [transport.buffer])
  const ref = useCanvasDraw(
    (canvas) => data && drawScope(canvas, { lanes: [data], position: transport.position, hover: scrub.hover, grid: true }),
    [data, transport.position, scrub.hover],
  )
  const duration = transport.buffer?.duration ?? patch.duration
  return (
    <div className="pss-inline-player">
      <MiniTransport transport={transport} />
      <StudioScopeWell className="pss-inline-scope">
        <canvas ref={ref} className="pss-scrub-canvas" {...scrub.handlers} />
        {data ? null : <span className="pss-wave-loading">rendering…</span>}
      </StudioScopeWell>
      <span className="pss-time">
        {fmt((scrub.hover ?? transport.position) * duration)}
        <span> / {fmt(duration)}</span>
      </span>
    </div>
  )
}

/** Right-pane page: the studio's Scope, Timeline and Transport deck. */
export function FullPlayer({ id, patch, vary }: { id: string; patch: SfxPatch; vary: boolean }) {
  const transport = useTransport(id, patch, vary)
  const scopeScrub = useScrub(transport)
  const timelineScrub = useScrub(transport)
  const buffer = transport.buffer
  const lanes = useMemo(
    () => (buffer ? Array.from({ length: Math.min(2, buffer.numberOfChannels) }, (_, ch) => waveformData(buffer, 160, ch)) : null),
    [buffer],
  )
  const hover = timelineScrub.hover ?? scopeScrub.hover
  const durationMs = (buffer?.duration ?? patch.duration) * 1000
  const scopeRef = useCanvasDraw(
    (canvas) => lanes && drawScope(canvas, { lanes, position: transport.position, hover }),
    [lanes, transport.position, hover],
  )
  const timelineRef = useCanvasDraw(
    (canvas) => lanes && drawTimeline(canvas, { data: lanes[0], durationMs, position: transport.position, hover }),
    [lanes, transport.position, hover, durationMs],
  )

  return (
    <div className="pss-full-player">
      <StudioRack
        label="Scope"
        readout={`${Math.round(durationMs)}ms · ${patch.layers.length} layers${lanes && lanes.length > 1 ? ' · stereo' : ''}`}
        className="p-0 overflow-hidden"
      >
        <div className="px-3 py-3">
          <StudioScopeWell>
            <canvas ref={scopeRef} className="pss-scrub-canvas h-40 w-full" {...scopeScrub.handlers} />
          </StudioScopeWell>
        </div>
      </StudioRack>
      <StudioRack
        label="Timeline"
        readout={`${Math.round((hover ?? transport.position) * durationMs)} / ${Math.round(durationMs)}ms`}
        className="overflow-hidden"
      >
        <div className="p-3">
          <StudioScopeWell>
            <canvas ref={timelineRef} className="pss-scrub-canvas h-16 w-full" {...timelineScrub.handlers} />
          </StudioScopeWell>
        </div>
      </StudioRack>
      <StudioTransportDeck
        onStop={transport.stop}
        onPlay={() => void transport.play()}
        onPause={transport.pause}
        isPlaying={transport.playing}
        disabled={!buffer}
      />
    </div>
  )
}
