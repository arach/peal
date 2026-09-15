import {
  DEFAULT_PEAL_AI_PRESET,
  PEAL_AI_MODEL_PRESETS,
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

const PEAL_DEFAULT_OPENAI_SESSION_ID = 'sess-default-openai'
const PEAL_DEFAULT_CODEX_SESSION_ID = 'sess-default-codex'

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

/** Stable defaults for SSR and pre-hydration client render — never use random ids here. */
export function defaultMusicSessions(): PealAISessionWorkspace {
  const openai: PealAISession = {
    id: PEAL_DEFAULT_OPENAI_SESSION_ID,
    label: 'OpenAI',
    config: configFromPreset(presetForValue('openai:gpt-5.4-mini')),
  }
  const codex: PealAISession = {
    id: PEAL_DEFAULT_CODEX_SESSION_ID,
    label: 'Codex',
    config: configFromPreset(presetForValue('openai-codex:gpt-5.4')),
  }
  return {
    sessions: [openai, codex],
    activeId: openai.id,
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
    // Migrate sessions pinned to presets that no longer exist (e.g. retired providers).
    const sessions = parsed.sessions.map((s) =>
      PEAL_AI_MODEL_PRESETS.some((p) => p.value === s.config?.presetValue)
        ? s
        : { ...s, config: configFromPreset(presetForValue(s.config?.presetValue ?? '')) },
    )
    const activeId = sessions.some((s) => s.id === parsed.activeId)
      ? parsed.activeId
      : sessions[0].id
    const splitSessionId = parsed.splitSessionId
      && sessions.some((s) => s.id === parsed.splitSessionId)
      ? parsed.splitSessionId
      : sessions.find((s) => s.id !== activeId)?.id ?? null
    return {
      sessions,
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