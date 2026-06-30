'use client'

import { PauseIcon, PlayIcon } from '@/components/icons/PealStudioIcon'
import { usePealVoice } from './PealVoiceProvider'
import { usePealVoiceAIContext } from './PealVoiceAIProvider'
import { summarizeAppliedEdit } from './voiceAiEditDiff'
import { voiceFxLabel } from './voiceFx'

export function PealVoiceAILastEdit() {
  const voice = usePealVoice()
  const {
    lastEdit,
    lastEditExpanded,
    compareSide,
    toggleLastEdit,
    dismissLastEdit,
    previewEditCompare,
    sendPrompt,
    isBusy,
  } = usePealVoiceAIContext()

  if (!lastEdit) return null

  const clip = voice.selectedTake
  const playing = clip != null && voice.currentlyPlayingId === clip.id
  const changeCount = lastEdit.knobChanges.length + (lastEdit.genreChanged ? 1 : 0)
  const appliedSummary = summarizeAppliedEdit(lastEdit)

  return (
    <div
      className={`shrink-0 border-t peal-instruments transition-colors ${
        lastEditExpanded
          ? 'border-[#4a9eff]/40 bg-[#4a9eff]/[0.06]'
          : 'border-[#2c2c2e] bg-[#0d0d0f]'
      }`}
    >
      <button
        type="button"
        onClick={toggleLastEdit}
        className="w-full p-3 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#4a9eff]">
              <span className={`peal-inst-led ${lastEditExpanded ? 'peal-inst-led--on' : ''}`} aria-hidden />
              Last AI edit
              <span className="text-gray-600">
                {lastEditExpanded ? '▾' : '▸'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-100">{lastEdit.summary}</p>
            {appliedSummary ? (
              <p className="mt-1 line-clamp-2 font-mono text-[10px] leading-relaxed text-[#4a9eff]/85">
                {appliedSummary}
              </p>
            ) : null}
            <p className="mt-1 font-mono text-[10px] text-gray-500">
              {changeCount} strip change{changeCount === 1 ? '' : 's'}
              {lastEdit.appliedParams.length > 0
                ? ` · ${lastEdit.appliedParams.length} param${lastEdit.appliedParams.length === 1 ? '' : 's'} applied`
                : ''}
              {lastEdit.clipLabel ? ` · ${lastEdit.clipLabel}` : ''}
            </p>
          </div>
          {clip ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (playing) {
                  voice.stopPlayback()
                  return
                }
                previewEditCompare(compareSide)
              }}
              className="peal-inst-pad peal-inst-pad--active shrink-0 !px-2.5"
              title={playing ? 'Pause' : `Preview ${compareSide}`}
            >
              {playing ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
            </button>
          ) : null}
        </div>
      </button>

      {lastEditExpanded ? (
        <div className="space-y-3 border-t border-[#4a9eff]/20 px-3 pb-3">
          {lastEdit.appliedParams.length > 0 || lastEdit.appliedGenreId !== undefined ? (
            <div className="peal-voice-ai-applied">
              <p className="peal-voice-ai-diff-label">Params applied</p>
              <div className="flex flex-wrap gap-1.5">
                {lastEdit.appliedGenreId !== undefined ? (
                  <span className="peal-voice-ai-applied-chip peal-voice-ai-applied-chip--genre">
                    Genre {voiceFxLabel(lastEdit.appliedGenreId)}
                  </span>
                ) : null}
                {lastEdit.appliedParams.map((entry) => (
                  <span key={entry.key} className="peal-voice-ai-applied-chip">
                    {entry.label} {entry.value}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="peal-voice-ai-compare">
            <button
              type="button"
              onClick={() => previewEditCompare('before')}
              className={`peal-voice-ai-compare-btn peal-voice-ai-compare-btn--before${compareSide === 'before' ? ' peal-voice-ai-compare-btn--active' : ''}`}
            >
              <span className="peal-voice-ai-compare-label">Before</span>
              <span className="peal-voice-ai-compare-value">{voiceFxLabel(lastEdit.genreIdBefore)}</span>
              {lastEdit.knobChanges.length > 0 ? (
                <span className="peal-voice-ai-compare-meta">
                  {lastEdit.knobChanges.length} strip value{lastEdit.knobChanges.length === 1 ? '' : 's'}
                </span>
              ) : null}
            </button>
            <span className="peal-voice-ai-compare-vs" aria-hidden>vs</span>
            <button
              type="button"
              onClick={() => previewEditCompare('after')}
              className={`peal-voice-ai-compare-btn peal-voice-ai-compare-btn--after${compareSide === 'after' ? ' peal-voice-ai-compare-btn--active' : ''}`}
            >
              <span className="peal-voice-ai-compare-label">After</span>
              <span className="peal-voice-ai-compare-value">{voiceFxLabel(lastEdit.genreIdAfter)}</span>
              {lastEdit.knobChanges.length > 0 ? (
                <span className="peal-voice-ai-compare-meta">
                  {lastEdit.knobChanges.length} strip value{lastEdit.knobChanges.length === 1 ? '' : 's'}
                </span>
              ) : null}
            </button>
          </div>

          <div className="peal-voice-ai-diff">
            <p className="peal-voice-ai-diff-label">Strip diff</p>
            <div className="space-y-1">
              {lastEdit.genreChanged ? (
                <div className="peal-voice-ai-diff-row peal-voice-ai-diff-row--highlight">
                  <span className="peal-voice-ai-diff-key">Genre</span>
                  <button
                    type="button"
                    onClick={() => previewEditCompare('before')}
                    className={`peal-voice-ai-diff-btn peal-voice-ai-diff-btn--before${compareSide === 'before' ? ' peal-voice-ai-diff-btn--active' : ''}`}
                  >
                    {voiceFxLabel(lastEdit.genreIdBefore)}
                  </button>
                  <span className="peal-voice-ai-diff-arrow" aria-hidden>→</span>
                  <button
                    type="button"
                    onClick={() => previewEditCompare('after')}
                    className={`peal-voice-ai-diff-btn peal-voice-ai-diff-btn--after${compareSide === 'after' ? ' peal-voice-ai-diff-btn--active' : ''}`}
                  >
                    {voiceFxLabel(lastEdit.genreIdAfter)}
                  </button>
                </div>
              ) : null}
              {lastEdit.knobChanges.map((change) => (
                <div key={change.key} className="peal-voice-ai-diff-row">
                  <span className="peal-voice-ai-diff-key">{change.label}</span>
                  <button
                    type="button"
                    onClick={() => previewEditCompare('before')}
                    className={`peal-voice-ai-diff-btn peal-voice-ai-diff-btn--before${compareSide === 'before' ? ' peal-voice-ai-diff-btn--active' : ''}`}
                  >
                    {change.before}
                  </button>
                  <span className="peal-voice-ai-diff-arrow" aria-hidden>→</span>
                  <button
                    type="button"
                    onClick={() => previewEditCompare('after')}
                    className={`peal-voice-ai-diff-btn peal-voice-ai-diff-btn--after${compareSide === 'after' ? ' peal-voice-ai-diff-btn--active' : ''}`}
                  >
                    {change.after}
                  </button>
                </div>
              ))}
              {changeCount === 0 ? (
                <p className="font-mono text-[10px] text-gray-500">No strip value changes recorded.</p>
              ) : null}
            </div>
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-gray-600">
              Tap Before or After to audition — mixer strip follows the active side.
            </p>
          </div>

          {lastEdit.followUpSuggestions.length > 0 ? (
            <div>
              <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#4a9eff]/90">
                Next
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lastEdit.followUpSuggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendPrompt(prompt)}
                    disabled={isBusy}
                    className="peal-inst-pad text-[9px] normal-case tracking-normal disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={dismissLastEdit}
            className="peal-inst-pad w-full py-1.5 text-[9px]"
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  )
}