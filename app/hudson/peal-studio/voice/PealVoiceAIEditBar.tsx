'use client'

import { AiDesignIcon } from '@/components/icons/PealStudioIcon'
import { StudioPad } from '@/components/studio/StudioInstruments'
import { getVoiceEditSuggestions } from '@/lib/ai/voiceDesignExamples'
import { usePealVoice } from './PealVoiceProvider'
import { usePealVoiceAIContext } from './PealVoiceAIProvider'

export function PealVoiceAIEditBar() {
  const voice = usePealVoice()
  const { sendPrompt, isBusy, chat } = usePealVoiceAIContext()
  const clip = voice.selectedTake
  const suggestions = getVoiceEditSuggestions(clip)
  const streaming = chat.status === 'streaming' || chat.status === 'submitted'

  return (
    <div className="mb-3 rounded border border-[#4a9eff]/20 bg-[#4a9eff]/[0.04] p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="peal-inst-led peal-inst-led--on" aria-hidden />
          <AiDesignIcon size={12} className="text-[#4a9eff]" />
          <p className="peal-inst-rack-label !text-[#4a9eff]">AI edit</p>
        </div>
        {streaming ? (
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#4a9eff]/80">
            Applying…
          </span>
        ) : null}
      </div>
      <p className="mb-2 font-mono text-[9px] leading-relaxed text-gray-500">
        {clip
          ? `Describe how “${clip.label}” should sound — genres and strip tweaks apply live to this pad.`
          : 'Select a deck pad, then ask AI to load a genre or tweak the strip.'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((prompt) => (
          <StudioPad
            key={prompt}
            onClick={() => sendPrompt(prompt)}
            disabled={isBusy}
            className="!text-[9px] !normal-case !tracking-normal"
          >
            {prompt}
          </StudioPad>
        ))}
      </div>
    </div>
  )
}