"use client"

import { Suspense } from 'react'
import UnifiedStudio from '@/components/UnifiedStudio'

export default function VoicePage() {
  return (
    <main className="h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors">
      <Suspense fallback={<div className="h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors">Loading Voice Lab...</div>}>
        <UnifiedStudio initialTool="voice" />
      </Suspense>
    </main>
  )
}