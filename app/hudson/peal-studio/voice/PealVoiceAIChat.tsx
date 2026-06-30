'use client'

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { isToolUIPart, getToolName } from 'ai'
import { Square, AlertCircle } from 'lucide-react'
import { usePealVoiceAIContext } from './PealVoiceAIProvider'

interface PealVoiceAIChatProps {
  placeholder: string
}

export function PealVoiceAIChat({ placeholder }: PealVoiceAIChatProps) {
  const { chat } = usePealVoiceAIContext()
  const { messages, status, error } = chat
  const scrollRef = useRef<HTMLDivElement>(null)
  const isStreaming = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isStreaming])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 ? (
          <p className="py-6 text-center font-mono text-[11px] leading-relaxed text-gray-500">
            {placeholder}
          </p>
        ) : null}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed ${
                msg.role === 'user'
                  ? 'border border-[#4a9eff]/25 bg-[#4a9eff]/10 text-gray-100'
                  : 'border border-[#2c2c2e] bg-[#1c1c1e]/80 text-gray-200'
              }`}
            >
              {(msg.parts ?? []).map((part, i) => {
                if (!part) return null
                if (part.type === 'text') {
                  return <span key={i}>{part.text}</span>
                }
                if (isToolUIPart(part)) {
                  const name = getToolName(part)
                  const argStr = Object.entries((part.input ?? {}) as Record<string, unknown>)
                    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                    .join(', ')
                  return (
                    <div key={i} className="mt-1 font-mono text-[10px] text-[#4a9eff]/80">
                      <span className="text-gray-600">{'↳ '}</span>
                      {name}({argStr})
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' ? (
          <div className="flex justify-start">
            <div className="rounded-lg border border-[#2c2c2e] bg-[#1c1c1e]/80 px-3 py-2 font-mono text-[11px] text-gray-500">
              <span className="animate-pulse">Applying to mixer…</span>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="flex shrink-0 items-center gap-2 border-t border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[10px] text-red-300">
          <AlertCircle size={12} />
          <span className="truncate">{error.message || 'An error occurred'}</span>
        </div>
      ) : null}
    </div>
  )
}

export function PealVoiceAIComposer({ placeholder }: { placeholder: string }) {
  const { chat, sendPrompt, isBusy } = usePealVoiceAIContext()
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = inputRef.current?.value.trim() ?? ''
    if (!text || isBusy) return
    if (inputRef.current) inputRef.current.value = ''
    sendPrompt(text)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="peal-voice-ai-composer shrink-0 border-t border-[#4a9eff]/25 bg-[#0d0d0f] p-3"
    >
      <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#4a9eff]/90">
        Your idea
      </label>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={isBusy}
          className="peal-voice-ai-composer-input min-w-0 flex-1"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={() => chat.stop()}
            className="peal-inst-pad peal-inst-pad--active shrink-0 !px-2.5"
            title="Stop"
          >
            <Square size={12} />
          </button>
        ) : (
          <button
            type="submit"
            className="peal-inst-pad peal-inst-pad--active shrink-0 !px-3 !text-[10px]"
          >
            Send
          </button>
        )}
      </div>
    </form>
  )
}