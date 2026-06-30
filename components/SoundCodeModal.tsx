'use client'

import { useState, useRef, useMemo } from 'react'
import { Howl } from 'howler'
import { X, Copy, Check, Download, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildPlaySnippet, buildConstructSnippet } from '@/lib/landing-sound-snippets'
import { highlightJavaScript } from '@/lib/highlight-javascript'

type CodeView = 'play' | 'construct'

interface SoundCodeModalProps {
  sound: {
    id: string
    name: string
    type: string
    file?: string
    preview?: string
  }
  onClose: () => void
}

export default function SoundCodeModal({ sound, onClose }: SoundCodeModalProps) {
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<CodeView>('play')
  const previewRef = useRef<Howl | null>(null)

  const snippets = useMemo(
    () => ({
      play: buildPlaySnippet(sound),
      construct: buildConstructSnippet(sound),
    }),
    [sound],
  )

  const code = snippets[view]
  const filename = view === 'play' ? 'app.ts' : `${sound.id}.construct.ts`

  const playPreview = () => {
    if (!sound.file) return
    previewRef.current?.stop()
    previewRef.current = new Howl({ src: [sound.file], volume: 0.5 })
    previewRef.current.play()
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadFile = () => {
    const blob = new Blob([code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      <div
        className="landing-sound-modal-backdrop"
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="landing-sound-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="sound-modal-title"
        >
          <header className="landing-sound-modal-head">
            <div>
              <h2 id="sound-modal-title" className="landing-sound-modal-title">
                {sound.name}
              </h2>
              <p className="landing-sound-modal-meta">
                {sound.type}
                <span className="landing-sound-modal-meta-sep">·</span>
                {view === 'play' ? 'load & play' : 'sound construction'}
              </p>
            </div>
            <div className="landing-sound-modal-actions">
              <button
                type="button"
                className="landing-sound-modal-icon-btn"
                onClick={playPreview}
                aria-label="Play sound"
              >
                <Play size={15} />
              </button>
              <button
                type="button"
                className="landing-sound-modal-icon-btn"
                onClick={copyToClipboard}
                aria-label="Copy code"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
              <button
                type="button"
                className="landing-sound-modal-icon-btn"
                onClick={downloadFile}
                aria-label="Download code"
              >
                <Download size={15} />
              </button>
              <button
                type="button"
                className="landing-sound-modal-icon-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </header>

          <div className="landing-sound-modal-toolbar">
            <div className="landing-sound-modal-tabs">
              <button
                type="button"
                className={`landing-sound-modal-tab ${view === 'play' ? 'active' : ''}`}
                onClick={() => setView('play')}
              >
                Play
              </button>
              <button
                type="button"
                className={`landing-sound-modal-tab ${view === 'construct' ? 'active' : ''}`}
                onClick={() => setView('construct')}
              >
                Construct
              </button>
            </div>
          </div>

          <div className="landing-sound-modal-code-wrap">
            <div className="landing-sound-modal-code-label">{filename}</div>
            <pre
              className="landing-sound-modal-code"
              dangerouslySetInnerHTML={{ __html: highlightJavaScript(code) }}
            />
          </div>

          <footer className="landing-sound-modal-foot">
            <a href={`/studio?sound=${encodeURIComponent(sound.id)}&type=${sound.type}`}>
              Customize in studio
            </a>
            <a href="/library">Browse library</a>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}