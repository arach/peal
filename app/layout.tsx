import type { Metadata } from 'next'
import Script from 'next/script'
import { Figtree, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import '@/styles/peal-type.css'
import '@/styles/peal-nav.css'
import '@/styles/peal-context-bar.css'
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
  weight: ['300', '400', '500'],
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
        <Script
          id="peal-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('peal-sound-store');if(!s)return;var p=JSON.parse(s);var t=p.state&&p.state.theme;var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GSHDZPFRZG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GSHDZPFRZG');`}
        </Script>
      </body>
    </html>
  )
}