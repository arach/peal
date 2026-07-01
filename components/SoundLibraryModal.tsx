'use client'

import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sound, useSoundStore } from '@/store/soundStore'
import { modernAppPresets, soundCategories } from '@/lib/presets/modernAppSounds'
import {
  getPresetAudioBuffer,
  isPresetSoundId,
  presetIdFromSoundId,
  presetToSound,
} from '@/lib/presets/presetSound'
import SoundGridRenderer from './SoundGridRenderer'
import '@/styles/studio-library-modal.css'

interface SoundLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSound: (sound: Sound) => void
}

const presetSounds = modernAppPresets.map(presetToSound)

const categoryOptions = [
  { value: 'all', label: 'All Sounds' },
  ...Object.entries(soundCategories).map(([value, category]) => ({
    value,
    label: category.name,
  })),
  { value: 'my-ui', label: 'My UI Sounds' },
  { value: 'my-notification', label: 'My Notifications' },
  { value: 'my-success', label: 'My Success' },
  { value: 'my-error', label: 'My Error' },
]

export default function SoundLibraryModal({ isOpen, onClose, onSelectSound }: SoundLibraryModalProps) {
  const { sounds } = useSoundStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectingId, setSelectingId] = useState<string | null>(null)

  const librarySounds = useMemo(() => [...presetSounds, ...sounds], [sounds])

  const filteredSounds = librarySounds.filter(sound => {
    const isUserSound = !isPresetSoundId(sound.id)
    const matchesCategory = selectedCategory === 'all' || (
      selectedCategory.startsWith('my-')
        ? isUserSound && sound.tags.includes(selectedCategory.slice(4))
        : isPresetSoundId(sound.id) && sound.tags.includes(selectedCategory)
    )
    const matchesSearch = searchQuery === '' ||
      sound.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sound.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSelectSound = async (sound: Sound) => {
    if (selectingId) return

    setSelectingId(sound.id)

    try {
      if (isPresetSoundId(sound.id) && !sound.audioBuffer) {
        const audioBuffer = await getPresetAudioBuffer(presetIdFromSoundId(sound.id))
        if (!audioBuffer) return

        onSelectSound({ ...sound, audioBuffer })
        onClose()
        return
      }

      onSelectSound(sound)
      onClose()
    } catch (error) {
      console.error('Error loading library sound:', error)
    } finally {
      setSelectingId(null)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="peal-library-modal">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 z-[250]"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 flex items-center justify-center z-[250] px-6 py-8 pointer-events-none"
          >
            <div
              className="peal-library-modal__panel pointer-events-auto w-full max-w-[min(1280px,calc(100vw-3rem))] max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="peal-library-modal__header">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="peal-library-modal__kicker">Browse</p>
                    <h2 className="peal-library-modal__title">Sound Library</h2>
                    <p className="peal-library-modal__copy">
                      Curated presets and your saved sounds
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="peal-library-modal__close"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="peal-library-modal__controls">
                  <div className="peal-library-modal__search-wrap">
                    <Search className="peal-library-modal__search-icon" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search sounds..."
                      className="peal-library-modal__input"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="peal-library-modal__select"
                    aria-label="Filter by category"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="peal-library-modal__body">
                <SoundGridRenderer
                  sounds={filteredSounds}
                  columns={{
                    default: 4,
                  }}
                  gap={4}
                  onSoundClick={handleSelectSound}
                  cardVariant="rack"
                />

                {filteredSounds.length === 0 && (
                  <p className="peal-library-modal__empty">
                    No sounds found matching your criteria
                  </p>
                )}

                {selectingId && (
                  <p className="peal-library-modal__loading">Loading sound…</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}