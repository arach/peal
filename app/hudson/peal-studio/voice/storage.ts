import { DECK_PADS_PER_BANK } from './types'
import type { DeckClip } from './types'

const STORAGE_KEY = 'peal-deck-clips-v1'
const LEGACY_KEY = 'peal-voice-takes-v1'
const MAX_CLIPS = 32

type StoredClip = Omit<DeckClip, 'audioUrl'>

function blobUrlFromBase64(base64: string, mimeType: string) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  const blob = new Blob([bytes], { type: mimeType })
  return URL.createObjectURL(blob)
}

function hydrateClip(stored: StoredClip): DeckClip {
  return {
    ...stored,
    audioUrl: blobUrlFromBase64(stored.audioBase64, stored.mimeType),
  }
}

function normalizeLegacyTake(raw: Record<string, unknown>, index: number): StoredClip | null {
  if (typeof raw.id !== 'string' || typeof raw.audioBase64 !== 'string') return null
  const script = typeof raw.script === 'string' ? raw.script : ''
  return {
    id: raw.id,
    source: 'tts',
    bank: Math.floor(index / DECK_PADS_PER_BANK),
    slot: index % DECK_PADS_PER_BANK,
    label: soundboardLabel(script),
    script,
    model: typeof raw.model === 'string' ? raw.model : 'tts-1',
    voice: typeof raw.voice === 'string' ? raw.voice : 'alloy',
    speed: typeof raw.speed === 'number' ? raw.speed : 1,
    filename: typeof raw.filename === 'string' ? raw.filename : `clip-${raw.id}.mp3`,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toLocaleString(),
    mimeType: typeof raw.mimeType === 'string' ? raw.mimeType : 'audio/mpeg',
    audioBase64: raw.audioBase64,
    fxPresetId: typeof raw.fxPresetId === 'string' ? raw.fxPresetId : '',
    fxParamsOverride: raw.fxParamsOverride as StoredClip['fxParamsOverride'],
  }
}

export function loadStoredDeckClips(): DeckClip[] {
  if (typeof window === 'undefined') return []
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy) as Record<string, unknown>[]
        if (Array.isArray(parsed)) {
          const migrated = parsed
            .map((item, index) => normalizeLegacyTake(item, index))
            .filter((item): item is StoredClip => item != null)
          if (migrated.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
          }
        }
      }
      raw = localStorage.getItem(STORAGE_KEY)
    }
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredClip[]
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, MAX_CLIPS).map(hydrateClip)
  } catch {
    return []
  }
}

export function saveDeckClips(clips: DeckClip[]) {
  if (typeof window === 'undefined') return
  try {
    const stored: StoredClip[] = clips.slice(0, MAX_CLIPS).map(({ audioUrl: _audioUrl, ...clip }) => clip)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    for (let limit = clips.length - 1; limit >= 0; limit -= 1) {
      try {
        const stored: StoredClip[] = clips.slice(0, limit).map(({ audioUrl: _audioUrl, ...clip }) => clip)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
        return
      } catch {
        // keep trimming
      }
    }
  }
}

export function soundboardLabel(text: string, maxLength = 28) {
  const line = text.trim().split(/\s+/).slice(0, 6).join(' ')
  if (line.length <= maxLength) return line || 'Clip'
  return `${line.slice(0, maxLength - 1)}…`
}

/** @deprecated */
export const loadStoredVoiceTakes = loadStoredDeckClips
/** @deprecated */
export const saveVoiceTakes = saveDeckClips