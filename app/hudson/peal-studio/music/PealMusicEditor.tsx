'use client'

import { PealMusicCodePanel } from './PealMusicCodePanel'
import { PealMusicEngineBar } from './PealMusicEngineBar'
import { usePealMusicEngine } from './PealMusicEngineProvider'
import { PealStrudelRepl } from './PealStrudelRepl'

/** Center workspace — editor (top) + Strudel REPL (bottom). */
export function PealMusicEditor() {
  const engine = usePealMusicEngine()

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#0d0d0f]">
      <PealMusicEngineBar
        engine={engine.status}
        engineBusy={engine.busy}
        engineError={engine.error}
        onStart={() => void engine.start()}
        onStop={() => void engine.stop()}
      />
      <div className="grid min-h-0 flex-1 grid-rows-2">
        <PealMusicCodePanel engineRunning={Boolean(engine.status?.reachable && engine.status.phase === 'running')} />
        <PealStrudelRepl engine={engine.status} showHeader />
      </div>
    </div>
  )
}