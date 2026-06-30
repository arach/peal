'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import GenerateOptionsModal from './GenerateOptionsModal'

export default function GenerateMoreCard() {
  const [showOptionsModal, setShowOptionsModal] = useState(false)

  return (
    <div className="library-generate-more">
      <button
        type="button"
        onClick={() => setShowOptionsModal(true)}
        className="library-generate-more-btn"
      >
        <span className="library-generate-more-icon" aria-hidden="true">
          <Sparkles size={20} />
        </span>
        <div className="library-generate-more-copy">
          <p>Generate more sounds</p>
          <span>Add new sounds to your library</span>
        </div>
      </button>

      <GenerateOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
      />
    </div>
  )
}