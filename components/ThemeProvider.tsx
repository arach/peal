'use client'

import { useEffect } from 'react'
import { useSoundStore } from '@/store/soundStore'

function resolveIsDark(theme: 'light' | 'dark' | 'system') {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSoundStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      root.classList.toggle('dark', resolveIsDark(theme))
    }

    applyTheme()

    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return <>{children}</>
}