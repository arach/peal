import { AlertCircle } from 'lucide-react'

function formatAIError(error: Error | string) {
  const message = typeof error === 'string' ? error : error.message
  if (/429|too many requests|quota/i.test(message)) {
    return 'AI provider quota exceeded. Check billing or switch provider/model, then try again.'
  }
  return message || 'An error occurred'
}

export function PealAIErrorBanner({ error }: { error: Error | string }) {
  const originalMessage = typeof error === 'string' ? error : error.message

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="peal-ai-error-banner flex shrink-0 items-start gap-2 px-3 py-2 font-mono text-[10px] leading-relaxed"
      title={originalMessage}
    >
      <AlertCircle className="mt-0.5 shrink-0" size={12} aria-hidden="true" />
      <span className="min-w-0 break-words">{formatAIError(error)}</span>
    </div>
  )
}
