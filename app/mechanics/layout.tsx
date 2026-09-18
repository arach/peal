import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'UI Mechanics',
  description: 'Interaction sound patterns for real UI mechanics.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
