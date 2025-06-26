'use client'

import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { Zap, Settings } from 'lucide-react'

export default function SimpleGenerateButton() {
  const { sounds, showGenerationParams, toggleGenerationParams } = useSoundStore()
  const { generateBatch } = useSoundGeneration()

  // Show simple generate button when user has sounds but advanced settings are hidden
  if (sounds.length === 0 || showGenerationParams) return null

  return (
    <div className="text-center py-12 space-y-4 bg-surface/50 dark:bg-gray-900/50 rounded-xl shadow-sm">
      <button
        onClick={async () => {
          // Initialize audio context with user gesture
          if (typeof window !== 'undefined') {
            try {
              const AudioContext = window.AudioContext || (window as any).webkitAudioContext
              const ctx = new AudioContext()
              if (ctx.state === 'suspended') {
                await ctx.resume()
              }
            } catch (error) {
              console.log('AudioContext initialization will happen during generation')
            }
          }
          generateBatch()
        }}
        className="btn-base btn-lg bg-primary-500 text-white hover:bg-primary-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/30 focus-ring mx-auto"
      >
        <Zap size={20} />
        Generate More Sounds
      </button>

      <div className="flex items-center justify-center gap-2">
        <span className="text-text-tertiary dark:text-gray-500 text-sm">Need more control?</span>
        <button
          onClick={toggleGenerationParams}
          className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          <Settings size={14} />
          Advanced Settings
        </button>
      </div>
    </div>
  )
}