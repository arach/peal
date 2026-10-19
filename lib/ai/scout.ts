/**
 * Scout backend for Peal AI chat — direct agent sessions.
 *
 * Instead of calling a provider API with a key, Peal drives a local harness
 * session (Claude Code or Codex) through Scout's session adapters
 * (@openscout/agent-sessions). This is a direct, one-turn session — no broker
 * delivery, no agent-to-agent messaging. The agent replies with JSON (prose +
 * tool calls), which we replay as an AI SDK UI message stream so the studio's
 * onToolCall handlers fire exactly as they do for pi-ai.
 */
import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai'
import { z } from 'zod'
import type { PiAiUIMessage } from '@hudsonkit/ai'
import { SessionRegistry } from '@openscout/agent-sessions'
import { createAdapter as createClaudeCodeAdapter } from '@openscout/agent-sessions/adapters/claude-code'
import { createAdapter as createCodexAdapter } from '@openscout/agent-sessions/adapters/codex'

const DEFAULT_HARNESS = process.env.PEAL_SCOUT_HARNESS ?? 'codex'
const TIMEOUT_MS = Number(process.env.PEAL_SCOUT_TIMEOUT_MS ?? 180_000)
/**
 * Sessions run in an empty scratch dir by default: the agent answers from the
 * prompt alone, with nothing in its cwd to read or edit.
 */
const SESSION_CWD = process.env.PEAL_SCOUT_SESSION_CWD ?? path.join(tmpdir(), 'peal-scout-sessions')

/** `auto` (default): Scout when the provider has no credential. `scout`: always. `pi`: never. */
export type PealAIBackend = 'auto' | 'scout' | 'pi'

export function pealAIBackend(): PealAIBackend {
  const v = process.env.PEAL_AI_BACKEND
  return v === 'scout' || v === 'pi' ? v : 'auto'
}

/** Provider id → Scout harness. Explicit `scout` presets carry the harness as the model. */
export function scoutHarnessFor(provider?: string, model?: string): string {
  if (provider === 'scout') return model || DEFAULT_HARNESS
  if (provider === 'anthropic') return 'claude'
  if (provider === 'openai' || provider === 'openai-codex') return 'codex'
  return DEFAULT_HARNESS
}

/** Harness name → adapter type registered below. */
const ADAPTER_FOR_HARNESS: Record<string, string> = {
  claude: 'claude-code',
  'claude-code': 'claude-code',
  codex: 'codex',
}

const ADAPTER_OPTIONS: Record<string, Record<string, unknown>> = {
  // Read-only sandbox, never prompt: a design turn must not touch the machine.
  codex: { sandbox: 'read-only', approvalPolicy: 'never' },
  'claude-code': {},
}

let registry: SessionRegistry | null = null

function sessionRegistry(): SessionRegistry {
  registry ??= new SessionRegistry({
    adapters: {
      'claude-code': createClaudeCodeAdapter,
      codex: createCodexAdapter,
    },
  })
  return registry
}

/**
 * Run one turn in a fresh harness session and return the agent's final text.
 * Tool approvals are denied — the agent only answers from the prompt.
 */
async function runSessionTurn(
  prompt: string,
  harness: string,
  onProgress: (status: string) => void,
): Promise<string> {
  const adapterType = ADAPTER_FOR_HARNESS[harness]
  if (!adapterType) throw new Error(`Scout session adapter not available for harness "${harness}"`)

  mkdirSync(SESSION_CWD, { recursive: true })
  const reg = sessionRegistry()
  const session = await reg.createSession(adapterType, {
    name: `peal ${harness}`,
    cwd: SESSION_CWD,
    options: ADAPTER_OPTIONS[adapterType],
  })

  const textByBlock = new Map<string, string>()
  const textOrder: string[] = []
  let sawText = false

  try {
    const outcome = await new Promise<{ ok: true } | { ok: false; message: string }>((resolve) => {
      const timer = setTimeout(() => resolve({ ok: false, message: `timed out after ${Math.round(TIMEOUT_MS / 1000)}s` }), TIMEOUT_MS)
      const stop = reg.onEvent(({ event }) => {
        if (!('sessionId' in event) || event.sessionId !== session.id) return
        switch (event.event) {
          case 'turn:start':
            onProgress(`${harness}: thinking`)
            break
          case 'block:start':
            if (event.block.type === 'text') {
              textByBlock.set(event.block.id, 'text' in event.block ? String(event.block.text ?? '') : '')
              textOrder.push(event.block.id)
              if (!sawText) {
                sawText = true
                onProgress(`${harness}: composing`)
              }
            } else if (event.block.type === 'action') {
              onProgress(`${harness}: ${'action' in event.block ? String((event.block.action as { kind?: string })?.kind ?? 'tool') : 'tool'}`)
            }
            break
          case 'block:delta':
            if (textByBlock.has(event.blockId)) {
              textByBlock.set(event.blockId, (textByBlock.get(event.blockId) ?? '') + event.text)
            }
            break
          case 'block:action:approval':
            // Off the broadcast loop, per the registry contract.
            queueMicrotask(() => reg.decide({
              sessionId: event.sessionId,
              turnId: event.turnId,
              blockId: event.blockId,
              version: event.approval.version,
              decision: 'deny',
              reason: 'Peal design turns answer from the prompt only.',
            }))
            break
          case 'turn:end':
            clearTimeout(timer)
            stop()
            resolve(event.status === 'completed' ? { ok: true } : { ok: false, message: `turn ${event.status}` })
            break
          case 'turn:error':
            clearTimeout(timer)
            stop()
            resolve({ ok: false, message: event.message })
            break
        }
      })
      reg.send({ sessionId: session.id, text: prompt })
    })
    if (!outcome.ok) throw new Error(`${harness} session ${outcome.message}`)

    // Prefer the snapshot (authoritative), fall back to streamed deltas.
    const snapshot = reg.getSessionSnapshot(session.id)
    const turns = snapshot?.turns ?? []
    const fromSnapshot = turns[turns.length - 1]?.blocks
      .map(({ block }: { block: { type: string; text?: string } }) => (block.type === 'text' ? block.text ?? '' : ''))
      .join('')
      .trim()
    return fromSnapshot || textOrder.map((id) => textByBlock.get(id) ?? '').join('').trim()
  } finally {
    await reg.closeSession(session.id).catch(() => {})
  }
}

// ---- Prompt ----

type AnyTool = { description?: string; inputSchema?: unknown; execute?: (args: never, opts: never) => unknown }

function toolSchemaJson(tool: AnyTool): unknown {
  try {
    if (tool.inputSchema instanceof z.ZodType) return z.toJSONSchema(tool.inputSchema)
  } catch {
    // fall through
  }
  return { type: 'object' }
}

function messageText(message: PiAiUIMessage): string {
  const parts = (message as { parts?: Array<Record<string, unknown>> }).parts ?? []
  const lines: string[] = []
  for (const part of parts) {
    if (part.type === 'text' && typeof part.text === 'string') lines.push(part.text)
    else if (typeof part.type === 'string' && part.type.startsWith('tool-') && part.input !== undefined) {
      lines.push(`[called ${part.type.slice(5)} ${JSON.stringify(part.input)}]`)
    }
  }
  return lines.join('\n').trim()
}

function buildPrompt(input: {
  system?: string
  tools: Record<string, AnyTool>
  messages: PiAiUIMessage[]
}): string {
  const toolLines = Object.entries(input.tools).map(([name, tool]) =>
    `- ${name}: ${tool.description ?? ''}\n  input JSON schema: ${JSON.stringify(toolSchemaJson(tool))}`,
  )
  const transcript = input.messages
    .map((m) => {
      const text = messageText(m)
      return text ? `${m.role.toUpperCase()}: ${text}` : ''
    })
    .filter(Boolean)
    .join('\n\n')

  return [
    'You are answering on behalf of the Peal web app (a UI sound design studio). This is a one-shot request routed through Scout.',
    'Do NOT read, edit or create files and do NOT run commands. Answer only from the instructions below.',
    '',
    '# Assistant instructions',
    input.system ?? '(none)',
    '',
    '# Tools the app can apply',
    'You cannot call these directly. To use one, list it in "toolCalls" and the app will apply it.',
    toolLines.length ? toolLines.join('\n') : '(no tools)',
    '',
    '# Conversation so far',
    transcript || '(empty)',
    '',
    '# Reply format',
    'Reply with ONLY one JSON object and nothing else, no code fences:',
    '{"text": "<message shown to the user>", "toolCalls": [{"name": "<tool name>", "args": { ... }}]}',
    'Use an empty toolCalls array when no tool applies. Args must match the tool schema; numbers as numbers.',
  ].join('\n')
}

interface ScoutReply {
  text: string
  toolCalls: { name: string; args: Record<string, unknown> }[]
}

export function parseScoutReply(output: string): ScoutReply {
  const trimmed = output.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>
      const calls = Array.isArray(parsed.toolCalls) ? parsed.toolCalls : []
      return {
        text: typeof parsed.text === 'string' ? parsed.text : '',
        toolCalls: calls
          .filter((c): c is { name: string; args?: unknown } =>
            Boolean(c) && typeof (c as { name?: unknown }).name === 'string')
          .map((c) => ({
            name: c.name,
            args: c.args && typeof c.args === 'object' && !Array.isArray(c.args)
              ? (c.args as Record<string, unknown>)
              : {},
          })),
      }
    } catch {
      // not JSON — show the raw reply
    }
  }
  return { text: output.trim(), toolCalls: [] }
}

// ---- Stream ----

export function streamScoutChat(input: {
  messages: PiAiUIMessage[]
  toolset: string
  system?: string
  tools: Record<string, AnyTool>
  harness: string
  signal?: AbortSignal
  log: (msg: string) => void
}): Response {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: 'start' })
      writer.write({ type: 'start-step' })

      const statusId = 'scout-status'
      writer.write({ type: 'reasoning-start', id: statusId })
      writer.write({ type: 'reasoning-delta', id: statusId, delta: `Starting a ${input.harness} session via Scout…` })

      const prompt = buildPrompt(input)
      const progress = (status: string) => {
        writer.write({ type: 'reasoning-delta', id: statusId, delta: `\n${status}` })
      }
      let output: string
      const startedAt = Date.now()
      try {
        output = await runSessionTurn(prompt, input.harness, progress)
      } catch (err) {
        // Harness sessions occasionally fail at startup; one fresh retry for fast failures.
        if (Date.now() - startedAt > 15_000) throw err
        input.log(`scout session ${input.harness} failed fast (${err instanceof Error ? err.message : err}); retrying`)
        progress(`${input.harness}: retrying in a fresh session`)
        output = await runSessionTurn(prompt, input.harness, progress)
      }
      writer.write({ type: 'reasoning-end', id: statusId })
      input.log(`scout session ${input.harness} replied (${output.length} chars)`)

      const reply = parseScoutReply(output)
      if (reply.text) {
        writer.write({ type: 'text-start', id: 'scout-text' })
        writer.write({ type: 'text-delta', id: 'scout-text', delta: reply.text })
        writer.write({ type: 'text-end', id: 'scout-text' })
      }

      for (const [i, call] of reply.toolCalls.entries()) {
        const tool = input.tools[call.name]
        const toolCallId = `scout-${Date.now().toString(36)}-${i}`
        if (!tool) {
          input.log(`scout reply named unknown tool ${call.name}`)
          continue
        }
        let args = call.args
        if (tool.inputSchema instanceof z.ZodType) {
          const parsed = tool.inputSchema.safeParse(args)
          if (!parsed.success) {
            writer.write({ type: 'tool-input-error', toolCallId, toolName: call.name, input: args, errorText: parsed.error.message })
            continue
          }
          args = parsed.data as Record<string, unknown>
        }
        writer.write({ type: 'tool-input-available', toolCallId, toolName: call.name, input: args })
        const output = tool.execute ? await tool.execute(args as never, { toolCallId, messages: [] } as never) : { applied: true }
        writer.write({ type: 'tool-output-available', toolCallId, output })
      }

      writer.write({ type: 'finish-step' })
      writer.write({ type: 'finish', finishReason: 'stop' })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err)
      input.log(`scout ERROR: ${message}`)
      return `Scout: ${message}`
    },
  })
  return createUIMessageStreamResponse({ stream })
}
