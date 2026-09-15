/**
 * Hudson AI host adapter for Peal.
 *
 * Peal does not call provider APIs (OpenAI, OpenRouter, etc.) directly.
 * All inference goes through @hudsonkit/ai/pi-ai → createPiAiBackend → pi-ai.
 * Credentials resolve via pi-ai's getEnvApiKey (OPENAI_API_KEY, etc.).
 */
import { getEnvApiKey } from '@earendil-works/pi-ai'
import { createPiAiBackend, listAvailableModels } from '@hudsonkit/ai/pi-ai'
import { resolveOpenAICodexAccessToken } from '@/lib/ai/codexCredentials'
import { ensurePealCredentialsLoaded, resolvePealCredential } from '@/lib/credentials'

export const piBackend = createPiAiBackend()

/**
 * First registered model per provider — sourced from pi-ai, not a Peal catalog.
 * `credentials` carries the merged env+BYOK map so providers keyed only in the
 * browser still resolve a default model.
 */
export function buildDefaultModels(
  credentials?: Record<string, string | undefined>,
): Record<string, string> {
  ensurePealCredentialsLoaded()
  const out: Record<string, string> = {}
  for (const entry of listAvailableModels({
    hasCredential: credentials
      ? (p) => Boolean(credentials[p]) || Boolean(getEnvApiKey(p))
      : undefined,
  })) {
    if (!out[entry.provider]) out[entry.provider] = entry.model
  }
  return out
}

/**
 * Credentials for pi-ai streamUI — env files + process.env + pi-ai fallbacks.
 * `overrides` carries browser-supplied BYOK keys; they win over env.
 */
export function loadCredentials(
  overrides?: Record<string, string | undefined>,
): Record<string, string | undefined> {
  ensurePealCredentialsLoaded()
  return {
    openai: resolvePealCredential('OPENAI_API_KEY'),
    groq: resolvePealCredential('GROQ_API_KEY'),
    anthropic: resolvePealCredential('ANTHROPIC_API_KEY'),
    google: resolvePealCredential('GEMINI_API_KEY'),
    openrouter: resolvePealCredential('OPENROUTER_API_KEY'),
    xai: resolvePealCredential('XAI_API_KEY'),
    deepseek: resolvePealCredential('DEEPSEEK_API_KEY'),
    opencode: resolvePealCredential('OPENCODE_API_KEY'),
    'openai-codex': resolveOpenAICodexAccessToken(),
    ...overrides,
  }
}

const HUDSON_AI_ORIGIN = process.env.HUDSON_AI_ORIGIN ?? 'http://localhost:3500'

/** Forward unknown toolsets to the Hudson dev app (optional shared backend). */
export async function proxyChatToHudson(req: Request, body: string): Promise<Response> {
  const target = `${HUDSON_AI_ORIGIN}/api/ai/chat`
  try {
    return await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      `Peal could not reach Hudson AI at ${HUDSON_AI_ORIGIN}. Start Hudson (\`bun dev\` in ../hudson) or set HUDSON_AI_ORIGIN. (${message})`,
      { status: 502, headers: { 'Content-Type': 'text/plain' } },
    )
  }
}