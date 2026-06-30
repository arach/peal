import { redirect } from 'next/navigation'
import { studioHrefWithTool } from '@/app/hudson/peal-studio/routing'

export const dynamic = 'force-static'

export default function VoicePage() {
  // Legacy entry point: Hudson Studio owns tools at /studio.
  redirect(studioHrefWithTool(null, 'voice'))
}
