'use client'

import { Suspense } from 'react'
import PealStudioShell from '@/app/hudson/PealStudioShell'

export default function StudioPageClient() {
  return (
    <Suspense
      fallback={
        <div className="peal-studio-shell h-full flex items-center justify-center text-[var(--peal-surface-text-muted,#9ca3af)]">
          Loading Studio...
        </div>
      }
    >
      <PealStudioShell />
    </Suspense>
  )
}
