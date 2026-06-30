export type VoiceLayoutMode = 'panels' | 'tabs' | 'tile'

/** Modules that live in the center workspace (side panels stay fixed). */
export type VoiceCenterModuleId = 'fx' | 'capture'

export interface VoiceLayoutState {
  mode: VoiceLayoutMode
  activeTab: VoiceCenterModuleId
  tileLeft: VoiceCenterModuleId
  tileRight: VoiceCenterModuleId
  tileRatio: number
}

export const VOICE_LAYOUT_STORAGE_KEY = 'peal-voice-layout-v1'

export const VOICE_CENTER_MODULE_LABELS: Record<VoiceCenterModuleId, string> = {
  fx: 'Programmable mixer',
  capture: 'Capture',
}

export const DEFAULT_VOICE_LAYOUT: VoiceLayoutState = {
  mode: 'panels',
  activeTab: 'fx',
  tileLeft: 'fx',
  tileRight: 'capture',
  tileRatio: 0.58,
}

export function loadVoiceLayout(): VoiceLayoutState {
  if (typeof window === 'undefined') return DEFAULT_VOICE_LAYOUT
  try {
    const raw = localStorage.getItem(VOICE_LAYOUT_STORAGE_KEY)
    if (!raw) return DEFAULT_VOICE_LAYOUT
    const parsed = JSON.parse(raw) as Partial<VoiceLayoutState> & {
      activeTab?: string
      tileLeft?: string
      tileRight?: string
    }
    const normalizeModule = (id: string | undefined, fallback: VoiceCenterModuleId): VoiceCenterModuleId => {
      if (id === 'capture' || id === 'fx') return id
      return fallback
    }
    return {
      ...DEFAULT_VOICE_LAYOUT,
      ...parsed,
      mode: parsed.mode ?? DEFAULT_VOICE_LAYOUT.mode,
      activeTab: normalizeModule(parsed.activeTab, DEFAULT_VOICE_LAYOUT.activeTab),
      tileLeft: normalizeModule(parsed.tileLeft, DEFAULT_VOICE_LAYOUT.tileLeft),
      tileRight: normalizeModule(parsed.tileRight, DEFAULT_VOICE_LAYOUT.tileRight),
      tileRatio: typeof parsed.tileRatio === 'number' ? parsed.tileRatio : DEFAULT_VOICE_LAYOUT.tileRatio,
    }
  } catch {
    return DEFAULT_VOICE_LAYOUT
  }
}

export function saveVoiceLayout(state: VoiceLayoutState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(VOICE_LAYOUT_STORAGE_KEY, JSON.stringify(state))
}