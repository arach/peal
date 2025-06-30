'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Sparkles, Grid3X3, List, Volume2 } from 'lucide-react'
import { brandPresets, processingPreset, type BrandPreset, type BrandSound } from '@/lib/presets/brandPresets'
import { playPremiumSound, preloadPremiumSounds } from '@/lib/presets/playPremiumSound'

// Brand logos/icons
const brandIcons = {
  palantir: '🛡️',
  apple: '🍎',
  slack: '💬',
  discord: '🎮',
  fluent: '🪟',
  spotify: '🎵',
  notion: '📝',
  generic: '⚙️'
}

// Sound categories with descriptions
const categories = {
  interaction: { name: 'Interaction', icon: '👆', description: 'Clicks, taps, and direct user actions' },
  feedback: { name: 'Feedback', icon: '✓', description: 'Success, error, and confirmations' },
  notification: { name: 'Notification', icon: '🔔', description: 'Alerts and incoming messages' },
  navigation: { name: 'Navigation', icon: '→', description: 'Page transitions and movement' },
  process: { name: 'Process', icon: '⏳', description: 'Loading, processing, and progress states' }
}

export default function BrandsPage() {
  const router = useRouter()
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.5)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [compareMode, setCompareMode] = useState(false)
  const [comparedSounds, setComparedSounds] = useState<string[]>([])

  useEffect(() => {
    // Preload all brand sounds
    const loadSounds = async () => {
      setIsLoading(true)
      // Create audio context to ensure browser allows audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      await audioContext.resume()
      
      // Preload sounds
      const allSounds = [...brandPresets, processingPreset].flatMap(preset => 
        preset.sounds.map(sound => sound.audioFile)
      )
      
      // Load in batches to avoid overwhelming the browser
      const batchSize = 10
      for (let i = 0; i < allSounds.length; i += batchSize) {
        const batch = allSounds.slice(i, i + batchSize)
        await Promise.all(batch.map(async (file) => {
          try {
            const response = await fetch(file)
            await response.arrayBuffer()
          } catch (error) {
            console.error(`Failed to preload ${file}:`, error)
          }
        }))
      }
      
      setIsLoading(false)
    }
    
    loadSounds()
  }, [])

  const handlePlay = async (sound: BrandSound) => {
    if (playingId === sound.id) {
      setPlayingId(null)
      return
    }

    setPlayingId(sound.id)
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const response = await fetch(sound.audioFile)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      const source = audioContext.createBufferSource()
      const gainNode = audioContext.createGain()
      
      source.buffer = audioBuffer
      gainNode.gain.value = volume
      
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      source.start(0)
      
      source.onended = () => {
        setPlayingId(null)
      }
    } catch (error) {
      console.error('Error playing sound:', error)
      setPlayingId(null)
    }
  }

  const handleCompare = (soundId: string) => {
    if (comparedSounds.includes(soundId)) {
      setComparedSounds(comparedSounds.filter(id => id !== soundId))
    } else if (comparedSounds.length < 4) {
      setComparedSounds([...comparedSounds, soundId])
    }
  }

  const playComparison = async () => {
    for (const soundId of comparedSounds) {
      const sound = getAllSounds().find(s => s.id === soundId)
      if (sound) {
        await handlePlay(sound)
        await new Promise(resolve => setTimeout(resolve, sound.duration + 200))
      }
    }
  }

  // Get all sounds across all brands
  const getAllSounds = () => {
    const allPresets = [...brandPresets, processingPreset]
    return allPresets.flatMap(preset => preset.sounds)
  }

  // Filter sounds based on selection
  const getFilteredSounds = () => {
    let sounds = getAllSounds()
    
    if (selectedBrand !== 'all') {
      const preset = selectedBrand === 'processing' ? processingPreset : brandPresets.find(p => p.id === selectedBrand)
      sounds = preset ? preset.sounds : []
    }
    
    if (selectedCategory !== 'all') {
      sounds = sounds.filter(sound => sound.category === selectedCategory)
    }
    
    return sounds
  }

  const filteredSounds = getFilteredSounds()

  // Group sounds by brand for grid view
  const groupedSounds = selectedBrand === 'all' ? 
    [...brandPresets, processingPreset].map(preset => ({
      ...preset,
      sounds: preset.sounds.filter(sound => 
        selectedCategory === 'all' || sound.category === selectedCategory
      )
    })).filter(preset => preset.sounds.length > 0) : []

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
                <h1 className="text-2xl font-bold">Brand Sound Inspiration</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Explore sounds inspired by Slack, Discord, Microsoft, Spotify, and more
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {comparedSounds.length > 0 && (
                <button
                  onClick={playComparison}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                >
                  <Play size={16} />
                  Play Comparison ({comparedSounds.length})
                </button>
              )}
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-6">
            {/* Brand Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Brand:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBrand('all')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    selectedBrand === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}
                >
                  All Brands
                </button>
                {[...brandPresets, processingPreset].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedBrand(preset.id)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center gap-1 ${
                      selectedBrand === preset.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                    }`}
                  >
                    <span>{brandIcons[preset.brand as keyof typeof brandIcons]}</span>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-400">Category:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}
                >
                  All
                </button>
                {Object.entries(categories).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center gap-1 ${
                      selectedCategory === key
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3 mb-6">
          <Volume2 size={16} className="text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-400">{Math.round(volume * 100)}%</span>
          <div className="ml-auto">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => {
                  setCompareMode(e.target.checked)
                  if (!e.target.checked) setComparedSounds([])
                }}
                className="rounded"
              />
              Compare Mode
            </label>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            Loading brand sounds...
          </div>
        ) : viewMode === 'grid' && selectedBrand === 'all' ? (
          // Grid view - grouped by brand
          <div className="space-y-8">
            {groupedSounds.map((preset) => (
              <div key={preset.id}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{brandIcons[preset.brand as keyof typeof brandIcons]}</span>
                  <h2 className="text-xl font-semibold">{preset.name}</h2>
                  <span className="text-sm text-gray-400">— {preset.philosophy}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {preset.sounds.map((sound) => (
                    <SoundCard
                      key={sound.id}
                      sound={sound}
                      preset={preset}
                      isPlaying={playingId === sound.id}
                      compareMode={compareMode}
                      isCompared={comparedSounds.includes(sound.id)}
                      onPlay={() => handlePlay(sound)}
                      onCompare={() => handleCompare(sound.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view or single brand view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSounds.map((sound) => {
              const preset = [...brandPresets, processingPreset].find(p => 
                p.sounds.some(s => s.id === sound.id)
              )!
              return (
                <SoundCard
                  key={sound.id}
                  sound={sound}
                  preset={preset}
                  isPlaying={playingId === sound.id}
                  compareMode={compareMode}
                  isCompared={comparedSounds.includes(sound.id)}
                  onPlay={() => handlePlay(sound)}
                  onCompare={() => handleCompare(sound.id)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Sound Card Component
function SoundCard({ 
  sound, 
  preset, 
  isPlaying, 
  compareMode,
  isCompared,
  onPlay, 
  onCompare 
}: {
  sound: BrandSound
  preset: BrandPreset
  isPlaying: boolean
  compareMode: boolean
  isCompared: boolean
  onPlay: () => void
  onCompare: () => void
}) {
  return (
    <div 
      className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all group relative ${
        isCompared ? 'ring-2 ring-purple-500' : ''
      }`}
      style={{
        borderTop: `3px solid ${preset.colors.primary}`
      }}
    >
      {compareMode && (
        <button
          onClick={onCompare}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 transition-colors ${
            isCompared 
              ? 'bg-purple-500 border-purple-500' 
              : 'border-gray-600 hover:border-purple-500'
          }`}
        >
          {isCompared && (
            <span className="text-white text-xs">✓</span>
          )}
        </button>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-gray-100">{sound.name}</h3>
          <p className="text-xs text-gray-400 mt-1">{sound.description}</p>
        </div>
        <button
          onClick={onPlay}
          className={`p-2 rounded-lg transition-all ml-2 ${
            isPlaying
              ? 'bg-primary-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
          {categories[sound.category].icon} {categories[sound.category].name}
        </span>
        <span className="text-xs text-gray-500">{sound.duration}ms</span>
      </div>

      <p className="text-xs text-gray-500 italic">{sound.useCase}</p>
    </div>
  )
}