'use client'

import type { Sound } from '@/store/soundStore'
import PealSfxCodeEditorSurface from './PealSfxCodeEditorSurface'
import type { PealSfxCodeEditorTrack } from './usePealSfxCodeEditor'

interface CodeEditorProps {
  currentSound: Sound | null
  onSoundChange?: (sound: Sound) => void | Promise<void>
  tracks?: PealSfxCodeEditorTrack[]
}

export default function CodeEditor({ currentSound, onSoundChange, tracks }: CodeEditorProps) {
  return (
    <PealSfxCodeEditorSurface
      currentSound={currentSound}
      tracks={tracks}
      onSoundChange={onSoundChange}
    />
  )
}
