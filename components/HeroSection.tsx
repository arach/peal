'use client'

import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useRouter } from 'next/navigation'
import { Zap, Settings, Sliders, Activity, Music, Sparkles, Library, Brain } from 'lucide-react'

export default function HeroSection() {
  const { sounds, showGenerationParams, toggleGenerationParams } = useSoundStore()
  const { generateBatch } = useSoundGeneration()
  const router = useRouter()

  // Show hero only when there are no sounds (zero state)
  if (sounds.length > 0) return null

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl">
      {/* Background decoration - matching landing page */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative text-center py-20 px-8 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-text-primary dark:text-gray-100">
            Create high-end bespoke sounds for your app
          </h1>
          
          <p className="text-xl text-text-secondary dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            No more buying random audio libraries. Design custom notification sounds that perfectly match your app's personality. Generate dozens of variations with full control over every parameter.
          </p>
        </div>

        {/* Features preview */}
        <div className="flex items-center justify-center gap-8 text-sm text-text-tertiary dark:text-gray-500">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-primary-400" />
            <span>Visual feedback</span>
          </div>
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-primary-400" />
            <span>Full control</span>
          </div>
          <div className="flex items-center gap-2">
            <Music size={16} className="text-primary-400" />
            <span>5 sound types</span>
          </div>
        </div>

        {/* Main CTA */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
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
              className="btn-base text-lg px-8 py-4 bg-primary-500 text-white hover:bg-primary-400 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/40 focus-ring transition-all duration-300 font-semibold"
            >
              <Zap size={24} />
              Generate Sounds
            </button>
            
            <button
              onClick={() => router.push('/presets')}
              className="btn-base text-lg px-8 py-4 bg-gray-800 text-gray-100 hover:bg-gray-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-800/40 focus-ring transition-all duration-300 font-semibold"
            >
              <Library size={24} />
              Browse Presets
            </button>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleGenerationParams}
              className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1 transition-colors hover:underline"
            >
              <Settings size={14} />
              Advanced Settings
            </button>
            
            <button
              onClick={() => router.push('/studio')}
              className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1 transition-colors hover:underline"
            >
              <Sparkles size={14} />
              Open Studio
            </button>
            
            <button
              onClick={() => router.push('/signature')}
              className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center gap-1 transition-colors hover:underline"
            >
              <Brain size={14} />
              Signature Sounds
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}