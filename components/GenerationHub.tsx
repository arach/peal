'use client'

import { useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { Zap, Sparkles, Settings } from 'lucide-react'
import VibeSoundDesigner from './VibeSoundDesigner'

export default function GenerationHub() {
  const { sounds, showGenerationParams, toggleGenerationParams } = useSoundStore()
  const { generateBatch } = useSoundGeneration()
  const [showVibeDesigner, setShowVibeDesigner] = useState(false)

  return (
    <>
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20 rounded-2xl p-8 shadow-sm border border-primary-100 dark:border-gray-800">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Create Your Perfect Sounds
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Generate random sounds or describe exactly what you want in natural language. 
              Build your custom sound library in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <button
              onClick={() => setShowVibeDesigner(true)}
              className="flex-1 btn-base btn-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 focus-ring group"
            >
              <Sparkles size={20} className="group-hover:animate-pulse" />
              Vibe Designer
            </button>
            
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
              className="flex-1 btn-base btn-lg bg-primary-500 text-white hover:bg-primary-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/30 focus-ring"
            >
              <Zap size={20} />
              Generate Random
            </button>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-text-tertiary dark:text-gray-500 text-sm">Need more control?</span>
            <button
              onClick={toggleGenerationParams}
              className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Settings size={14} />
              Advanced Settings
            </button>
          </div>

          {/* Example prompts for vibe designer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try saying:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'two short beeps',
                'metallic ping followed by chime', 
                'three quick clicks',
                'soft notification ding'
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setShowVibeDesigner(true)}
                  className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-1 rounded-full transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showVibeDesigner && (
        <VibeSoundDesigner onClose={() => setShowVibeDesigner(false)} />
      )}
    </>
  )
}