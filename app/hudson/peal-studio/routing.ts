export type PealStudioTool = 'sfx' | 'voice' | 'music'

export type LegacyStudioSearchParams = Record<string, string | string[] | undefined>

export const PEAL_STUDIO_TOOLS: PealStudioTool[] = ['sfx', 'voice', 'music']

/** Path segment for each tool. SFX lives at `/studio` (no segment). */
export function studioPathForTool(tool: PealStudioTool): string {
  if (tool === 'voice') return '/studio/voice'
  if (tool === 'music') return '/studio/music'
  return '/studio'
}

/** Parse tool from a path like `/studio`, `/studio/voice`, `/studio/music`. */
export function parsePealStudioToolFromPathname(pathname: string | null | undefined): PealStudioTool {
  if (!pathname) return 'sfx'
  // Strip optional basePath and trailing slashes for matching
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/studio/voice' || path.endsWith('/studio/voice')) return 'voice'
  if (path === '/studio/music' || path.endsWith('/studio/music')) return 'music'
  if (path === '/studio/sfx' || path.endsWith('/studio/sfx')) return 'sfx'
  return 'sfx'
}

/** Parse tool from a legacy `?tool=` query value. */
export function parsePealStudioTool(value: string | null | undefined): PealStudioTool {
  if (value === 'voice') return 'voice'
  if (value === 'music') return 'music'
  if (value === 'sfx') return 'sfx'
  return 'sfx'
}

/**
 * @deprecated Prefer path-based routes via `studioPathForTool`. Kept for any
 * residual query-param writers; new code should not set `tool`.
 */
export function applyPealStudioToolParam(params: URLSearchParams, tool: PealStudioTool) {
  params.delete('tool')
  void tool
}

export function cloneLegacyStudioSearchParams(searchParams?: LegacyStudioSearchParams | null) {
  const params = new URLSearchParams()

  if (!searchParams) return params

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
    } else {
      params.set(key, value)
    }
  }

  return params
}

/**
 * Build a studio URL for a tool, preserving non-tool query params
 * (e.g. `sound`, `type`) and always using path segments:
 * `/studio`, `/studio/voice`, `/studio/music`.
 */
export function studioHrefWithTool(
  searchParams: LegacyStudioSearchParams | URLSearchParams | string | null | undefined,
  tool: PealStudioTool,
) {
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams instanceof URLSearchParams
      ? new URLSearchParams(searchParams.toString())
      : cloneLegacyStudioSearchParams(searchParams)

  // Drop legacy query tool; path owns the selection now.
  params.delete('tool')

  const path = studioPathForTool(tool)
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

/**
 * If the URL still uses `?tool=voice|music|sfx`, return the path-based href
 * to redirect to; otherwise null.
 */
export function legacyToolQueryRedirectHref(
  pathname: string,
  searchParams: URLSearchParams | string | null | undefined,
): string | null {
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams instanceof URLSearchParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams()

  const raw = params.get('tool')
  if (raw == null) return null

  const tool = parsePealStudioTool(raw)
  params.delete('tool')

  const pathFromQuery = studioPathForTool(tool)
  // Already on the right path with only a redundant ?tool= — still strip it.
  const query = params.toString()
  const target = query ? `${pathFromQuery}?${query}` : pathFromQuery
  const currentQuery = typeof searchParams === 'string'
    ? searchParams
    : searchParams instanceof URLSearchParams
      ? searchParams.toString()
      : ''
  const current = currentQuery ? `${pathname}?${currentQuery}` : pathname
  return target === current ? null : target
}
