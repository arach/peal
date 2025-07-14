'use client'

import { useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { Zap, Trash2, X, Library, Sparkles, Crown, Menu, Book, Mic } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import DynamicPealLogo from './DynamicPealLogo'
import { useBasePath } from './BaseLink'
import { isStaticBuild } from '@/utils/build'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { selectedSounds, removeSelectedSounds, clearSelection } = useSoundStore()
  const { push } = useBasePath()

  return (
    <header className="bg-surface/90 dark:bg-gray-900/90 border-b border-border dark:border-gray-800 backdrop-blur-md section-padding-sm">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={() => push('/')}
            className="focus:outline-none"
          >
            <DynamicPealLogo 
              width={120} 
              height={40}
              preset="layered"
              animated={false}
              className="text-text-primary dark:text-gray-100"
            />
          </button>
          
          <nav className="hidden md:flex items-center gap-4">
            <button
              onClick={() => push('/')}
              className="text-sm text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 transition-colors"
            >
              Home
            </button>
            {!isStaticBuild && (
              <>
                <button
                  onClick={() => push('/library')}
                  className="text-sm text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                >
                  <Library size={16} />
                  Library
                </button>
                <button
                  onClick={() => push('/studio')}
                  className="text-sm text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                >
                  <Sparkles size={16} />
                  Studio
                </button>
                <button
                  onClick={() => push('/presets')}
                  className="text-sm text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                >
                  <Crown size={16} />
                  Presets
                </button>
                <button
                  onClick={() => push('/tts')}
                  className="text-sm text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                >
                  <Mic size={16} />
                  Voice Lab
                </button>
              </>
            )}
            <button
              onClick={() => push('/docs')}
              className="text-sm text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 transition-colors flex items-center gap-1"
            >
              <Book size={16} />
              Docs
            </button>
            <button
              onClick={() => push('/about')}
              className="text-sm text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 transition-colors"
            >
              About
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100"
          >
            <Menu size={24} />
          </button>
          
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
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border dark:border-gray-800 bg-surface dark:bg-gray-900">
          <nav className="container py-4 space-y-2">
            <button
              onClick={() => {
                push('/')
                setMobileMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 hover:bg-background dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Home
            </button>
            {!isStaticBuild && (
              <>
                <button
                  onClick={() => {
                    push('/library')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 hover:bg-background dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Library size={16} />
                  Library
                </button>
                <button
                  onClick={() => {
                    push('/studio')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 hover:bg-background dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Studio
                </button>
                <button
                  onClick={() => {
                    push('/presets')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 hover:bg-background dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Crown size={16} />
                  Presets
                </button>
                <button
                  onClick={() => {
                    push('/tts')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 hover:bg-background dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Mic size={16} />
                  Voice Lab
                </button>
              </>
            )}
            <button
              onClick={() => {
                push('/docs')
                setMobileMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 hover:bg-background dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <Book size={16} />
              Docs
            </button>
            <button
              onClick={() => {
                push('/about')
                setMobileMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100 hover:bg-background dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              About
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}