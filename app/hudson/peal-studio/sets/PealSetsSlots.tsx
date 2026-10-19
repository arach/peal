'use client'

/**
 * Sound Sets inside the Hudson shell: projects and conversations in the left
 * panel, the conversation in content, sound pages (player + mixer) in the
 * inspector. All three read the same store (design/sets/store.ts).
 */
import { useEffect, useRef } from 'react'
import { useAppShellSidePanels } from 'hudsonkit/app-shell'
import { SetsPages, SetsSidebar, SetsThread, useSetsBoot } from '@/design/sets/SoundSetsApp'
import { useSets } from '@/design/sets/store'

/** Sound pages carry a mixer; give the inspector room once per visit. */
const SETS_INSPECTOR_WIDTH = 560

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
  const { right } = useAppShellSidePanels()
  const widened = useRef(false)

  useEffect(() => {
    if (widened.current) return
    widened.current = true
    if (right.width < SETS_INSPECTOR_WIDTH) right.setWidth(SETS_INSPECTOR_WIDTH)
    if (right.isCollapsed) right.setCollapsed(false)
  }, [right])

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
