'use client'

import { useSoundStore } from '@/store/soundStore'

export default function SimpleStatsBar() {
  const { sounds, filteredSounds } = useSoundStore()
  const filtered = filteredSounds()

  // Don't show if no sounds or no active filters
  if (sounds.length === 0 || filtered.length === sounds.length) return null

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Showing <span className="font-medium text-gray-900 dark:text-gray-100">{filtered.length}</span> of {sounds.length} sounds
    </div>
  )
}