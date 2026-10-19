import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design · Peal',
  description: 'Design studies and prototypes for Peal.',
}

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return children
}
