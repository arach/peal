/**
 * Browser-side AI inference for the static GitHub Pages export (no /api/*
 * routes). Loaded lazily — pi-ai's model registry is heavy, so this module is
 * only ever dynamic-imported when the static runtime is detected.
 *
 * Runs the same piBackend.streamUI pipeline as /api/ai/chat and returns the
 * same UIMessageStream Response, so the chat transport sees identical wire
 * data either way. Credentials are the visitor's BYOK keys (localStorage) —
 * no server env exists on static.
 */
import { createPiAiBackend } from '@hudsonkit/ai/pi-ai'
import {
  BYOK_MODELS,
  BYOK_PROVIDERS,
  BYOK_PROVIDER_IDS,
  sanitizeByok,
  type ByokKeys,
  type ByokProvider,
} from '@/lib/byok'
import { loadToolset } from '@/lib/ai/toolsets'

const browserBackend = createPiAiBackend()

/** First-choice model per BYOK provider that actually has a browser key. */
function browserDefaultModels(byok: ByokKeys): Record<string, string> {
  const out: Record<string, string> = {}
  for (const id of BYOK_PROVIDER_IDS) {
    if (byok[id]) out[id] = BYOK_PROVIDERS[id].defaultModel
  }
  return out
}

/** Run one chat request fully in-browser; mirrors the /api/ai/chat route. */
export function streamBrowserChat(init?: RequestInit): Response {
  let body: Record<string, unknown> = {}
  try {
    body = JSON.parse(typeof init?.body === 'string' ? init.body : '{}') as Record<string, unknown>
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const context =
    body.context && typeof body.context === 'object' && !Array.isArray(body.context)
      ? { ...(body.context as Record<string, unknown>) }
      : {}
  const byok = sanitizeByok(context.byok)
  delete context.byok

  try {
    return browserBackend.streamUI({
      messages: (Array.isArray(body.messages) ? body.messages : []) as never,
      toolset: typeof body.toolset === 'string' ? body.toolset : '',
      context,
      provider: typeof body.provider === 'string' ? body.provider : undefined,
      model: typeof body.model === 'string' ? body.model : undefined,
      effort:
        body.effort === 'off' || body.effort === 'low' || body.effort === 'medium' || body.effort === 'high'
          ? body.effort
          : undefined,
      loadToolset: loadToolset as never,
      loadCredentials: () => ({ ...byok }),
      defaultModels: browserDefaultModels(byok),
    } as Parameters<typeof browserBackend.streamUI>[0])
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(message || 'Unknown error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

/**
 * Curated BYOK model shortlist — mirrors /api/models for the static build,
 * which has no server route.
 */
export function browserModelCatalog(): Partial<Record<ByokProvider, { id: string; name?: string }[]>> {
  const out: Partial<Record<ByokProvider, { id: string; name?: string }[]>> = {}
  for (const id of BYOK_PROVIDER_IDS) {
    out[id] = BYOK_MODELS[id].map((model) => ({ id: model }))
  }
  return out
}
