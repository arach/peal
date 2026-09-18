import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'About',
  description: 'Peal is a lightweight sound effect library for web and desktop apps.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
