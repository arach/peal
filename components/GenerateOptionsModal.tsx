'use client'

import { useState } from 'react'
import { X, Sparkles, Sliders, Zap, Shuffle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { Sound } from '@/store/soundStore'

interface GenerateOptionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GenerateOptionsModal({ isOpen, onClose }: GenerateOptionsModalProps) {
  const { generateBatch } = useSoundGeneration()
  const [selectedTypes, setSelectedTypes] = useState<Sound['type'][]>(['click', 'tone', 'chime'])
  const [count, setCount] = useState(12)
  const [temperature, setTemperature] = useState<'conservative' | 'balanced' | 'wild'>('balanced')
  const [isGenerating, setIsGenerating] = useState(false)

  const soundTypes: { value: Sound['type'], label: string, icon: string }[] = [
    { value: 'click', label: 'Clicks', icon: '👆' },
    { value: 'tone', label: 'Tones', icon: '🎵' },
    { value: 'chime', label: 'Chimes', icon: '🔔' },
    { value: 'sweep', label: 'Sweeps', icon: '🌊' },
    { value: 'pulse', label: 'Pulses', icon: '💫' }
  ]

  const temperatureOptions = [
    {
      value: 'conservative' as const,
      label: 'Conservative',
      description: 'Stick to familiar patterns',
      icon: '🎯',
      color: 'blue'
    },
    {
      value: 'balanced' as const,
      label: 'Balanced',
      description: 'Mix of safe and creative',
      icon: '⚖️',
      color: 'purple'
    },
    {
      value: 'wild' as const,
      label: 'Go Wild',
      description: 'Maximum creativity',
      icon: '🚀',
      color: 'pink'
    }
  ]

  const toggleType = (type: Sound['type']) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleGenerate = async () => {
    if (selectedTypes.length === 0 || isGenerating) return

    setIsGenerating(true)
    try {
      // Pass options to generate batch
      await generateBatch(count, {
        enabledTypes: selectedTypes,
        temperature,
        // Add variation based on temperature
        enabledEffects: temperature === 'wild' 
          ? ['reverb', 'delay', 'filter', 'distortion', 'modulation']
          : temperature === 'balanced'
          ? ['reverb', 'delay', 'filter']
          : ['reverb'],
        durationMin: temperature === 'wild' ? 50 : 100,
        durationMax: temperature === 'wild' ? 2000 : 1000,
        frequencyMin: temperature === 'wild' ? 100 : 200,
        frequencyMax: temperature === 'wild' ? 4000 : 2000
      })
      onClose()
    } catch (error) {
      console.error('Error generating sounds:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="relative border-b border-gray-200 dark:border-gray-800 p-6">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Sliders className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Generate Options
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Customize your sound generation
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Sound Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Sound Types
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {soundTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => toggleType(type.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedTypes.includes(type.value)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Number of Sounds: <span className="text-purple-600 dark:text-purple-400">{count}</span>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>6</span>
                    <span>25</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Generation Style
                  </label>
                  <div className="space-y-2">
                    {temperatureOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTemperature(option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          temperature === option.value
                            ? option.color === 'blue'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : option.color === 'purple'
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{option.icon}</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {option.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {option.description}
                            </p>
                          </div>
                          {temperature === option.value && (
                            <div className={`w-2 h-2 rounded-full ${
                              option.color === 'blue' ? 'bg-blue-500' :
                              option.color === 'purple' ? 'bg-purple-500' : 'bg-pink-500'
                            }`} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={selectedTypes.length === 0 || isGenerating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate {count} Sounds
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}