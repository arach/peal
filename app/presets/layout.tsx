import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Presets',
  description: 'Curated UI sound presets — preview any sound, open it in Studio, or copy the synthesis parameters.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
