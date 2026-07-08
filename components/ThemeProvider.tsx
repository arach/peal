'use client'

import { useEffect } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { resolvePealTheme } from '@/lib/pealTheme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSoundStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      const resolved = resolvePealTheme(theme)
      root.classList.toggle('dark', resolved === 'dark')
      root.style.colorScheme = resolved
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