import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Signature Sounds',
  description: 'Craft your signature sound.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
