'use client'

import { useEffect, useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import Header from './Header'
import Sidebar from './Sidebar'
import SoundGrid from './SoundGrid'
import LoadingOverlay from './LoadingOverlay'
import DetailModal from './DetailModal'
import SoundEditor from './SoundEditor'
import SoundVariationModal from './SoundVariationModal'
import ShortcutsPanel from './ShortcutsPanel'
import StatsBar from './StatsBar'
import HeroSection from './HeroSection'
import GenerationParamsPanel from './GenerationParamsPanel'
import GenerationHub from './GenerationHub'

export default function SoundDesigner() {
  const [isHydrated, setIsHydrated] = useState(false)
  
  const {
    isGenerating,
    showDetailModal,
    showEditorModal,
    editorSoundId,
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
    hideEditor,
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
      <div className="min-h-screen bg-background dark:bg-gray-950 text-text-primary dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-border dark:border-gray-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-gray-400">Loading Peal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 text-text-primary dark:text-gray-100">
      <Header />
      
      <div className="container space-y-section pt-section">
        <HeroSection />
        
        <GenerationHub />
        <GenerationParamsPanel />
        
        <StatsBar />
        
        <div className="grid-main">
          <Sidebar />
          <main>
            <SoundGrid />
          </main>
        </div>
      </div>

      {isGenerating && <LoadingOverlay />}
      {showDetailModal && <DetailModal />}
      {showEditorModal && editorSoundId && (
        <SoundEditor
          sound={sounds.find(s => s.id === editorSoundId)!}
          onClose={hideEditor}
        />
      )}
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