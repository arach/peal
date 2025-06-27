'use client'

import { useSoundStore } from '@/store/soundStore'

export default function Sidebar() {
  const {
    filters,
    updateFilters,
    sounds
  } = useSoundStore()

  // Get all available tags from sounds
  const allTags = Array.from(new Set(sounds.flatMap(sound => sound.tags))).sort()

  const toggleTypeFilter = (type: string) => {
    const currentTypes = filters.type || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    updateFilters({ type: newTypes })
  }

  const toggleTagFilter = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    updateFilters({ tags: newTags })
  }

  return (
    <aside className="surface-secondary rounded-xl card-padding h-fit sticky top-[160px] space-y-subsection shadow-sm">
      {/* Filters */}
      <div>
        <h3 className="section-header text-primary-500">
          Filters
        </h3>
        
        <div className="space-y-component">
          {/* Favorites filter */}
          <div>
            <label className="flex items-center gap-2 body-text cursor-pointer">
              <input
                type="checkbox"
                checked={filters.favoriteOnly}
                onChange={(e) => updateFilters({ favoriteOnly: e.target.checked })}
                className="w-4 h-4 accent-primary-500 focus-ring"
              />
              Favorites Only
            </label>
          </div>

          {/* Type filters */}
          <div>
            <h4 className="heading-4 text-text-secondary dark:text-gray-300">
              Sound Types
            </h4>
            <div className="space-y-tight">
              {['tone', 'chime', 'click', 'sweep', 'pulse'].map(type => (
                <label key={type} className="flex items-center gap-2 body-text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => toggleTypeFilter(type)}
                    className="w-3 h-3 accent-primary-500 focus-ring"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div>
              <h4 className="heading-4 text-text-secondary dark:text-gray-300">
                Tags
              </h4>
              <div className="space-y-tight max-h-32 overflow-y-auto">
                {allTags.map(tag => (
                  <label key={tag} className="flex items-center gap-2 body-text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => toggleTagFilter(tag)}
                      className="w-3 h-3 accent-primary-500 focus-ring"
                    />
                    <span className="text-primary-400">#{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Duration range filter */}
          <div>
            <h4 className="heading-4 text-text-secondary dark:text-gray-300">
              Duration Filter
            </h4>
            <div className="flex gap-2 mb-2 caption text-text-tertiary dark:text-gray-400">
              <span>Min: {filters.durationMin}ms</span>
              <span>Max: {filters.durationMax}ms</span>
            </div>
            <div className="space-y-tight">
              <input
                type="range"
                min="0"
                max="3000"
                value={filters.durationMin}
                onChange={(e) => updateFilters({ durationMin: Number(e.target.value) })}
                className="slider w-full focus-ring"
              />
              <input
                type="range"
                min="100"
                max="5000"
                value={filters.durationMax}
                onChange={(e) => updateFilters({ durationMax: Number(e.target.value) })}
                className="slider w-full focus-ring"
              />
            </div>
          </div>

          {/* Frequency range filter */}
          <div>
            <h4 className="heading-4 text-text-secondary dark:text-gray-300">
              Frequency Filter
            </h4>
            <div className="flex gap-2 mb-2 caption text-text-tertiary dark:text-gray-400">
              <span>Min: {filters.frequencyMin}Hz</span>
              <span>Max: {filters.frequencyMax}Hz</span>
            </div>
            <div className="space-y-tight">
              <input
                type="range"
                min="0"
                max="2000"
                value={filters.frequencyMin}
                onChange={(e) => updateFilters({ frequencyMin: Number(e.target.value) })}
                className="slider w-full focus-ring"
              />
              <input
                type="range"
                min="200"
                max="5000"
                value={filters.frequencyMax}
                onChange={(e) => updateFilters({ frequencyMax: Number(e.target.value) })}
                className="slider w-full focus-ring"
              />
            </div>
          </div>
        </div>

        {/* Clear filters button */}
        {(filters.favoriteOnly || filters.type.length > 0 || filters.tags.length > 0 || 
          filters.durationMin > 0 || filters.durationMax < 5000 || 
          filters.frequencyMin > 0 || filters.frequencyMax < 5000) && (
          <button
            onClick={() => updateFilters({
              favoriteOnly: false,
              type: [],
              tags: [],
              durationMin: 0,
              durationMax: 5000,
              frequencyMin: 0,
              frequencyMax: 5000
            })}
            className="btn-base w-full bg-surface-secondary dark:bg-gray-700 text-text-primary dark:text-gray-100 hover:bg-background-tertiary dark:hover:bg-gray-600 focus-ring"
          >
            Clear All Filters
          </button>
        )}
      </div>

    </aside>
  )
}