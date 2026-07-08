'use client'

import { useResolvedPealTheme } from '@/hooks/useResolvedPealTheme'

interface PealAppShellProps {
  className?: string
  children: React.ReactNode
}

export default function PealAppShell({ className, children }: PealAppShellProps) {
  const resolved = useResolvedPealTheme()

  return (
    <div className={className} data-peal-theme={resolved}>
      {children}
    </div>
  )
}