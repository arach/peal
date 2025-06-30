'use client'

import { useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useRouter } from 'next/navigation'
import { Zap, Sparkles, Upload, Wand2 } from 'lucide-react'

export default function LibraryHero() {
  const { sounds } = useSoundStore()
  const { generateBatch } = useSoundGeneration()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'generate' | 'studio' | 'upload'>('generate')

  // Show hero only when there are no sounds (zero state)
  if (sounds.length > 0) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Start building your sound library
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Choose how you'd like to create your first sounds
        </p>

        {/* Action cards */}
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
            className={`p-6 rounded-lg border-2 transition-all ${
              activeTab === 'generate' 
                ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onMouseEnter={() => setActiveTab('generate')}
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Quick Generate
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Instantly create a set of polished sounds with one click
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
              Generate now
              <Wand2 size={14} />
            </span>
          </button>

          {/* AI Studio */}
          <button
            onClick={() => router.push('/studio')}
            className={`p-6 rounded-lg border-2 transition-all ${
              activeTab === 'studio' 
                ? 'border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onMouseEnter={() => setActiveTab('studio')}
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              AI Studio
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Describe sounds in natural language and fine-tune them
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
              Open Studio
              <Sparkles size={14} />
            </span>
          </button>

          {/* Import Sounds */}
          <button
            onClick={() => {
              // TODO: Implement import functionality
              alert('Import functionality coming soon!')
            }}
            className={`p-6 rounded-lg border-2 transition-all ${
              activeTab === 'upload' 
                ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onMouseEnter={() => setActiveTab('upload')}
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Import Sounds
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload your existing sound files to organize and enhance
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-400">
              Coming soon
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}