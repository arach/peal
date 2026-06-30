'use client'

import { useLayoutEffect } from 'react'
import PealNav from '@/components/PealNav'

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
    <>
      <PealNav />
      <div className="h-[calc(100vh-52px)] overflow-hidden">{children}</div>
    </>
  )
}