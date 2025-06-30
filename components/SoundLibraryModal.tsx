'use client'

import { useState, useEffect } from 'react'
import { X, Search, Play, Pause, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sound, useSoundStore } from '@/store/soundStore'
import { Howl } from 'howler'

interface SoundLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSound: (sound: Sound) => void
}

export default function SoundLibraryModal({ isOpen, onClose, onSelectSound }: SoundLibraryModalProps) {
  const { sounds, categories } = useSoundStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadedSounds, setLoadedSounds] = useState<{ [key: string]: Howl }>({})

  // Filter sounds based on category and search
  const filteredSounds = sounds.filter(sound => {
    const matchesCategory = selectedCategory === 'all' || sound.tags.includes(selectedCategory)
    const matchesSearch = searchQuery === '' || 
      sound.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sound.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Preload sounds
  useEffect(() => {
    if (isOpen) {
      const loaded: { [key: string]: Howl } = {}
      filteredSounds.slice(0, 20).forEach(sound => {
        if (sound.audioBuffer) {
          // Convert AudioBuffer to data URL for Howler
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const buffer = sound.audioBuffer
          const channels = buffer.numberOfChannels
          const length = buffer.length
          const sampleRate = buffer.sampleRate
          const arrayBuffer = audioContext.createBuffer(channels, length, sampleRate)
          
          for (let i = 0; i < channels; i++) {
            arrayBuffer.copyToChannel(buffer.getChannelData(i), i)
          }
          
          loaded[sound.id] = new Howl({
            src: [`data:audio/wav;base64,${btoa('dummy')}`], // Placeholder, would need proper encoding
            onend: () => setPlayingId(null)
          })
        }
      })
      setLoadedSounds(loaded)
    }

    return () => {
      Object.values(loadedSounds).forEach(howl => howl.unload())
    }
  }, [isOpen, filteredSounds])

  const handlePlay = (soundId: string) => {
    if (playingId === soundId) {
      if (loadedSounds[soundId]) {
        loadedSounds[soundId].stop()
      }
      setPlayingId(null)
    } else {
      // Stop any currently playing sound
      if (playingId && loadedSounds[playingId]) {
        loadedSounds[playingId].stop()
      }
      
      // Play new sound
      const sound = sounds.find(s => s.id === soundId)
      if (sound?.audioBuffer) {
        // For now, use the Web Audio API directly
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.createBufferSource()
        source.buffer = sound.audioBuffer
        source.connect(audioContext.destination)
        source.start(0)
        source.onended = () => setPlayingId(null)
        setPlayingId(soundId)
      }
    }
  }

  const handleSelectSound = (sound: Sound) => {
    onSelectSound(sound)
    onClose()
  }

  const categoryOptions = [
    { value: 'all', label: 'All Sounds' },
    { value: 'ui', label: 'UI Sounds' },
    { value: 'notification', label: 'Notifications' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
    { value: 'click', label: 'Clicks' },
    { value: 'transition', label: 'Transitions' }
  ]

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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Sound Library
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search and filters */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search sounds..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sound Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredSounds.map((sound) => (
                    <motion.div
                      key={sound.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group relative bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer"
                      onClick={() => handleSelectSound(sound)}
                    >
                      {/* Play button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlay(sound.id)
                        }}
                        className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {playingId === sound.id ? (
                          <Pause size={16} className="text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Play size={16} className="text-gray-600 dark:text-gray-300" />
                        )}
                      </button>

                      {/* Sound info */}
                      <div className="pr-10">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {sound.type}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{sound.duration}ms</span>
                          <span>•</span>
                          <span>{sound.frequency}Hz</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sound.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Selection indicator */}
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                    </motion.div>
                  ))}
                </div>

                {filteredSounds.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      No sounds found matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}