'use client'

import {
  CopyIcon,
  DownloadIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  WaveformIcon,
} from '@/components/icons/PealStudioIcon'
import { Waveform } from '@/components/waveform'
import { StudioPad, StudioPadTray, StudioRack } from '@/components/studio/StudioInstruments'
import { usePealVoice } from './PealVoiceProvider'
import { voiceFxLabel } from './voiceFx'

export function PealVoiceTakes() {
  const voice = usePealVoice()

  return (
    <div className="flex h-full min-h-0 flex-col peal-instruments bg-transparent p-3 text-gray-200">
      <StudioRack
        label="Takes"
        readout={voice.takes.length ? `${voice.takes.length}` : 'empty'}
        className="flex min-h-0 flex-1 flex-col"
      >
        {voice.takes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <WaveformIcon size={28} className="text-gray-600" />
            <p className="peal-inst-rack-label">No takes yet</p>
            <p className="max-w-[14rem] font-mono text-[10px] leading-relaxed text-gray-500">
              Generated speech appears here. Write a script in the center panel and hit Generate.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {voice.takes.map((take) => {
              const active = voice.selectedTakeId === take.id
              const playing = voice.currentlyPlayingId === take.id
              return (
                <div
                  key={take.id}
                  className={`peal-inst-take-row${active ? ' peal-inst-take-row--active' : ''}`}
                  onClick={() => voice.setSelectedTakeId(take.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      voice.setSelectedTakeId(take.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-[#4a9eff]">
                      {take.filename}
                    </p>
                    <StudioPadTray>
                      <StudioPad
                        title={playing ? 'Pause' : 'Play'}
                        onClick={(e) => {
                          e.stopPropagation()
                          voice.togglePlay(take.id)
                        }}
                        active={playing}
                        className="!min-h-[20px] !px-1.5"
                      >
                        {playing ? <PauseIcon size={10} /> : <PlayIcon size={10} />}
                      </StudioPad>
                      <StudioPad
                        title="Download"
                        onClick={(e) => {
                          e.stopPropagation()
                          voice.downloadTake(take)
                        }}
                        className="!min-h-[20px] !px-1.5"
                      >
                        <DownloadIcon size={10} />
                      </StudioPad>
                      <StudioPad
                        title="Copy filename"
                        onClick={(e) => {
                          e.stopPropagation()
                          voice.copyFilename(take.filename)
                        }}
                        className="!min-h-[20px] !px-1.5"
                      >
                        <CopyIcon size={10} />
                      </StudioPad>
                      <StudioPad
                        title="Delete"
                        tone="muted"
                        onClick={(e) => {
                          e.stopPropagation()
                          voice.deleteTake(take.id)
                        }}
                        className="!min-h-[20px] !px-1.5"
                      >
                        <TrashIcon size={10} />
                      </StudioPad>
                    </StudioPadTray>
                  </div>

                  <p className="mb-2 line-clamp-2 font-mono text-[10px] leading-relaxed text-gray-400">
                    {take.script ?? take.prompt ?? take.label}
                  </p>

                  <div className="mb-2 flex flex-wrap gap-x-2 font-mono text-[9px] uppercase tracking-wider text-gray-500">
                    <span className="text-[#4a9eff]/90">{take.source}</span>
                    <span className="opacity-40">·</span>
                    <span>{take.voice ?? take.model}</span>
                    <span className="opacity-40">·</span>
                    <span>{take.model}</span>
                    <span className="opacity-40">·</span>
                    <span>{take.speed}x</span>
                    <span className="opacity-40">·</span>
                    <span className="text-[#4a9eff]/80">{voiceFxLabel(take.fxPresetId)}</span>
                  </div>

                  <Waveform
                    isPlaying={playing}
                    audioUrl={take.audioUrl}
                    visualOnly
                    className="h-7"
                  />
                </div>
              )
            })}
          </div>
        )}
      </StudioRack>
    </div>
  )
}