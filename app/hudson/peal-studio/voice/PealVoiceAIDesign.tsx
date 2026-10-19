'use client'

import {
  getVoiceEditSuggestions,
  VOICE_CAPTURE_EXAMPLE_PROMPTS,
} from '@/lib/ai/voiceDesignExamples'
import { usePealVoice } from './PealVoiceProvider'
import { usePealVoiceAIContext } from './PealVoiceAIProvider'
import { PealVoiceAIChat, PealVoiceAIComposer } from './PealVoiceAIChat'
import { PealVoiceAILastEdit } from './PealVoiceAILastEdit'
import {
  PealAIActivity,
  PealAIChips,
  PealAIHeader,
  PealAIPanel,
} from '../shared/PealAIPanel'

export function PealVoiceAIDesign() {
  const voice = usePealVoice()
  const { sendPrompt, isBusy, activity, chat, lastEdit } = usePealVoiceAIContext()
  const clip = voice.selectedTake
  const editSuggestions = getVoiceEditSuggestions(clip)
  const hasClips = voice.takes.length > 0
  const composerPlaceholder = hasClips
    ? 'Describe the mood, genre, or strip tweak…'
    : 'Once created: load a genre, tweak the strip…'

  const starterChips = hasClips
    ? (lastEdit?.followUpSuggestions.length
      ? lastEdit.followUpSuggestions
      : editSuggestions.slice(0, 3))
    : VOICE_CAPTURE_EXAMPLE_PROMPTS.slice(0, 3)

  const latest = activity[activity.length - 1]
  const working = latest && (chat.status === 'streaming' || chat.status === 'submitted')

  return (
    <PealAIPanel>
      <PealAIHeader
        title="AI Edit"
        hint={hasClips
          ? 'Tap last edit to see what changed. Strip and genre pills highlight on the mixer.'
          : 'Create a clip first, then shape it here through the mixer.'}
      />

      <PealVoiceAIChat
        placeholder={
          hasClips
            ? 'Ask AI to load a genre or tweak the strip — changes apply live to the selected pad.'
            : 'Create a clip, then describe how it should sound.'
        }
      />

      {working ? <PealAIActivity label="Working" tool={latest.tool} summary={latest.summary} /> : null}

      <PealVoiceAILastEdit />

      {clip ? <PealAIActivity label="Selected pad" summary={clip.label} /> : null}

      <PealAIChips
        label={lastEdit ? 'Suggested next' : hasClips ? 'Try' : 'Once created'}
        chips={starterChips}
        onPick={sendPrompt}
        disabled={isBusy}
      />

      <PealVoiceAIComposer placeholder={composerPlaceholder} />
    </PealAIPanel>
  )
}
