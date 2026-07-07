'use client'

import { useEffect, useMemo, useRef } from 'react'
import { resolveStrudelIframeUrl } from '@/lib/strudel/mount'
import { usePealMusic } from './PealMusicProvider'
import type { StrudelManageStatusResponse } from './useStrudelManage'

interface PealStrudelReplProps {
  engine: StrudelManageStatusResponse | null
  showHeader?: boolean
}

export function PealStrudelRepl({ engine, showHeader = false }: PealStrudelReplProps) {
  const {
    lastRoutedCode,
    patternCode,
    patternReady,
    routeGeneration,
    registerStrudelFrame,
    markStrudelMirrorReady,
  } = usePealMusic()

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const lastRouteGen = useRef(0)

  const running = engine?.phase === 'running' && engine.reachable
  const codeForRepl = (lastRoutedCode || patternCode).trim()

  const enginePid = engine?.state?.pid ? String(engine.state.pid) : ''

  const replSrc = useMemo(
    () => resolveStrudelIframeUrl(engine, codeForRepl || undefined),
    [engine, codeForRepl],
  )

  useEffect(() => {
    registerStrudelFrame(iframeRef.current)
    return () => registerStrudelFrame(null)
  }, [registerStrudelFrame, replSrc])

  useEffect(() => {
    if (!running || routeGeneration === 0 || !replSrc) return
    if (routeGeneration === lastRouteGen.current) return
    lastRouteGen.current = routeGeneration
    const iframe = iframeRef.current
    if (!iframe || !lastRoutedCode.trim()) return
    const nextSrc = resolveStrudelIframeUrl(engine, lastRoutedCode.trim())
    if (nextSrc) iframe.src = nextSrc
  }, [routeGeneration, lastRoutedCode, running, engine, replSrc])

  const handleLoad = () => {
    registerStrudelFrame(iframeRef.current)
    markStrudelMirrorReady()
  }

  return (
    <div className="peal-strudel-repl flex h-full min-h-0 flex-col overflow-hidden bg-[var(--peal-surface-1)]">
      {showHeader ? (
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--peal-surface-border)] px-3 py-1.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4a9eff]">
            Strudel REPL
          </p>
          <p className="truncate font-mono text-[9px] text-gray-600" title={replSrc ?? undefined}>
            {running && replSrc ? replSrc.replace(/\?.*$/, '') : 'start engine to connect'}
          </p>
        </div>
      ) : null}
      {running && replSrc ? (
        patternReady ? (
          <iframe
            key={enginePid || 'strudel'}
            ref={iframeRef}
            title="Strudel REPL"
            src={replSrc}
            onLoad={handleLoad}
            className="peal-strudel-repl-frame h-full min-h-0 w-full border-0 bg-[var(--peal-surface-1)]"
            allow="midi; microphone; autoplay"
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">
              Strudel REPL
            </p>
            <p className="max-w-sm text-[11px] leading-relaxed text-gray-500">
              Loading editor…
            </p>
          </div>
        )
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">
            Strudel REPL
          </p>
          <p className="max-w-sm text-[11px] leading-relaxed text-gray-500">
            Start the Strudel engine in Transport (left) or the bar above, then Route your pattern.
          </p>
        </div>
      )}
    </div>
  )
}