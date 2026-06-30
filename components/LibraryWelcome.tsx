'use client'

import { useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { useRouter } from 'next/navigation'
import { Zap, Sparkles, ChevronRight, Sliders } from 'lucide-react'
import GenerateOptionsModal from './GenerateOptionsModal'

export default function LibraryWelcome() {
  const { sounds } = useSoundStore()
  const router = useRouter()
  const [showOptionsModal, setShowOptionsModal] = useState(false)

  const hasSounds = sounds.length > 0

  return (
    <>
    {!hasSounds && (
    <section className="library-welcome" aria-labelledby="library-welcome-title">
      <header className="library-welcome-header">
        <div className="library-welcome-kicker">Your library</div>
        <h1 id="library-welcome-title">Start building your library</h1>
        <p className="library-welcome-lead">Choose how you&apos;d like to create your first sounds</p>
      </header>

      <div className="library-welcome-grid">
        <button
          type="button"
          onClick={() => setShowOptionsModal(true)}
          className="library-welcome-card"
        >
          <span className="library-welcome-icon" aria-hidden="true">
            <Zap size={18} />
          </span>
          <h2>Quick Generate</h2>
          <p>Instantly create a set of polished sounds</p>
          <span className="library-welcome-cta">
            Start now
            <ChevronRight size={14} />
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/studio')}
          className="library-welcome-card"
        >
          <span className="library-welcome-icon" aria-hidden="true">
            <Sliders size={18} />
          </span>
          <h2>AI Studio</h2>
          <p>Describe sounds in natural language</p>
          <span className="library-welcome-cta">
            Open Studio
            <ChevronRight size={14} />
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/presets')}
          className="library-welcome-card"
        >
          <span className="library-welcome-icon" aria-hidden="true">
            <Sparkles size={18} />
          </span>
          <h2>Browse Presets</h2>
          <p>Start with pre-made sound collections</p>
          <span className="library-welcome-cta">
            Explore
            <ChevronRight size={14} />
          </span>
        </button>
      </div>
    </section>
    )}

      <GenerateOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
      />
    </>
  )
}