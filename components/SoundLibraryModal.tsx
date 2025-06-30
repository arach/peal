'use client'

import { useState, useEffect } from 'react'
import { X, Search, Play, Pause, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sound, useSoundStore } from '@/store/soundStore'
import SoundGridRenderer from './SoundGridRenderer'

interface SoundLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSound: (sound: Sound) => void
}

export default function SoundLibraryModal({ isOpen, onClose, onSelectSound }: SoundLibraryModalProps) {
  const { sounds } = useSoundStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Filter sounds based on category and search
  const filteredSounds = sounds.filter(sound => {
    const matchesCategory = selectedCategory === 'all' || sound.tags.includes(selectedCategory)
    const matchesSearch = searchQuery === '' || 
      sound.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sound.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // No need for preloading - we'll use Web Audio API directly

  const handlePlay = (soundId: string) => {
    if (playingId === soundId) {
      // Can't stop Web Audio API sounds easily, just clear the playing state
      setPlayingId(null)
    } else {
      // Play new sound
      const sound = sounds.find(s => s.id === soundId)
      if (sound?.audioBuffer) {
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
                <SoundGridRenderer
                  sounds={filteredSounds}
                  columns={{
                    default: 2,
                    sm: 2,
                    lg: 3,
                    xl: 3
                  }}
                  gap={4}
                  onSoundClick={handleSelectSound}
                />

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