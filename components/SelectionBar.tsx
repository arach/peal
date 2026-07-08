'use client'

import { useSoundStore } from '@/store/soundStore'
import { X, Download, Trash2, Copy } from 'lucide-react'

export default function SelectionBar() {
  const { selectedSounds, sounds, clearSelection, removeSelectedSounds } = useSoundStore()

  if (selectedSounds.size === 0) return null

  const exportSelected = async () => {
    const { exportSounds } = await import('@/lib/audioUtils')
    const selectedSoundsList = sounds.filter((s) => selectedSounds.has(s.id))
    await exportSounds(selectedSoundsList)
  }

  const deleteSelected = () => {
    const count = selectedSounds.size
    const confirmed = confirm(`Delete ${count} sound${count > 1 ? 's' : ''}?`)
    if (confirmed) {
      removeSelectedSounds()
    }
  }

  return (
    <div className="library-selection-bar">
      <span className="library-selection-count">
        {selectedSounds.size} sound{selectedSounds.size > 1 ? 's' : ''} selected
      </span>

      <div className="library-selection-actions">
        <button type="button" onClick={exportSelected} className="library-selection-btn">
          <Download size={15} />
          Export
        </button>

        <button
          type="button"
          onClick={() => alert('Copy functionality coming soon!')}
          className="library-selection-btn"
        >
          <Copy size={15} />
          Copy Code
        </button>

        <button type="button" onClick={deleteSelected} className="library-selection-btn library-selection-btn--danger">
          <Trash2 size={15} />
          Delete
        </button>

        <span className="library-selection-divider" aria-hidden />

        <button
          type="button"
          onClick={clearSelection}
          className="library-selection-icon-btn"
          title="Clear selection"
          aria-label="Clear selection"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}