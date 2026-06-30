import { NextResponse } from 'next/server'
import { pealCredentialsStatus } from '@/lib/credentials'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(pealCredentialsStatus())
}