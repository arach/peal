import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Quick start, CLI commands, and API reference for adding SFX sounds to your app.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
