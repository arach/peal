import type { Metadata } from 'next'
import StudioPageClient from '../StudioPageClient'

export const metadata: Metadata = {
  title: 'SFX Editor',
  description: 'Timeline, parameters and live Web Audio code for a single sound.',
}

export default function StudioEditorPage() {
  return <StudioPageClient />
}
