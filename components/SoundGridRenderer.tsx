'use client'

import { Sound } from '@/store/soundStore'
import SoundCardRedesign from './SoundCardRedesign'
import SoundLibraryCard from './SoundLibraryCard'
import SkeletonCard from './SkeletonCard'

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

const GRID_GAPS: Record<number, string> = {
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
}

function buildGridClass(
  columns: { default?: number; sm?: number; lg?: number; xl?: number },
  gap: number,
  className: string,
) {
  const col = (n: number) => GRID_COLS[n] ?? GRID_COLS[1]
  return [
    'grid',
    col(columns.default ?? 1),
    columns.sm ? `sm:${col(columns.sm)}` : '',
    columns.lg ? `lg:${col(columns.lg)}` : '',
    columns.xl ? `xl:${col(columns.xl)}` : '',
    GRID_GAPS[gap] ?? 'gap-4',
    className,
  ].filter(Boolean).join(' ')
}

interface SoundGridRendererProps {
  sounds: Sound[]
  isLoading?: boolean
  columns?: {
    default?: number
    sm?: number
    lg?: number
    xl?: number
  }
  gap?: number
  onSoundClick?: (sound: Sound) => void
  className?: string
  cardVariant?: 'default' | 'rack'
}

export default function SoundGridRenderer({
  sounds,
  isLoading = false,
  columns = {
    default: 1,
    sm: 2,
    lg: 3,
    xl: 4,
  },
  gap = 6,
  onSoundClick,
  className = '',
  cardVariant = 'default',
}: SoundGridRendererProps) {
  const gridClass = buildGridClass(columns, gap, className)

  if (isLoading && sounds.length === 0) {
    const skeletonCount = (columns.default ?? columns.xl ?? 4) * 2
    return (
      <div className={gridClass}>
        {[...Array(skeletonCount)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (sounds.length === 0) {
    return null
  }

  return (
    <div className={gridClass}>
      {sounds.map((sound, index) => (
        <div
          key={sound.id}
          onClick={() => onSoundClick?.(sound)}
          className={onSoundClick ? 'cursor-pointer' : ''}
        >
          {cardVariant === 'rack' ? (
            <SoundLibraryCard sound={sound} index={index} />
          ) : (
            <SoundCardRedesign sound={sound} index={index} />
          )}
        </div>
      ))}
    </div>
  )
}