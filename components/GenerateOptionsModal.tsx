'use client'

import { useState } from 'react'
import {
  X,
  SlidersHorizontal,
  MousePointerClick,
  AudioLines,
  Bell,
  Waves,
  Activity,
  Shield,
  Zap,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { Sound } from '@/store/soundStore'

interface GenerateOptionsModalProps {
  isOpen: boolean
  onClose: () => void
}

type SoundTypeOption = {
  value: Sound['type']
  label: string
  icon: LucideIcon
}

type TemperatureOption = {
  value: 'conservative' | 'balanced' | 'wild'
  label: string
  description: string
  icon: LucideIcon
}

const soundTypes: SoundTypeOption[] = [
  { value: 'click', label: 'Clicks', icon: MousePointerClick },
  { value: 'tone', label: 'Tones', icon: AudioLines },
  { value: 'chime', label: 'Chimes', icon: Bell },
  { value: 'sweep', label: 'Sweeps', icon: Waves },
  { value: 'pulse', label: 'Pulses', icon: Activity },
]

const temperatureOptions: TemperatureOption[] = [
  {
    value: 'conservative',
    label: 'Conservative',
    description: 'Stick to familiar patterns',
    icon: Shield,
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Mix of safe and creative',
    icon: SlidersHorizontal,
  },
  {
    value: 'wild',
    label: 'Go Wild',
    description: 'Maximum creativity',
    icon: Zap,
  },
]

export default function GenerateOptionsModal({ isOpen, onClose }: GenerateOptionsModalProps) {
  const { generateBatch } = useSoundGeneration()
  const [selectedTypes, setSelectedTypes] = useState<Sound['type'][]>(['click', 'tone', 'chime'])
  const [count, setCount] = useState(12)
  const [temperature, setTemperature] = useState<'conservative' | 'balanced' | 'wild'>('balanced')
  const [isGenerating, setIsGenerating] = useState(false)

  const toggleType = (type: Sound['type']) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  const handleGenerate = async () => {
    if (selectedTypes.length === 0 || isGenerating) return

    setIsGenerating(true)
    try {
      await generateBatch(count, {
        enabledTypes: selectedTypes,
        temperature,
        enabledEffects:
          temperature === 'wild'
            ? ['reverb', 'delay', 'filter', 'distortion', 'modulation']
            : temperature === 'balanced'
              ? ['reverb', 'delay', 'filter']
              : ['reverb'],
        durationMin: temperature === 'wild' ? 50 : 100,
        durationMax: temperature === 'wild' ? 2000 : 1000,
        frequencyMin: temperature === 'wild' ? 100 : 200,
        frequencyMax: temperature === 'wild' ? 4000 : 2000,
      })
      onClose()
    } catch (error) {
      console.error('Error generating sounds:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close generate options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="gen-modal-backdrop"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="gen-modal-stage"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gen-modal-title"
          >
            <div className="gen-modal">
              <header className="gen-modal-head">
                <button
                  type="button"
                  onClick={onClose}
                  className="gen-modal-close"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <div className="gen-modal-head-row">
                  <span className="gen-modal-head-icon" aria-hidden>
                    <SlidersHorizontal size={18} />
                  </span>
                  <div>
                    <h2 id="gen-modal-title">Generate Options</h2>
                    <p>Customize your sound generation</p>
                  </div>
                </div>
              </header>

              <div className="gen-modal-body">
                <div className="gen-modal-field">
                  <label>Sound Types</label>
                  <div className="gen-modal-type-grid">
                    {soundTypes.map(({ value, label, icon: Icon }) => {
                      const selected = selectedTypes.includes(value)
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleType(value)}
                          className={`gen-modal-type-btn${selected ? ' is-selected' : ''}`}
                          aria-pressed={selected}
                        >
                          <span className="gen-modal-type-icon" aria-hidden>
                            <Icon size={15} />
                          </span>
                          <span>{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="gen-modal-field">
                  <label>
                    Number of Sounds: <strong>{count}</strong>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="gen-modal-range"
                    aria-valuemin={6}
                    aria-valuemax={50}
                    aria-valuenow={count}
                  />
                  <div className="gen-modal-range-ticks">
                    <span>6</span>
                    <span>25</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="gen-modal-field">
                  <label>Generation Style</label>
                  <div className="gen-modal-style-list">
                    {temperatureOptions.map(({ value, label, description, icon: Icon }) => {
                      const selected = temperature === value
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTemperature(value)}
                          className={`gen-modal-style-btn${selected ? ' is-selected' : ''}`}
                          aria-pressed={selected}
                        >
                          <span className="gen-modal-style-main">
                            <span className="gen-modal-style-icon" aria-hidden>
                              <Icon size={15} />
                            </span>
                            <span>
                              <strong>{label}</strong>
                              <small>{description}</small>
                            </span>
                          </span>
                          {selected && <span className="gen-modal-style-check" aria-hidden />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <footer className="gen-modal-foot">
                <button type="button" onClick={onClose} className="gen-modal-btn gen-modal-btn--ghost">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={selectedTypes.length === 0 || isGenerating}
                  className="gen-modal-btn gen-modal-btn--primary"
                >
                  {isGenerating ? (
                    <>
                      <span className="gen-modal-spinner" aria-hidden />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Generate {count} Sounds
                    </>
                  )}
                </button>
              </footer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}