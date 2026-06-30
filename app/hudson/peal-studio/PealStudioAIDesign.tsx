'use client'

import { AI } from 'hudsonkit'
import type { Sound } from '@/store/soundStore'
import type { ProposeSoundInput } from '@/lib/ai/soundProposal'
import { usePealStudioHudson } from './Provider'
import { usePealStudioAI } from './usePealStudioAI'
import { STUDIO_EXAMPLE_PROMPTS } from '@/lib/ai/soundDesignExamples'

export interface PealStudioAIDesignProps {
  currentSound: Sound | null
  onProposeSound: (input: ProposeSoundInput) => Promise<Sound | null>
  onLoadSound: (sound: Sound) => void
  onPlaySound: (sound: Sound) => void | Promise<void>
  onAddAsTrack: (sound: Sound) => void | Promise<void>
  onOpenLibrary: () => void
}

export function PealStudioAIDesign({
  currentSound,
  onProposeSound,
  onLoadSound,
  onPlaySound,
  onAddAsTrack,
  onOpenLibrary,
}: PealStudioAIDesignProps) {
  const { sfxSummary } = usePealStudioHudson()
  const { chat, lastProposal, clearProposal } = usePealStudioAI({
    sfxSummary,
    onProposeSound,
    onOpenLibrary,
  })

  const sendExample = (text: string) => {
    if (chat.status === 'streaming' || chat.status === 'submitted') return
    chat.sendMessage({ text })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#111113] text-gray-200">
      <div className="flex-1 min-h-0 overflow-hidden [&_.flex-col.h-full]:text-[11px]">
        <AI
          chat={chat}
          placeholder="Describe a UI sound — the designer will propose parameters you can load into the studio."
        />
      </div>

      {lastProposal && (
        <div className="shrink-0 border-t border-[#2c2c2e] bg-[#0d0d0f] p-3 space-y-2 peal-instruments">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#4a9eff]">
                <span className="peal-inst-led peal-inst-led--on" aria-hidden />
                Proposed sound
              </div>
              <div className="text-sm text-gray-100">{lastProposal.input.summary}</div>
              <div className="text-[11px] text-gray-500">
                {lastProposal.sound.type} · {lastProposal.sound.duration}ms · {lastProposal.sound.frequency}Hz
              </div>
              {lastProposal.input.notes ? (
                <div className="text-[11px] text-gray-400 mt-1">{lastProposal.input.notes}</div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onPlaySound(lastProposal.sound)}
              className="peal-inst-pad peal-inst-pad--active"
            >
              Test
            </button>
          </div>

          {currentSound ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAddAsTrack(lastProposal.sound)}
                className="peal-inst-pad peal-inst-pad--active flex-1 py-2 text-[10px]"
              >
                Add as Track
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Replace the current sound with this proposal?')) {
                    onLoadSound(lastProposal.sound)
                    clearProposal()
                  }
                }}
                className="peal-inst-pad py-2 text-[10px]"
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onLoadSound(lastProposal.sound)
                clearProposal()
              }}
              className="peal-inst-pad peal-inst-pad--active w-full py-2 text-[10px]"
            >
              Load to Studio
            </button>
          )}
        </div>
      )}

      {chat.messages.length === 0 && !lastProposal && (
        <div className="shrink-0 border-t border-[#2c2c2e] p-3 space-y-2 peal-instruments">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-gray-500">Patch presets</p>
          <div className="flex flex-wrap gap-1.5">
            {STUDIO_EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => sendExample(example)}
                className="peal-inst-pad text-[9px] normal-case tracking-normal"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}