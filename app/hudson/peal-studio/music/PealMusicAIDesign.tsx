'use client'

import {
  MUSIC_EDIT_EXAMPLE_PROMPTS,
  MUSIC_PATTERN_EXAMPLE_PROMPTS,
} from '@/lib/ai/musicPatternExamples'
import { usePealMusic } from './PealMusicProvider'
import { usePealMusicAIContext } from './PealMusicAIContext'
import { PealMusicAIChat, PealMusicAIComposer } from './PealMusicAIChat'
import { PealMusicImprovLoopControls } from './PealMusicImprovLoop'

export function PealMusicAIDesign() {
  const music = usePealMusic()
  const {
    sendPrompt,
    isBusy,
    activity,
    chat,
    lastEdit,
    improvLoop,
    improvTick,
    improvWaiting,
    improvNextFireAt,
    improvCanRun,
    setImprovEnabled,
    setImprovIntervalSec,
    setImprovStyle,
  } = usePealMusicAIContext()
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

  const canUndoLastEdit = Boolean(
    lastEdit
    && lastEdit.patternBefore.trim() !== lastEdit.patternAfter.trim(),
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--peal-surface-0)] text-[var(--peal-surface-text)]">
      <PealMusicAIChat
        placeholder="Describe a groove, mood, or edit — AI writes Strudel into the pattern editor."
      />

      {activity.length > 0 && (chat.status === 'streaming' || chat.status === 'submitted') ? (
        <div className="shrink-0 border-t border-[var(--peal-surface-3)] px-3 py-2">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-gray-600">Working</p>
          <p className="truncate font-mono text-[9px] text-gray-500">
            <span className="text-[#4a9eff]/80">{activity[activity.length - 1]?.tool}</span>
            {' · '}
            {activity[activity.length - 1]?.summary}
          </p>
        </div>
      ) : null}

      {lastEdit ? (
        <div className="shrink-0 border-t border-[var(--peal-surface-3)] px-3 py-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-gray-600">Last change</p>
            {canUndoLastEdit ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => music.applyPatternSnapshot(lastEdit.patternBefore, {
                  label: 'Undo AI edit',
                  source: 'restore',
                  tool: lastEdit.tool,
                  summary: lastEdit.summary,
                  route: true,
                })}
                className="rounded border border-[var(--peal-surface-border)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gray-400 transition hover:border-[#4a9eff]/30 hover:text-[#4a9eff] disabled:opacity-40"
              >
                Roll back
              </button>
            ) : null}
          </div>
          <p className="truncate font-mono text-[9px] text-gray-500">
            <span className="text-[#4a9eff]/80">{lastEdit.tool}</span>
            {' · '}
            {lastEdit.summary}
            {lastEdit.routed && !lastEdit.isDirty ? ' · playing in Strudel' : ''}
            {lastEdit.start.firstLayerHint ? ` · ${lastEdit.start.firstLayerHint}` : ''}
          </p>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-[var(--peal-surface-3)] px-3 py-2">
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-gray-600">{chipLabel}</p>
        <div className="flex flex-wrap gap-1.5">
          {starterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={isBusy}
              onClick={() => sendPrompt(chip)}
              className="rounded border border-[var(--peal-surface-3)] bg-[var(--peal-surface-2)] px-2 py-1 font-mono text-[9px] text-gray-400 transition hover:border-[#4a9eff]/30 hover:text-[var(--peal-surface-text)] disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <PealMusicImprovLoopControls
        enabled={improvLoop.enabled}
        intervalSec={improvLoop.intervalSec}
        style={improvLoop.style}
        tick={improvTick}
        waiting={improvWaiting}
        nextFireAt={improvNextFireAt}
        canRun={improvCanRun}
        isBusy={isBusy}
        onEnabledChange={setImprovEnabled}
        onIntervalChange={setImprovIntervalSec}
        onStyleChange={setImprovStyle}
      />

      <PealMusicAIComposer placeholder="e.g. dusty lo-fi drums at 82 bpm" />
    </div>
  )
}