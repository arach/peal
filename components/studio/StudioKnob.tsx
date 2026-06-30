'use client'

import { useCallback, useId, useRef, type PointerEvent as ReactPointerEvent } from 'react'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function snapToStep(value: number, min: number, step: number) {
  if (step <= 0) return value
  const steps = Math.round((value - min) / step)
  return min + steps * step
}

/** Classic synth sweep: 7 o'clock → 5 o'clock. */
function valueToAngle(value: number, min: number, max: number) {
  const ratio = max === min ? 0 : (value - min) / (max - min)
  return -135 + ratio * 270
}

export function StudioKnob({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  tweaked = false,
  className,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  onChange: (value: number) => void
  tweaked?: boolean
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const dragRef = useRef<{ y: number; value: number } | null>(null)

  const emit = useCallback((next: number) => {
    const snapped = snapToStep(next, min, step)
    const clamped = clamp(snapped, min, max)
    const decimals = String(step).includes('.') ? String(step).split('.')[1]?.length ?? 2 : 0
    const rounded = decimals > 0 ? Number(clamped.toFixed(decimals)) : clamped
    if (rounded !== value) onChange(rounded)
  }, [max, min, onChange, step, value])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { y: event.clientY, value }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const deltaY = dragRef.current.y - event.clientY
    const range = max - min
    const sensitivity = event.shiftKey ? 0.0025 : 0.012
    emit(dragRef.current.value + deltaY * range * sensitivity)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
  }

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const direction = event.deltaY < 0 ? 1 : -1
    const multiplier = event.shiftKey ? 1 : Math.max(1, Math.round((max - min) / step / 40))
    emit(value + direction * step * multiplier)
  }

  const angle = valueToAngle(value, min, max)
  const faceId = `knob-face-${uid}`
  const wellId = `knob-well-${uid}`

  return (
    <div className={cn('peal-inst-knob', tweaked && 'peal-inst-knob--tweaked', className)}>
      <div
        className="peal-inst-knob-module"
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={(event) => {
          const delta = event.shiftKey ? step * 0.25 : step
          if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
            event.preventDefault()
            emit(value + delta)
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
            event.preventDefault()
            emit(value - delta)
          }
        }}
      >
        <svg
          className="peal-inst-knob-svg"
          viewBox="0 0 80 80"
          aria-hidden
        >
          <defs>
            <radialGradient id={wellId} cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#1a1a1f" />
              <stop offset="72%" stopColor="#0b0b0d" />
              <stop offset="100%" stopColor="#050506" />
            </radialGradient>
            <radialGradient id={faceId} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#6a6a74" />
              <stop offset="38%" stopColor="#34343c" />
              <stop offset="72%" stopColor="#1a1a20" />
              <stop offset="100%" stopColor="#0e0e12" />
            </radialGradient>
          </defs>

          {/* Recessed socket */}
          <circle cx="40" cy="40" r="36" fill={`url(#${wellId})`} />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth="1.5"
          />

          {/* Arc tick marks (active sweep zone) */}
          <path
            d="M 18.5 58 A 30 30 0 1 1 61.5 58"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 22 54.5 A 26 26 0 1 1 58 54.5"
            fill="none"
            stroke="rgba(74,158,255,0.18)"
            strokeWidth="1"
            strokeDasharray="2 5"
          />

          {/* Rotating cap + pointer */}
          <g transform={`rotate(${angle} 40 40)`}>
            <circle
              cx="40"
              cy="40"
              r="27"
              fill={`url(#${faceId})`}
              stroke="rgba(0,0,0,0.65)"
              strokeWidth="1.25"
            />
            <circle
              cx="40"
              cy="40"
              r="27"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.75"
            />
            <line
              x1="40"
              y1="16"
              x2="40"
              y2="26"
              stroke={tweaked ? '#8ec5ff' : '#4a9eff'}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="40" cy="40" r="3.5" fill="#121216" stroke="rgba(255,255,255,0.08)" />
          </g>
        </svg>
      </div>

      <span className="peal-inst-knob-readout">{format(value)}</span>
      <span className="peal-inst-knob-label">
        {label}
        {tweaked ? <span className="peal-inst-knob-tweak">*</span> : null}
      </span>
    </div>
  )
}