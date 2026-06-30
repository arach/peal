export function highlightJavaScript(source: string): string {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const patterns: Array<{ re: RegExp; cls: string }> = [
    { re: /^\/\/.*/, cls: 'hl-cmt' },
    { re: /^(['"`])(?:[^\\]|\\.)*?\1/, cls: 'hl-str' },
    { re: /^(import|export|const|let|var|function|return|new|for|forEach|from|default)\b/, cls: 'hl-kw' },
    { re: /^\d+(?:\.\d+)?/, cls: 'hl-key' },
    { re: /^[a-zA-Z_$][\w$]*(?=\s*\()/, cls: 'hl-fn' },
    { re: /^[a-zA-Z_$][\w$]*/, cls: 'hl-key' },
    { re: /^[(){}[\];,.=+\-*/<>!&|:]/, cls: '' },
  ]

  let remaining = source
  const parts: string[] = []

  while (remaining.length > 0) {
    let matched = false
    for (const { re, cls } of patterns) {
      const match = remaining.match(re)
      if (match) {
        const value = escapeHtml(match[0])
        parts.push(cls ? `<span class="${cls}">${value}</span>` : value)
        remaining = remaining.slice(match[0].length)
        matched = true
        break
      }
    }
    if (!matched) {
      parts.push(escapeHtml(remaining[0]))
      remaining = remaining.slice(1)
    }
  }

  return parts.join('')
}