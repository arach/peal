'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Pause, Brain, Smartphone, Sparkles, Atom, Download, Volume2 } from 'lucide-react'
import Link from 'next/link'
import { Howl } from 'howler'

interface SignatureSound {
  name: string
  file: string
  category: 'neural' | 'haptic' | 'cascade' | 'experimental'
  displayName: string
  description: string
  inspiration: string
}

const signatureSounds: SignatureSound[] = [
  // Neural sounds
  {
    name: 'synaptic_fire',
    file: '/sounds/signature-sounds/synaptic_fire.wav',
    category: 'neural',
    displayName: 'Synaptic Fire',
    description: 'Rapid neural firing patterns across multiple pathways',
    inspiration: 'Inspired by Neural Pulse - simulates actual brain activity'
  },
  {
    name: 'cortex_wave',
    file: '/sounds/signature-sounds/cortex_wave.wav',
    category: 'neural',
    displayName: 'Cortex Wave',
    description: 'Alpha, beta, and gamma brainwave synthesis',
    inspiration: 'Brainwave patterns with binaural-like beating'
  },
  {
    name: 'dendrite_cascade',
    file: '/sounds/signature-sounds/dendrite_cascade.wav',
    category: 'neural',
    displayName: 'Dendrite Cascade',
    description: 'Cascading activation through neural dendrites',
    inspiration: 'Signal propagation through neural branches'
  },
  
  // Haptic sounds
  {
    name: 'deep_haptic_pulse',
    file: '/sounds/signature-sounds/deep_haptic_pulse.wav',
    category: 'haptic',
    displayName: 'Deep Haptic Pulse',
    description: 'Sub-bass frequency for physical sensation',
    inspiration: 'Inspired by Haptic Click - even deeper and more physical'
  },
  {
    name: 'haptic_rumble',
    file: '/sounds/signature-sounds/haptic_rumble.wav',
    category: 'haptic',
    displayName: 'Haptic Rumble',
    description: 'Complex low-frequency rumble with texture',
    inspiration: 'Multiple low frequencies create realistic vibration'
  },
  {
    name: 'tactile_tap',
    file: '/sounds/signature-sounds/tactile_tap.wav',
    category: 'haptic',
    displayName: 'Tactile Tap',
    description: 'Sharp low-frequency impact with overtones',
    inspiration: 'Physical tap sensation through sound'
  },
  {
    name: 'vibration_pattern',
    file: '/sounds/signature-sounds/vibration_pattern.wav',
    category: 'haptic',
    displayName: 'Vibration Pattern',
    description: 'Three-pulse vibration sequence',
    inspiration: 'Rhythmic haptic feedback pattern'
  },
  
  // Cascade sounds
  {
    name: 'quantum_cascade',
    file: '/sounds/signature-sounds/quantum_cascade.wav',
    category: 'cascade',
    displayName: 'Quantum Cascade',
    description: 'Cascading quantum state collapse',
    inspiration: 'Inspired by Triple Click Cascade - with quantum uncertainty'
  },
  {
    name: 'domino_chain',
    file: '/sounds/signature-sounds/domino_chain.wav',
    category: 'cascade',
    displayName: 'Domino Chain',
    description: 'Accelerating domino fall sequence',
    inspiration: 'Physical cascade with increasing speed'
  },
  {
    name: 'ripple_cascade',
    file: '/sounds/signature-sounds/ripple_cascade.wav',
    category: 'cascade',
    displayName: 'Ripple Cascade',
    description: 'Water drop ripples spreading outward',
    inspiration: 'Natural cascade pattern'
  },
  
  // Experimental sounds
  {
    name: 'biometric_scan_pro',
    file: '/sounds/refined-sounds/biometric_scan_pro.wav',
    category: 'experimental',
    displayName: 'Biometric Scan Pro',
    description: 'Professional scanning with authentication sequence',
    inspiration: 'Enterprise-grade biometric security system'
  },
  {
    name: 'secure_auth',
    file: '/sounds/refined-sounds/secure_auth.wav',
    category: 'experimental',
    displayName: 'Secure Authentication',
    description: 'Three-stage security authentication sequence',
    inspiration: 'Key insert, processing, and success confirmation'
  },
  {
    name: 'data_sync',
    file: '/sounds/refined-sounds/data_sync.wav',
    category: 'experimental',
    displayName: 'Data Sync Cascade',
    description: 'Multiple data streams synchronizing',
    inspiration: 'Cloud sync and data transfer completion'
  },
  {
    name: 'machine_startup',
    file: '/sounds/refined-sounds/machine_startup.wav',
    category: 'experimental',
    displayName: 'Machine Startup',
    description: 'Industrial system boot sequence',
    inspiration: 'Power button, turbine spin-up, ready beeps'
  },
  {
    name: 'achievement_unlock',
    file: '/sounds/refined-sounds/achievement_unlock.wav',
    category: 'experimental',
    displayName: 'Achievement Unlock',
    description: 'Triumphant unlock with celebration notes',
    inspiration: 'Gaming achievement and milestone celebration'
  }
]

type CategoryFilter = 'all' | 'neural' | 'haptic' | 'cascade' | 'experimental'

export default function SignaturePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [playingSound, setPlayingSound] = useState<string | null>(null)
  const [currentHowl, setCurrentHowl] = useState<Howl | null>(null)
  const [volume, setVolume] = useState(0.7)

  useEffect(() => {
    return () => {
      if (currentHowl) {
        currentHowl.stop()
      }
    }
  }, [currentHowl])

  const categoryIcons = {
    neural: <Brain className="w-5 h-5" />,
    haptic: <Smartphone className="w-5 h-5" />,
    cascade: <Sparkles className="w-5 h-5" />,
    experimental: <Atom className="w-5 h-5" />
  }

  const categoryColors = {
    neural: 'purple',
    haptic: 'orange',
    cascade: 'blue',
    experimental: 'green'
  }

  const categoryDescriptions = {
    neural: 'Brain-inspired sounds simulating neural activity',
    haptic: 'Physical feedback sounds you can almost feel',
    cascade: 'Sequential patterns that flow and build',
    experimental: 'Unique sounds from science and nature'
  }

  const filteredSounds = selectedCategory === 'all' 
    ? signatureSounds 
    : signatureSounds.filter(s => s.category === selectedCategory)

  const playSound = (sound: SignatureSound) => {
    if (currentHowl) {
      currentHowl.stop()
      setCurrentHowl(null)
    }

    if (playingSound === sound.file) {
      setPlayingSound(null)
      return
    }

    const howl = new Howl({
      src: [sound.file],
      volume: volume,
      onend: () => {
        setPlayingSound(null)
        setCurrentHowl(null)
      }
    })

    howl.play()
    setCurrentHowl(howl)
    setPlayingSound(sound.file)
  }

  const categories: { value: CategoryFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: signatureSounds.length },
    { value: 'neural', label: 'Neural', count: signatureSounds.filter(s => s.category === 'neural').length },
    { value: 'haptic', label: 'Haptic', count: signatureSounds.filter(s => s.category === 'haptic').length },
    { value: 'cascade', label: 'Cascade', count: signatureSounds.filter(s => s.category === 'cascade').length },
    { value: 'experimental', label: 'Experimental', count: signatureSounds.filter(s => s.category === 'experimental').length }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Signature Sounds</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-gray-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value)
                  setVolume(newVolume)
                  if (currentHowl) {
                    currentHowl.volume(newVolume)
                  }
                }}
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Signature Sound Collection
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Inspired by your favorites: Neural Pulse 🔥, Triple Click Cascade 👌🏻, and Haptic Click.
            These sounds push the boundaries of UI audio design.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(category => {
            const isActive = selectedCategory === category.value
            const colorClass = category.value === 'all' ? 'gray' : categoryColors[category.value as keyof typeof categoryColors]
            
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all transform
                  ${isActive
                    ? `bg-${colorClass}-500 text-white scale-105 shadow-lg`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-102 shadow-md'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {category.value !== 'all' && categoryIcons[category.value as keyof typeof categoryIcons]}
                  {category.label}
                  <span className={`text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    ({category.count})
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Category description */}
        {selectedCategory !== 'all' && (
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {categoryDescriptions[selectedCategory]}
          </p>
        )}

        {/* Sound grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSounds.map((sound) => {
            const isPlaying = playingSound === sound.file
            const colorClass = categoryColors[sound.category]
            
            return (
              <div
                key={sound.file}
                className={`
                  bg-white dark:bg-gray-900 rounded-2xl p-6 
                  border-2 transition-all duration-300
                  ${isPlaying 
                    ? `border-${colorClass}-400 shadow-xl scale-102` 
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {sound.displayName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sound.description}
                    </p>
                  </div>
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${colorClass === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      colorClass === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                      colorClass === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }
                  `}>
                    {categoryIcons[sound.category]}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                    {sound.inspiration}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => playSound(sound)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                      font-medium text-sm transition-all duration-200
                      ${isPlaying
                        ? `bg-${colorClass}-500 text-white`
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = sound.file
                      link.download = `${sound.name}.wav`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}