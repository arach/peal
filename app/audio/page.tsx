"use client"

import { Suspense } from 'react'
import UnifiedStudio from '@/components/UnifiedStudio'

export default function AudioLabPage() {
  return (
    <main className="h-screen bg-gray-950 overflow-hidden">
      <Suspense fallback={<div className="h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading Audio Lab...</div>}>
        <UnifiedStudio initialTool="audio" />
      </Suspense>
    </main>
  )
}