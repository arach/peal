import { Suspense } from 'react'
import 'hudsonkit/styles'
import PealStudioShell from '@/app/hudson/PealStudioShell'

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#111113] flex items-center justify-center text-gray-400">Loading Studio...</div>}>
      <PealStudioShell />
    </Suspense>
  )
}
