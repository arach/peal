import type { Metadata } from 'next'
import 'hudsonkit/styles'
import StudioChrome from './StudioChrome'

export const metadata: Metadata = {
  title: 'Studio',
  description:
    'Design UI sounds with live Web Audio code, AI-assisted design, and parameter panels.',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StudioChrome>{children}</StudioChrome>
}