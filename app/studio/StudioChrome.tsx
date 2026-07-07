'use client'

import { useEffect } from 'react'
import PealChrome from '@/components/PealChrome'
import { useResolvedPealTheme } from '@/hooks/useResolvedPealTheme'

export default function StudioChrome({ children }: { children: React.ReactNode }) {
  const resolved = useResolvedPealTheme()

  useEffect(() => {
    document.documentElement.dataset.hudsonTemplate = 'hudson'
    return () => {
      delete document.documentElement.dataset.hudsonTemplate
    }
  }, [])

  return (
    <div className="peal-studio-chrome" data-peal-theme={resolved}>
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