import { defaultRegistry } from '@hudsonkit/ai/toolsets'
import {
  buildDefaultModels,
  loadCredentials,
  piBackend,
  proxyChatToHudson,
} from '@/lib/ai/host'
import { loadToolset } from '@/lib/ai/toolsets'

export const runtime = 'nodejs'

const PEAL_LOCAL_TOOLSETS = new Set(['peal-studio', 'peal-voice', 'intents'])

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
  const messages = body.messages
  const context = body.context ?? {}
  const provider = body.provider
  const model = body.model

  if (toolset && !PEAL_LOCAL_TOOLSETS.has(toolset) && !defaultRegistry.resolve(toolset)) {
    log(`proxy → Hudson | toolset=${toolset}`)
    return proxyChatToHudson(req, rawBody)
  }

  log(`${provider ?? 'default'}/${model ?? 'default'} | toolset=${toolset} | ${Array.isArray(messages) ? messages.length : 0} messages`)

  try {
    return piBackend.streamUI({
      messages,
      toolset,
      context,
      provider,
      model,
      loadToolset: loadToolset as never,
      loadCredentials,
      defaultModels: buildDefaultModels(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    log(`ERROR: ${message}`)
    return new Response(message || 'Unknown error in /api/ai/chat', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}