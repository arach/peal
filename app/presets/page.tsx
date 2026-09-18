'use client'

import '@/styles/presets.css'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Play,
  Sparkles,
  Copy,
  Check,
  Volume2,
  MousePointerClick,
  CircleCheck,
  ArrowRight,
  Bell,
  Settings,
  AudioLines,
  type LucideIcon,
} from 'lucide-react'
import Header from '@/components/Header'
import PealAppShell from '@/components/PealAppShell'
import { modernAppPresets, soundCategories, getPresetsByCategory, type SoundPreset } from '@/lib/presets/modernAppSounds'
import { presetToSound } from '@/lib/presets/presetSound'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { useSoundStore } from '@/store/soundStore'

const categoryIcons: Record<string, LucideIcon> = {
  interaction: MousePointerClick,
  feedback: CircleCheck,
  navigation: ArrowRight,
  notification: Bell,
  system: Settings,
  ambient: AudioLines,
}

export default function PresetsPage() {
  const router = useRouter()
  const { playSound } = useSoundGeneration()
  const { addSounds } = useSoundStore()
  const [selectedCategory, setSelectedCategory] = useState('interaction')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredPresets = getPresetsByCategory(selectedCategory)

  const playSource = useRef<AudioBufferSourceNode | null>(null)
  const playToken = useRef(0)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPreview = () => {
    playToken.current++
    const source = playSource.current
    playSource.current = null
    if (source) {
      try {
        source.stop()
      } catch {
        // already finished
      }
    }
    setPlayingId(null)
  }

  useEffect(() => stopPreview, [])

  const handlePlayPreset = async (preset: SoundPreset) => {
    if (playingId === preset.id) {
      stopPreview()
      return
    }

    stopPreview()
    const token = playToken.current
    setPlayingId(preset.id)

    try {
      // `preset-<id>` ids route through the preset renderer + cache inside
      // playSound → ensureSoundAudioBuffer.
      const source = await playSound(presetToSound(preset))
      if (token !== playToken.current) {
        try {
          source?.stop()
        } catch {
          // already finished
        }
        return
      }
      if (!source) {
        if (token === playToken.current) setPlayingId(null)
        return
      }
      playSource.current = source
      // Clear the indicator on real playback end — a fixed timer loses the
      // visible state to AudioContext resume + first-render latency.
      source.onended = () => {
        if (playSource.current === source) {
          playSource.current = null
          setPlayingId(null)
        }
      }
    } catch (error) {
      console.error('Error playing preset:', error)
      if (token === playToken.current) stopPreview()
    }
  }

  const handleUseInStudio = async (preset: SoundPreset) => {
    setGeneratingId(preset.id)

    try {
      // Keep the `preset-<id>-<rand>` id so the imported sound re-renders via
      // the preset renderer after reload instead of the generic generators.
      const sound = {
        ...presetToSound(preset),
        id: `preset-${preset.id}-${Math.random().toString(36).slice(2, 8)}`,
        created: new Date(),
      }

      addSounds([sound])
      router.push(`/studio?sound=${encodeURIComponent(sound.id)}&type=${sound.type}`)
    } catch (error) {
      console.error('Error generating preset:', error)
      setGeneratingId(null)
    }
  }

  const handleCopyParameters = async (preset: SoundPreset) => {
    const text = JSON.stringify(preset.parameters, null, 2)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard API needs a secure context — fall back for edge cases.
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopiedId(preset.id)
    if (copiedTimer.current) clearTimeout(copiedTimer.current)
    copiedTimer.current = setTimeout(() => setCopiedId(null), 1500)
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
    <PealAppShell className="presets peal-app-shell">
      <Header />
      <main className="presets-shell peal-content-gutter">
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
          {Object.entries(soundCategories).map(([key, category]) => {
            const Icon = categoryIcons[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                aria-pressed={selectedCategory === key}
                className={`presets-category${selectedCategory === key ? ' is-active' : ''}`}
              >
                {Icon ? <Icon size={14} className="presets-category-icon" /> : null}
                {category.name}
              </button>
            )
          })}
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
                  aria-pressed={playingId === preset.id}
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
                    <Check size={15} className="presets-copied" />
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
    </PealAppShell>
  )
}