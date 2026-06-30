'use client'

import { StudioPad, StudioRack } from '@/components/studio/StudioInstruments'
import { MESSAGE_BED_PRESETS, type MessageBedId } from '@/lib/deck/messageBeds'
import { usePealVoice } from './PealVoiceProvider'

export function PealMessageBeds() {
  const voice = usePealVoice()

  const applyBed = (id: MessageBedId, capture = false) => {
    const preset = MESSAGE_BED_PRESETS.find((b) => b.id === id)
    if (!preset) return
    voice.setCaptureSource('music')
    voice.setMusicPrompt(preset.musicPrompt)
    voice.setScript(preset.suggestedSpeech)
    if (preset.suggestedFxPresetId) voice.setDefaultFxPresetId(preset.suggestedFxPresetId)
    if (capture) void voice.generateMusic(preset.musicPrompt)
  }

  const pairReady = (id: MessageBedId) => voice.hasMessagePair(id)

  return (
    <StudioRack label="Message beds" className="mt-3 space-y-3 p-3">
      <p className="font-mono text-[9px] leading-relaxed text-gray-500">
        Instrumental unders for Peal message types — pair a bed pad with a speech pad on the deck.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {MESSAGE_BED_PRESETS.map((bed) => (
          <div
            key={bed.id}
            className="rounded border border-[var(--inst-line-lo)] bg-black/20 p-2.5"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-semibold text-[#4a9eff]">{bed.label}</span>
              <span className="font-mono text-[8px] uppercase tracking-wider text-gray-500">{bed.pealSound}</span>
            </div>
            <p className="mb-2 line-clamp-2 font-mono text-[9px] leading-relaxed text-gray-400">
              {bed.suggestedSpeech}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <StudioPad
                className="!text-[9px]"
                onClick={() => applyBed(bed.id, false)}
              >
                Use prompt
              </StudioPad>
              <StudioPad
                className="!text-[9px] peal-inst-pad--active"
                active={voice.isGenerating}
                onClick={() => applyBed(bed.id, true)}
                disabled={voice.isGenerating || !voice.musicProviderReady}
              >
                Capture bed
              </StudioPad>
              <StudioPad
                className="!text-[9px] peal-inst-pad--active"
                active={voice.isGenerating}
                onClick={() => void voice.captureMessagePair(bed.id)}
                disabled={
                  voice.isGenerating
                  || !voice.musicProviderReady
                  || !voice.activeProviderReady
                }
              >
                Capture pair
              </StudioPad>
              <StudioPad
                className="!text-[9px]"
                onClick={() => voice.previewMessagePair(bed.id)}
                disabled={!pairReady(bed.id) || voice.isGenerating}
              >
                Preview pair
              </StudioPad>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void voice.importStarterMessageBeds()}
        disabled={voice.isGenerating}
        className="peal-inst-pad w-full py-2 text-[10px]"
      >
        Import starter beds (if seeded)
      </button>
    </StudioRack>
  )
}