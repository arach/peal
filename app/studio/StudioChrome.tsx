'use client'

import { useLayoutEffect } from 'react'
import PealChrome from '@/components/PealChrome'

export default function StudioChrome({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.dataset.hudsonTheme = 'dark'
    document.documentElement.dataset.hudsonTemplate = 'hudson'
    return () => {
      document.documentElement.classList.remove('dark')
      delete document.documentElement.dataset.hudsonTheme
      delete document.documentElement.dataset.hudsonTemplate
    }
  }, [])

  return (
    <div className="peal-studio-chrome">
      <PealChrome layout="studio" />
      <div
        className="overflow-hidden"
        style={{ height: 'calc(100vh - var(--peal-chrome-height, 40px))' }}
      >
        {children}
      </div>
    </div>
  )
}