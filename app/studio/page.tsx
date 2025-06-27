import { Suspense } from 'react'
import Studio from '@/components/Studio'

export default function StudioPage() {
  return (
    <main className="h-screen bg-gray-950 overflow-hidden">
      <Suspense fallback={<div className="h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading Studio...</div>}>
        <Studio />
      </Suspense>
    </main>
  )
}