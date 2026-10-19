'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Sends old sets links to /studio, keeping ?stage=. Runs on the client so the
 * page survives static export (no searchParams at build time).
 */
export default function StudioStageRedirect() {
  const router = useRouter()

  useEffect(() => {
    const stage = new URLSearchParams(window.location.search).get('stage')
    router.replace(stage ? `/studio?stage=${encodeURIComponent(stage)}` : '/studio')
  }, [router])

  return null
}
