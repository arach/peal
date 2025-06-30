'use client'

import { useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useRouter } from 'next/navigation'
import { Zap, Sparkles, ChevronRight } from 'lucide-react'

export default function LibraryWelcome() {
  const { sounds } = useSoundStore()
  const { generateBatch } = useSoundGeneration()
  const router = useRouter()
  
  // Always show welcome, but adjust content based on whether there are sounds
  const hasSounds = sounds.length > 0

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {hasSounds ? 'Your Sound Library' : 'Start Building Your Library'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {hasSounds 
            ? `${sounds.length} sounds in your collection`
            : 'Choose how you\'d like to create your first sounds'
          }
        </p>
      </div>

      {!hasSounds && (
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Quick Generate */}
          <button
            onClick={async () => {
              // Initialize audio context
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
            className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all bg-white dark:bg-gray-900 group"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Quick Generate
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Instantly create a set of polished sounds
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
              Start now
              <ChevronRight size={14} />
            </span>
          </button>

          {/* AI Studio */}
          <button
            onClick={() => router.push('/studio')}
            className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all bg-white dark:bg-gray-900 group"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              AI Studio
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Describe sounds in natural language
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
              Open Studio
              <ChevronRight size={14} />
            </span>
          </button>

          {/* Browse Presets */}
          <button
            onClick={() => router.push('/presets')}
            className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-400 transition-all bg-white dark:bg-gray-900 group"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Browse Presets
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Start with pre-made sound collections
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              Explore
              <ChevronRight size={14} />
            </span>
          </button>
        </div>
      )}
    </div>
  )
}