import type { Metadata } from 'next'
import { Figtree, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import '@/styles/peal-nav.css'
import ThemeProvider from '@/components/ThemeProvider'

const figtree = Figtree({ 
  subsets: ['latin'],
  variable: '--font-figtree'
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-space-grotesk',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
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
    <html lang="en" suppressHydrationWarning className={`${figtree.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background dark:bg-gray-950 text-text-primary dark:text-gray-100 transition-colors">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}