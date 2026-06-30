import { redirect } from 'next/navigation'
import {
  studioHrefWithTool,
  type LegacyStudioSearchParams,
} from '@/app/hudson/peal-studio/routing'

interface AudioLabPageProps {
  searchParams?: Promise<LegacyStudioSearchParams>
}

export default async function AudioLabPage({ searchParams }: AudioLabPageProps) {
  // Legacy entry point: Hudson Studio owns tools at /studio; preserve sound/type deep links.
  redirect(studioHrefWithTool(await searchParams, 'sfx'))
}
