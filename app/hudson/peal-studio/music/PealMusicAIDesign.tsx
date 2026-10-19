'use client'

import {
  MUSIC_EDIT_EXAMPLE_PROMPTS,
  MUSIC_PATTERN_EXAMPLE_PROMPTS,
} from '@/lib/ai/musicPatternExamples'
import { usePealMusic } from './PealMusicProvider'
import { usePealMusicAIContext } from './PealMusicAIContext'
import { PealMusicAIChat, PealMusicAIComposer } from './PealMusicAIChat'
import { PealMusicImprovLoopControls } from './PealMusicImprovLoop'
import { PealAIActivity, PealAIChips, PealAIPanel } from '../shared/PealAIPanel'

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

  const latest = activity[activity.length - 1]
  const working = latest && (chat.status === 'streaming' || chat.status === 'submitted')

  return (
    <PealAIPanel>
      <PealMusicAIChat
        placeholder="Describe a groove, mood, or edit — AI writes Strudel into the pattern editor."
      />

      {working ? <PealAIActivity label="Working" tool={latest.tool} summary={latest.summary} /> : null}

      {lastEdit ? (
        <PealAIActivity
          label="Last change"
          tool={lastEdit.tool}
          summary={[
            lastEdit.summary,
            lastEdit.routed && !lastEdit.isDirty ? 'playing in Strudel' : '',
            lastEdit.start.firstLayerHint ?? '',
          ].filter(Boolean).join(' · ')}
          action={canUndoLastEdit ? (
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
              className="peal-ai-text-btn"
            >
              Roll back
            </button>
          ) : undefined}
        />
      ) : null}

      <PealAIChips label={chipLabel} chips={starterChips} onPick={sendPrompt} disabled={isBusy} />

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
    </PealAIPanel>
  )
}