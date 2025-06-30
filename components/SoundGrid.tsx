'use client'

import { useSoundStore } from '@/store/soundStore'
import SoundCardRedesign from './SoundCardRedesign'
import SkeletonCard from './SkeletonCard'
import GenerateMoreCard from './GenerateMoreCard'
import GenerateMorePromoCard from './GenerateMorePromoCard'

export default function SoundGrid() {
  const { filteredSounds, isGenerating } = useSoundStore()
  const sounds = filteredSounds()

  // Show skeletons while generating
  if (isGenerating && sounds.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  // No sounds
  if (sounds.length === 0) {
    return null
  }

  // Position 11 (0-indexed position 10) for the promo card
  const PROMO_POSITION = 10
  
  const items: Array<{ type: 'sound' | 'promo' | 'generate', data?: any, key: string }> = []
  
  // Insert sounds with promotional card at position 11
  sounds.forEach((sound, index) => {
    if (index === PROMO_POSITION && sounds.length > 20) {
      // Insert promo card at position 11 (index 10)
      items.push({ type: 'promo', key: 'promo-main' })
    }
    items.push({ type: 'sound', data: sound, key: sound.id })
  })
  
  // If we haven't added the promo yet (not enough sounds), add it at the end
  if (sounds.length <= 20 && sounds.length >= 8) {
    items.push({ type: 'promo', key: 'promo-end' })
  }
  
  // Always add the simple generate card at the very end
  items.push({ type: 'generate', key: 'generate-end' })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => {
        if (item.type === 'promo') {
          return <GenerateMorePromoCard key={item.key} />
        } else if (item.type === 'generate') {
          return <GenerateMoreCard key={item.key} />
        } else {
          return (
            <SoundCardRedesign
              key={item.key}
              sound={item.data}
              index={index}
            />
          )
        }
      })}
    </div>
  )
}