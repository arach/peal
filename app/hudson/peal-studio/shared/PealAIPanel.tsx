'use client'

/**
 * Shared AI panel kit for the studio inspectors (SFX AI Design, Voice AI Edit,
 * Music Copilot). One header, thread, section, chip row and composer so the
 * three tools read as one product. Styles live in styles/studio-panels.css.
 */
import { useEffect, useRef, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { getToolName, isToolUIPart } from 'ai'
import { Square } from 'lucide-react'
import type { HudsonAIChat } from 'hudsonkit'
import { AiDesignIcon } from '@/components/icons/PealStudioIcon'
import { PealAIErrorBanner } from './PealAIErrorBanner'

export function PealAIPanel({ children }: { children: ReactNode }) {
  return <div className="peal-ai-panel">{children}</div>
}

export function PealAIHeader({ title, hint, action }: { title: string; hint?: ReactNode; action?: ReactNode }) {
  return (
    <div className="peal-ai-header">
      <span className="peal-ai-header-icon" aria-hidden>
        <AiDesignIcon size={12} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="peal-ai-title">{title}</p>
        {hint ? <p className="peal-ai-hint">{hint}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function PealAISection({
  label,
  action,
  children,
}: {
  label: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="peal-ai-section">
      <div className="peal-ai-section-head">
        <p className="peal-ai-label">{label}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

export function PealAIChips({
  label,
  chips,
  onPick,
  disabled,
}: {
  label: string
  chips: readonly string[]
  onPick: (chip: string) => void
  disabled?: boolean
}) {
  if (chips.length === 0) return null
  return (
    <PealAISection label={label}>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={disabled}
            onClick={() => onPick(chip)}
            className="peal-ai-chip"
          >
            {chip}
          </button>
        ))}
      </div>
    </PealAISection>
  )
}

/** One-line activity readout: `tool · summary`. */
export function PealAIActivity({ label, tool, summary, action }: {
  label: string
  tool?: string
  summary?: string
  action?: ReactNode
}) {
  return (
    <PealAISection label={label} action={action}>
      <p className="peal-ai-activity">
        {tool ? <span className="peal-ai-activity-tool">{tool}</span> : null}
        {tool && summary ? ' · ' : null}
        {summary}
      </p>
    </PealAISection>
  )
}

/** Compact tool-call line: the call's summary when it has one, else truncated args. */
function toolCallLabel(name: string, input: unknown): string {
  const args = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  if (typeof args.summary === 'string') {
    const layers = Array.isArray(args.layers) ? ` · ${args.layers.length} layers` : ''
    return `${name} · ${args.summary}${layers}`
  }
  const text = Object.entries(args).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')
  return `${name}(${text.length > 140 ? `${text.slice(0, 140)}…` : text})`
}

function lastLine(text: string): string {
  const lines = text.trim().split('\n')
  return lines[lines.length - 1] ?? ''
}

export function PealAIThread({
  chat,
  placeholder,
  pendingLabel = 'Thinking…',
}: {
  chat: Pick<HudsonAIChat, 'messages' | 'status' | 'error'>
  placeholder: string
  pendingLabel?: string
}) {
  const { messages, status, error } = chat
  const scrollRef = useRef<HTMLDivElement>(null)
  const isStreaming = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isStreaming])

  const last = messages[messages.length - 1]
  const showPending = isStreaming && (last?.role !== 'assistant'
    || !(last.parts ?? []).some((p) => p?.type === 'text' || isToolUIPart(p as never)))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="peal-ai-thread">
        {messages.length === 0 ? <p className="peal-ai-empty">{placeholder}</p> : null}

        {messages.map((msg) => {
          const parts = (msg.parts ?? []) as Array<Record<string, unknown> | null>
          const visible = parts.some((p) => p && (p.type === 'text' || isToolUIPart(p as never)))
          if (!visible) return null
          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`peal-ai-bubble ${msg.role === 'user' ? 'peal-ai-bubble--user' : ''}`}>
                {parts.map((part, i) => {
                  if (!part) return null
                  if (part.type === 'text') return <span key={i}>{String(part.text ?? '')}</span>
                  if (isToolUIPart(part as never)) {
                    return (
                      <div key={i} className="peal-ai-tool" title={JSON.stringify(part.input ?? {})}>
                        <span className="peal-ai-tool-arrow">↳ </span>
                        {toolCallLabel(getToolName(part as never), part.input)}
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          )
        })}

        {showPending ? (
          <div className="flex justify-start">
            <div className="peal-ai-bubble peal-ai-bubble--pending">
              <span className="animate-pulse">
                {(() => {
                  // Surface backend progress (e.g. Scout flight state) streamed as reasoning.
                  const reasoning = last?.role === 'assistant'
                    ? (last.parts ?? []).filter((p) => p?.type === 'reasoning').map((p) => (p as { text?: string }).text ?? '').join('')
                    : ''
                  return lastLine(reasoning) || pendingLabel
                })()}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <PealAIErrorBanner error={error} /> : null}
    </div>
  )
}

export function PealAIComposer({
  label,
  placeholder,
  isBusy,
  onSend,
  onStop,
}: {
  label: string
  placeholder: string
  isBusy: boolean
  onSend: (text: string) => void
  onStop?: () => void
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = inputRef.current?.value.trim() ?? ''
    if (!text || isBusy) return
    if (inputRef.current) inputRef.current.value = ''
    onSend(text)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <form onSubmit={onSubmit} className="peal-ai-composer">
      <label className="peal-ai-label peal-ai-label--accent">{label}</label>
      <div className="peal-ai-composer-row">
        <textarea
          ref={inputRef}
          rows={1}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={isBusy}
          className="peal-ai-composer-input"
        />
        {isBusy && onStop ? (
          <button type="button" onClick={onStop} className="peal-ai-send" title="Stop">
            <Square size={11} />
          </button>
        ) : (
          <button type="submit" disabled={isBusy} className="peal-ai-send">
            Send
          </button>
        )}
      </div>
    </form>
  )
}
