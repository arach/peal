import StudioStageRedirect from '@/components/StudioStageRedirect'

/** The prototype now lives in the studio shell; keep old links (and ?stage=) working. */
export default function SoundSetsPrototypePage() {
  return <StudioStageRedirect />
}
