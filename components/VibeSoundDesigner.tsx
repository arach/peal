'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Wand2 } from 'lucide-react'
import { VibeParser } from '@/lib/vibeParser'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useSoundStore } from '@/store/soundStore'
import { Sound } from '@/store/soundStore'

interface VibeSoundDesignerProps {
  onClose: () => void
  initialPrompt?: string
}

export default function VibeSoundDesigner({ onClose, initialPrompt }: VibeSoundDesignerProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSounds, setGeneratedSounds] = useState<Sound[]>([])
  const { generator } = useSoundGeneration()
  const { addSounds } = useSoundStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    // Auto-generate if we have an initial prompt
    if (initialPrompt && initialPrompt.trim()) {
      // Small delay to let the UI render first
      setTimeout(() => handleGenerate(), 100)
    }
  }, [initialPrompt])

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

        // Create a proper composite audio buffer by mixing all individual sounds
        const compositeBuffer = await createCompositeBuffer(individualSounds, totalDuration)
        
        const compositeSound: Sound = {
          id: `vibe-${Date.now()}`,
          type: individualSounds[0].type, // Use the type of the first sound
          frequency: individualSounds[0].frequency,
          duration: Math.round(totalDuration * 1000),
          parameters: {
            frequency: individualSounds[0].frequency,
            duration: totalDuration,
            waveform: individualSounds[0].parameters.waveform || 'sine',
            attack: individualSounds[0].parameters.attack || 0.01,
            decay: individualSounds[0].parameters.decay || 0.1,
            sustain: individualSounds[0].parameters.sustain || 0.5,
            release: individualSounds[0].parameters.release || 0.1,
            effects: individualSounds[0].parameters.effects || {
              reverb: false,
              delay: false,
              filter: false,
              distortion: false,
              compression: false
            }
          },
          created: new Date(),
          favorite: false,
          tags: ['vibe-generated', ...prompt.split(' ').filter(w => w.length > 3)],
          audioBuffer: compositeBuffer,
          waveformData: compositeBuffer ? generateWaveformData(compositeBuffer) : null
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

  // Helper function to create composite audio buffer
  const createCompositeBuffer = async (sounds: (Sound & { delay?: number })[], totalDuration: number): Promise<AudioBuffer | null> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const bufferLength = Math.floor(totalDuration * sampleRate)
      
      const compositeBuffer = audioContext.createBuffer(1, bufferLength, sampleRate)
      const compositeData = compositeBuffer.getChannelData(0)
      
      for (const sound of sounds) {
        if (!sound.audioBuffer) continue
        
        const delay = sound.delay || 0
        const startSample = Math.floor(delay * sampleRate)
        const soundData = sound.audioBuffer.getChannelData(0)
        
        // Mix the sound into the composite buffer
        for (let i = 0; i < soundData.length && (startSample + i) < bufferLength; i++) {
          compositeData[startSample + i] += soundData[i] * 0.5 // Reduce volume to prevent clipping
        }
      }
      
      await audioContext.close()
      return compositeBuffer
    } catch (error) {
      console.error('Error creating composite buffer:', error)
      return null
    }
  }

  // Helper function to generate waveform data from audio buffer
  const generateWaveformData = (buffer: AudioBuffer): number[] => {
    const channelData = buffer.getChannelData(0)
    const sampleStep = Math.floor(channelData.length / 100) // 100 data points
    const waveformData: number[] = []
    
    for (let i = 0; i < 100; i++) {
      const start = i * sampleStep
      const end = Math.min(start + sampleStep, channelData.length)
      
      let max = 0
      for (let j = start; j < end; j++) {
        max = Math.max(max, Math.abs(channelData[j]))
      }
      waveformData.push(max)
    }
    
    return waveformData
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
                  onClick={() => {
                    setPrompt(suggestion)
                    // Auto-generate after setting the prompt
                    setTimeout(() => handleGenerate(), 100)
                  }}
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
            <div className="space-y-1">
              {[
                "A gentle notification chime",
                "Three short beeps increasing in pitch", 
                "A deep, smooth swoosh sound",
                "Quick, punchy interface clicks",
                "A bright success ding"
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(example)
                    setTimeout(() => handleGenerate(), 100)
                  }}
                  className="block w-full text-left text-sm text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-200 transition-colors"
                >
                  • "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}