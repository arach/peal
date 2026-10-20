/**
 * Hudson AI host adapter for Peal.
 *
 * Peal does not call provider APIs (OpenAI, OpenRouter, etc.) directly.
 * Inference goes through the Hudson host; provider adapters stay internal there.
 * Credentials resolve via pi-ai's getEnvApiKey (OPENAI_API_KEY, etc.).
 */
import { HUDSON_AI_CHAT_PATH, HUDSON_AI_SERVER_ORIGIN } from './hostEndpoints'
import { resolveOpenAICodexAccessToken } from '@/lib/ai/codexCredentials'
import { ensurePealCredentialsLoaded, resolvePealCredential } from '@/lib/credentials'

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


/** Forward unknown toolsets to the Hudson dev app (optional shared backend). */
export async function proxyChatToHudson(req: Request, body: string): Promise<Response> {
  const target = new URL(HUDSON_AI_CHAT_PATH, HUDSON_AI_SERVER_ORIGIN)
  try {
    return await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: req.signal,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      `Peal could not reach Hudson AI at ${HUDSON_AI_SERVER_ORIGIN}. Start Hudson (\`bun dev\` in ../hudson) or set HUDSON_AI_ORIGIN. (${message})`,
      { status: 502, headers: { 'Content-Type': 'text/plain' } },
    )
  }
}