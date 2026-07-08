'use client'

import { useSoundStore } from '@/store/soundStore'
import SoundCardRedesign from './SoundCardRedesign'
import SkeletonCard from './SkeletonCard'
import GenerateMoreCard from './GenerateMoreCard'
import GenerateMorePromoCard from './GenerateMorePromoCard'

export default function SoundGrid() {
  const { filteredSounds, isGenerating } = useSoundStore()
  const sounds = filteredSounds()

  if (isGenerating && sounds.length === 0) {
    return (
      <div className="library-sound-grid">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (sounds.length === 0) {
    return null
  }

  const PROMO_POSITION = 10
  const showPromo = sounds.length >= 8

  const items: Array<{ type: 'sound' | 'promo' | 'generate'; data?: (typeof sounds)[number]; key: string }> = []

  sounds.forEach((sound, index) => {
    if (showPromo && index === PROMO_POSITION && sounds.length > 20) {
      items.push({ type: 'promo', key: 'promo-main' })
    }
    items.push({ type: 'sound', data: sound, key: sound.id })
  })

  if (showPromo && sounds.length <= 20) {
    items.push({ type: 'promo', key: 'promo-end' })
  }

  items.push({ type: 'generate', key: 'generate-end' })

  return (
    <div className="library-sound-grid">
      {items.map((item, index) => {
        if (item.type === 'promo') {
          return <GenerateMorePromoCard key={item.key} />
        }
        if (item.type === 'generate') {
          return <GenerateMoreCard key={item.key} />
        }
        return (
          <SoundCardRedesign
            key={item.key}
            sound={item.data!}
            index={index}
          />
        )
      })}
    </div>
  )
}