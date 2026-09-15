'use client'

import { StudioRack } from '@/components/studio/StudioInstruments'
import { MESSAGE_BED_PRESETS } from '@/lib/deck/messageBeds'
import { usePealVoice } from './PealVoiceProvider'

export function PealMessageBeds() {
  const voice = usePealVoice()

  return (
    <StudioRack label="Message beds" className="mt-3 space-y-3 p-3">
      <p className="font-mono text-[9px] leading-relaxed text-gray-500">
        Bundled instrumental unders for Peal message types — import them onto the deck and pair a bed pad with a speech pad.
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
            <p className="line-clamp-2 font-mono text-[9px] leading-relaxed text-gray-400">
              {bed.suggestedSpeech}
            </p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void voice.importStarterMessageBeds()}
        disabled={voice.isGenerating}
        className="peal-inst-pad w-full py-2 text-[10px]"
      >
        Import starter beds
      </button>
    </StudioRack>
  )
}
