'use client'

import { useEffect } from 'react'
import { useSoundStore } from '@/store/soundStore'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useSoundStore()

  useEffect(() => {
    // Function to apply theme
    const applyTheme = (isDark: boolean) => {
      const root = document.documentElement
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Function to get system preference
    const getSystemPreference = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // Apply initial theme
    if (theme === 'system') {
      applyTheme(getSystemPreference())
    } else {
      applyTheme(theme === 'dark')
    }

    // Listen for system preference changes when in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [theme])

  // Initialize theme on first load
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    }
  }, [])

  return <>{children}</>
}