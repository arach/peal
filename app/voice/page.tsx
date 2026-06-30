import { redirect } from 'next/navigation'
import {
  studioHrefWithTool,
  type LegacyStudioSearchParams,
} from '@/app/hudson/peal-studio/routing'

interface VoicePageProps {
  searchParams?: Promise<LegacyStudioSearchParams>
}

export default async function VoicePage({ searchParams }: VoicePageProps) {
  // Legacy entry point: Hudson Studio owns tools at /studio; preserve sound/type deep links.
  redirect(studioHrefWithTool(await searchParams, 'voice'))
}
