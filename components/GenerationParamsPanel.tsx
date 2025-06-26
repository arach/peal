'use client'

import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { Zap } from 'lucide-react'

export default function GenerationParamsPanel() {
  const {
    generationParams,
    updateGenerationParams,
    sounds,
    showGenerationParams,
    toggleGenerationParams
  } = useSoundStore()
  
  const { generateBatch } = useSoundGeneration()

  // Only show if user has sounds and wants advanced settings
  if (sounds.length === 0 || !showGenerationParams) return null

  const handleDurationMinChange = (value: number) => {
    updateGenerationParams({ durationMin: value })
  }

  const handleDurationMaxChange = (value: number) => {
    updateGenerationParams({ durationMax: value })
  }

  const handleFreqMinChange = (value: number) => {
    updateGenerationParams({ frequencyMin: value })
  }

  const handleFreqMaxChange = (value: number) => {
    updateGenerationParams({ frequencyMax: value })
  }

  const toggleSoundType = (type: string) => {
    const enabledTypes = generationParams.enabledTypes.includes(type)
      ? generationParams.enabledTypes.filter(t => t !== type)
      : [...generationParams.enabledTypes, type]
    
    updateGenerationParams({ 
      enabledTypes: enabledTypes.length > 0 ? enabledTypes : ['tone'] 
    })
  }

  const toggleEffect = (effect: string) => {
    const enabledEffects = generationParams.enabledEffects.includes(effect)
      ? generationParams.enabledEffects.filter(e => e !== effect)
      : [...generationParams.enabledEffects, effect]
    
    updateGenerationParams({ enabledEffects })
  }

  return (
    <div className="bg-surface-elevated dark:bg-gray-900/95 rounded-xl section-padding shadow-sm mb-8">
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading-2 text-primary-500 m-0">Generation Settings</h2>
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
            className="btn-base bg-primary-500 text-white hover:bg-primary-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/30 focus-ring"
          >
            <Zap size={16} />
            Generate Sounds
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sound Parameters */}
          <div className="space-y-component">
            <h3 className="section-header text-primary-500">
              Sound Parameters
            </h3>
            
            {/* Duration Range */}
            <div>
              <label className="form-label text-text-secondary dark:text-gray-400">Duration Range</label>
              <div className="flex gap-2 mb-2 caption text-text-tertiary dark:text-gray-400">
                <span>Min: {generationParams.durationMin}ms</span>
                <span>Max: {generationParams.durationMax}ms</span>
              </div>
              <div className="space-y-tight">
                <input
                  type="range"
                  min="100"
                  max="1000"
                  value={generationParams.durationMin}
                  onChange={(e) => handleDurationMinChange(Number(e.target.value))}
                  className="slider w-full focus-ring"
                />
                <input
                  type="range"
                  min="200"
                  max="2000"
                  value={generationParams.durationMax}
                  onChange={(e) => handleDurationMaxChange(Number(e.target.value))}
                  className="slider w-full focus-ring"
                />
              </div>
            </div>

            {/* Frequency Range */}
            <div>
              <label className="form-label text-text-secondary dark:text-gray-400">Frequency Range</label>
              <div className="flex gap-2 mb-2 caption text-text-tertiary dark:text-gray-400">
                <span>Min: {generationParams.frequencyMin}Hz</span>
                <span>Max: {generationParams.frequencyMax}Hz</span>
              </div>
              <div className="space-y-tight">
                <input
                  type="range"
                  min="100"
                  max="1000"
                  value={generationParams.frequencyMin}
                  onChange={(e) => handleFreqMinChange(Number(e.target.value))}
                  className="slider w-full focus-ring"
                />
                <input
                  type="range"
                  min="500"
                  max="4000"
                  value={generationParams.frequencyMax}
                  onChange={(e) => handleFreqMaxChange(Number(e.target.value))}
                  className="slider w-full focus-ring"
                />
              </div>
            </div>
          </div>

          {/* Sound Types */}
          <div className="space-y-component">
            <h3 className="section-header text-primary-500">
              Sound Types
            </h3>
            <div className="space-y-tight">
              {[
                { key: 'tone', label: 'Tone (sine/square)' },
                { key: 'chime', label: 'Chime (harmonic)' },
                { key: 'click', label: 'Click (percussive)' },
                { key: 'sweep', label: 'Sweep (ascending/descending)' },
                { key: 'pulse', label: 'Pulse (rhythmic)' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 body-text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generationParams.enabledTypes.includes(key)}
                    onChange={() => toggleSoundType(key)}
                    className="w-4 h-4 accent-primary-500 focus-ring"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Effects */}
          <div className="space-y-component">
            <h3 className="section-header text-primary-500">
              Effects
            </h3>
            <div className="space-y-tight">
              {[
                { key: 'reverb', label: 'Reverb' },
                { key: 'delay', label: 'Delay/Echo' },
                { key: 'filter', label: 'Filter Sweeps' },
                { key: 'distortion', label: 'Soft Distortion' },
                { key: 'modulation', label: 'Modulation' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 body-text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generationParams.enabledEffects.includes(key)}
                    onChange={() => toggleEffect(key)}
                    className="w-4 h-4 accent-primary-500 focus-ring"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider {
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: #374151;
          border-radius: 3px;
          outline: none;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #4a9eff;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #4a9eff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}