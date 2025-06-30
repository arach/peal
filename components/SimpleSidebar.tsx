'use client'

import { useSoundStore } from '@/store/soundStore'

export default function SimpleSidebar() {
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
  } = useSoundStore()

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
            onClick={() => setFilterType('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filterType === '' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            All sounds
          </button>
          <button
            onClick={() => setFilterType('click')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filterType === 'click' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Clicks
          </button>
          <button
            onClick={() => setFilterType('notification')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filterType === 'notification' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setFilterType('success')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filterType === 'success' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setFilterType('error')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filterType === 'error' 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Errors
          </button>
        </div>
      </div>
    </aside>
  )
}