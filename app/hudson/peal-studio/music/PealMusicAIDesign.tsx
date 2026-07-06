'use client'

import {
  MUSIC_EDIT_EXAMPLE_PROMPTS,
  MUSIC_PATTERN_EXAMPLE_PROMPTS,
} from '@/lib/ai/musicPatternExamples'
import { usePealMusic } from './PealMusicProvider'
import { usePealMusicAIContext } from './PealMusicAIContext'
import { PealMusicAIChat, PealMusicAIComposer } from './PealMusicAIChat'

export function PealMusicAIDesign() {
  const music = usePealMusic()
  const { sendPrompt, isBusy, activity, chat, lastEdit } = usePealMusicAIContext()
  const hasPattern = music.patternCode.trim().length > 0

  const starterChips = lastEdit?.followUpSuggestions.length
    ? lastEdit.followUpSuggestions
    : hasPattern
      ? MUSIC_EDIT_EXAMPLE_PROMPTS.slice(0, 3)
      : MUSIC_PATTERN_EXAMPLE_PROMPTS.slice(0, 3)

  const chipLabel = lastEdit
    ? 'Suggested next'
    : hasPattern
      ? 'Try'
      : 'Start with'

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#111113] text-gray-200">
      <PealMusicAIChat
        placeholder="Describe a groove, mood, or edit — AI writes Strudel into the pattern editor."
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

      {lastEdit ? (
        <div className="shrink-0 border-t border-[#2c2c2e] px-3 py-2">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-gray-600">Last change</p>
          <p className="truncate font-mono text-[9px] text-gray-500">
            <span className="text-[#4a9eff]/80">{lastEdit.tool}</span>
            {' · '}
            {lastEdit.summary}
            {lastEdit.start.firstLayerHint ? ` · ${lastEdit.start.firstLayerHint}` : ''}
          </p>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-[#2c2c2e] px-3 py-2">
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-gray-600">{chipLabel}</p>
        <div className="flex flex-wrap gap-1.5">
          {starterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={isBusy}
              onClick={() => sendPrompt(chip)}
              className="rounded border border-[#2c2c2e] bg-[#1c1c1e]/60 px-2 py-1 font-mono text-[9px] text-gray-400 transition hover:border-[#4a9eff]/30 hover:text-gray-200 disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <PealMusicAIComposer placeholder="e.g. dusty lo-fi drums at 82 bpm" />
    </div>
  )
}