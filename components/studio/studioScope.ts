/**
 * Canvas drawing for the studio's Scope (big line waveform on a dashed grid)
 * and Timeline (faint waveform, ms ruler, amber progress, white playhead with
 * a cap). Plain-mode rendering only — Studio.tsx layers edit/trim/insert
 * overlays on top of its own copy.
 */

/** 0..1 peak per column of channel `channel` — same shape Studio uses. */
export function waveformData(buffer: AudioBuffer, points = 100, channel = 0): number[] {
  const data = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1))
  const step = Math.max(1, Math.floor(data.length / points))
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    let max = 0
    for (let j = i * step; j < Math.min((i + 1) * step, data.length); j++) max = Math.max(max, Math.abs(data[j]))
    out.push(max)
  }
  return out
}

function prepare(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, rect.width, rect.height)
  return { ctx, width: rect.width, height: rect.height }
}

function playhead(ctx: CanvasRenderingContext2D, x: number, height: number, cap: boolean) {
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, 0)
  ctx.lineTo(x, height)
  ctx.stroke()
  if (cap) {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(x - 6, 0)
    ctx.lineTo(x + 6, 0)
    ctx.lineTo(x, 10)
    ctx.closePath()
    ctx.fill()
  }
}

export interface ScopeOptions {
  /** 0..1; 0 hides the playhead. */
  position?: number
  /** Hover position for the seek ghost line, or null. */
  hover?: number | null
  /** One data array per lane (stereo = two). */
  lanes: number[][]
  preview?: boolean
  /** Draw the grid (off for tiny inline scopes). */
  grid?: boolean
  /** 'bottom' sits the trace on a low baseline so peaks use the full height (small scopes). */
  anchor?: 'center' | 'bottom'
  /** 0..1 of the width this sound occupies — compare views share one time scale. */
  extent?: number
  /** Label for the hover ghost line, e.g. "212ms". */
  hoverLabel?: string
}

export function drawScope(canvas: HTMLCanvasElement | null, { lanes, position = 0, hover = null, preview = false, grid = true, anchor = 'center', extent = 1, hoverLabel }: ScopeOptions) {
  if (!canvas || lanes.length === 0) return
  const surface = prepare(canvas)
  if (!surface) return
  const { ctx, height } = surface
  const fullWidth = surface.width
  const width = fullWidth * extent
  const laneH = height / lanes.length

  lanes.forEach((data, li) => {
    const top = laneH * li
    const mid = anchor === 'bottom' ? top + laneH * 0.86 : top + laneH / 2
    if (grid) {
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 4])
      ctx.beginPath()
      ctx.moveTo(0, mid)
      ctx.lineTo(fullWidth, mid)
      ctx.stroke()
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * fullWidth
        ctx.beginPath()
        ctx.moveTo(x, top)
        ctx.lineTo(x, top + laneH)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }

    // Played portion brighter, the rest the studio blue.
    const step = width / data.length
    const amp = anchor === 'bottom' ? laneH * 0.92 : laneH / 2
    const trace = (color: string, from: number, to: number) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = from; i < to; i++) {
        const x = i * step
        const y = mid - data[i] * amp * 0.8
        if (i === from) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    const base = preview ? '#7cb8ff' : '#4a9eff'
    if (position > 0 && position <= 1) {
      const split = Math.min(data.length, Math.ceil(position * data.length) + 1)
      trace('#9ccaff', 0, split)
      trace(base, Math.max(0, split - 1), data.length)
    } else {
      trace(base, 0, data.length)
    }

    if (lanes.length > 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = '9px ui-monospace, monospace'
      ctx.fillText(li === 0 ? 'L' : 'R', 4, top + 11)
    }
  })

  if (hover !== null) {
    const hx = hover * fullWidth
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(hx, 0)
    ctx.lineTo(hx, height)
    ctx.stroke()
    if (hoverLabel) hoverTag(ctx, hoverLabel, hx, fullWidth)
  }
  if (position > 0 && position <= 1) playhead(ctx, position * width, height, false)
}

function hoverTag(ctx: CanvasRenderingContext2D, label: string, x: number, width: number) {
  ctx.font = 'bold 10px ui-monospace, SFMono-Regular, Menlo, monospace'
  const w = ctx.measureText(label).width + 8
  const lx = Math.min(Math.max(x - w / 2, 0), width - w)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
  ctx.fillRect(lx, 2, w, 14)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, lx + 4, 9)
}

export interface TimelineOptions {
  data: number[]
  /** Length of the ruler (the shared scale in compare views). */
  durationMs: number
  /** 0..1 of the ruler this sound occupies. */
  extent?: number
  position?: number
  hover?: number | null
}

export function drawTimeline(canvas: HTMLCanvasElement | null, { data, durationMs, extent = 1, position = 0, hover = null }: TimelineOptions) {
  if (!canvas || data.length === 0) return
  const surface = prepare(canvas)
  if (!surface) return
  const { ctx, height } = surface
  const fullWidth = surface.width
  const width = fullWidth * extent

  ctx.fillStyle = 'rgba(75, 85, 99, 0.1)'
  ctx.fillRect(0, 0, fullWidth, height)

  // Played region tint
  if (position > 0) {
    ctx.fillStyle = 'rgba(240, 180, 41, 0.07)'
    ctx.fillRect(0, 0, position * width, height)
  }

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  const step = width / data.length
  const amp = height / 3
  const centerY = height / 2
  data.forEach((v, i) => {
    const y = centerY - v * amp
    if (i === 0) ctx.moveTo(i * step, y)
    else ctx.lineTo(i * step, y)
  })
  ctx.stroke()

  // Amber position marker (always visible, like the studio)
  const px = position * width
  ctx.strokeStyle = '#f0b429'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(px, 0)
  ctx.lineTo(px, height)
  ctx.stroke()
  ctx.fillStyle = '#f0b429'
  ctx.fillRect(px - 1, height / 2 - 4, 2, 8)

  // ms ruler
  ctx.save()
  ctx.fillStyle = 'rgba(156, 163, 175, 0.9)'
  ctx.font = '11px Inter, system-ui, sans-serif'
  ctx.textBaseline = 'bottom'
  const markers = 5
  for (let i = 0; i <= markers; i++) {
    const x = (i / markers) * fullWidth
    const label = `${Math.round((i / markers) * durationMs)}ms`
    ctx.textAlign = i === 0 ? 'left' : i === markers ? 'right' : 'center'
    ctx.fillText(label, i === 0 ? x + 4 : i === markers ? x - 4 : x, height - 4)
  }
  ctx.restore()

  if (hover !== null) {
    const hx = hover * fullWidth
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(hx, 0)
    ctx.lineTo(hx, height)
    ctx.stroke()
    ctx.setLineDash([])
    hoverTag(ctx, `${Math.round(hover * durationMs)}ms`, hx, fullWidth)
  }

  if (position > 0 && position <= 1) playhead(ctx, px, height, true)
}
