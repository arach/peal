'use client'

import { useEffect, useRef } from 'react'
import { useAppShellSidePanels } from 'hudsonkit/app-shell'
import { PEAL_STUDIO_LAYOUT_MIGRATION_KEY, PEAL_STUDIO_SHELL_LAYOUT } from './shell-layout'

/**
 * One-time bump for users who persisted the old 260/280 AppShell defaults
 * before Peal declared wider panel layout on the HudsonApp.
 */
export function usePealStudioShellLayout(collapsePanelsForEmptyState = false) {
  const { left, right } = useAppShellSidePanels()
  const applied = useRef(false)
  const panelsRef = useRef({ left, right })
  const autoCollapsedState = useRef<{ left: boolean; right: boolean } | null>(null)
  panelsRef.current = { left, right }

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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const narrowLayout = window.matchMedia('(max-width: 1180px)')

    const syncEmptyStatePanels = () => {
      const panels = panelsRef.current
      const shouldCollapse = collapsePanelsForEmptyState && narrowLayout.matches

      if (shouldCollapse && !autoCollapsedState.current) {
        autoCollapsedState.current = {
          left: panels.left.isCollapsed,
          right: panels.right.isCollapsed,
        }
        panels.left.setCollapsed(true)
        panels.right.setCollapsed(true)
        return
      }

      if (!shouldCollapse && autoCollapsedState.current) {
        const previousState = autoCollapsedState.current
        autoCollapsedState.current = null
        panels.left.setCollapsed(previousState.left)
        panels.right.setCollapsed(previousState.right)
      }
    }

    syncEmptyStatePanels()
    narrowLayout.addEventListener('change', syncEmptyStatePanels)

    return () => {
      narrowLayout.removeEventListener('change', syncEmptyStatePanels)

      if (autoCollapsedState.current) {
        const previousState = autoCollapsedState.current
        autoCollapsedState.current = null
        panelsRef.current.left.setCollapsed(previousState.left)
        panelsRef.current.right.setCollapsed(previousState.right)
      }
    }
  }, [collapsePanelsForEmptyState])
}
