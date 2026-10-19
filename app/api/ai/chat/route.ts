import type { PiAiUIMessage } from '@hudsonkit/ai'
import { defaultRegistry } from '@hudsonkit/ai/toolsets'
import {
  buildDefaultModels,
  loadCredentials,
  piBackend,
  proxyChatToHudson,
} from '@/lib/ai/host'
import { pealAIBackend, scoutHarnessFor, streamScoutChat } from '@/lib/ai/scout'
import { loadToolset } from '@/lib/ai/toolsets'
import { sanitizeByok } from '@/lib/byok'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

const PEAL_LOCAL_TOOLSETS = new Set(['peal-studio', 'peal-voice', 'peal-music', 'intents', 'sfx'])

function log(msg: string) {
  const ts = new Date().toISOString().slice(11, 23)
  console.log(`[${ts}] peal/ai/chat: ${msg}`)
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const toolset = typeof body.toolset === 'string' ? body.toolset : ''
  const messages = Array.isArray(body.messages) ? (body.messages as PiAiUIMessage[]) : []
  const context =
    body.context && typeof body.context === 'object' && !Array.isArray(body.context)
      ? (body.context as Record<string, unknown>)
      : {}
  // BYOK: client keys ride in context.byok — strip before the toolset sees it.
  const byok = sanitizeByok(context.byok)
  delete context.byok
  const provider = typeof body.provider === 'string' ? body.provider : undefined
  const model = typeof body.model === 'string' ? body.model : undefined
  const effort = body.effort === 'off' || body.effort === 'low' || body.effort === 'medium' || body.effort === 'high'
    ? body.effort
    : undefined

  if (toolset && !PEAL_LOCAL_TOOLSETS.has(toolset) && !defaultRegistry.resolve(toolset)) {
    log(`proxy → Hudson | toolset=${toolset}`)
    return proxyChatToHudson(req, rawBody)
  }

  log(`${provider ?? 'default'}/${model ?? 'default'}${effort ? ` effort=${effort}` : ''} | toolset=${toolset} | ${Array.isArray(messages) ? messages.length : 0} messages`)

  const credentials = loadCredentials(byok)

  // Scout: explicit `scout` provider, PEAL_AI_BACKEND=scout, or (auto) no key for the provider.
  const backend = pealAIBackend()
  const useScout = backend !== 'pi' && (
    backend === 'scout'
    || provider === 'scout'
    || !(provider ? credentials[provider] : Object.values(credentials).some(Boolean))
  )
  if (useScout) {
    const harness = scoutHarnessFor(provider, model)
    log(`route → Scout | harness=${harness}`)
    const { system, tools } = loadToolset(toolset, context)
    return streamScoutChat({ messages, toolset, system, tools: tools as Parameters<typeof streamScoutChat>[0]['tools'], harness, log })
  }

  try {
    return piBackend.streamUI({
      messages,
      toolset,
      context,
      provider,
      model,
      ...(effort ? { effort } : {}),
      loadToolset: loadToolset as never,
      loadCredentials: () => credentials,
      defaultModels: buildDefaultModels(credentials),
    } as Parameters<typeof piBackend.streamUI>[0])
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    log(`ERROR: ${message}`)
    return new Response(message || 'Unknown error in /api/ai/chat', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}