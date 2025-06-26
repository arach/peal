'use client'

import { useSoundStore } from '@/store/soundStore'
import SoundCard from './SoundCard'

export default function SoundGrid() {
  const { filteredSounds } = useSoundStore()
  const sounds = filteredSounds()

  // No empty state here - HeroSection handles zero-state experience
  if (sounds.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
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