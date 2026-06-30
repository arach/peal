import { NextResponse } from 'next/server'
import { pealCredentialsStatus } from '@/lib/credentials'

export async function GET() {
  return NextResponse.json(pealCredentialsStatus())
}