import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Brand Sounds',
  description: 'Sound design inspiration from recognizable product brands.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
