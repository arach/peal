/**
 * Strudel is a managed external app (AGPL) — not vendored in Peal.
 * Peal orchestrates pattern state + AI tools and proxies /strudel → STRUDEL_UPSTREAM.
 * See lib/strudel/README.md.
 */

const DEFAULT_MOUNT = '/strudel'

/** Default managed Strudel dev origin — iframe must load here, not via Next proxy. */
export const STRUDEL_DEFAULT_UPSTREAM = 'http://127.0.0.1:4321'

export interface StrudelEngineLike {
  phase?: string
  reachable?: boolean
  upstream?: string | null
  state?: { startedAt?: string; pid?: number } | null
}

/** Mount path or absolute origin (e.g. https://strudel.peal.dev). */
export function strudelMountBase(): string {
  const configured = process.env.NEXT_PUBLIC_STRUDEL_MOUNT?.trim()
  if (configured) return configured.replace(/\/$/, '')
  return DEFAULT_MOUNT
}

/** UTF-8 text → base64 (matches @strudel/core unicodeToBase64). */
function unicodeToBase64(text: string): string {
  if (typeof TextEncoder !== 'undefined' && typeof btoa !== 'undefined') {
    const utf8Bytes = new TextEncoder().encode(text)
    let binaryString = ''
    const chunkSize = 0x8000
    for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
      const chunk = utf8Bytes.subarray(i, i + chunkSize)
      binaryString += String.fromCharCode(...chunk)
    }
    return btoa(binaryString)
  }
  return Buffer.from(text, 'utf8').toString('base64')
}

/** Pattern hash for Strudel deep links (URI-encoded base64, matches code2hash). */
export function encodeStrudelPatternHash(code: string): string {
  const trimmed = code.trim()
  if (!trimmed) return ''
  try {
    return `#${encodeURIComponent(unicodeToBase64(trimmed))}`
  } catch {
    return ''
  }
}

const STRUDEL_EMBED_SEGMENT = '/embed'

function strudelEmbedRoot(base: string): string {
  const root = base.replace(/\/$/, '')
  if (root.endsWith(STRUDEL_EMBED_SEGMENT)) return root
  return `${root}${STRUDEL_EMBED_SEGMENT}`
}

/** Bust iframe/document cache when the managed Strudel process restarts. */
export function appendStrudelCacheBust(path: string, sessionKey: string): string {
  if (!sessionKey) return path
  const hashIdx = path.indexOf('#')
  const withoutHash = hashIdx >= 0 ? path.slice(0, hashIdx) : path
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : ''
  const joiner = withoutHash.includes('?') ? '&' : '?'
  return `${withoutHash}${joiner}_peal=${encodeURIComponent(sessionKey)}${hash}`
}

/** Relative or absolute mount URL — safe for SSR (no window.origin). Uses /embed for iframe embedding. */
export function strudelMountIndexPath(patternCode?: string): string {
  const base = strudelMountBase()
  const hash = patternCode ? encodeStrudelPatternHash(patternCode) : ''
  if (base.startsWith('http://') || base.startsWith('https://')) {
    const root = base.replace(/\/$/, '')
    if (root.endsWith('.html')) return `${root}${hash}`
    if (!root.includes('localhost') && !root.includes('127.0.0.1')) {
      return `${strudelEmbedRoot(root)}${hash}`
    }
    return `${strudelEmbedRoot(root)}${hash}`
  }
  const path = (base.startsWith('/') ? base : `/${base}`).replace(/\/$/, '')
  return `${strudelEmbedRoot(path)}${hash}`
}

/** Build a REPL URL from a running upstream (e.g. http://127.0.0.1:4321). */
export function strudelReplUrlForUpstream(upstream: string, patternCode?: string): string {
  const hash = patternCode ? encodeStrudelPatternHash(patternCode) : ''
  return `${strudelEmbedRoot(upstream.replace(/\/$/, ''))}${hash}`
}

/**
 * Absolute iframe URL for a running managed engine.
 * Never returns the Peal /strudel proxy path — Vite dev cannot be proxied through Next.
 */
/** Prefer localhost when the studio is on localhost — avoids some mixed-host quirks. */
export function normalizeStrudelUpstream(upstream: string): string {
  const trimmed = upstream.trim().replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return trimmed.replace('127.0.0.1', 'localhost')
  }
  return trimmed
}

export function resolveStrudelIframeUrl(
  engine: StrudelEngineLike | null,
  patternCode?: string,
): string | null {
  const running = engine?.phase === 'running' && engine.reachable
  if (!running) return null

  const upstream = normalizeStrudelUpstream(
    engine?.upstream?.trim() || STRUDEL_DEFAULT_UPSTREAM,
  )
  const session = engine?.state?.pid ? String(engine.state.pid) : ''
  const url = strudelReplUrlForUpstream(upstream, patternCode)
  return session ? appendStrudelCacheBust(url, session) : url
}

/** Absolute URL when an origin is known; otherwise same relative path as SSR. */
export function resolveStrudelReplUrl(patternCode?: string, origin?: string): string {
  const relative = strudelMountIndexPath(patternCode)
  if (!origin?.trim()) return relative
  if (relative.startsWith('http://') || relative.startsWith('https://')) return relative
  return `${origin.replace(/\/$/, '')}${relative}`
}

export const STRUDEL_PEER_MESSAGE = 'peal-strudel'

export type PealStrudelOutbound =
  | { type: typeof STRUDEL_PEER_MESSAGE; action: 'evaluate'; code: string }
  | { type: typeof STRUDEL_PEER_MESSAGE; action: 'route-and-play'; code: string }
  | { type: typeof STRUDEL_PEER_MESSAGE; action: 'stop' }
  | { type: typeof STRUDEL_PEER_MESSAGE; action: 'set-tempo'; cps: number }

export type PealStrudelInbound =
  | { type: typeof STRUDEL_PEER_MESSAGE; action: 'ready' }
  | { type: typeof STRUDEL_PEER_MESSAGE; action: 'evaluated'; ok: boolean; error?: string }
  | { type: typeof STRUDEL_PEER_MESSAGE; action: 'playing'; playing: boolean }

export type StrudelMountStatus = 'idle' | 'loading' | 'ready' | 'routed' | 'playing' | 'error'

export function isPealStrudelMessage(data: unknown): data is PealStrudelOutbound | PealStrudelInbound {
  return typeof data === 'object'
    && data !== null
    && (data as { type?: string }).type === STRUDEL_PEER_MESSAGE
    && typeof (data as { action?: string }).action === 'string'
}

export function strudelFrameTargetOrigin(iframe: HTMLIFrameElement | null): string {
  if (!iframe?.src) return '*'
  try {
    return new URL(iframe.src, typeof window !== 'undefined' ? window.location.href : undefined).origin
  } catch {
    return '*'
  }
}

export function postToStrudelFrame(
  iframe: HTMLIFrameElement | null,
  message: PealStrudelOutbound,
  targetOrigin?: string,
) {
  const origin = targetOrigin ?? strudelFrameTargetOrigin(iframe)
  iframe?.contentWindow?.postMessage(message, origin)
}

type StrudelMirrorPeer = {
  setCode: (code: string) => void
  evaluate: (autostart?: boolean) => Promise<void>
  toggle: () => Promise<void>
  repl?: { scheduler?: { started?: boolean } }
}

function strudelPlayButton(doc: Document): HTMLButtonElement | null {
  const play = doc.querySelector('button[title="play"]')
  if (play instanceof HTMLButtonElement) return play
  for (const button of doc.querySelectorAll('button')) {
    if (button.textContent?.trim().toLowerCase() === 'play') {
      return button
    }
  }
  return null
}

function strudelUpdateButton(doc: Document): HTMLButtonElement | null {
  const update = doc.querySelector('button[title="update"]')
  return update instanceof HTMLButtonElement ? update : null
}

function routeAndPlaySameOrigin(
  iframe: HTMLIFrameElement,
  code: string,
): boolean {
  const win = iframe.contentWindow as Window & { strudelMirror?: StrudelMirrorPeer }
  const doc = iframe.contentDocument
  if (!doc) return false

  const mirror = win.strudelMirror
  mirror?.setCode?.(code)

  const playButton = strudelPlayButton(doc)
  if (playButton) {
    playButton.click()
    return true
  }

  const updateButton = strudelUpdateButton(doc)
  if (updateButton && !updateButton.className.includes('opacity-50')) {
    updateButton.click()
    return true
  }

  if (mirror?.evaluate) {
    void mirror.evaluate(true)
    return true
  }

  return false
}

/**
 * Route pattern into the Strudel iframe and start playback.
 * Same-origin: clicks play inside the iframe (Web Audio gesture).
 * Cross-origin (direct upstream): postMessage route-and-play to peal-bridge.
 */
export function routeAndPlayInStrudelFrame(
  iframe: HTMLIFrameElement | null,
  code: string,
): boolean {
  if (!iframe?.contentWindow || !code.trim()) return false

  try {
    if (iframe.contentDocument) {
      return routeAndPlaySameOrigin(iframe, code)
    }
  } catch {
    // cross-origin — fall through to postMessage
  }

  postToStrudelFrame(iframe, {
    type: STRUDEL_PEER_MESSAGE,
    action: 'route-and-play',
    code,
  })
  return true
}

export function isStrudelMirrorReady(iframe: HTMLIFrameElement | null): boolean {
  if (!iframe?.contentWindow) return false
  try {
    return Boolean((iframe.contentWindow as Window & { strudelMirror?: StrudelMirrorPeer }).strudelMirror)
  } catch {
    return false
  }
}

/** @deprecated Prefer routeAndPlayInStrudelFrame from a user-gesture handler. */
export function evaluateInStrudelFrame(
  iframe: HTMLIFrameElement | null,
  code: string,
): boolean {
  return routeAndPlayInStrudelFrame(iframe, code)
}