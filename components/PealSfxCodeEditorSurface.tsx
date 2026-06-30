'use client'

import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  GitBranchIcon,
  RefreshIcon,
  WarningIcon,
} from '@/components/icons/PealStudioIcon'
import { CodeEditor as HudsonCodeEditor } from 'hudsonkit/controls'
import type { Sound } from '@/store/soundStore'
import {
  usePealSfxCodeEditor,
  type PealSfxCodeEditorTrack,
} from './usePealSfxCodeEditor'

interface PealSfxCodeEditorSurfaceProps {
  currentSound: Sound | null
  tracks?: PealSfxCodeEditorTrack[]
  onSoundChange?: (sound: Sound) => void | Promise<void>
  className?: string
}

export default function PealSfxCodeEditorSurface({
  currentSound,
  tracks = [],
  onSoundChange,
  className = '',
}: PealSfxCodeEditorSurfaceProps) {
  const editor = usePealSfxCodeEditor({
    currentSound,
    tracks,
    onSoundChange,
  })

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden bg-[#0a0f12] text-gray-200 ${className}`}>
      <div className="shrink-0 border-b border-white/10 bg-[#0d1317] px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#4a9eff]/25 bg-[#4a9eff]/10 text-[#4a9eff]">
              <CodeIcon size={14} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[#4a9eff]">
                Web Audio
              </div>
              <div className="truncate text-[11px] text-gray-400">
                {currentSound
                  ? `${currentSound.frequency}Hz · ${currentSound.duration}ms · ${tracks.length} track${tracks.length === 1 ? '' : 's'}`
                  : 'Load or generate a sound to edit code'}
              </div>
            </div>
          </div>

          {currentSound ? (
            <div className="flex shrink-0 items-center gap-1">
              {editor.studioHasChanged ? (
                <button
                  type="button"
                  onClick={editor.mergeWithStudioChanges}
                  className="peal-inst-tool-pad text-amber-300"
                  title="Studio parameters changed; reconcile code"
                >
                  <WarningIcon size={13} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => editor.setShowVersionControl(!editor.showVersionControl)}
                className={`peal-inst-tool-pad${editor.showVersionControl ? ' peal-inst-tool-pad--active' : ''}`}
                title={`Version history (${editor.versions.length})`}
              >
                <GitBranchIcon size={13} />
              </button>
              <button
                type="button"
                onClick={editor.refreshFromStudio}
                className="peal-inst-tool-pad"
                title="Sync with Studio state"
              >
                <RefreshIcon size={13} className={editor.isRefreshing ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                onClick={editor.copyToClipboard}
                className="peal-inst-tool-pad"
                title="Copy code"
              >
                {editor.copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
              </button>
              <button
                type="button"
                onClick={() => editor.applyCode()}
                disabled={editor.isApplying}
                className="peal-inst-tool-pad peal-inst-tool-pad--active inline-flex gap-1 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] disabled:cursor-wait disabled:opacity-50"
                title="Apply code changes to Studio (Cmd+S)"
              >
                <CheckIcon size={12} />
                Apply
              </button>
            </div>
          ) : null}
        </div>

        {(editor.hasUnsavedChanges || editor.error) && currentSound ? (
          <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
            {editor.hasUnsavedChanges ? <span className="text-amber-300">Modified · Cmd+S applies to Studio</span> : null}
            {editor.error ? <span className="text-red-300">{editor.error}</span> : null}
          </div>
        ) : null}
      </div>

      {editor.showVersionControl && editor.versions.length > 0 ? (
        <div className="max-h-44 shrink-0 overflow-y-auto border-b border-white/10 bg-white/[0.03] p-2">
          <div className="space-y-1">
            {editor.versions.map((version, index) => (
              <button
                key={`${version.timestamp}-${index}`}
                type="button"
                onClick={() => void editor.switchToVersion(index)}
                className={`flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left transition-colors ${
                  index === editor.currentVersionIndex ? 'bg-[#4a9eff]/12' : 'hover:bg-white/5'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${version.source === 'user' ? 'bg-[#4a9eff]' : 'bg-emerald-400'}`} />
                  <span className="truncate text-[11px] text-gray-300">
                    {version.description || `${version.source} change`}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-gray-500">
                  {new Date(version.timestamp).toLocaleTimeString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1">
        {currentSound ? (
          <HudsonCodeEditor
            code={editor.editorValue}
            language="javascript"
            filename={editor.filename}
            onChange={editor.handleEditorChange}
            onSave={editor.applyCode}
            showLineNumbers
            className="h-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div className="max-w-xs space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4a9eff]">
                Code editor
              </div>
              <p className="text-sm leading-6 text-gray-400">
                Load a library sound or design a new sound to see the live Web Audio API implementation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
