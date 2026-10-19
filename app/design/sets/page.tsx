import { redirect } from 'next/navigation'

/** The prototype now lives in the studio shell; keep old links (and ?stage=) working. */
export default async function SoundSetsPrototypePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { stage } = await searchParams
  redirect(typeof stage === 'string' ? `/studio?stage=${encodeURIComponent(stage)}` : '/studio')
}
