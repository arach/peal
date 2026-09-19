import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Premium Sounds',
  description: 'Premium-quality UI sound effects.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
