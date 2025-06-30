'use client'

import { useSoundStore } from '@/store/soundStore'

export default function SimpleSidebar() {
  const {
    sounds,
    filters,
    updateFilters,
  } = useSoundStore()

  if (sounds.length === 0) return null
  
  const currentTypeFilter = filters.type?.[0] || ''

  return (
    <aside className="w-64 space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Search sounds..."
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
        />
      </div>

      {/* Filter by type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type
        </label>
        <div className="space-y-1">
          <button
            onClick={() => updateFilters({ type: [] })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentTypeFilter === '' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            All sounds
          </button>
          <button
            onClick={() => updateFilters({ type: ['click'] })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentTypeFilter === 'click' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Clicks
          </button>
          <button
            onClick={() => updateFilters({ type: ['tone'] })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentTypeFilter === 'tone' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Tones
          </button>
          <button
            onClick={() => updateFilters({ type: ['chime'] })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentTypeFilter === 'chime' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Chimes
          </button>
          <button
            onClick={() => updateFilters({ type: ['sweep'] })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentTypeFilter === 'sweep' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Sweeps
          </button>
          <button
            onClick={() => updateFilters({ type: ['pulse'] })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              currentTypeFilter === 'pulse' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Pulses
          </button>
        </div>
      </div>
    </aside>
  )
}