/**
 * Bring-your-own-key (BYOK) support for Peal's AI features.
 *
 * Keys are stored in the visitor's browser (localStorage) and sent with each
 * API request body. They are never written to server-side storage — the routes
 * prefer a client-supplied key over the server's env credentials.
 */

import { GENERATED_BYOK_MODELS } from './ai/byokModels.generated'

export type ByokProvider =
  | 'openai'
  | 'openrouter'
  | 'opencode'

export type ByokKeys = Partial<Record<ByokProvider, string>>

export type ByokModels = Partial<Record<ByokProvider, string>>

/** Persisted browser-side state: per-provider keys + model picks + active provider. */
export interface ByokState {
  /** Visitor-selected provider for the AI chat surfaces. `null` = auto. */
  provider: ByokProvider | null
  keys: ByokKeys
  /** Optional model id per provider — empty means "provider default". */
  models: ByokModels
}

export const EMPTY_BYOK_STATE: ByokState = { provider: null, keys: {}, models: {} }

export interface ByokProviderDef {
  /** Server credential env var this key satisfies (pi-ai provider→env mapping). */
  envVar: string
  label: string
  /** Which surfaces the key unlocks. */
  unlocks: string
  placeholder: string
  consoleUrl: string
  /** pi-ai registry model id used when the visitor leaves the model field blank. */
  defaultModel: string
}

export const BYOK_PROVIDERS: Record<ByokProvider, ByokProviderDef> = {
  openai: {
    envVar: 'OPENAI_API_KEY',
    label: 'OpenAI',
    unlocks: 'AI Design',
    placeholder: 'sk-…',
    consoleUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-5.5',
  },
  openrouter: {
    envVar: 'OPENROUTER_API_KEY',
    label: 'OpenRouter',
    unlocks: 'AI Design (all models)',
    placeholder: 'sk-or-…',
    consoleUrl: 'https://openrouter.ai/keys',
    defaultModel: 'deepseek/deepseek-v4-pro',
  },
  opencode: {
    envVar: 'OPENCODE_API_KEY',
    label: 'Opencode',
    unlocks: 'AI Design',
    placeholder: 'oc-…',
    consoleUrl: 'https://opencode.ai',
    defaultModel: 'big-pickle',
  },
}

export const BYOK_PROVIDER_IDS = Object.keys(BYOK_PROVIDERS) as ByokProvider[]

/**
 * Model suggestions per provider — generated from models.dev by
 * `bun run models:sync` (12-month release cutoff, tool-call capable, resolved
 * against the pi-ai registry). The provider default is pinned first so it never
 * ages out of the list. The field is free-text: any registry id still works.
 */
export const BYOK_MODELS: Record<ByokProvider, string[]> = Object.fromEntries(
  BYOK_PROVIDER_IDS.map((id) => [
    id,
    [...new Set([BYOK_PROVIDERS[id].defaultModel, ...(GENERATED_BYOK_MODELS[id] ?? [])])],
  ]),
) as Record<ByokProvider, string[]>

const ENV_VAR_TO_BYOK: Record<string, ByokProvider> = Object.fromEntries(
  BYOK_PROVIDER_IDS.map((id) => [BYOK_PROVIDERS[id].envVar, id]),
)

/** Map a server credential env var (e.g. OPENAI_API_KEY) to its BYOK provider. */
export function byokProviderForEnvVar(envVar: string): ByokProvider | undefined {
  return ENV_VAR_TO_BYOK[envVar]
}

const MAX_KEY_LENGTH = 512

/**
 * Whitelist + trim a `byok` payload received in a request body.
 * Anything that isn't a non-empty string under a known provider is dropped.
 */
export function sanitizeByok(value: unknown): ByokKeys {
  return sanitizeByokKeys(value)
}

function sanitizeByokKeys(value: unknown): ByokKeys {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: ByokKeys = {}
  for (const id of BYOK_PROVIDER_IDS) {
    const raw = (value as Record<string, unknown>)[id]
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed && trimmed.length <= MAX_KEY_LENGTH) out[id] = trimmed
    }
  }
  return out
}

const MAX_MODEL_ID_LENGTH = 128

function sanitizeByokModels(value: unknown): ByokModels {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: ByokModels = {}
  for (const id of BYOK_PROVIDER_IDS) {
    const raw = (value as Record<string, unknown>)[id]
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed && trimmed.length <= MAX_MODEL_ID_LENGTH) out[id] = trimmed
    }
  }
  return out
}

/** Sanitize the whole persisted BYOK state (localStorage shape). */
export function sanitizeByokState(value: unknown): ByokState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_BYOK_STATE
  const raw = value as Record<string, unknown>
  const provider = BYOK_PROVIDER_IDS.includes(raw.provider as ByokProvider)
    ? (raw.provider as ByokProvider)
    : null
  return {
    provider,
    keys: sanitizeByokKeys(raw.keys),
    models: sanitizeByokModels(raw.models),
  }
}

/**
 * Resolve which provider should drive a chat surface.
 * Explicit selection wins when its key exists; otherwise first provider with a
 * stored key; otherwise the caller's fallback.
 */
export function resolveByokProvider(
  state: ByokState,
  fallback: string,
): { provider: string; model?: string } {
  const picked =
    state.provider && state.keys[state.provider]
      ? state.provider
      : BYOK_PROVIDER_IDS.find((id) => state.keys[id])
  if (!picked) return { provider: fallback }
  return { provider: picked, model: state.models[picked] || BYOK_PROVIDERS[picked].defaultModel }
}

/** localStorage key + change/open events shared by the hook and dialog. */
export const BYOK_STORAGE_KEY = 'peal.byok.v1'
export const BYOK_CHANGED_EVENT = 'peal:byok-changed'
export const OPEN_BYOK_EVENT = 'peal:open-byok-settings'

/** Ask the studio chrome to open the API-keys dialog (no-op off-browser). */
export function openByokSettings(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_BYOK_EVENT))
}
