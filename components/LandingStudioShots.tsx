'use client'

import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  Maximize2,
  Mic,
  Minimize2,
  Music,
  Sparkles,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export type StudioView = {
  id: string
  label: string
  hint: string
  href: string
  image: string
  openLabel: string
}

type LandingStudioShotsProps = {
  views: readonly StudioView[]
}

function StudioIcon({ id }: { id: string }) {
  if (id === 'voice') return <Mic size={16} />
  if (id === 'music') return <Music size={16} />
  return <Code2 size={16} />
}

type ViewerSize = 'card' | 'stage'

export default function LandingStudioShots({ views }: LandingStudioShotsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewerSize, setViewerSize] = useState<ViewerSize>('card')

  const closeViewer = () => {
    setActiveId(null)
    setViewerSize('card')
  }

  const openViewer = (id: string) => {
    setActiveId(id)
    setViewerSize('card')
  }

  const activeIndex = activeId ? views.findIndex((view) => view.id === activeId) : -1
  const activeView = activeIndex >= 0 ? views[activeIndex] : null
  const prevView = activeIndex > 0 ? views[activeIndex - 1] : null
  const nextView = activeIndex >= 0 && activeIndex < views.length - 1 ? views[activeIndex + 1] : null

  useEffect(() => {
    if (!activeId) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (viewerSize === 'stage') {
          setViewerSize('card')
          return
        }
        closeViewer()
      }
      if (event.key === 'ArrowLeft' && prevView) openViewer(prevView.id)
      if (event.key === 'ArrowRight' && nextView) openViewer(nextView.id)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [activeId, prevView, nextView, viewerSize])

  return (
    <>
      <div className="landing-studio-shots" aria-label="Studio views">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            className="landing-studio-shot"
            onClick={() => openViewer(view.id)}
            aria-label={`Expand ${view.label} studio screenshot`}
          >
            <div className="landing-studio-shot-frame">
              <img
                src={view.image}
                alt={`Peal ${view.label} studio`}
                loading="lazy"
                decoding="async"
              />
              <span className="landing-studio-shot-expand" aria-hidden>
                <Maximize2 size={12} />
              </span>
            </div>
            <div className="landing-studio-shot-meta">
              <span className="landing-studio-shot-label">{view.label}</span>
              <span className="landing-studio-shot-hint">{view.hint}</span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeView && (
          <div
            className={`landing-studio-viewer-backdrop ${viewerSize === 'stage' ? 'landing-studio-viewer-backdrop--stage' : ''}`}
            onClick={closeViewer}
            role="presentation"
          >
            <motion.div
              key={activeView.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`landing-studio-viewer ${viewerSize === 'stage' ? 'landing-studio-viewer--stage' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-label={`${activeView.label} studio`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="landing-studio-viewer-top">
                <div className="landing-studio-viewer-toolbar">
                  <button
                    type="button"
                    className="landing-studio-viewer-icon-btn"
                    onClick={() => setViewerSize(viewerSize === 'stage' ? 'card' : 'stage')}
                    aria-label={viewerSize === 'stage' ? 'Shrink studio preview' : 'Expand studio preview'}
                  >
                    {viewerSize === 'stage' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    type="button"
                    className="landing-studio-viewer-icon-btn"
                    onClick={closeViewer}
                    aria-label="Close studio preview"
                  >
                    <X size={16} />
                  </button>
                </div>

                {viewerSize === 'card' ? (
                  <>
                    <div className="landing-studio-viewer-kicker">
                      <Sparkles size={12} />
                      Studio preview
                    </div>
                    <h3 className="landing-studio-viewer-title">{activeView.label}</h3>
                    <p className="landing-studio-viewer-hint">{activeView.hint}</p>
                  </>
                ) : (
                  <div className="landing-studio-viewer-stage-head">
                    <span className="landing-studio-viewer-stage-label">{activeView.label}</span>
                    <span className="landing-studio-viewer-stage-sep" aria-hidden>
                      ·
                    </span>
                    <span className="landing-studio-viewer-stage-hint">{activeView.hint}</span>
                  </div>
                )}
              </div>

              <div className="landing-studio-viewer-frame">
                <button
                  type="button"
                  className="landing-studio-viewer-image-hit"
                  onClick={() => setViewerSize(viewerSize === 'stage' ? 'card' : 'stage')}
                  aria-label={viewerSize === 'stage' ? 'Shrink studio preview' : 'Expand studio preview'}
                >
                  <img
                    src={activeView.image}
                    alt={`Peal ${activeView.label} studio`}
                    draggable={false}
                  />
                </button>
              </div>

              <div className="landing-studio-viewer-foot">
                <div className="landing-studio-viewer-nav">
                  {prevView ? (
                    <button
                      type="button"
                      className="landing-studio-viewer-nav-btn"
                      onClick={() => openViewer(prevView.id)}
                    >
                      <ChevronLeft size={14} />
                      <span>{prevView.label}</span>
                    </button>
                  ) : (
                    <span aria-hidden />
                  )}

                  <span className="landing-studio-viewer-nav-hint">
                    {viewerSize === 'stage'
                      ? '← / → to browse · Esc to shrink · click backdrop to close'
                      : '← / → to browse · Esc to close'}
                  </span>

                  {nextView ? (
                    <button
                      type="button"
                      className="landing-studio-viewer-nav-btn landing-studio-viewer-nav-btn--next"
                      onClick={() => openViewer(nextView.id)}
                    >
                      <span>{nextView.label}</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <span aria-hidden />
                  )}
                </div>

                <a href={activeView.href} className="landing-btn landing-btn-primary landing-studio-viewer-cta">
                  <StudioIcon id={activeView.id} />
                  {activeView.openLabel}
                  <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}