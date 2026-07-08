'use client'

import { useSoundStore } from '@/store/soundStore'

const typeFilters: { value: string; label: string }[] = [
  { value: '', label: 'All sounds' },
  { value: 'click', label: 'Clicks' },
  { value: 'tone', label: 'Tones' },
  { value: 'chime', label: 'Chimes' },
  { value: 'sweep', label: 'Sweeps' },
  { value: 'pulse', label: 'Pulses' },
]

export default function SimpleSidebar() {
  const { sounds, filters, updateFilters } = useSoundStore()

  if (sounds.length === 0) return null

  const currentTypeFilter = filters.type?.[0] || ''

  return (
    <aside className="library-sidebar">
      <div className="library-sidebar-field">
        <label htmlFor="library-search">Search</label>
        <input
          id="library-search"
          type="text"
          placeholder="Search sounds..."
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="library-sidebar-input"
        />
      </div>

      <div className="library-sidebar-field">
        <span className="library-sidebar-label">Type</span>
        <div className="library-sidebar-filters">
          {typeFilters.map(({ value, label }) => {
            const active = currentTypeFilter === value
            return (
              <button
                key={value || 'all'}
                type="button"
                onClick={() => updateFilters({ type: value ? [value] : [] })}
                className={`library-sidebar-filter${active ? ' is-active' : ''}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}