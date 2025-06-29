'use client'

import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useRouter } from 'next/navigation'
import { Zap, Settings, Sliders, Activity, Music, Sparkles, Library } from 'lucide-react'

export default function HeroSection() {
  const { sounds, showGenerationParams, toggleGenerationParams } = useSoundStore()
  const { generateBatch } = useSoundGeneration()
  const router = useRouter()

  // Show hero only when there are no sounds (zero state)
  if (sounds.length > 0) return null

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-background to-background dark:from-gray-900/50 dark:via-gray-950 dark:to-gray-950 border border-border dark:border-gray-800 rounded-2xl shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(74, 158, 255) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }}></div>
      
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
          </div>
        </div>
      </div>
    </div>
  )
}