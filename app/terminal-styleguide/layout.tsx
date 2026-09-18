import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Terminal Styleguide',
  description: 'Peal terminal-chic style reference.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
