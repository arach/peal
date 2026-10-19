'use client'

/**
 * Sound Sets inside the Hudson shell: projects and conversations in the left
 * panel, the conversation in content, sound pages (player + mixer) in the
 * inspector. All three read the same store (design/sets/store.ts).
 */
import { useEffect, useRef } from 'react'
import { useAppShellSidePanels } from 'hudsonkit/app-shell'
import { SetsPages, SetsSidebar, SetsThread, useSetsBoot } from '@/design/sets/SoundSetsApp'
import { toggleSetsPlayback, useSets } from '@/design/sets/store'

/** hudsonkit AppShell's persisted panel keys for this app instance. */
const SHELL_KEY = 'inst:peal-studio:appshell.peal-studio'

/** The sidebar is a list of titles; sound pages carry a mixer. */
const SETS_LEFT_WIDTH = 280
const inspectorWidth = () => (window.innerWidth >= 1440 ? 560 : 480)

/**
 * Panel sizing for this tool, restored on the way out (widths are shared with
 * the editor/voice/music tools): a narrow left list, and an inspector sized
 * for sound pages once one opens.
 */
function useSetsPanels() {
  const { left, right } = useAppShellSidePanels()
  const hasPages = useSets((s) => s.tabs.length > 0)
  const panels = useRef({ left, right })
  panels.current = { left, right }
  const saved = useRef<{ left: number; right: number } | null>(null)

  useEffect(() => {
    const { left: l, right: r } = panels.current
    saved.current = { left: l.width, right: r.width }
    if (l.width > SETS_LEFT_WIDTH) l.setWidth(SETS_LEFT_WIDTH)
    // Narrow screens: size the inspector so the conversation keeps its minimum width.
    if (window.innerWidth < 1440 && r.width > inspectorWidth()) r.setWidth(inspectorWidth())
    // Panel widths persist. Restore them when leaving the tool in-app, and
    // on reload/navigation away (unmount never runs, so write the shell's
    // persisted keys directly).
    const restore = () => {
      const prev = saved.current
      if (!prev) return
      panels.current.left.setWidth(prev.left)
      panels.current.right.setWidth(prev.right)
    }
    const persist = () => {
      const prev = saved.current
      if (!prev) return
      try {
        localStorage.setItem(`${SHELL_KEY}.leftW`, JSON.stringify(prev.left))
        localStorage.setItem(`${SHELL_KEY}.rightW`, JSON.stringify(prev.right))
      } catch { /* storage unavailable */ }
    }
    window.addEventListener('pagehide', persist)
    return () => {
      window.removeEventListener('pagehide', persist)
      restore()
    }
  }, [])

  useEffect(() => {
    const r = panels.current.right
    if (hasPages) {
      // Wide screens: at least 560. Narrow ones: exactly 480 so the
      // conversation keeps its minimum width instead of being overlaid.
      const target = inspectorWidth()
      if (r.width < target || (window.innerWidth < 1440 && r.width > target)) r.setWidth(target)
      if (r.isCollapsed) r.setCollapsed(false)
    }
  }, [hasPages])
}

/** Space plays/pauses (outside text fields); the page itself never scrolls. */
function useSetsKeys() {
  useEffect(() => {
    const root = document.documentElement
    const prev = [root.style.overflow, document.body.style.overflow]
    root.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName) || el.getAttribute('role') === 'slider')) return
      e.preventDefault()
      void toggleSetsPlayback()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      root.style.overflow = prev[0]
      document.body.style.overflow = prev[1]
    }
  }, [])
}

export function PealSetsLeftPanel() {
  return (
    <div className="pss-root pss-slot">
      <SetsSidebar />
    </div>
  )
}

export function PealSetsContent() {
  useSetsBoot()
  const booted = useSets((s) => s.booted)
  useSetsPanels()
  useSetsKeys()

  return <div className="pss-root pss-slot">{booted ? <SetsThread /> : null}</div>
}

export function PealSetsInspector() {
  return (
    <div className="pss-root pss-slot">
      <SetsPages
        empty={(
          <div className="pss-slot-empty">
            <b>Sound pages</b>
            Open a sound from the conversation or the sidebar to see its player and mixer here.
            Open two and press Compare to stack them.
          </div>
        )}
      />
    </div>
  )
}
