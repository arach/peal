'use client'

import { useState } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import GenerateOptionsModal from './GenerateOptionsModal'

export default function GenerateMorePromoCard() {
  const [showOptionsModal, setShowOptionsModal] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowOptionsModal(true)}
        className="library-promo-card"
      >
        <span className="library-promo-card-glow" aria-hidden />
        <span className="library-promo-icon" aria-hidden>
          <Sparkles size={22} />
        </span>
        <span className="library-promo-copy">
          <strong>Need more sounds?</strong>
          <span>Generate a fresh batch tuned to your library</span>
        </span>
        <span className="library-promo-cta">
          <Plus size={14} />
          Generate batch
        </span>
      </button>

      <GenerateOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
      />
    </>
  )
}