import { redirect } from 'next/navigation'

/** Sets grew into the SFX tool at /studio; keep old links (and ?stage=) working. */
export default async function StudioSetsRedirect({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { stage } = await searchParams
  redirect(typeof stage === 'string' ? `/studio?stage=${encodeURIComponent(stage)}` : '/studio')
}
