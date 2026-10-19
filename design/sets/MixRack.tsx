'use client'

/**
 * Mixer around the player: per-layer level, mute/solo, pan, and drag-to-move
 * timing on lanes that show each layer's own waveform in place; four macros
 * for the whole sound. Edits are non-destructive (see mix.ts) and play live.
 */
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { SfxLayer } from '@/lib/sfx/patch'
import { drawScope, waveformData } from '@/components/studio/studioScope'
import { StudioKnob, StudioPad, StudioPadTray, StudioRack } from '@/components/studio/StudioInstruments'
import { renderCached } from './audio'
import { isDirty, soloLayer, type LayerMix, type PatchMix } from './mix'
import { usePlayhead, useDebounced } from './Player'
import { basePatch, livePatch, mixOf, useSets, versionsOf } from './store'

const LAYER_COLORS = ['#4a9eff', '#f0b429', '#7cb8ff', '#9ca3af', '#2f7fd8', '#e8a317', '#6bb0ff', '#c4c4cc']

const panLabel = (v: number) => (Math.abs(v) < 0.03 ? 'C' : `${v < 0 ? 'L' : 'R'}${Math.round(Math.abs(v) * 100)}`)

function sourceLabel(l: SfxLayer) {
  return l.source === 'noise' ? `${l.noiseColor ?? 'white'} noise` : `${l.waveform ?? 'sine'} ${Math.round(l.frequency ?? 0)}Hz`
}

function Lane({ soundKey, index, color, onShift, shiftMs }: {
  soundKey: string
  index: number
  color: string
  onShift: (seconds: number) => void
  shiftMs: number
}) {
  const sound = useSets((s) => s.sounds.find((x) => x.key === soundKey))!
  const card = useSets((s) => s.cards[soundKey])
  const patch = useDebounced(livePatch(sound, card), 140)
  const solo = useMemo(() => soloLayer(patch, index), [patch, index])
  const [data, setData] = useState<number[] | null>(null)
  const [drag, setDrag] = useState<{ x: number; dx: number; width: number } | null>(null)
  const ref = useRef<HTMLCanvasElement>(null)
  const position = usePlayhead(soundKey)

  useEffect(() => {
    let live = true
    renderCached(solo).then((b) => { if (live) setData(waveformData(b, 140)) })
    return () => { live = false }
  }, [solo])

  useEffect(() => {
    if (!ref.current || !data) return
    const canvas = ref.current
    // The lane's own waveform, tinted per layer, on the shared time axis.
    drawScope(canvas, { lanes: [data], grid: false })
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = color
      ctx.globalAlpha = 0.6
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      if (position > 0 && position < 1) {
        const x = position * canvas.clientWidth
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.fillRect(x - 0.5, 0, 1, canvas.clientHeight)
      }
    }
  }, [data, position, color])

  const totalMs = patch.duration * 1000
  const dragMs = drag ? (drag.dx / drag.width) * totalMs : 0

  return (
    <div
      className={`pss-lane ${drag ? 'is-dragging' : ''}`}
      title="Drag to move this layer in time"
      onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        setDrag({ x: e.clientX, dx: 0, width: e.currentTarget.getBoundingClientRect().width })
      }}
      onPointerMove={(e) => { if (drag) setDrag({ ...drag, dx: e.clientX - drag.x }) }}
      onPointerUp={() => {
        if (drag && Math.abs(drag.dx) > 2) onShift(Math.round(dragMs / 5) * 5 / 1000)
        setDrag(null)
      }}
    >
      <canvas ref={ref} style={drag ? { transform: `translateX(${drag.dx}px)` } : undefined} />
      {drag || shiftMs !== 0 ? (
        <span className="pss-lane-tag">
          {(shiftMs + dragMs) >= 0 ? '+' : ''}{Math.round(shiftMs + dragMs)}ms
        </span>
      ) : null}
    </div>
  )
}

function LayerRow({ soundKey, index, layer, m, onChange, dimmed }: {
  soundKey: string
  index: number
  layer: SfxLayer
  m: LayerMix
  onChange: (next: Partial<LayerMix>) => void
  dimmed: boolean
}) {
  const color = LAYER_COLORS[index % LAYER_COLORS.length]
  const panValue = Math.max(-1, Math.min(1, (layer.pan ?? 0) + m.pan))
  return (
    <div className={`pss-strip ${dimmed ? 'is-dimmed' : ''}`}>
      <div className="pss-strip-ms">
        <button type="button" className={`pss-ms ${m.mute ? 'is-mute' : ''}`} onClick={() => onChange({ mute: !m.mute })} title="Mute">M</button>
        <button type="button" className={`pss-ms ${m.solo ? 'is-solo' : ''}`} onClick={() => onChange({ solo: !m.solo })} title="Solo">S</button>
      </div>
      <div className="pss-strip-name">
        <span className="pss-strip-swatch" style={{ background: color }} />
        <span className="min-w-0">
          <span className="pss-strip-title">{layer.name}</span>
          <span className="pss-strip-src">{sourceLabel(layer)}</span>
        </span>
      </div>
      <Lane soundKey={soundKey} index={index} color={color} shiftMs={m.shift * 1000} onShift={(s) => onChange({ shift: Math.round((m.shift + s) * 1000) / 1000 })} />
      <label className="pss-fader pss-fader--level" title="Level — accentuate or pull back this layer (double-click for 0 dB)">
        <input
          type="range"
          min={-24}
          max={12}
          step={0.5}
          value={m.db}
          onChange={(e) => onChange({ db: Number(e.target.value) })}
          onDoubleClick={() => onChange({ db: 0 })}
        />
        <span className={m.db !== 0 ? 'is-tweaked' : ''}>{m.db > 0 ? '+' : ''}{m.db.toFixed(1)}dB</span>
      </label>
      <label className="pss-fader pss-fader--pan" title={layer.panEnd !== undefined ? 'Pan — moves the whole sweep (double-click to reset)' : 'Pan (double-click to center)'}>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.05}
          value={panValue}
          onChange={(e) => onChange({ pan: Math.round((Number(e.target.value) - (layer.pan ?? 0)) * 100) / 100 })}
          onDoubleClick={() => onChange({ pan: 0 })}
        />
        <span className={m.pan !== 0 ? 'is-tweaked' : ''}>
          {panLabel(panValue)}
          {layer.panEnd !== undefined ? ` → ${panLabel(Math.max(-1, Math.min(1, layer.panEnd + m.pan)))}` : ''}
        </span>
      </label>
    </div>
  )
}

export function MixRack({ soundKey }: { soundKey: string }) {
  const sound = useSets((s) => s.sounds.find((x) => x.key === soundKey))!
  const card = useSets((s) => s.cards[soundKey])
  const { setMix, resetMix, keepMix, updateCard } = useSets.getState()
  const base = basePatch(sound, card)
  const mix = mixOf(sound, card)
  const dirty = isDirty(base, card.mixes[card.version])
  const anySolo = mix.layers.some((m) => m.solo)
  const nextVersion = versionsOf(sound, card).length + 1

  const change = (next: Partial<PatchMix>) => setMix(soundKey, { ...mix, ...next })
  const changeLayer = (i: number, next: Partial<LayerMix>) =>
    change({ layers: mix.layers.map((m, j) => (j === i ? { ...m, ...next } : m)) })

  return (
    <div className="pss-mix peal-instruments">
      <StudioRack
        label="Mix"
        readout={(
          <StudioPadTray>
            <StudioPad
              active={card.bypass}
              tone="amber"
              disabled={!dirty}
              onClick={() => updateCard(soundKey, { bypass: !card.bypass })}
              title="Hear it without your edits (A/B)"
            >
              {card.bypass ? 'Original' : 'A/B'}
            </StudioPad>
            <StudioPad disabled={!dirty} onClick={() => resetMix(soundKey)} title="Drop all edits">Reset</StudioPad>
            <StudioPad active={dirty} disabled={!dirty} onClick={() => keepMix(soundKey)} title="Save the edits as a new version">
              Keep as v{nextVersion}
            </StudioPad>
          </StudioPadTray>
        )}
      >
        <div className="pss-strips">
          {base.layers.map((layer, i) => (
            <LayerRow
              key={`${layer.name}-${i}`}
              soundKey={soundKey}
              index={i}
              layer={layer}
              m={mix.layers[i]}
              dimmed={mix.layers[i].mute || (anySolo && !mix.layers[i].solo)}
              onChange={(next) => changeLayer(i, next)}
            />
          ))}
        </div>
        <div className="pss-macros">
          <StudioKnob label="Room" value={mix.room} min={0} max={0.6} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(room) => change({ room })} tweaked={mix.room !== (base.room?.mix ?? 0)} />
          <StudioKnob label="Tone" value={mix.tone} min={-1.5} max={1.5} step={0.05} format={(v) => (v === 0 ? 'flat' : `${v > 0 ? '+' : ''}${v.toFixed(2)}oct`)} onChange={(tone) => change({ tone })} tweaked={mix.tone !== 0} />
          <StudioKnob label="Pitch" value={mix.pitch} min={-12} max={12} step={1} format={(v) => `${v > 0 ? '+' : ''}${v}st`} onChange={(pitch) => change({ pitch })} tweaked={mix.pitch !== 0} />
          <StudioKnob label="Length" value={mix.length} min={0.5} max={2} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={(length) => change({ length })} tweaked={mix.length !== 1} />
        </div>
      </StudioRack>
      <p className="pss-hint">Drag a lane to move that layer · double-click a fader to reset · edits play live.</p>
    </div>
  )
}
