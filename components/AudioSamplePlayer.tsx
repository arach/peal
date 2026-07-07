'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Code2, Pause, Play } from 'lucide-react'
import '@/styles/audio-sample-player.css'

export type AudioSampleWavePreset = 'console' | 'compact'

export type AudioSamplePlayerSample = {
  id: string
  title: string
  duration?: string
  type?: string
  tags?: string[]
  waveform: number[]
}

export type AudioSamplePlayerProps = {
  sample: AudioSamplePlayerSample
  isPlaying?: boolean
  onTogglePlay?: () => void
  onCodeClick?: () => void
  showType?: boolean
  showDuration?: boolean
  showTags?: boolean | 'hover'
  showCode?: boolean
  showLiveBadge?: boolean
  liveLabel?: string
  codeLabel?: string
  wavePreset?: AudioSampleWavePreset
  waveHeight?: number
  waveRailHeight?: number
  wavePaddingY?: number
  tagLimit?: number
  transportLeft?: ReactNode
  transportRight?: ReactNode
  className?: string
}

const WAVE_PRESETS: Record<
  AudioSampleWavePreset,
  { barGap: number; heightScale: number; baseAlpha: number; hoverAlpha: number }
> = {
  console: {
    barGap: 0.75,
    heightScale: 0.9,
    baseAlpha: 0.44,
    hoverAlpha: 0.66,
  },
  compact: {
    barGap: 2,
    heightScale: 0.78,
    baseAlpha: 0.38,
    hoverAlpha: 0.58,
  },
}

export default function AudioSamplePlayer({
  sample,
  isPlaying = false,
  onTogglePlay,
  onCodeClick,
  showType = true,
  showDuration = true,
  showTags = 'hover',
  showCode = true,
  showLiveBadge = true,
  liveLabel = 'On air',
  codeLabel = 'View code',
  wavePreset = 'console',
  waveHeight,
  waveRailHeight,
  wavePaddingY,
  tagLimit = 3,
  transportLeft,
  transportRight,
  className = '',
}: AudioSamplePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const progressRef = useRef(0)
  const [isHovered, setIsHovered] = useState(false)

  const preset = WAVE_PRESETS[wavePreset]
  const tags = sample.tags?.slice(0, tagLimit) ?? []
  const revealTags =
    showTags === true || (showTags === 'hover' && (isHovered || isPlaying))
  const resolvedWaveHeight = waveHeight ?? (wavePreset === 'console' ? 84 : 60)
  const stageStyle = {
    ...(waveRailHeight !== undefined ? { '--asp-rail-height': `${waveRailHeight}px` } : {}),
    ...(wavePaddingY !== undefined ? { '--asp-wave-pad-y': `${wavePaddingY}px` } : {}),
  } as CSSProperties

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const barWidth = width / sample.waveform.length
      const centerY = height / 2
      const maxHalfBar = (height / 2) * preset.heightScale

      sample.waveform.forEach((value, index) => {
        const halfBar = value * maxHalfBar
        const x = index * barWidth
        const top = centerY - halfBar
        const barHeight = halfBar * 2

        const isPlayed = isPlaying && index / sample.waveform.length < progressRef.current
        const alpha = isPlayed
          ? 1
          : isPlaying
            ? 0.84
            : isHovered
              ? preset.hoverAlpha
              : preset.baseAlpha

        const gradient = ctx.createLinearGradient(0, top, 0, top + barHeight)
        gradient.addColorStop(0, `rgba(74, 158, 255, ${alpha * 0.78})`)
        gradient.addColorStop(0.5, `rgba(107, 176, 255, ${alpha})`)
        gradient.addColorStop(1, `rgba(74, 158, 255, ${alpha * 0.78})`)

        ctx.fillStyle = gradient
        const barInset = preset.barGap / 2
        const drawWidth = Math.max(barWidth - preset.barGap, 1.5)
        ctx.fillRect(x + barInset, top, drawWidth, barHeight)
      })

      if (isPlaying) {
        progressRef.current += 0.02
        if (progressRef.current > 1) progressRef.current = 0
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [sample.waveform, isPlaying, isHovered, preset, wavePreset])

  useEffect(() => {
    if (!isPlaying) progressRef.current = 0
  }, [isPlaying])

  const leftSlot =
    transportLeft ??
    (showDuration && sample.duration ? (
      <span className="asp-transport-meta">{sample.duration}</span>
    ) : null)

  const rightSlot =
    transportRight ??
    (showCode && onCodeClick ? (
      <button type="button" className="asp-code-btn" onClick={onCodeClick}>
        <Code2 size={12} />
        {codeLabel}
      </button>
    ) : null)

  return (
    <article
      className={`asp ${isPlaying ? 'is-playing' : ''} ${isHovered ? 'is-hovered' : ''} ${className}`.trim()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="asp-head">
        <h3 className="asp-title">{sample.title}</h3>
        {showType && sample.type ? (
          <div className="asp-head-meta">
            <span className={`asp-type asp-type--${sample.type}`}>{sample.type}</span>
          </div>
        ) : null}
      </div>

      <div className={`asp-deck ${isPlaying ? 'is-playing' : ''}`}>
        <div className="asp-wave-stage" style={stageStyle}>
          <div className={`asp-wave-rail asp-wave-rail--top ${revealTags ? 'is-visible' : ''}`}>
            {tags.length > 0 && showTags !== false && (
              <div className="asp-tags">
                {tags.map((tag) => (
                  <span key={tag} className="asp-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="asp-wave-canvas" style={{ height: resolvedWaveHeight }}>
            <canvas ref={canvasRef} />
          </div>

          <div className="asp-wave-rail asp-wave-rail--bottom" aria-hidden="true" />
        </div>

        {showLiveBadge && isPlaying && <span className="asp-live">{liveLabel}</span>}
      </div>

      <div className="asp-transport">
        <div className="asp-transport-side asp-transport-side--left">{leftSlot}</div>
        <button
          type="button"
          className={`asp-transport-play ${isPlaying ? 'is-active' : ''}`}
          onClick={onTogglePlay}
          aria-label={isPlaying ? `Stop ${sample.title}` : `Play ${sample.title}`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="asp-play-glyph" />}
        </button>
        <div className="asp-transport-side asp-transport-side--right">{rightSlot}</div>
      </div>
    </article>
  )
}