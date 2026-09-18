import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Keyboard Sounds',
  description: 'Compare keyboard sound profiles side by side.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
