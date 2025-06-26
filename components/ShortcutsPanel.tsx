'use client'

import { useSoundStore } from '@/store/soundStore'

export default function ShortcutsPanel() {
  const { toggleShortcuts } = useSoundStore()

  const shortcuts = [
    { action: 'Play/Stop', key: 'Space' },
    { action: 'Navigate', key: '←→↑↓' },
    { action: 'Select/Deselect', key: 'Enter' },
    { action: 'Select All', key: 'Cmd+A' },
    { action: 'Export', key: 'Cmd+E' },
    { action: 'Generate New', key: 'G' },
    { action: 'Delete', key: 'Delete' },
  ]

  return (
    <div className="fixed bottom-5 right-5 bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm z-40">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-blue-400 font-medium">Keyboard Shortcuts</h4>
        <button
          onClick={toggleShortcuts}
          className="text-gray-400 hover:text-gray-100"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        {shortcuts.map(({ action, key }) => (
          <div key={action} className="flex justify-between items-center">
            <span className="text-gray-300">{action}</span>
            <span className="bg-gray-800 px-2 py-1 rounded font-mono text-xs">
              {key}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}