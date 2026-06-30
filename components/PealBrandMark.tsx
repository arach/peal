/** Peal brand mark — blue-tinted app tile with a centered audio waveform.
 *  Static (no store dependency) so it renders identically on the dark landing. */

// Symmetric double-peak waveform — reads as a burst of sound, not a signal-strength ramp.
const WAVE = [0.42, 0.72, 1, 0.64, 1, 0.72, 0.42]

function barColor(i: number, n: number) {
  // brighter toward the center of the wave for depth
  const t = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2)
  return t > 0.66 ? '#a9d0ff' : t > 0.33 ? '#7ab8ff' : '#5aa6ff'
}

export function PealBrandMark({ size = 26 }: { size?: number }) {
  const pad = size * 0.19
  const gap = size * 0.065
  const n = WAVE.length
  const barWidth = (size - pad * 2 - gap * (n - 1)) / n
  const cy = size / 2
  const maxBarHeight = size - pad * 2
  const radius = size * 0.3
  const gid = `peal-tile-${size}`

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="peal-brand-mark"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1c2e49" />
          <stop offset="1" stopColor="#131f33" />
        </linearGradient>
      </defs>
      <rect
        x={0.6}
        y={0.6}
        width={size - 1.2}
        height={size - 1.2}
        rx={radius}
        fill={`url(#${gid})`}
        stroke="rgba(74, 158, 255, 0.5)"
        strokeWidth={1}
      />
      {WAVE.map((h, i) => {
        const barH = Math.max(maxBarHeight * h, barWidth)
        const x = pad + i * (barWidth + gap)
        const y = cy - barH / 2
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barH}
            rx={barWidth / 2}
            fill={barColor(i, n)}
          />
        )
      })}
    </svg>
  )
}

export function PealWordmark() {
  return <span className="peal-wordmark">peal</span>
}
