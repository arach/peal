import { NextResponse } from 'next/server'
import { BYOK_MODELS, BYOK_PROVIDER_IDS, type ByokProvider } from '@/lib/byok'

export const dynamic = 'force-static'

/**
 * Model catalog for the BYOK dialog — a curated shortlist per provider. The
 * pi-ai registry is huge (hundreds of models), so we suggest a handful; the
 * field is free-text and any registry id still works when typed.
 */
export async function GET() {
  const out: Partial<Record<ByokProvider, { id: string }[]>> = {}
  for (const id of BYOK_PROVIDER_IDS) {
    out[id] = BYOK_MODELS[id].map((model) => ({ id: model }))
  }
  return NextResponse.json(out)
}
