'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Volume2, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import { premiumUIPresets, getPremiumPresetsByCategory, getPremiumPresetsByStyle, getComparisonPairs } from '@/lib/presets/premiumUIPresets'
import { playPremiumSound, preloadPremiumSounds, playComparisonPair, playPremiumSoundDemo } from '@/lib/presets/playPremiumSound'

const categories = {
  interaction: {
    name: 'Interaction',
    description: 'Clicks, taps, and touches',
    icon: '👆',
  },
  feedback: {
    name: 'Feedback', 
    description: 'Success, error, and confirmations',
    icon: '✓',
  },
  notification: {
    name: 'Notification',
    description: 'Alerts and messages',
    icon: '🔔',
  },
  navigation: {
    name: 'Navigation',
    description: 'Transitions and movements',
    icon: '→',
  },
}

export default function PremiumSoundsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('interaction')
  const [selectedStyle, setSelectedStyle] = useState<'all' | 'modern' | 'futuristic'>('modern')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.5)
  const [isPreloading, setIsPreloading] = useState(true)
  const [compareMode, setCompareMode] = useState(false)

  useEffect(() => {
    // Preload all sounds on mount
    preloadPremiumSounds().then(() => {
      setIsPreloading(false)
    })
  }, [])

  const handlePlay = async (presetId: string) => {
    if (playingId === presetId) {
      setPlayingId(null)
      return
    }

    setPlayingId(presetId)
    await playPremiumSound(presetId, volume)
    
    // Clear playing state after sound duration
    const preset = premiumUIPresets.find(p => p.id === presetId)
    if (preset) {
      setTimeout(() => {
        setPlayingId(null)
      }, preset.duration)
    }
  }

  const handlePlayDemo = () => {
    playPremiumSoundDemo()
  }

  const handleCompare = async (type: 'tap' | 'click' | 'success' | 'error') => {
    setCompareMode(true)
    await playComparisonPair(type, volume)
    setTimeout(() => setCompareMode(false), 2500)
  }

  // Filter presets based on category and style
  let filteredPresets = getPremiumPresetsByCategory(selectedCategory)
  if (selectedStyle === 'modern') {
    filteredPresets = filteredPresets.filter(p => p.id.startsWith('modern-'))
  } else if (selectedStyle === 'futuristic') {
    filteredPresets = filteredPresets.filter(p => p.id.startsWith('futuristic-'))
  }

  const getStyleBadge = (preset: any) => {
    const { style, intensity } = preset.characteristics
    const colors = {
      minimal: 'bg-gray-700 text-gray-300',
      elegant: 'bg-purple-900 text-purple-300',
      warm: 'bg-orange-900 text-orange-300',
      crisp: 'bg-blue-900 text-blue-300',
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${colors[style as keyof typeof colors] || colors.minimal}`}>
        {style} • {intensity}
      </span>
    )
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
                <h1 className="text-2xl font-bold">Premium UI Sounds</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Modern, elegant sounds inspired by Apple, Palantir, and Airbnb
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayDemo}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors"
              >
                <Play size={16} />
                Play Demo
              </button>
              <button
                onClick={() => router.push('/studio')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-lg transition-colors"
              >
                <Sparkles size={16} />
                Sound Studio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Style Filter */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Style:</span>
            <div className="flex gap-2">
              {(['all', 'modern', 'futuristic'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    selectedStyle === style
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
            {selectedStyle === 'all' && (
              <div className="flex items-center gap-2 ml-auto text-sm text-gray-400">
                <span>Compare:</span>
                <button 
                  onClick={() => handleCompare('tap')}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  disabled={compareMode}
                >
                  Tap
                </button>
                <button 
                  onClick={() => handleCompare('click')}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  disabled={compareMode}
                >
                  Click
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-3">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-gray-800 text-gray-100'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
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
        </div>

        {/* Sound Grid */}
        {isPreloading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            Loading premium sounds...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                className="bg-gray-800 rounded-lg p-5 hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100 mb-1">{preset.name}</h3>
                    <p className="text-sm text-gray-400">{preset.description}</p>
                  </div>
                  <button
                    onClick={() => handlePlay(preset.id)}
                    className={`p-2 rounded-lg transition-all ${
                      playingId === preset.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    {playingId === preset.id ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {getStyleBadge(preset)}
                  <span className="text-xs text-gray-500">{preset.duration}ms</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {preset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {preset.id.startsWith('modern-') && selectedStyle === 'all' && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle size={14} />
                      <span>Premium Quality</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}