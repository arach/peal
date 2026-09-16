'use client'

import { useEffect, useState } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { resolvePealTheme, type ResolvedPealTheme } from '@/lib/pealTheme'

export function useResolvedPealTheme(): ResolvedPealTheme {
  const theme = useSoundStore((state) => state.theme)
  const [resolved, setResolved] = useState<ResolvedPealTheme>(() => {
    if (typeof document === 'undefined') return 'dark'
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  useEffect(() => {
    const apply = () => setResolved(resolvePealTheme(theme))
    apply()

    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => apply()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return resolved
}