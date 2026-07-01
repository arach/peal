/** Peal brand mark — compact app tile with a centered waveform. */

const WAVE = [0.38, 0.68, 1, 0.68, 0.38]

function barFill(i: number, n: number) {
  const t = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2)
  if (t > 0.75) return '#c8e4ff'
  if (t > 0.4) return '#8ec2ff'
  return '#5aa6ff'
}

export function PealBrandMark({ size = 28 }: { size?: number }) {
  const pad = size * 0.22
  const gap = size * 0.08
  const n = WAVE.length
  const barWidth = (size - pad * 2 - gap * (n - 1)) / n
  const cy = size / 2
  const maxBarHeight = size - pad * 2
  const radius = size * 0.28
  const gid = `peal-mark-${size}`

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="peal-brand-mark"
    >
      <defs>
        <linearGradient id={`${gid}-tile`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2a42" />
          <stop offset="100%" stopColor="#121c2c" />
        </linearGradient>
        <linearGradient id={`${gid}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(140, 196, 255, 0.9)" />
          <stop offset="100%" stopColor="rgba(52, 108, 176, 0.55)" />
        </linearGradient>
      </defs>

      <rect
        x={0.75}
        y={0.75}
        width={size - 1.5}
        height={size - 1.5}
        rx={radius - 0.5}
        fill={`url(#${gid}-tile)`}
        stroke={`url(#${gid}-rim)`}
        strokeWidth={1}
      />

      {WAVE.map((h, i) => {
        const barH = Math.max(maxBarHeight * h, barWidth * 1.1)
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
            fill={barFill(i, n)}
          />
        )
      })}
    </svg>
  )
}

export function PealWordmark() {
  return <span className="peal-wordmark">peal</span>
}