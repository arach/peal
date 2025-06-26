'use client'

import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { Zap, Settings, Sliders, Waveform, Music } from 'lucide-react'
import PealLogo from './PealLogo'

export default function HeroSection() {
  const { sounds, showGenerationParams, toggleGenerationParams } = useSoundStore()
  const { generateBatch } = useSoundGeneration()

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
          <PealLogo size={300} />
          
          <p className="text-xl text-text-secondary dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Take the driver's seat in creating unique notification sounds. We'll generate dozens of variations with customizable duration, frequency, effects, and sound types—from gentle chimes to rhythmic pulses. 
            <span className="inline-flex items-center gap-1 ml-1">
              <Settings size={16} className="text-primary-500" />
              <span className="text-primary-500 font-medium">Advanced settings</span>
            </span> 
            let you fine-tune every detail when you're ready.
          </p>
        </div>

        {/* Features preview */}
        <div className="flex items-center justify-center gap-8 text-sm text-text-tertiary dark:text-gray-500">
          <div className="flex items-center gap-2">
            <Waveform size={16} className="text-primary-400" />
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
            className="btn-base text-lg px-8 py-4 bg-primary-500 text-white hover:bg-primary-400 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/40 focus-ring mx-auto transition-all duration-300 font-semibold"
          >
            <Zap size={24} />
            Generate Sounds
          </button>

          <div className="flex items-center justify-center gap-2">
            <span className="text-text-tertiary dark:text-gray-500 text-sm">Want to customize first?</span>
            <button
              onClick={toggleGenerationParams}
              className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1 transition-colors hover:underline"
            >
              <Settings size={14} />
              Advanced Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}