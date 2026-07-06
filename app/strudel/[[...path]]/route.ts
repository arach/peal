import { type NextRequest, NextResponse } from 'next/server'
import {
  buildStrudelUpstreamUrl,
  STRUDEL_PROXY_MOUNT,
} from '@/lib/strudel/manage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PROXY_PREFIX = STRUDEL_PROXY_MOUNT

/** Rewrite HTML so root-absolute Vite/Astro assets resolve under /strudel/*. */
function rewriteStrudelHtml(html: string): string {
  let out = html.replace(
    /<base\s+href="[^"]*"\s*\/?>/gi,
    `<base href="${PROXY_PREFIX}/">`,
  )
  out = out.replace(
    /(\s(?:src|href)=["'])\/(?!\/|strudel\/)/gi,
    `$1${PROXY_PREFIX}/`,
  )
  out = out.replace(
    /(["'`])\/(?!\/|strudel\/)(@(?:vite|fs|id)|src\/|make-scrollable-code-focusable\.js)/g,
    `$1${PROXY_PREFIX}/$2`,
  )
  return out
}

async function proxyStrudel(request: NextRequest, pathSegments: string[] | undefined) {
  const subpath = pathSegments?.length ? pathSegments.join('/') : ''
  const incoming = new URL(request.url)
  const targetUrl = `${buildStrudelUpstreamUrl(subpath)}${incoming.search}`

  const headers = new Headers()
  for (const name of ['accept', 'accept-encoding', 'accept-language', 'range']) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  let upstreamResponse: Response
  try {
    upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      redirect: 'manual',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Strudel upstream unreachable (${targetUrl}): ${message}` },
      { status: 502 },
    )
  }

  const contentType = upstreamResponse.headers.get('content-type') ?? ''

  if (contentType.includes('text/html')) {
    const html = rewriteStrudelHtml(await upstreamResponse.text())
    return new NextResponse(html, {
      status: upstreamResponse.status,
      headers: {
        'content-type': contentType,
        'cache-control': 'no-store, no-cache, must-revalidate',
        pragma: 'no-cache',
      },
    })
  }

  const responseHeaders = new Headers()
  upstreamResponse.headers.forEach((value, key) => {
    if (key === 'transfer-encoding' || key === 'connection') return
    responseHeaders.set(key, value)
  })

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  })
}

type RouteContext = { params: Promise<{ path?: string[] }> }

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyStrudel(request, path)
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context)
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return handle(request, context)
}