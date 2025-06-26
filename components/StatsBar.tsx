'use client'

import { useSoundStore } from '@/store/soundStore'

export default function StatsBar() {
  const {
    sounds,
    selectedSounds,
    selectAll,
    clearSelection,
    filteredSounds,
    sortBy,
    setSortBy
  } = useSoundStore()

  const filtered = filteredSounds()
  const durations = filtered.map(s => s.duration)
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0

  const exportSelected = async () => {
    const { exportSounds } = await import('@/lib/audioUtils')
    const selectedSoundsList = sounds.filter(s => selectedSounds.has(s.id))
    
    if (selectedSoundsList.length === 0) {
      alert('No sounds selected for export')
      return
    }
    
    await exportSounds(selectedSoundsList)
  }

  // Don't show stats bar when there are no sounds
  if (sounds.length === 0) return null

  return (
    <div className="surface-secondary rounded-xl p-4 flex justify-between items-center text-sm shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary dark:text-gray-300">Total sounds:</span>
          <span className="text-primary-500 font-semibold">{sounds.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary dark:text-gray-300">Showing:</span>
          <span className="text-green-500 font-semibold">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary dark:text-gray-300">Selected:</span>
          <span className="text-primary-500 font-semibold">{selectedSounds.size}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary dark:text-gray-300">Duration range:</span>
          <span className="text-primary-500 font-semibold">
            {minDuration}ms - {maxDuration}ms
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-text-tertiary dark:text-gray-400 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-surface dark:bg-gray-700 border border-border dark:border-gray-600 rounded px-2 py-1 text-text-primary dark:text-gray-100 text-sm focus-ring"
          >
            <option value="creation">Created</option>
            <option value="duration">Duration</option>
            <option value="frequency">Frequency</option>
            <option value="brightness">Brightness</option>
            <option value="type">Type</option>
          </select>
        </div>
        
        <div className="w-px h-4 bg-border dark:bg-gray-600"></div>
        
        <button
          onClick={clearSelection}
          className="btn-base btn-sm bg-surface dark:bg-gray-700 border-border dark:border-gray-600 text-text-primary dark:text-gray-100 hover:bg-background-tertiary dark:hover:bg-gray-600 focus-ring"
        >
          Clear All
        </button>
        <button
          onClick={selectAll}
          className="btn-base btn-sm bg-surface dark:bg-gray-700 border-border dark:border-gray-600 text-text-primary dark:text-gray-100 hover:bg-background-tertiary dark:hover:bg-gray-600 focus-ring"
        >
          Select All
        </button>
        <button
          onClick={exportSelected}
          disabled={selectedSounds.size === 0}
          className="btn-base btn-sm bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
        >
          Export Selected
        </button>
      </div>
    </div>
  )
}