'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { isPealStaticRuntime } from '@/lib/ai/runtime'
import {
  BYOK_CHANGED_EVENT,
  BYOK_STORAGE_KEY,
  EMPTY_BYOK_STATE,
  resolveByokProvider,
  sanitizeByokState,
  type ByokKeys,
  type ByokModels,
  type ByokProvider,
  type ByokState,
} from '@/lib/byok'

let cachedState: ByokState = EMPTY_BYOK_STATE

function readStoredState(): ByokState {
  if (typeof window === 'undefined') return cachedState
  try {
    cachedState = sanitizeByokState(JSON.parse(window.localStorage.getItem(BYOK_STORAGE_KEY) ?? '{}'))
  } catch {
    cachedState = EMPTY_BYOK_STATE
  }
  return cachedState
}

function persistState(state: ByokState): void {
  cachedState = state
  try {
    if (state.provider || Object.keys(state.keys).length || Object.keys(state.models).length) {
      window.localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(state))
    } else {
      window.localStorage.removeItem(BYOK_STORAGE_KEY)
    }
  } catch {}
  window.dispatchEvent(new CustomEvent(BYOK_CHANGED_EVENT))
}

function subscribe(onChange: () => void): () => void {
  const handler = () => {
    readStoredState()
    onChange()
  }
  readStoredState()
  window.addEventListener(BYOK_CHANGED_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(BYOK_CHANGED_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

export interface UseByokResult {
  /** Full persisted state. */
  state: ByokState
  /** Sanitized provider → key map. Safe to send as `byok` in request bodies. */
  keys: ByokKeys
  /** Per-provider model picks. */
  models: ByokModels
  /** Visitor-selected chat provider, or null for auto. */
  provider: ByokProvider | null
  has: (provider: ByokProvider) => boolean
  hasAny: boolean
  setKey: (provider: ByokProvider, key: string) => void
  clearKey: (provider: ByokProvider) => void
  setProvider: (provider: ByokProvider) => void
  setModel: (provider: ByokProvider, model: string) => void
}

export function useByok(): UseByokResult {
  const state = useSyncExternalStore(
    subscribe,
    () => cachedState,
    () => cachedState,
  )

  const setKey = useCallback((provider: ByokProvider, key: string) => {
    const trimmed = key.trim()
    const keys = { ...cachedState.keys }
    if (trimmed) keys[provider] = trimmed
    else delete keys[provider]
    persistState({ ...cachedState, keys })
  }, [])

  const clearKey = useCallback((provider: ByokProvider) => {
    const keys = { ...cachedState.keys }
    delete keys[provider]
    persistState({ ...cachedState, keys })
  }, [])

  const setProvider = useCallback((provider: ByokProvider) => {
    persistState({ ...cachedState, provider })
  }, [])

  const setModel = useCallback((provider: ByokProvider, model: string) => {
    const trimmed = model.trim()
    const models = { ...cachedState.models }
    if (trimmed) models[provider] = trimmed
    else delete models[provider]
    persistState({ ...cachedState, models })
  }, [])

  const has = useCallback(
    (provider: ByokProvider) => Boolean(state.keys[provider]),
    [state.keys],
  )

  return {
    state,
    keys: state.keys,
    models: state.models,
    provider: state.provider,
    has,
    hasAny: Object.keys(state.keys).length > 0,
    setKey,
    clearKey,
    setProvider,
    setModel,
  }
}

/**
 * Resolve the provider + model a chat surface should use:
 * the visitor's BYOK selection when its key exists, else the first stored key,
 * else the caller's fallback (typically the server-env default).
 */
export function useByokChatTarget(fallback: string): { provider: string; model?: string } {
  const { state } = useByok()
  return resolveByokProvider(state, fallback)
}

let serverStatusCache: Record<string, boolean> | null = null
let serverStatusPromise: Promise<Record<string, boolean>> | null = null

function fetchServerCredentialStatus(): Promise<Record<string, boolean>> {
  if (serverStatusCache) return Promise.resolve(serverStatusCache)
  if (!serverStatusPromise) {
    // Static export has no API routes — report "nothing server-configured".
    serverStatusPromise = isPealStaticRuntime()
      ? Promise.resolve((serverStatusCache = {}))
      : fetch('/api/check-providers')
          .then((res) => (res.ok ? res.json() : {}))
          .then((status) => {
            serverStatusCache = status as Record<string, boolean>
            return serverStatusCache
          })
          .catch(() => {
            serverStatusCache = {}
            return serverStatusCache
          })
  }
  return serverStatusPromise
}

const serverStatusListeners = new Set<() => void>()

/**
 * Env-var → configured map reported by /api/check-providers.
 * `null` while loading. Server-side credentials only — merge with useByok()
 * for "is this feature usable" checks.
 */
export function useServerCredentialStatus(): Record<string, boolean> | null {
  return useSyncExternalStore(
    (onChange) => {
      serverStatusListeners.add(onChange)
      if (!serverStatusCache && !serverStatusPromise) {
        void fetchServerCredentialStatus().then(() => {
          serverStatusListeners.forEach((fn) => fn())
        })
      }
      return () => {
        serverStatusListeners.delete(onChange)
      }
    },
    () => serverStatusCache,
    () => serverStatusCache,
  )
}

// ---- Model catalog (served by /api/models, cached module-wide) ----

export interface ByokModelOption {
  id: string
  name?: string
}

const EMPTY_MODEL_CATALOG: Partial<Record<ByokProvider, ByokModelOption[]>> = {}
let modelCatalogCache: Partial<Record<ByokProvider, ByokModelOption[]>> = EMPTY_MODEL_CATALOG
let modelCatalogPromise: Promise<Partial<Record<ByokProvider, ByokModelOption[]>>> | null = null
const modelCatalogListeners = new Set<() => void>()

function fetchModelCatalog(): Promise<Partial<Record<ByokProvider, ByokModelOption[]>>> {
  if (modelCatalogCache !== EMPTY_MODEL_CATALOG) return Promise.resolve(modelCatalogCache)
  if (!modelCatalogPromise) {
    // Static export has no /api/models — enumerate the pi-ai registry locally
    // (lazy import keeps pi-ai out of the hosted bundle).
    modelCatalogPromise = isPealStaticRuntime()
      ? import('@/lib/ai/browserChat')
          .then((m) => {
            modelCatalogCache = m.browserModelCatalog()
            return modelCatalogCache
          })
          .catch(() => modelCatalogCache)
      : fetch('/api/models')
          .then((res) => (res.ok ? res.json() : {}))
          .then((data) => {
            modelCatalogCache = data as Partial<Record<ByokProvider, ByokModelOption[]>>
            return modelCatalogCache
          })
          .catch(() => modelCatalogCache)
  }
  return modelCatalogPromise
}

/** pi-ai registry models per BYOK provider, fetched once from /api/models. */
export function useByokModelCatalog(): Partial<Record<ByokProvider, ByokModelOption[]>> {
  return useSyncExternalStore(
    (onChange) => {
      modelCatalogListeners.add(onChange)
      if (!modelCatalogPromise && modelCatalogCache === EMPTY_MODEL_CATALOG) {
        void fetchModelCatalog().then(() => {
          modelCatalogListeners.forEach((fn) => fn())
        })
      }
      return () => {
        modelCatalogListeners.delete(onChange)
      }
    },
    () => modelCatalogCache,
    () => modelCatalogCache,
  )
}
