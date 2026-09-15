'use client'

/**
 * Peal's chat hook — same contract as hudsonkit's useHudsonAI, but the
 * transport carries a custom fetch: on the static GitHub Pages build the
 * request runs pi-ai inference in-browser (BYOK keys only); on the hosted
 * app it posts to /api/ai/chat as before.
 */
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { logHudsonAgentAction } from 'hudsonkit'
import type { HudsonAIChat } from 'hudsonkit'
import type { ChatOnErrorCallback, ChatOnFinishCallback, UIMessage } from 'ai'
import { isPealStaticRuntime } from './runtime'

/**
 * Transport fetch: hosted app → real fetch to /api/ai/chat; static export →
 * pi-ai inference in-browser (pi-ai is lazy-loaded so it never ships in the
 * hosted bundle).
 */
const pealChatFetch: typeof fetch = async (input, init) => {
  if (!isPealStaticRuntime()) return fetch(input, init)
  const { streamBrowserChat } = await import('./browserChat')
  return streamBrowserChat(init)
}

function traceId() {
  return `tr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export interface PealAIAgentTrace {
  appId?: string
  appName?: string
  source?: string
}

export interface UsePealChatOptions {
  api?: string
  toolset: string
  chatId?: string
  context?: Record<string, unknown>
  provider?: string
  model?: string
  effort?: 'off' | 'low' | 'medium' | 'high'
  mode?: 'cli' | 'api'
  onToolCall?: (toolName: string, args: Record<string, unknown>) => void | Promise<void>
  onFinish?: ChatOnFinishCallback<UIMessage>
  onError?: ChatOnErrorCallback
  agentTrace?: PealAIAgentTrace
}

const DEFAULT_API = '/api/ai/chat'

function emitToolEvent(input: {
  status: 'started' | 'completed' | 'failed'
  toolset: string
  chatId?: string
  toolName: string
  args: Record<string, unknown>
  trace?: PealAIAgentTrace
  traceId?: string
  error?: Error
}) {
  logHudsonAgentAction({
    source: input.trace?.source ?? 'usePealChat',
    status: input.status,
    toolset: input.toolset,
    chatId: input.chatId,
    action: input.toolName,
    appId: input.trace?.appId,
    appName: input.trace?.appName,
    traceId: input.traceId,
    args: input.args,
    error: input.error,
  })
}

export function usePealChat({
  api,
  toolset,
  chatId,
  context,
  provider,
  model,
  effort,
  mode,
  onToolCall,
  onFinish,
  onError,
  agentTrace,
}: UsePealChatOptions): HudsonAIChat {
  const resolvedApi = api ?? DEFAULT_API
  const resolvedMode = mode ?? 'api'

  const contextRef = useRef(context)
  const toolsetRef = useRef(toolset)
  const providerRef = useRef(provider)
  const modelRef = useRef(model)
  const effortRef = useRef(effort)
  const modeRef = useRef(resolvedMode)
  const onToolCallRef = useRef(onToolCall)
  const onFinishRef = useRef(onFinish)
  const onErrorRef = useRef(onError)
  const agentTraceRef = useRef(agentTrace)

  useEffect(() => { contextRef.current = context }, [context])
  useEffect(() => { toolsetRef.current = toolset }, [toolset])
  useEffect(() => { providerRef.current = provider }, [provider])
  useEffect(() => { modelRef.current = model }, [model])
  useEffect(() => { effortRef.current = effort }, [effort])
  useEffect(() => { modeRef.current = resolvedMode }, [resolvedMode])
  useEffect(() => { onToolCallRef.current = onToolCall }, [onToolCall])
  useEffect(() => { onFinishRef.current = onFinish }, [onFinish])
  useEffect(() => { onErrorRef.current = onError }, [onError])
  useEffect(() => { agentTraceRef.current = agentTrace }, [agentTrace])

  /* eslint-disable react-hooks/refs */
  const transport = useMemo(
    () => new DefaultChatTransport({
      api: resolvedApi,
      fetch: pealChatFetch,
      body: () => ({
        toolset: toolsetRef.current,
        context: contextRef.current,
        mode: modeRef.current,
        provider: providerRef.current,
        model: modelRef.current,
        effort: effortRef.current,
      }),
    }),
    [resolvedApi],
  )
  /* eslint-enable react-hooks/refs */

  const handleToolCall = useCallback(
    async ({ toolCall }: { toolCall: { toolName: string; input: unknown } }) => {
      if (!onToolCallRef.current) return
      const args =
        toolCall.input && typeof toolCall.input === 'object' && !Array.isArray(toolCall.input)
          ? (toolCall.input as Record<string, unknown>)
          : {}
      const id = traceId()
      const base = {
        toolset: toolsetRef.current,
        chatId,
        toolName: toolCall.toolName,
        args,
        trace: agentTraceRef.current,
        traceId: id,
      }
      try {
        emitToolEvent({ ...base, status: 'started' })
        await onToolCallRef.current(toolCall.toolName, args)
        emitToolEvent({ ...base, status: 'completed' })
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        emitToolEvent({ ...base, status: 'failed', error })
        onErrorRef.current?.(error)
        throw error
      }
    },
    [chatId],
  )

  const chat = useChat({
    id: chatId,
    transport: transport as never,
    onToolCall: handleToolCall as never,
    onFinish: (event) => onFinishRef.current?.(event as never),
    onError: (error) => onErrorRef.current?.(error),
  })

  const clearChat = useCallback(() => {
    chat.setMessages([])
  }, [chat])

  const sendMessage = useCallback(
    (...args: Parameters<typeof chat.sendMessage>) => chat.sendMessage(...args),
    [chat],
  )

  const emptyAttachments = useRef<never[]>([])
  const emptyActive = useRef(new Set<string>())
  const toggleAttachment = useCallback((_label: string) => {}, [])

  return {
    messages: chat.messages as HudsonAIChat['messages'],
    sendMessage: sendMessage as HudsonAIChat['sendMessage'],
    stop: chat.stop,
    status: chat.status,
    setMessages: chat.setMessages as HudsonAIChat['setMessages'],
    clearChat,
    error: chat.error,
    mode: resolvedMode,
    attachments: emptyAttachments.current,
    activeAttachments: emptyActive.current,
    toggleAttachment,
  }
}
