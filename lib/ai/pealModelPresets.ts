export type PealAIHarness = 'pi-api' | 'pi-cli'

export type PealAIEffort = 'off' | 'low' | 'medium' | 'high'

export interface PealAIModelPreset {
  label: string
  value: string
  provider: string
  model: string
}

export const PEAL_AI_HARNESS_OPTIONS: { value: PealAIHarness; label: string; hint: string }[] = [
  { value: 'pi-api', label: 'API', hint: 'pi-ai in-process (Peal /api/ai/chat)' },
  { value: 'pi-cli', label: 'CLI', hint: 'Coming soon — Hudson CLI harness' },
]

export const PEAL_AI_EFFORT_OPTIONS: { value: PealAIEffort; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Med' },
  { value: 'high', label: 'High' },
]

/** Curated presets — Codex for code/debug, MiniMax for fast iteration. */
export const PEAL_AI_MODEL_PRESETS: PealAIModelPreset[] = [
  { label: 'MiniMax M2.7', value: 'minimax:MiniMax-M2.7', provider: 'minimax', model: 'MiniMax-M2.7' },
  { label: 'MiniMax M3', value: 'minimax:MiniMax-M3', provider: 'minimax', model: 'MiniMax-M3' },
  { label: 'Codex GPT-5.4', value: 'openai-codex:gpt-5.4', provider: 'openai-codex', model: 'gpt-5.4' },
  { label: 'Codex GPT-5.5', value: 'openai-codex:gpt-5.5', provider: 'openai-codex', model: 'gpt-5.5' },
  { label: 'Codex GPT-5.4 Mini', value: 'openai-codex:gpt-5.4-mini', provider: 'openai-codex', model: 'gpt-5.4-mini' },
  { label: 'Codex Spark', value: 'openai-codex:gpt-5.3-codex-spark', provider: 'openai-codex', model: 'gpt-5.3-codex-spark' },
  { label: 'GPT-4o Mini', value: 'openai:gpt-4o-mini', provider: 'openai', model: 'gpt-4o-mini' },
  { label: 'Claude Sonnet 4', value: 'anthropic:claude-sonnet-4-20250514', provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
]

export const DEFAULT_PEAL_AI_PRESET = PEAL_AI_MODEL_PRESETS[0]

export function presetForValue(value: string): PealAIModelPreset {
  return PEAL_AI_MODEL_PRESETS.find((p) => p.value === value) ?? DEFAULT_PEAL_AI_PRESET
}

export function presetsForProvider(provider: string): PealAIModelPreset[] {
  return PEAL_AI_MODEL_PRESETS.filter((p) => p.provider === provider)
}

export function effortToReasoning(effort: PealAIEffort): 'low' | 'medium' | 'high' | undefined {
  if (effort === 'off') return undefined
  return effort
}