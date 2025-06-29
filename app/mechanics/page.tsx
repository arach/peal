'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Pause, Loader, MousePointer, Cpu, Filter, Download } from 'lucide-react'
import Link from 'next/link'
import { uiMechanicsPresets, UIMechanicsSound } from '@/lib/presets/uiMechanicsPresets'
import { Howl } from 'howler'

type CategoryFilter = 'all' | 'loading' | 'processing' | 'click'

export default function MechanicsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingSound, setPlayingSound] = useState<string | null>(null)
  const [currentHowl, setCurrentHowl] = useState<Howl | null>(null)
  const [volume, setVolume] = useState(0.5)

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
    click: <MousePointer className="w-4 h-4" />
  }

  const categoryColors = {
    loading: 'blue',
    processing: 'purple',
    click: 'green'
  }

  const filteredSounds = uiMechanicsPresets.filter(sound => {
    const matchesCategory = selectedCategory === 'all' || sound.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      sound.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sound.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sound.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const playSound = (sound: UIMechanicsSound) => {
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

  const downloadSound = (sound: UIMechanicsSound) => {
    const link = document.createElement('a')
    link.href = sound.file
    link.download = `${sound.name.toLowerCase().replace(/\s+/g, '_')}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const categories: { value: CategoryFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All Sounds', count: uiMechanicsPresets.length },
    { value: 'loading', label: 'Loading', count: uiMechanicsPresets.filter(s => s.category === 'loading').length },
    { value: 'processing', label: 'Processing', count: uiMechanicsPresets.filter(s => s.category === 'processing').length },
    { value: 'click', label: 'Clicks', count: uiMechanicsPresets.filter(s => s.category === 'click').length }
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">UI Mechanics</h1>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search sounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Volume</label>
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
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category filters */}
        <div className="flex gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedCategory === category.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {sound.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sound.description}
                    </p>
                  </div>
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    bg-${colorClass}-100 dark:bg-${colorClass}-900/30 text-${colorClass}-600 dark:text-${colorClass}-400
                  `}>
                    {categoryIcons[sound.category]}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    <span className="font-medium">Use case:</span> {sound.useCase}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {sound.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
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
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>
                  <button
                    onClick={() => downloadSound(sound)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
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
            <p className="text-gray-500 dark:text-gray-400">
              No sounds found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}