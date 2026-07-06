'use client'

import { useEffect, useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { Sun, Moon, Monitor } from 'lucide-react'

const themes = [
  { id: 'light' as const, label: 'Light', icon: Sun },
  { id: 'dark' as const, label: 'Dark', icon: Moon },
  { id: 'system' as const, label: 'System', icon: Monitor },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useSoundStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="peal-theme-toggle" aria-hidden="true">
        {themes.map(({ id, icon: Icon }) => (
          <span
            key={id}
            className={`peal-theme-toggle-btn${id === 'system' ? ' is-active' : ''}`}
          >
            <Icon size={14} strokeWidth={1.75} />
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="peal-theme-toggle" role="group" aria-label="Color theme">
      {themes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`peal-theme-toggle-btn${theme === id ? ' is-active' : ''}`}
          onClick={() => setTheme(id)}
          aria-label={label}
          aria-pressed={theme === id}
          title={label}
        >
          <Icon size={14} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}