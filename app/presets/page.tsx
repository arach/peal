'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Download, Sparkles, Copy, Volume2 } from 'lucide-react'
import { modernAppPresets, soundCategories, getPresetsByCategory, type SoundPreset } from '@/lib/presets/modernAppSounds'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useSoundStore } from '@/store/soundStore'

export default function PresetsPage() {
  const router = useRouter()
  const { generator, playSound } = useSoundGeneration()
  const { addSounds } = useSoundStore()
  const [selectedCategory, setSelectedCategory] = useState('interaction')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filteredPresets = getPresetsByCategory(selectedCategory)

  // Generate audio from preset parameters
  const generatePresetSound = async (preset: SoundPreset) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const sampleRate = 44100
    const duration = preset.parameters.duration || 0.2
    const offlineContext = new OfflineAudioContext(1, sampleRate * duration, sampleRate)

    // Create oscillator
    const osc = offlineContext.createOscillator()
    const gain = offlineContext.createGain()
    
    // Set oscillator parameters
    osc.type = preset.parameters.oscillator?.waveform || 'sine'
    osc.frequency.value = preset.parameters.oscillator?.frequency || 440
    if (preset.parameters.oscillator?.detune) {
      osc.detune.value = preset.parameters.oscillator.detune
    }

    // Apply envelope
    const env = preset.parameters.envelope || { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 }
    const now = 0
    
    // Ensure envelope times don't exceed duration
    const safeAttack = Math.min(env.attack, duration * 0.2)
    const safeDecay = Math.min(env.decay, duration * 0.3)
    const safeRelease = Math.min(env.release, duration * 0.3)
    const sustainTime = Math.max(0, duration - safeAttack - safeDecay - safeRelease)
    
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.5, now + safeAttack)
    gain.gain.linearRampToValueAtTime(env.sustain * 0.5, now + safeAttack + safeDecay)
    
    if (sustainTime > 0) {
      gain.gain.setValueAtTime(env.sustain * 0.5, now + safeAttack + safeDecay + sustainTime)
    }
    
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    // Connect and render
    osc.connect(gain)
    gain.connect(offlineContext.destination)
    osc.start(now)
    osc.stop(now + duration)

    const buffer = await offlineContext.startRendering()
    return buffer
  }

  const handlePlayPreset = async (preset: SoundPreset) => {
    if (playingId === preset.id) {
      // Stop if already playing
      setPlayingId(null)
      return
    }

    setPlayingId(preset.id)
    
    try {
      // Generate the audio buffer
      const audioBuffer = await generatePresetSound(preset)
      
      // Create a temporary sound object to play
      const tempSound = {
        id: preset.id,
        type: 'tone' as const,
        duration: (preset.parameters.duration || 0.2) * 1000,
        frequency: preset.parameters.oscillator?.frequency || 440,
        brightness: 50,
        created: new Date(),
        favorite: false,
        tags: [],
        parameters: preset.parameters,
        waveformData: null,
        audioBuffer: audioBuffer
      }
      
      // Play it
      await playSound(tempSound)
      
      // Clear playing state after duration
      setTimeout(() => {
        setPlayingId(null)
      }, (preset.parameters.duration || 0.2) * 1000)
    } catch (error) {
      console.error('Error playing preset:', error)
      setPlayingId(null)
    }
  }

  const handleUseInStudio = async (preset: SoundPreset) => {
    setGeneratingId(preset.id)
    
    try {
      // Generate the audio buffer
      const audioBuffer = await generatePresetSound(preset)
      
      // Create a sound object
      const sound = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        type: 'tone' as const,
        duration: (preset.parameters.duration || 0.2) * 1000,
        frequency: preset.parameters.oscillator?.frequency || 440,
        brightness: 50,
        created: new Date(),
        favorite: false,
        tags: preset.tags,
        parameters: preset.parameters,
        waveformData: null,
        audioBuffer: audioBuffer
      }
      
      // Add to sound library
      addSounds([sound])
      
      // Navigate to studio with this sound
      router.push(`/studio?sound=${sound.id}`)
    } catch (error) {
      console.error('Error generating preset:', error)
      setGeneratingId(null)
    }
  }

  const handleCopyParameters = (preset: SoundPreset) => {
    const params = JSON.stringify(preset.parameters, null, 2)
    navigator.clipboard.writeText(params)
    
    // Show brief feedback
    setHoveredId(preset.id + '-copied')
    setTimeout(() => setHoveredId(null), 1000)
  }

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'micro': return '<100ms'
      case 'short': return '100-300ms'
      case 'medium': return '300-500ms'
      default: return duration
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <div className="w-px h-6 bg-gray-700"></div>
              <div>
                <h1 className="text-2xl font-bold">Modern App Sounds</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Polished, intentional sound effects for futuristic applications
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/studio')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-lg transition-colors"
            >
              <Sparkles size={16} />
              Create Custom
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-3 overflow-x-auto">
            {Object.entries(soundCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === key
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Presets Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
              onMouseEnter={() => setHoveredId(preset.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{preset.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{preset.description}</p>
                </div>
                <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  {getDurationLabel(preset.duration)}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {preset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayPreset(preset)}
                  disabled={playingId !== null && playingId !== preset.id}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    playingId === preset.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {playingId === preset.id ? (
                    <>
                      <Volume2 size={16} className="animate-pulse" />
                      Playing
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Preview
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleUseInStudio(preset)}
                  disabled={generatingId === preset.id}
                  className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
                  title="Open in Studio"
                >
                  {generatingId === preset.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </button>
                
                <button
                  onClick={() => handleCopyParameters(preset)}
                  className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
                  title="Copy parameters"
                >
                  {hoveredId === preset.id + '-copied' ? (
                    <span className="text-xs text-green-400">✓</span>
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              {/* Visual indicator */}
              {hoveredId === preset.id && (
                <div className="mt-4 h-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPresets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No presets in this category yet.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-800">
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="font-semibold mb-3">About Modern App Sounds</h3>
          <p className="text-sm text-gray-400 mb-4">
            This preset library is designed for creating polished, intentional sound effects 
            perfect for modern applications, marketing materials, and video content. Each sound 
            is crafted to be short, snappy, and refined - embodying the futuristic aesthetic 
            of cutting-edge software.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-300 mb-1">Use Cases</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• UI interactions</li>
                <li>• Marketing videos</li>
                <li>• Product demos</li>
                <li>• App notifications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-1">Design Principles</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Ultra-short duration</li>
                <li>• Clean & refined</li>
                <li>• Non-intrusive</li>
                <li>• Purposeful</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-1">Customization</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Open any preset in Studio</li>
                <li>• Adjust parameters</li>
                <li>• Layer multiple sounds</li>
                <li>• Export for any use</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}