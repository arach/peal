'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Loader, MousePointer, Cpu, Download, Keyboard } from 'lucide-react'
import Header from '@/components/Header'
import { uiMechanicsPresets, UIMechanicsSound } from '@/lib/presets/uiMechanicsPresets'
import { dotsPatternPresets, DotsPatternSound } from '@/lib/presets/dotsPatternPresets'
import { keyboardPresets, KeyboardSound } from '@/lib/presets/keyboardPresets'
import { Howl } from 'howler'

type CategoryFilter = 'all' | 'loading' | 'processing' | 'click' | 'dots' | 'sequence' | 'multi-click' | 'keyboard'
type MechanicsSound = (UIMechanicsSound | DotsPatternSound | KeyboardSound) & { 
  category: 'loading' | 'processing' | 'click' | 'dots' | 'sequence' | 'multi-click' | 'keyboard' 
}

export default function MechanicsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingSound, setPlayingSound] = useState<string | null>(null)
  const [currentHowl, setCurrentHowl] = useState<Howl | null>(null)
  const [volume, setVolume] = useState(0.5)
  
  // Merge all sounds
  const allSounds: MechanicsSound[] = [
    ...uiMechanicsPresets,
    ...dotsPatternPresets,
    ...keyboardPresets.map(k => ({ ...k, category: 'keyboard' as const }))
  ] as MechanicsSound[]

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentHowl) {
        currentHowl.stop()
      }
    }
  }, [currentHowl])

  const categoryIcons = {
    loading: <Loader className="w-4 h-4" />,
    processing: <Cpu className="w-4 h-4" />,
    click: <MousePointer className="w-4 h-4" />,
    dots: <span className="w-4 h-4 flex items-center justify-center">•••</span>,
    sequence: <span className="w-4 h-4 flex items-center justify-center">→</span>,
    'multi-click': <MousePointer className="w-4 h-4" />,
    keyboard: <Keyboard className="w-4 h-4" />
  }

  const categoryColors = {
    loading: 'blue',
    processing: 'purple',
    click: 'green',
    dots: 'amber',
    sequence: 'indigo',
    'multi-click': 'teal',
    keyboard: 'red'
  }

  const filteredSounds = allSounds.filter(sound => {
    const matchesCategory = selectedCategory === 'all' || sound.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      sound.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sound.tags && sound.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      sound.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const playSound = (sound: MechanicsSound) => {
    // Stop current sound if playing
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

  const downloadSound = (sound: MechanicsSound) => {
    const link = document.createElement('a')
    link.href = sound.file
    link.download = `${sound.name.toLowerCase().replace(/\s+/g, '_')}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const categories: { value: CategoryFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All Sounds', count: allSounds.length },
    { value: 'loading', label: 'Loading', count: allSounds.filter(s => s.category === 'loading').length },
    { value: 'processing', label: 'Processing', count: allSounds.filter(s => s.category === 'processing').length },
    { value: 'click', label: 'Clicks', count: allSounds.filter(s => s.category === 'click').length },
    { value: 'dots', label: 'Dots', count: allSounds.filter(s => s.category === 'dots').length },
    { value: 'sequence', label: 'Sequences', count: allSounds.filter(s => s.category === 'sequence').length },
    { value: 'multi-click', label: 'Multi-Click', count: allSounds.filter(s => s.category === 'multi-click').length },
    { value: 'keyboard', label: 'Keyboard', count: allSounds.filter(s => s.category === 'keyboard').length }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#111113] text-gray-100">
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">UI Mechanics & Patterns</h1>
            <p className="text-sm text-gray-400 mt-1">Loading, clicks, sequences, and keyboard UI sounds</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search sounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a9eff]"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Volume</label>
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category filters */}
        <div className="flex gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedCategory === category.value
                  ? 'bg-[#4a9eff] text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {category.value !== 'all' && categoryIcons[category.value as keyof typeof categoryIcons]}
                {category.label}
                <span className="text-xs opacity-70">({category.count})</span>
              </span>
            </button>
          ))}
        </div>

        {/* Sound grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSounds.map((sound) => {
            const colorClass = categoryColors[sound.category]
            const isPlaying = playingSound === sound.file
            
            return (
              <div
                key={sound.file}
                className="bg-[#1c1c1e] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">
                      {sound.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {sound.description}
                    </p>
                  </div>
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${colorClass === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      colorClass === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      colorClass === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      colorClass === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                      colorClass === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                      colorClass === 'teal' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' :
                      colorClass === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {categoryIcons[sound.category]}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">Use case:</span> {sound.useCase}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sound.tags && sound.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => playSound(sound)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-all
                      ${isPlaying
                        ? 'bg-[#4a9eff] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }
                    `}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>
                  <button
                    onClick={() => downloadSound(sound)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredSounds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              No sounds found matching your criteria.
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  )
}