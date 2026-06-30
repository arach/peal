/**
 * Hudson AI host adapter for Peal.
 *
 * Peal does not call provider APIs (Minimax, OpenAI, etc.) directly.
 * All inference goes through @hudsonkit/ai → createPiAiBackend → pi-ai.
 * Credentials resolve via pi-ai's getEnvApiKey (MINIMAX_API_KEY, etc.).
 */
import { createPiAiBackend, listAvailableModels } from '@hudsonkit/ai'
import { ensurePealCredentialsLoaded, resolvePealCredential } from '@/lib/credentials'

export const piBackend = createPiAiBackend()

/** First registered model per provider — sourced from pi-ai, not a Peal catalog. */
export function buildDefaultModels(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const entry of listAvailableModels()) {
    if (!out[entry.provider]) out[entry.provider] = entry.model
  }
  return out
}

/** Credentials for pi-ai streamUI — env files + process.env + pi-ai fallbacks. */
export function loadCredentials(): Record<string, string | undefined> {
  ensurePealCredentialsLoaded()
  return {
    minimax: resolvePealCredential('MINIMAX_API_KEY'),
    openai: resolvePealCredential('OPENAI_API_KEY'),
    groq: resolvePealCredential('GROQ_API_KEY'),
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