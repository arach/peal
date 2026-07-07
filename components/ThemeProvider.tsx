'use client'

import { useEffect } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { resolvePealTheme } from '@/lib/pealTheme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSoundStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      root.classList.toggle('dark', resolvePealTheme(theme) === 'dark')
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