'use client'

import { useEffect, useRef } from 'react'
import { useAppShellSidePanels } from 'hudsonkit/app-shell'
import { PEAL_STUDIO_LAYOUT_MIGRATION_KEY, PEAL_STUDIO_SHELL_LAYOUT } from './shell-layout'

/**
 * One-time bump for users who persisted the old 260/280 AppShell defaults
 * before Peal declared wider panel layout on the HudsonApp.
 */
export function usePealStudioShellLayout() {
  const { left, right } = useAppShellSidePanels()
  const applied = useRef(false)

  useEffect(() => {
    if (applied.current) return
    if (typeof window === 'undefined') return
    if (localStorage.getItem(PEAL_STUDIO_LAYOUT_MIGRATION_KEY) === '1') return

    const targetLeft = PEAL_STUDIO_SHELL_LAYOUT.leftWidth ?? 420
    const targetRight = PEAL_STUDIO_SHELL_LAYOUT.rightWidth ?? 400

    if (left.width < targetLeft) left.setWidth(targetLeft)
    if (right.width < targetRight) right.setWidth(targetRight)

    localStorage.setItem(PEAL_STUDIO_LAYOUT_MIGRATION_KEY, '1')
    applied.current = true
  }, [left, right])
}