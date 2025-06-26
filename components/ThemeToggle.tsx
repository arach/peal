'use client'

import { useSoundStore } from '@/store/soundStore'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useSoundStore()

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} />
      case 'dark':
        return <Moon size={16} />
      case 'system':
        return <Monitor size={16} />
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center justify-center w-8 h-8 bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 text-text-secondary dark:text-gray-400 rounded-lg transition-all hover:bg-background-tertiary dark:hover:bg-gray-700 hover:text-text-primary dark:hover:text-gray-100 hover:border-primary-400 focus-ring"
      title={`Theme: ${theme} (click to change)`}
    >
      {getIcon()}
    </button>
  )
}