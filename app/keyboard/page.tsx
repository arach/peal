'use client'

import { useState, useEffect } from 'react'
import { Howl } from 'howler'

interface KeyboardSound {
  name: string
  file: string
  displayName: string
  description: string
  category: 'reference' | 'realistic' | 'experimental'
}

const keyboardSounds: KeyboardSound[] = [
  // 30-Second Sequences - A/B Comparison
  {
    name: 'learned_typing_30s',
    file: '/sounds/typing-sequences/learned_typing_30s.wav',
    displayName: '30s Learned (Pure Code)',
    description: 'Generated entirely through code synthesis',
    category: 'reference'
  },
  {
    name: 'sample_typing_30s', 
    file: '/sounds/typing-sequences/sample_typing_30s.wav',
    displayName: '30s Sample-Based',
    description: 'Real samples with pitch/volume variation',
    category: 'reference'
  },
  
  // Reference Samples
  {
    name: 'reference_single_1',
    file: '/sounds/typing-samples/single_key_1.wav',
    displayName: 'Reference Key 1',
    description: 'Real creamy keyboard single keystroke',
    category: 'reference'
  },
  {
    name: 'reference_sequence_1',
    file: '/sounds/typing-samples/typing_sequence_1.wav',
    displayName: 'Reference Sequence',
    description: 'Real typing sequence (1.5s)',
    category: 'reference'
  },
  {
    name: 'reference_long_1',
    file: '/sounds/typing-samples/typing_long_1.wav',
    displayName: 'Reference Long',
    description: 'Real extended typing (3s)',
    category: 'reference'
  },
  {
    name: 'reference_keyboard_long',
    file: '/sounds/typing-samples/reference_keyboard.wav',
    displayName: 'Reference Key (New)',
    description: 'High-quality keyboard sample from OPUS',
    category: 'reference'
  },
  {
    name: 'reference_keyboard_short',
    file: '/sounds/typing-samples/reference_keyboard_short.wav',
    displayName: 'Reference Short (New)',
    description: 'Short keypress from OPUS',
    category: 'reference'
  },
  
  // Best Realistic Sounds
  {
    name: 'key_tactile_realistic',
    file: '/sounds/realistic-keyboard/key_tactile_realistic.wav',
    displayName: 'Tactile Brown',
    description: 'Realistic tactile with balanced frequencies',
    category: 'realistic'
  },
  {
    name: 'creamy_tactile',
    file: '/sounds/creamy-keys/creamy_tactile.wav',
    displayName: 'Creamy Tactile',
    description: 'Subtle bump with creamy thock',
    category: 'realistic'
  },
  {
    name: 'key_spacebar_realistic',
    file: '/sounds/realistic-keyboard/key_spacebar_realistic.wav',
    displayName: 'Spacebar',
    description: 'Realistic spacebar with stabilizers',
    category: 'realistic'
  },
  {
    name: 'creamy_typing',
    file: '/sounds/creamy-keys/creamy_typing.wav',
    displayName: 'Creamy Typing',
    description: 'Natural typing rhythm',
    category: 'realistic'
  },
  
  // Experimental Sounds
  {
    name: 'deep_thock',
    file: '/sounds/experimental/deep_thock.wav',
    displayName: 'Deep Thock',
    description: 'Very low frequency thock',
    category: 'experimental'
  },
  {
    name: 'sharp_clack',
    file: '/sounds/experimental/sharp_clack.wav',
    displayName: 'Sharp Clack',
    description: 'Clean clicky sound',
    category: 'experimental'
  },
  {
    name: 'hybrid_switch',
    file: '/sounds/experimental/hybrid_switch.wav',
    displayName: 'Hybrid Switch',
    description: 'Between tactile and linear',
    category: 'experimental'
  },
  {
    name: 'balanced_single_key',
    file: '/sounds/balanced-typing/balanced_single_key.wav',
    displayName: 'Balanced Key',
    description: 'Balanced frequency profile',
    category: 'experimental'
  },
  {
    name: 'proper_single',
    file: '/sounds/proper-keyboard/single_key.wav',
    displayName: 'Proper Single',
    description: 'Single key with breathing room',
    category: 'experimental'
  },
  {
    name: 'learned_keypress',
    file: '/sounds/learned-keyboard/learned_keypress.wav',
    displayName: 'Learned Key',
    description: 'Based on OPUS analysis: fast attack, strong lows',
    category: 'experimental'
  },
  {
    name: 'learned_tactile',
    file: '/sounds/learned-keyboard/learned_tactile.wav',
    displayName: 'Learned Tactile',
    description: 'Tactile with realistic bump and bottom-out',
    category: 'experimental'
  },
  {
    name: 'learned_typing',
    file: '/sounds/learned-keyboard/learned_typing.wav',
    displayName: 'Learned Typing',
    description: 'Natural typing based on real recordings',
    category: 'experimental'
  }
]

export default function KeyboardPage() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [currentSound, setCurrentSound] = useState<Howl | null>(null)

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        stopSound()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSound])

  const playSound = (sound: KeyboardSound) => {
    // Stop current sound if playing
    if (currentSound) {
      currentSound.stop()
    }

    // Create and play new sound
    const howl = new Howl({
      src: [sound.file],
      onend: () => {
        setPlaying(null)
        setCurrentSound(null)
      }
    })
    
    howl.play()
    setPlaying(sound.name)
    setCurrentSound(howl)
  }

  const stopSound = () => {
    if (currentSound) {
      currentSound.stop()
      setPlaying(null)
      setCurrentSound(null)
    }
  }

  const categories = {
    reference: keyboardSounds.filter(s => s.category === 'reference'),
    realistic: keyboardSounds.filter(s => s.category === 'realistic'),
    experimental: keyboardSounds.filter(s => s.category === 'experimental')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Keyboard Sound Comparison</h1>
          <p className="mt-2 text-gray-600">Compare reference recordings with synthetic keyboard sounds</p>
          <p className="mt-1 text-sm text-gray-500">Press Space or Escape to stop playback</p>
        </div>

        {/* Reference Samples */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📼</span> Reference & 30-Second Sequences
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Compare our 30-second code-generated typing vs sample-based approach
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.reference.map((sound) => (
              <div
                key={sound.name}
                className={`border rounded-lg p-4 transition-all ${
                  playing === sound.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="border-l-4 border-gray-500 pl-3">
                  <h3 className="font-medium text-gray-900">{sound.displayName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{sound.description}</p>
                  <button
                    onClick={() => playing === sound.name ? stopSound() : playSound(sound)}
                    className={`mt-3 px-4 py-2 rounded text-sm font-medium transition-colors ${
                      playing === sound.name
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {playing === sound.name ? 'Stop' : 'Play'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Realistic Sounds */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">✅</span> Best Realistic Sounds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.realistic.map((sound) => (
              <div
                key={sound.name}
                className={`border rounded-lg p-4 transition-all ${
                  playing === sound.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-medium text-gray-900">{sound.displayName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{sound.description}</p>
                  <button
                    onClick={() => playing === sound.name ? stopSound() : playSound(sound)}
                    className={`mt-3 px-4 py-2 rounded text-sm font-medium transition-colors ${
                      playing === sound.name
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {playing === sound.name ? 'Stop' : 'Play'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experimental Sounds */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🧪</span> Experimental Sounds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.experimental.map((sound) => (
              <div
                key={sound.name}
                className={`border rounded-lg p-4 transition-all ${
                  playing === sound.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="border-l-4 border-green-500 pl-3">
                  <h3 className="font-medium text-gray-900">{sound.displayName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{sound.description}</p>
                  <button
                    onClick={() => playing === sound.name ? stopSound() : playSound(sound)}
                    className={`mt-3 px-4 py-2 rounded text-sm font-medium transition-colors ${
                      playing === sound.name
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {playing === sound.name ? 'Stop' : 'Play'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}