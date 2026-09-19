import type { Metadata } from 'next'
import StudioPageClient from '../StudioPageClient'

export const metadata: Metadata = {
  title: 'Music Studio',
  description: 'Strudel live-coding studio for generative beats.',
}

export default function StudioMusicPage() {
  return <StudioPageClient />
}
