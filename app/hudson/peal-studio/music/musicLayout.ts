const STORAGE_KEY = 'peal-music-tiles.v2'
const LEGACY_STORAGE_KEY = 'peal-music-tiles.v1'

export type MusicTileId = 'editor' | 'repl'

export type MusicTileSizes = Record<string, { width: number; height: number }>

export const MUSIC_TILE_ORDER: MusicTileId[] = ['editor', 'repl']

export const MUSIC_TILE_ITEMS: { id: MusicTileId }[] = [
  { id: 'editor' },
  { id: 'repl' },
]

export const DEFAULT_EDITOR_RATIO = 0.52
const MIN_EDITOR_RATIO = 0.22
const MAX_EDITOR_RATIO = 0.78

export function clampEditorRatio(ratio: number): number {
  return Math.min(MAX_EDITOR_RATIO, Math.max(MIN_EDITOR_RATIO, ratio))
}

export function loadMusicEditorRatio(): number {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_RATIO
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { editorRatio?: number }
      if (typeof parsed.editorRatio === 'number' && Number.isFinite(parsed.editorRatio)) {
        return clampEditorRatio(parsed.editorRatio)
      }
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const sizes = JSON.parse(legacy) as MusicTileSizes
      const editorH = sizes.editor?.height
      const replH = sizes.repl?.height
      if (editorH && replH && editorH + replH > 0) {
        return clampEditorRatio(editorH / (editorH + replH))
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return DEFAULT_EDITOR_RATIO
}

export function saveMusicEditorRatio(ratio: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ editorRatio: clampEditorRatio(ratio) }))
  } catch {
    // ignore quota errors
  }
}

/** @deprecated v1 absolute sizes — migrated to editorRatio in v2 */
export function loadMusicTileSizes(): MusicTileSizes {
  return {}
}

/** @deprecated v1 absolute sizes — use saveMusicEditorRatio */
export function saveMusicTileSizes(_sizes: MusicTileSizes): void {
  // no-op: ratio persistence replaces absolute tile sizes
}

export function musicTileSizesForContainer(
  width: number,
  height: number,
  editorRatio: number,
): MusicTileSizes {
  if (width <= 0 || height <= 0) return {}
  const editorHeight = Math.round(height * clampEditorRatio(editorRatio))
  const replHeight = Math.max(0, height - editorHeight)
  const tileWidth = Math.round(width)
  return {
    editor: { width: tileWidth, height: editorHeight },
    repl: { width: tileWidth, height: replHeight },
  }
}