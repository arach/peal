'use client'

import { useSoundStore } from '@/store/soundStore'
import { X, Download, Trash2, Copy } from 'lucide-react'

export default function SelectionBar() {
  const {
    selectedSounds,
    sounds,
    clearSelection,
    removeSelectedSounds
  } = useSoundStore()

  if (selectedSounds.size === 0) return null

  const exportSelected = async () => {
    const { exportSounds } = await import('@/lib/audioUtils')
    const selectedSoundsList = sounds.filter(s => selectedSounds.has(s.id))
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
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {selectedSounds.size} sound{selectedSounds.size > 1 ? 's' : ''} selected
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={exportSelected}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
        >
          <Download size={16} />
          Export
        </button>
        
        <button
          onClick={() => {
            // TODO: Implement copy functionality
            alert('Copy functionality coming soon!')
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
        >
          <Copy size={16} />
          Copy Code
        </button>
        
        <button
          onClick={deleteSelected}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Trash2 size={16} />
          Delete
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <button
          onClick={clearSelection}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="Clear selection"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}