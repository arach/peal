import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Styleguide',
  description: 'Peal design system reference.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
