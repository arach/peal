'use client'

import { useEffect, type RefObject } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { resolvePealTheme } from '@/lib/pealTheme'

const HUDSON_THEME_KEY = 'hudson.theme'

export function syncHudsonThemeStorage(theme: 'light' | 'dark' | 'system') {
  if (typeof window === 'undefined') return
  try {
    const existing = JSON.parse(window.localStorage.getItem(HUDSON_THEME_KEY) || '{}')
    const next =
      typeof existing === 'object' && existing !== null && !Array.isArray(existing)
        ? { ...existing, theme, template: 'hudson' }
        : { theme, template: 'hudson' }
    window.localStorage.setItem(HUDSON_THEME_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('hudson:saved', { detail: { key: HUDSON_THEME_KEY } }))
  } catch {
    // ignore storage failures
  }
}

export function applyStudioShellTheme(
  element: HTMLElement | null,
  resolved: 'light' | 'dark',
) {
  if (!element) return
  element.dataset.pealTheme = resolved
  element.dataset.hudsonTheme = resolved
  element.dataset.hudsonTemplate = 'hudson'
}

export default function StudioThemeBridge({
  shellRef,
}: {
  shellRef: RefObject<HTMLElement | null>
}) {
  const theme = useSoundStore((state) => state.theme)

  useEffect(() => {
    const apply = () => {
      const resolved = resolvePealTheme(theme)
      applyStudioShellTheme(shellRef.current, resolved)
    }

    apply()

    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => apply()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [shellRef, theme])

  useEffect(() => {
    syncHudsonThemeStorage(theme)
  }, [theme])

  useEffect(() => {
    delete document.documentElement.dataset.hudsonTheme
    return () => {
      delete document.documentElement.dataset.hudsonTheme
    }
  }, [])

  return null
}