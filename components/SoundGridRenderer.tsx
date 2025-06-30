'use client'

import { Sound } from '@/store/soundStore'
import SoundCardRedesign from './SoundCardRedesign'
import SkeletonCard from './SkeletonCard'

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
}

export default function SoundGridRenderer({
  sounds,
  isLoading = false,
  columns = {
    default: 1,
    sm: 2,
    lg: 3,
    xl: 4
  },
  gap = 6,
  onSoundClick,
  className = ''
}: SoundGridRendererProps) {
  // Show skeletons while loading
  if (isLoading && sounds.length === 0) {
    const skeletonCount = (columns.lg || 3) * 2
    return (
      <div className={`grid grid-cols-${columns.default || 1} sm:grid-cols-${columns.sm || 2} lg:grid-cols-${columns.lg || 3} xl:grid-cols-${columns.xl || 4} gap-${gap} ${className}`}>
        {[...Array(skeletonCount)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  // No sounds
  if (sounds.length === 0) {
    return null
  }

  return (
    <div className={`grid grid-cols-${columns.default || 1} sm:grid-cols-${columns.sm || 2} lg:grid-cols-${columns.lg || 3} xl:grid-cols-${columns.xl || 4} gap-${gap} ${className}`}>
      {sounds.map((sound, index) => (
        <div
          key={sound.id}
          onClick={() => onSoundClick?.(sound)}
          className={onSoundClick ? 'cursor-pointer' : ''}
        >
          <SoundCardRedesign
            sound={sound}
            index={index}
          />
        </div>
      ))}
    </div>
  )
}