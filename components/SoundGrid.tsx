'use client'

import { useSoundStore } from '@/store/soundStore'
import SoundCard from './SoundCard'
import SkeletonCard from './SkeletonCard'

export default function SoundGrid() {
  const { filteredSounds, isGenerating } = useSoundStore()
  const sounds = filteredSounds()

  // Show skeletons while generating
  if (isGenerating && sounds.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  // No empty state here - HeroSection handles zero-state experience
  if (sounds.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {sounds.map((sound, index) => (
        <SoundCard
          key={sound.id}
          sound={sound}
          index={index}
        />
      ))}
    </div>
  )
}