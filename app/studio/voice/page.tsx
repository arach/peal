import type { Metadata } from 'next'
import StudioPageClient from '../StudioPageClient'

export const metadata: Metadata = {
  title: 'Voice Studio',
  description: 'Text-to-speech studio for spoken UI feedback.',
}

export default function StudioVoicePage() {
  return <StudioPageClient />
}
