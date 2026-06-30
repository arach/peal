export type PealStudioTool = 'sfx' | 'voice'

export type LegacyStudioSearchParams = Record<string, string | string[] | undefined>

export const PEAL_STUDIO_TOOLS: PealStudioTool[] = ['sfx', 'voice']

export function parsePealStudioTool(value: string | null | undefined): PealStudioTool {
  return value === 'voice' ? 'voice' : 'sfx'
}

export function applyPealStudioToolParam(params: URLSearchParams, tool: PealStudioTool) {
  if (tool === 'sfx') {
    params.delete('tool')
  } else {
    params.set('tool', tool)
  }
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

export function studioHrefWithTool(
  searchParams: LegacyStudioSearchParams | URLSearchParams | string | null | undefined,
  tool: PealStudioTool,
) {
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams instanceof URLSearchParams
      ? new URLSearchParams(searchParams.toString())
      : cloneLegacyStudioSearchParams(searchParams)

  applyPealStudioToolParam(params, tool)

  const query = params.toString()
  return query ? `/studio?${query}` : '/studio'
}
