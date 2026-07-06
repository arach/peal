'use client'

import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Keyboard, Download, ChevronRight, ArrowLeft } from 'lucide-react'
import { Howl } from 'howler'
import { PealBrandMark } from '@/components/PealBrandMark'
import { getPublicUrl } from '@/utils/url'

type WelcomeVariant = 'default' | 'landing'

const previewSounds = [
  {
    id: 'click',
    label: 'Click',
    file: getPublicUrl('/sounds/modern/click.wav'),
    waveform: [0.35, 0.9, 0.55, 0.25, 0.15, 0.1],
  },
  {
    id: 'success',
    label: 'Success',
    file: getPublicUrl('/sounds/modern/success.wav'),
    waveform: [0.2, 0.45, 0.75, 1, 0.6, 0.35, 0.2],
  },
  {
    id: 'error',
    label: 'Error',
    file: getPublicUrl('/sounds/modern/error.wav'),
    waveform: [0.85, 0.5, 0.9, 0.4, 0.7, 0.3],
  },
] as const

const steps = [
  {
    kicker: 'First visit',
    title: 'Sounds that fit your product',
    content: 'Curated UI audio for web apps. Tap a sound below to hear it — every preset is ready to drop in.',
    showPreviews: true,
  },
  {
    kicker: 'Studio',
    title: 'Design in real time',
    content: 'Shape tones with live parameters, AI generation, and instant playback. Hear every tweak as you make it.',
    icon: Sparkles,
  },
  {
    kicker: 'Shortcuts',
    title: 'Move fast from the keyboard',
    content: 'Press ? anytime for the full cheat sheet. Space plays and pauses, arrows step through your library.',
    icon: Keyboard,
  },
  {
    kicker: 'Ship it',
    title: 'Export however you work',
    content: 'Download WAV files, copy Web Audio snippets, or run the CLI to wire sounds straight into your repo.',
    icon: Download,
  },
] as const

function PreviewWaveform({ bars, active }: { bars: readonly number[]; active: boolean }) {
  return (
    <span className={`peal-welcome-wave ${active ? 'is-active' : ''}`} aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          className="peal-welcome-wave-bar"
          style={{ '--bar-scale': height } as CSSProperties}
        />
      ))}
    </span>
  )
}

function StepIcon({ icon: Icon }: { icon: typeof Sparkles }) {
  return (
    <div className="peal-welcome-step-icon" aria-hidden="true">
      <Icon size={22} strokeWidth={1.75} />
    </div>
  )
}

export default function WelcomeModal({ variant = 'default' }: { variant?: WelcomeVariant }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const soundsRef = useRef<Record<string, Howl>>({})

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('peal-welcome-seen')
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    const loaded: Record<string, Howl> = {}
    previewSounds.forEach((sound) => {
      loaded[sound.id] = new Howl({
        src: [sound.file],
        html5: true,
        onend: () => setPlayingId(null),
      })
    })
    soundsRef.current = loaded

    return () => {
      Object.values(loaded).forEach((sound) => sound.unload())
    }
  }, [])

  const handleClose = useCallback(() => {
    setPlayingId((current) => {
      if (current && soundsRef.current[current]) {
        soundsRef.current[current].stop()
      }
      return null
    })
    localStorage.setItem('peal-welcome-seen', 'true')
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  const playPreview = (soundId: string) => {
    if (playingId && soundsRef.current[playingId]) {
      soundsRef.current[playingId].stop()
    }

    const sound = soundsRef.current[soundId]
    if (!sound) return

    sound.play()
    setPlayingId(soundId)
  }

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const isLanding = variant === 'landing'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close welcome tour"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className={`peal-welcome-backdrop ${isLanding ? 'peal-welcome-backdrop--landing' : ''}`}
          />

          <div className="peal-welcome-stage">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="peal-welcome-title"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className={`peal-welcome-panel ${isLanding ? 'peal-welcome-panel--landing' : ''}`}
            >
              <div className="peal-welcome-progress" aria-hidden="true">
                <motion.div
                  className="peal-welcome-progress-fill"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="peal-welcome-close"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="peal-welcome-body"
                >
                  {currentStep === 0 ? (
                    <div className="peal-welcome-hero">
                      <div className="peal-welcome-mark-wrap">
                        <span className="peal-welcome-mark-glow" aria-hidden="true" />
                        <PealBrandMark size={44} />
                      </div>
                    </div>
                  ) : (
                    step.icon && <StepIcon icon={step.icon} />
                  )}

                  <p className="peal-welcome-kicker">{step.kicker}</p>
                  <h2 id="peal-welcome-title" className="peal-welcome-title">
                    {step.title}
                  </h2>
                  <p className="peal-welcome-copy">{step.content}</p>

                  {step.showPreviews && (
                    <div className="peal-welcome-previews" role="group" aria-label="Preview sounds">
                      {previewSounds.map((sound) => {
                        const isPlaying = playingId === sound.id
                        return (
                          <button
                            key={sound.id}
                            type="button"
                            onClick={() => playPreview(sound.id)}
                            className={`peal-welcome-preview ${isPlaying ? 'is-playing' : ''}`}
                            aria-pressed={isPlaying}
                          >
                            <PreviewWaveform bars={sound.waveform} active={isPlaying} />
                            <span className="peal-welcome-preview-label">{sound.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="peal-welcome-footer">
                <div className="peal-welcome-steps" aria-label={`Step ${currentStep + 1} of ${steps.length}`}>
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className={`peal-welcome-step-dot ${index === currentStep ? 'is-active' : ''} ${index < currentStep ? 'is-complete' : ''}`}
                      aria-label={`Go to step ${index + 1}`}
                      aria-current={index === currentStep ? 'step' : undefined}
                    />
                  ))}
                </div>

                <div className="peal-welcome-actions">
                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="peal-welcome-btn peal-welcome-btn--ghost"
                    >
                      <ArrowLeft size={15} />
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="peal-welcome-btn peal-welcome-btn--ghost"
                    >
                      Skip tour
                    </button>
                  )}

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="peal-welcome-btn peal-welcome-btn--primary"
                    >
                      Continue
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="peal-welcome-btn peal-welcome-btn--primary"
                    >
                      Get started
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}