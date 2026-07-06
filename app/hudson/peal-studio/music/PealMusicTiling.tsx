'use client'

import { useEffect, useState } from 'react'
import { PealMusicCodePanel } from './PealMusicCodePanel'
import { PealStrudelRepl } from './PealStrudelRepl'
import {
  clampEditorRatio,
  loadMusicEditorRatio,
  saveMusicEditorRatio,
} from './musicLayout'
import type { StrudelManageStatusResponse } from './useStrudelManage'

interface PealMusicTilingProps {
  engine: StrudelManageStatusResponse | null
}

export function PealMusicTiling({ engine }: PealMusicTilingProps) {
  const [editorRatio, setEditorRatio] = useState(loadMusicEditorRatio)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    setEditorRatio(loadMusicEditorRatio())
  }, [])

  useEffect(() => {
    if (!dragging) return

    const onMove = (event: MouseEvent) => {
      const root = document.getElementById('peal-music-tile-root')
      if (!root) return
      const rect = root.getBoundingClientRect()
      const ratio = (event.clientY - rect.top) / rect.height
      const next = clampEditorRatio(ratio)
      setEditorRatio(next)
      saveMusicEditorRatio(next)
    }

    const onUp = () => {
      setDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  const editorHeight = `${(editorRatio * 100).toFixed(1)}%`

  return (
    <div id="peal-music-tile-root" className="peal-music-tile-root min-h-0 flex-1">
      <div className="peal-music-tile-pane" style={{ height: editorHeight }}>
        <PealMusicCodePanel />
      </div>
      <button
        type="button"
        aria-label="Resize editor and REPL"
        className={`peal-music-tile-divider${dragging ? ' peal-music-tile-divider--active' : ''}`}
        onMouseDown={() => setDragging(true)}
      />
      <div className="peal-music-tile-pane min-h-0 flex-1">
        <PealStrudelRepl engine={engine} showHeader />
      </div>
    </div>
  )
}