import { NextResponse } from 'next/server'
import {
  getStrudelStatus,
  installStrudel,
  setStrudelCheckoutPath,
  startStrudel,
  stopStrudel,
} from '@/lib/strudel/manage'

export const dynamic = 'force-dynamic'

function devOnly() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Strudel process management is only available in development.' },
      { status: 403 },
    )
  }
  return null
}

export async function GET() {
  const blocked = devOnly()
  if (blocked) return blocked
  return NextResponse.json(await getStrudelStatus())
}

export async function POST(request: Request) {
  const blocked = devOnly()
  if (blocked) return blocked

  const body = await request.json().catch(() => ({})) as {
    action?: string
    path?: string
    port?: number
  }

  try {
    switch (body.action) {
      case 'install': {
        const config = await installStrudel(body.path)
        return NextResponse.json({ ok: true, config, status: await getStrudelStatus() })
      }
      case 'start': {
        const status = await startStrudel()
        return NextResponse.json({ ok: status.phase === 'running', status })
      }
      case 'stop': {
        const status = await stopStrudel()
        return NextResponse.json({ ok: true, status })
      }
      case 'set-path': {
        if (!body.path?.trim()) {
          return NextResponse.json({ error: 'path is required' }, { status: 400 })
        }
        const config = await setStrudelCheckoutPath(body.path.trim())
        return NextResponse.json({ ok: true, config, status: await getStrudelStatus() })
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}