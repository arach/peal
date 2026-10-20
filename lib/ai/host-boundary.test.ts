import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

const host = vi.hoisted(() => ({ proxy: vi.fn(), credentials: vi.fn() }))
vi.mock('@/lib/ai/host', () => ({
  proxyChatToHudson: host.proxy,
  loadCredentials: host.credentials,
}))
vi.mock('@/lib/ai/scout', () => ({
  pealAIBackend: () => 'pi',
  scoutHarnessFor: vi.fn(),
  streamScoutChat: vi.fn(),
}))
vi.mock('@/lib/ai/toolsets', () => ({
  loadToolset: (_id: string, context: Record<string, unknown>) => {
    expect(context).not.toHaveProperty('byok')
    return {
      system: 'Sound designer',
      tools: {
        compose_sound: {
          description: 'Compose a sound',
          inputSchema: z.object({ summary: z.string() }),
          execute: () => { throw new Error('The server must not run app tools') },
        },
      },
    }
  },
}))
vi.mock('@/lib/byok', () => ({ sanitizeByok: (value: unknown) => value ?? {} }))

import { POST } from '../../app/api/ai/chat/route'

afterEach(() => vi.resetAllMocks())

describe('Hudson inference boundary', () => {
  it('sends declarative JSON schemas and request credentials without app executors', async () => {
    host.credentials.mockReturnValue({ openrouter: 'test-key' })
    host.proxy.mockResolvedValue(new Response('stream', { headers: { 'content-type': 'text/event-stream' } }))
    const request = new Request('http://localhost/api/ai/chat', {
      method: 'POST', body: JSON.stringify({
        toolset: 'peal-studio', provider: 'openrouter', model: 'example', messages: [],
        context: { byok: { openrouter: 'test-key' }, currentTool: 'sfx' },
      }),
    })
    const response = await POST(request)
    expect(await response.text()).toBe('stream')
    const body = JSON.parse(host.proxy.mock.calls[0][1])
    expect(body.mode).toBe('api')
    expect(body.credentials).toEqual({ openrouter: 'test-key' })
    expect(body.context).toEqual({ currentTool: 'sfx' })
    expect(body.appToolset.tools.compose_sound).not.toHaveProperty('execute')
    expect(body.appToolset.tools.compose_sound.inputSchema.properties.summary.type).toBe('string')
  })

  it('forwards host-owned toolsets intact instead of inventing a local definition', async () => {
    host.proxy.mockResolvedValue(new Response('host'))
    const body = JSON.stringify({ toolset: 'host-only', messages: [] })
    const request = new Request('http://localhost/api/ai/chat', { method: 'POST', body })
    expect(await (await POST(request)).text()).toBe('host')
    expect(host.proxy).toHaveBeenCalledWith(request, body)
  })
})
