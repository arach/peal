'use client'

import { useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { Search, Filter, ChevronDown } from 'lucide-react'

export default function FilterBar() {
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    sounds
  } = useSoundStore()
  
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (sounds.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search sounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Quick filters */}
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">All types</option>
            <option value="click">Clicks</option>
            <option value="notification">Notifications</option>
            <option value="success">Success</option>
            <option value="error">Errors</option>
            <option value="ambient">Ambient</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="creation">Newest first</option>
            <option value="duration">Duration</option>
            <option value="frequency">Frequency</option>
            <option value="brightness">Brightness</option>
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1 px-4 py-2 text-sm border rounded-lg transition-colors ${
              showAdvanced 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Filter size={14} />
            More
            <ChevronDown 
              size={14} 
              className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="">Any duration</option>
                <option value="short">Under 500ms</option>
                <option value="medium">500ms - 1s</option>
                <option value="long">Over 1s</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="">Any frequency</option>
                <option value="low">Low (under 400Hz)</option>
                <option value="mid">Mid (400-1000Hz)</option>
                <option value="high">High (over 1000Hz)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brightness
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                <option value="">Any brightness</option>
                <option value="dark">Dark</option>
                <option value="balanced">Balanced</option>
                <option value="bright">Bright</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <input 
                type="text" 
                placeholder="e.g. futuristic, soft"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Reset filters
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Apply filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}