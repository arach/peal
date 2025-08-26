import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'

// Load fonts but only use CSS variables
const figtree = Figtree({ 
  subsets: ['latin'],
  variable: '--font-figtree'
})

export const metadata: Metadata = {
  title: 'Peal - Tech Sound Designer',
  description: 'Create unique tech-oriented notification sounds with visual feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="bg-background dark:bg-gray-950 text-text-primary dark:text-gray-100 transition-colors">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}