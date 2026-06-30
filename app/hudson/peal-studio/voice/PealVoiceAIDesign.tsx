'use client'

import { AiDesignIcon } from '@/components/icons/PealStudioIcon'
import {
  getVoiceEditSuggestions,
  VOICE_CAPTURE_EXAMPLE_PROMPTS,
} from '@/lib/ai/voiceDesignExamples'
import { usePealVoice } from './PealVoiceProvider'
import { usePealVoiceAIContext } from './PealVoiceAIProvider'
import { PealVoiceAIChat, PealVoiceAIComposer } from './PealVoiceAIChat'
import { PealVoiceAILastEdit } from './PealVoiceAILastEdit'

export function PealVoiceAIDesign() {
  const voice = usePealVoice()
  const { sendPrompt, isBusy, activity, chat, lastEdit } = usePealVoiceAIContext()
  const clip = voice.selectedTake
  const editSuggestions = getVoiceEditSuggestions(clip)
  const hasClips = voice.takes.length > 0
  const composerPlaceholder = hasClips
    ? 'Describe the mood, genre, or strip tweak…'
    : 'After capture: load a genre, tweak the strip…'

  const starterChips = hasClips
    ? (lastEdit?.followUpSuggestions.length
      ? lastEdit.followUpSuggestions
      : editSuggestions.slice(0, 3))
    : VOICE_CAPTURE_EXAMPLE_PROMPTS.slice(0, 3)

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#111113] text-gray-200">
      <div className="shrink-0 border-b border-[#2c2c2e] bg-[#0d0d0f] px-3 py-2.5 peal-instruments">
        <div className="flex items-center gap-2">
          <span className="peal-inst-led peal-inst-led--on" aria-hidden />
          <AiDesignIcon size={13} className="text-[#4a9eff]" />
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4a9eff]">
              AI Edit
            </p>
            <p className="mt-0.5 font-mono text-[9px] leading-relaxed text-gray-500">
              {hasClips
                ? 'Tap last edit to see what changed. Strip and genre pills highlight on the mixer.'
                : 'Capture a clip first, then return here to shape it through the mixer.'}
            </p>
          </div>
        </div>
      </div>

      <PealVoiceAIChat
        placeholder={
          hasClips
            ? 'Ask AI to load a genre or tweak the strip — changes apply live to the selected pad.'
            : 'Capture on the deck, then describe how clips should sound.'
        }
      />

      {activity.length > 0 && (chat.status === 'streaming' || chat.status === 'submitted') ? (
        <div className="shrink-0 border-t border-[#2c2c2e] px-3 py-2">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-gray-600">Working</p>
          <p className="truncate font-mono text-[9px] text-gray-500">
            <span className="text-[#4a9eff]/80">{activity[activity.length - 1]?.tool}</span>
            {' · '}
            {activity[activity.length - 1]?.summary}
          </p>
        </div>
      ) : null}

      <PealVoiceAILastEdit />

      {clip ? (
        <div className="shrink-0 border-t border-[#2c2c2e] bg-[#111113] px-3 py-2 peal-instruments">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-gray-600">Selected pad</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-gray-300">{clip.label}</p>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-[#2c2c2e] px-3 py-2 peal-instruments">
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-gray-500">
          {lastEdit ? 'Suggested next' : hasClips ? 'Try' : 'After capture'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {starterChips.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => sendPrompt(example)}
              disabled={isBusy}
              className="peal-inst-pad text-[9px] normal-case tracking-normal disabled:opacity-40"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <PealVoiceAIComposer placeholder={composerPlaceholder} />
    </div>
  )
}