'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Wand2 } from 'lucide-react'
import { VibeParser } from '@/lib/vibeParser'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useSoundStore } from '@/store/soundStore'
import { Sound } from '@/store/soundStore'

interface VibeSoundDesignerProps {
  onClose: () => void
}

export default function VibeSoundDesigner({ onClose }: VibeSoundDesignerProps) {
  const [prompt, setPrompt] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSounds, setGeneratedSounds] = useState<Sound[]>([])
  const { generator } = useSoundGeneration()
  const { addSounds } = useSoundStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    // Update suggestions as user types
    const newSuggestions = VibeParser.getSuggestions(prompt)
    setSuggestions(newSuggestions)
  }, [prompt])

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setGeneratedSounds([])

    try {
      // Parse the prompt
      const intent = VibeParser.parsePrompt(prompt)
      const paramsList = VibeParser.generateParameters(intent)

      // First, generate all individual sounds
      const individualSounds: (Sound & { delay?: number })[] = []
      
      for (let i = 0; i < paramsList.length; i++) {
        const params = paramsList[i]
        
        // Create sound object
        const sound: Sound & { delay?: number } = {
          id: `vibe-${Date.now()}-${i}`,
          type: params.type,
          frequency: params.frequency || 440,
          duration: Math.round((params.duration || 0.5) * 1000),
          parameters: {
            frequency: params.frequency || 440,
            duration: params.duration || 0.5,
            waveform: params.waveform || 'sine',
            attack: params.attack || 0.01,
            decay: params.decay || 0.1,
            sustain: params.sustain || 0.5,
            release: params.release || 0.1,
            effects: params.effects || {
              reverb: false,
              delay: false,
              filter: false,
              distortion: false,
              compression: false
            },
            clickDuration: params.clickDuration,
            direction: params.direction,
            volume: params.volume
          },
          created: new Date(),
          favorite: false,
          tags: ['vibe-generated'],
          audioBuffer: null,
          waveformData: null,
          delay: params.delay
        }

        // Generate audio
        await (generator as any).renderSound(sound)
        individualSounds.push(sound)
      }

      // If multiple sounds, create a composite sound that contains all of them
      if (individualSounds.length > 1) {
        // Calculate total duration including delays
        let totalDuration = 0
        for (const sound of individualSounds) {
          const delay = sound.delay || 0
          totalDuration = Math.max(totalDuration, delay + (sound.parameters.duration || 0))
        }

        const compositeSound: Sound & { compositeSounds?: Sound[] } = {
          id: `vibe-composite-${Date.now()}`,
          type: 'composite',
          frequency: individualSounds[0].frequency,
          duration: Math.round(totalDuration * 1000),
          parameters: {
            frequency: 0,
            duration: totalDuration,
            waveform: 'sine',
            attack: 0,
            decay: 0,
            sustain: 1,
            release: 0,
            effects: {
              reverb: false,
              delay: false,
              filter: false,
              distortion: false,
              compression: false
            }
          },
          created: new Date(),
          favorite: false,
          tags: ['vibe-generated', 'composite', ...prompt.split(' ').filter(w => w.length > 3)],
          audioBuffer: null,
          waveformData: null,
          compositeSounds: individualSounds
        }

        setGeneratedSounds([compositeSound])
      } else {
        setGeneratedSounds(individualSounds)
      }
    } catch (error) {
      console.error('Error generating vibe sounds:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (generatedSounds.length > 0) {
      addSounds(generatedSounds)
      onClose()
    }
  }

  const playSound = async (sound: Sound) => {
    try {
      // Check if this is a composite sound
      const compositeSounds = (sound as any).compositeSounds
      if (compositeSounds) {
        // Play all sounds with their delays
        for (const individualSound of compositeSounds) {
          const delay = (individualSound as any).delay || 0
          if (delay > 0) {
            setTimeout(() => generator.playSound(individualSound), delay * 1000)
          } else {
            generator.playSound(individualSound)
          }
        }
      } else {
        await generator.playSound(sound)
      }
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Vibe Sound Designer
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Describe the sound you want in plain English
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Try: 'a short high beep' or '3 quick clicks'"
              className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Wand2 size={18} />
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && prompt.length < 20 && (
            <div className="mt-2 space-y-1">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(suggestion)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Generating sounds from your vibe...</p>
          </div>
        )}

        {/* Generated Sounds */}
        {generatedSounds.length > 0 && !isGenerating && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Generated sound:
            </h3>
            <div className="space-y-2">
              {generatedSounds.map((sound, index) => {
                const compositeSounds = (sound as any).compositeSounds
                const isComposite = compositeSounds && compositeSounds.length > 1
                
                return (
                  <div
                    key={sound.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-purple-500">
                          {prompt}
                        </span>
                        {isComposite && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded">
                            {compositeSounds.length} parts
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => playSound(sound)}
                        className="px-4 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
                      >
                        ▶ Play
                      </button>
                    </div>
                    
                    {isComposite ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div>Total duration: {sound.duration}ms</div>
                        <div className="pl-3 border-l-2 border-purple-200 dark:border-purple-700">
                          {compositeSounds.map((subSound: any, i: number) => (
                            <div key={i} className="py-1">
                              {subSound.delay ? `${(subSound.delay * 1000).toFixed(0)}ms: ` : ''}
                              {subSound.type} ({subSound.frequency}Hz, {(subSound.parameters.duration * 1000).toFixed(0)}ms)
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {sound.type} • {sound.duration}ms • {sound.frequency}Hz
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setGeneratedSounds([])
                  setPrompt('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Try Again
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Save to Library
              </button>
            </div>
          </div>
        )}

        {/* Examples */}
        {generatedSounds.length === 0 && !isGenerating && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
              Example prompts:
            </h4>
            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-400">
              <li>• "A gentle notification chime"</li>
              <li>• "Three short beeps increasing in pitch"</li>
              <li>• "A deep, smooth swoosh sound"</li>
              <li>• "Quick, punchy interface clicks"</li>
              <li>• "A bright success ding"</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}