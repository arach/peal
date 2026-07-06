/** Peal brand mark — compact tile with a centered waveform. */

const VIEW = 32
const WAVE = [0.28, 0.48, 0.72, 1, 0.72, 0.48, 0.28]

export function PealBrandMark({ size = 28 }: { size?: number }) {
  const padY = 8
  const gap = 2
  const barW = 2
  const n = WAVE.length
  const totalBarsW = n * barW + (n - 1) * gap
  const startX = (VIEW - totalBarsW) / 2
  const maxH = VIEW - padY * 2
  const cy = VIEW / 2
  const radius = 7.5
  const gid = `peal-mark-${size}`

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="peal-brand-mark"
    >
      <defs>
        <linearGradient id={`${gid}-tile`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2434" />
          <stop offset="100%" stopColor="#121820" />
        </linearGradient>
        <linearGradient id={`${gid}-bars`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4e9ff" />
          <stop offset="45%" stopColor="#8ec2ff" />
          <stop offset="100%" stopColor="#4a9eff" />
        </linearGradient>
        <filter id={`${gid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.35" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        x={0.5}
        y={0.5}
        width={VIEW - 1}
        height={VIEW - 1}
        rx={radius}
        fill={`url(#${gid}-tile)`}
        stroke="rgba(120, 176, 255, 0.28)"
        strokeWidth={0.5}
      />

      <rect
        x={1}
        y={1}
        width={VIEW - 2}
        height={VIEW - 2}
        rx={radius - 0.5}
        fill="none"
        stroke="rgba(255, 255, 255, 0.04)"
        strokeWidth={0.5}
      />

      {WAVE.map((h, i) => {
        const barH = Math.max(maxH * h, barW * 1.4)
        const x = startX + i * (barW + gap)
        const y = cy - barH / 2
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={1}
            fill={`url(#${gid}-bars)`}
            filter={`url(#${gid}-glow)`}
            opacity={0.92 - Math.abs(i - (n - 1) / 2) * 0.04}
          />
        )
      })}
    </svg>
  )
}

export function PealWordmark() {
  return <span className="peal-wordmark">peal</span>
}