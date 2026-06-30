'use client'

import '@/styles/presets.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Sparkles, Copy, Volume2 } from 'lucide-react'
import Header from '@/components/Header'
import { modernAppPresets, soundCategories, getPresetsByCategory, type SoundPreset } from '@/lib/presets/modernAppSounds'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useSoundStore } from '@/store/soundStore'

export default function PresetsPage() {
  const router = useRouter()
  const { playSound } = useSoundGeneration()
  const { addSounds } = useSoundStore()
  const [selectedCategory, setSelectedCategory] = useState('interaction')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredPresets = getPresetsByCategory(selectedCategory)

  const generatePresetSound = async (preset: SoundPreset) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const sampleRate = 44100
    const duration = preset.parameters.duration || 0.2
    const offlineContext = new OfflineAudioContext(1, sampleRate * duration, sampleRate)

    const osc = offlineContext.createOscillator()
    const gain = offlineContext.createGain()

    osc.type = preset.parameters.oscillator?.waveform || 'sine'
    osc.frequency.value = preset.parameters.oscillator?.frequency || 440
    if (preset.parameters.oscillator?.detune) {
      osc.detune.value = preset.parameters.oscillator.detune
    }

    const env = preset.parameters.envelope || { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 }
    const now = 0

    const safeAttack = Math.min(env.attack, duration * 0.2)
    const safeDecay = Math.min(env.decay, duration * 0.3)
    const safeRelease = Math.min(env.release, duration * 0.3)
    const sustainTime = Math.max(0, duration - safeAttack - safeDecay - safeRelease)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.5, now + safeAttack)
    gain.gain.linearRampToValueAtTime(env.sustain * 0.5, now + safeAttack + safeDecay)

    if (sustainTime > 0) {
      gain.gain.setValueAtTime(env.sustain * 0.5, now + safeAttack + safeDecay + sustainTime)
    }

    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(offlineContext.destination)
    osc.start(now)
    osc.stop(now + duration)

    return offlineContext.startRendering()
  }

  const handlePlayPreset = async (preset: SoundPreset) => {
    if (playingId === preset.id) {
      setPlayingId(null)
      return
    }

    setPlayingId(preset.id)

    try {
      const audioBuffer = await generatePresetSound(preset)

      const tempSound = {
        id: preset.id,
        type: 'tone' as const,
        duration: (preset.parameters.duration || 0.2) * 1000,
        frequency: preset.parameters.oscillator?.frequency || 440,
        brightness: 50,
        created: new Date(),
        favorite: false,
        tags: [],
        parameters: preset.parameters,
        waveformData: null,
        audioBuffer,
      }

      await playSound(tempSound)

      setTimeout(() => {
        setPlayingId(null)
      }, (preset.parameters.duration || 0.2) * 1000)
    } catch (error) {
      console.error('Error playing preset:', error)
      setPlayingId(null)
    }
  }

  const handleUseInStudio = async (preset: SoundPreset) => {
    setGeneratingId(preset.id)

    try {
      const audioBuffer = await generatePresetSound(preset)

      const sound = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        type: 'tone' as const,
        duration: (preset.parameters.duration || 0.2) * 1000,
        frequency: preset.parameters.oscillator?.frequency || 440,
        brightness: 50,
        created: new Date(),
        favorite: false,
        tags: preset.tags,
        parameters: preset.parameters,
        waveformData: null,
        audioBuffer,
      }

      addSounds([sound])
      router.push(`/studio?sound=${encodeURIComponent(sound.id)}&type=${sound.type}`)
    } catch (error) {
      console.error('Error generating preset:', error)
      setGeneratingId(null)
    }
  }

  const handleCopyParameters = (preset: SoundPreset) => {
    navigator.clipboard.writeText(JSON.stringify(preset.parameters, null, 2))
    setCopiedId(preset.id)
    setTimeout(() => setCopiedId(null), 1000)
  }

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'micro':
        return '<100ms'
      case 'short':
        return '100-300ms'
      case 'medium':
        return '300-500ms'
      default:
        return duration
    }
  }

  return (
    <div className="presets">
      <Header />
      <main className="presets-shell">
        <header className="presets-page-header">
          <div className="presets-kicker">Preset library</div>
          <div className="presets-title-row">
            <h1>Modern App Sounds</h1>
            <button
              type="button"
              onClick={() => router.push('/studio')}
              className="presets-btn presets-btn-primary"
            >
              <Sparkles size={15} />
              Create Custom
            </button>
          </div>
          <p className="presets-lead">
            Polished, intentional sound effects for futuristic applications — preview any preset,
            open it in Studio, or copy the synthesis parameters.
          </p>
        </header>

        <nav className="presets-categories" aria-label="Sound categories">
          {Object.entries(soundCategories).map(([key, category]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              className={`presets-category${selectedCategory === key ? ' is-active' : ''}`}
            >
              <span className="presets-category-icon" aria-hidden="true">
                {category.icon}
              </span>
              {category.name}
            </button>
          ))}
        </nav>

        <div className="presets-grid">
          {filteredPresets.map((preset) => (
            <article key={preset.id} className="presets-card">
              <div className="presets-card-head">
                <div>
                  <h3>{preset.name}</h3>
                  <p>{preset.description}</p>
                </div>
                <span className="presets-duration">{getDurationLabel(preset.duration)}</span>
              </div>

              <div className="presets-tags">
                {preset.tags.map((tag) => (
                  <span key={tag} className="presets-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="presets-card-actions">
                <button
                  type="button"
                  onClick={() => handlePlayPreset(preset)}
                  disabled={playingId !== null && playingId !== preset.id}
                  className={`presets-preview${playingId === preset.id ? ' is-playing' : ''}`}
                >
                  {playingId === preset.id ? (
                    <>
                      <Volume2 size={15} />
                      Playing
                    </>
                  ) : (
                    <>
                      <Play size={15} />
                      Preview
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleUseInStudio(preset)}
                  disabled={generatingId === preset.id}
                  className="presets-btn-icon"
                  title="Open in Studio"
                >
                  {generatingId === preset.id ? (
                    <span className="presets-spinner" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyParameters(preset)}
                  className="presets-btn-icon"
                  title="Copy parameters"
                >
                  {copiedId === preset.id ? (
                    <span style={{ fontSize: 11, color: 'var(--presets-accent-hi)' }}>✓</span>
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
              </div>
            </article>
          ))}

          {filteredPresets.length === 0 && (
            <p className="presets-empty">No presets in this category yet.</p>
          )}
        </div>

        <section className="presets-about">
          <div className="presets-about-panel">
            <h3>About Modern App Sounds</h3>
            <p>
              This preset library is designed for polished, intentional sound effects in modern
              applications, marketing materials, and product demos. Each sound is short, snappy,
              and refined — built for cutting-edge software aesthetics.
            </p>
            <div className="presets-about-cols">
              <div>
                <h4>Use cases</h4>
                <ul>
                  <li>UI interactions</li>
                  <li>Marketing videos</li>
                  <li>Product demos</li>
                  <li>App notifications</li>
                </ul>
              </div>
              <div>
                <h4>Design principles</h4>
                <ul>
                  <li>Ultra-short duration</li>
                  <li>Clean and refined</li>
                  <li>Non-intrusive</li>
                  <li>Purposeful</li>
                </ul>
              </div>
              <div>
                <h4>Customization</h4>
                <ul>
                  <li>Open any preset in Studio</li>
                  <li>Adjust parameters</li>
                  <li>Layer multiple sounds</li>
                  <li>Export for any use</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}