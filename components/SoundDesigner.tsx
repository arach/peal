'use client'

import { useEffect, useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import SoundGrid from './SoundGrid'
import LoadingOverlay from './LoadingOverlay'
import DetailModal from './DetailModal'
import SoundVariationModal from './SoundVariationModal'
import ShortcutsPanel from './ShortcutsPanel'
import SimpleStatsBar from './SimpleStatsBar'
import SelectionBar from './SelectionBar'
import SimpleSidebar from './SimpleSidebar'
import LibraryWelcome from './LibraryWelcome'

export default function SoundDesigner() {
  const [isHydrated, setIsHydrated] = useState(false)
  
  const {
    isGenerating,
    showDetailModal,
    showVariationModal,
    variationSoundId,
    showShortcuts,
    focusedIndex,
    sounds,
    selectedSounds,
    toggleSelection,
    setFocusedIndex,
    selectAll,
    clearSelection,
    hideVariations,
    removeSelectedSounds,
  } = useSoundStore()

  const { generateBatch, playSound } = useSoundGeneration()

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (focusedIndex >= 0 && sounds[focusedIndex]) {
            playSound(sounds[focusedIndex]).catch(console.error)
          }
          break

        case 'Enter':
          if (focusedIndex >= 0 && sounds[focusedIndex]) {
            toggleSelection(sounds[focusedIndex].id)
          }
          break

        case 'ArrowLeft':
          if (focusedIndex > 0) {
            setFocusedIndex(focusedIndex - 1)
            scrollToFocused(focusedIndex - 1)
          }
          break

        case 'ArrowRight':
          if (focusedIndex < sounds.length - 1) {
            setFocusedIndex(focusedIndex + 1)
            scrollToFocused(focusedIndex + 1)
          }
          break

        case 'g':
        case 'G':
          generateBatch()
          break

        case 'Delete':
        case 'Backspace':
          if (selectedSounds.size > 0) {
            removeSelectedSounds()
          }
          break
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        selectAll()
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        // TODO: Implement export
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, sounds, selectedSounds, toggleSelection, setFocusedIndex, selectAll, generateBatch, playSound, removeSelectedSounds])

  const scrollToFocused = (index: number) => {
    const card = document.querySelector(`[data-index="${index}"]`)
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Visual feedback
      const element = card as HTMLElement
      element.style.outline = '2px solid #4a9eff'
      setTimeout(() => {
        element.style.outline = ''
      }, 500)
    }
  }

  // Show loading until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return (
      <div className="library-loading">
        <span className="library-loading-spinner" aria-hidden />
        <p>Loading library...</p>
      </div>
    )
  }

  return (
    <div className="library-workspace">
      <div className="library-workspace-inner peal-content-gutter">
        <LibraryWelcome />
        
        <SelectionBar />
        <SimpleStatsBar />
        
        <div className="library-layout">
          <SimpleSidebar />
          <div className="library-layout-main">
            <SoundGrid />
          </div>
        </div>
      </div>

      {isGenerating && <LoadingOverlay />}
      {showDetailModal && <DetailModal />}
      {showVariationModal && variationSoundId && (
        <SoundVariationModal
          sound={sounds.find(s => s.id === variationSoundId)!}
          onClose={hideVariations}
        />
      )}
      {showShortcuts && <ShortcutsPanel />}
    </div>
  )
}