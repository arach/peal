'use client'

import { useSoundStore } from '@/store/soundStore'
import { Sparkles } from 'lucide-react'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'

export default function SimpleStatsBar() {
  const { sounds, filteredSounds } = useSoundStore()
  const { generateBatch } = useSoundGeneration()
  const filtered = filteredSounds()

  if (sounds.length === 0) return null

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {filtered.length === sounds.length ? (
            <>Showing <span className="font-medium text-gray-900 dark:text-gray-100">{sounds.length}</span> sounds</>
          ) : (
            <>Showing <span className="font-medium text-gray-900 dark:text-gray-100">{filtered.length}</span> of {sounds.length} sounds</>
          )}
        </span>
      </div>
      
      <button
        onClick={generateBatch}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
      >
        <Sparkles size={14} />
        Generate more
      </button>
    </div>
  )
}