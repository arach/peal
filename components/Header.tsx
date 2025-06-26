'use client'

import { useSoundStore } from '@/store/soundStore'
import { Zap, Trash2, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import PealLogo from './PealLogo'

export default function Header() {
  const { selectedSounds, removeSelectedSounds, clearSelection } = useSoundStore()

  return (
    <header className="bg-surface/90 dark:bg-gray-900/90 border-b border-border dark:border-gray-800 backdrop-blur-md section-padding-sm">
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <PealLogo size={60} compact={true} />
        </div>
        
        <div className="flex items-center gap-3">
          {selectedSounds.size > 0 && (
            <>
              <span className="mr-2 text-text-secondary dark:text-gray-400 text-sm">
                {selectedSounds.size} selected
              </span>
              <button
                onClick={clearSelection}
                className="btn-base btn-sm bg-surface-secondary dark:bg-gray-700 border-border dark:border-gray-600 text-text-primary dark:text-gray-100 hover:bg-background-tertiary dark:hover:bg-gray-600 focus-ring"
                title="Clear selection"
              >
                <X size={16} />
                Clear
              </button>
              <button
                onClick={removeSelectedSounds}
                className="btn-base btn-sm bg-red-600 border-red-500 text-white hover:bg-red-500 focus-ring"
                title="Delete selected sounds"
              >
                <Trash2 size={16} />
                Delete ({selectedSounds.size})
              </button>
            </>
          )}
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}