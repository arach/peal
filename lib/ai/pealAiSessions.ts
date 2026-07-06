import {
  DEFAULT_PEAL_AI_PRESET,
  type PealAIHarness,
  type PealAIEffort,
  type PealAIModelPreset,
  presetForValue,
} from './pealModelPresets'

export interface PealAISessionConfig {
  harness: PealAIHarness
  presetValue: string
  provider: string
  model: string
  effort: PealAIEffort
}

export interface PealAISession {
  id: string
  label: string
  config: PealAISessionConfig
}

export interface PealAISessionWorkspace {
  sessions: PealAISession[]
  activeId: string
  splitEnabled: boolean
  splitSessionId: string | null
}

function nextSessionId() {
  return `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function configFromPreset(
  preset: PealAIModelPreset,
  overrides?: Partial<PealAISessionConfig>,
): PealAISessionConfig {
  return {
    harness: 'pi-api',
    presetValue: preset.value,
    provider: preset.provider,
    model: preset.model,
    effort: 'medium',
    ...overrides,
  }
}

export function createPealAISession(label: string, preset = DEFAULT_PEAL_AI_PRESET): PealAISession {
  return {
    id: nextSessionId(),
    label,
    config: configFromPreset(preset),
  }
}

export function defaultMusicSessions(): PealAISessionWorkspace {
  const minimax = createPealAISession('Minimax', presetForValue('minimax:MiniMax-M2.7'))
  const codex = createPealAISession('Codex', presetForValue('openai-codex:gpt-5.4'))
  return {
    sessions: [minimax, codex],
    activeId: minimax.id,
    splitEnabled: false,
    splitSessionId: codex.id,
  }
}

export function loadPealAISessions(storageKey: string): PealAISessionWorkspace {
  if (typeof window === 'undefined') return defaultMusicSessions()
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return defaultMusicSessions()
    const parsed = JSON.parse(raw) as PealAISessionWorkspace
    if (!Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
      return defaultMusicSessions()
    }
    const activeId = parsed.sessions.some((s) => s.id === parsed.activeId)
      ? parsed.activeId
      : parsed.sessions[0].id
    const splitSessionId = parsed.splitSessionId
      && parsed.sessions.some((s) => s.id === parsed.splitSessionId)
      ? parsed.splitSessionId
      : parsed.sessions.find((s) => s.id !== activeId)?.id ?? null
    return {
      sessions: parsed.sessions,
      activeId,
      splitEnabled: Boolean(parsed.splitEnabled),
      splitSessionId,
    }
  } catch {
    return defaultMusicSessions()
  }
}

export function savePealAISessions(storageKey: string, workspace: PealAISessionWorkspace): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey, JSON.stringify(workspace))
  } catch {
    // ignore quota
  }
}