'use client'

import { useEffect, useRef, useState } from 'react'
import { Sound, useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import {
  MagicWandIcon,
  MoreIcon,
  PauseIcon,
  PlayIcon,
  StarIcon,
  WaveformIcon,
} from '@/components/icons/PealStudioIcon'
import { extractWaveformData } from '@/lib/audioUtils'
import {
  getPresetWaveform,
  isPresetSoundId,
  playPresetPreview,
  presetIdFromSoundId,
} from '@/lib/presets/presetSound'
import SoundCardDropdown from './SoundCardDropdown'
import '@/styles/studio-library-modal.css'

interface SoundLibraryCardProps {
  sound: Sound
  index: number
}

function displayName(sound: Sound): string {
  if (sound.tags[0] && isPresetSoundId(sound.id)) return sound.tags[0]
  return sound.type
}

function metaLine(sound: Sound): string {
  const tags = isPresetSoundId(sound.id) ? sound.tags.slice(1) : sound.tags
  return tags.slice(0, 4).join(' · ')
}

function drawScopeWaveform(
  canvas: HTMLCanvasElement,
  waveform: number[],
  isPlaying: boolean,
  progress: number,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const mid = height / 2
  const barCount = 52
  const barWidth = width / barCount
  const peak = Math.max(...waveform, 0.001)

  ctx.clearRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(74, 158, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, mid)
  ctx.lineTo(width, mid)
  ctx.stroke()

  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i / barCount) * waveform.length)
    const normalized = (waveform[dataIndex] || 0) / peak
    const barHeight = Math.max(2, normalized * (height * 0.38))
    const x = i * barWidth + 1
    const played = isPlaying && i / barCount < progress
    const alpha = played ? 0.95 : 0.42 + normalized * 0.35

    ctx.fillStyle = `rgba(74, 158, 255, ${alpha})`
    ctx.fillRect(x, mid - barHeight / 2, Math.max(1, barWidth - 2), barHeight)
  }
}

export default function SoundLibraryCard({ sound, index }: SoundLibraryCardProps) {
  const { currentlyPlaying, toggleFavorite, showVariations, setCurrentlyPlaying } = useSoundStore()
  const { playSound } = useSoundGeneration()
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveformPreview, setWaveformPreview] = useState<number[] | null>(sound.waveformData)
  const [waveformLoading, setWaveformLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentSource = useRef<AudioBufferSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    setWaveformPreview(sound.waveformData)
  }, [sound.id])

  useEffect(() => {
    if (sound.waveformData) return

    let cancelled = false

    const loadWaveform = async () => {
      setWaveformLoading(true)
      try {
        if (isPresetSoundId(sound.id)) {
          const data = await getPresetWaveform(presetIdFromSoundId(sound.id))
          if (!cancelled && data.length > 0) setWaveformPreview(data)
          return
        }

        if (sound.audioBuffer) {
          if (!cancelled) setWaveformPreview(extractWaveformData(sound.audioBuffer))
          return
        }

        const { SoundGenerator } = await import('@/hooks/useSoundGeneration')
        const tempSound = { ...sound }
        const generator = new SoundGenerator()
        await (generator as any).renderSound(tempSound)
        if (!cancelled && tempSound.waveformData) setWaveformPreview(tempSound.waveformData)
      } catch (error) {
        console.error('Error generating waveform preview:', sound.id, error)
      } finally {
        if (!cancelled) setWaveformLoading(false)
      }
    }

    loadWaveform()
    return () => { cancelled = true }
  }, [sound.id, sound.waveformData, sound.audioBuffer])

  useEffect(() => {
    if (!canvasRef.current || !waveformPreview) return

    const canvas = canvasRef.current

    const animate = () => {
      drawScopeWaveform(canvas, waveformPreview, isPlaying, progressRef.current)
      if (isPlaying) {
        progressRef.current += 0.018
        if (progressRef.current > 1) progressRef.current = 0
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [waveformPreview, isPlaying])

  useEffect(() => {
    return () => {
      if (currentSource.current) {
        currentSource.current.stop()
        currentSource.current = null
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (currentSource.current) {
      currentSource.current.stop()
      currentSource.current = null
    }

    if (currentlyPlaying === sound.id) {
      setCurrentlyPlaying(null)
      setIsPlaying(false)
      progressRef.current = 0
      return
    }

    try {
      const source = isPresetSoundId(sound.id)
        ? await playPresetPreview(sound)
        : await playSound(sound)

      if (source) {
        currentSource.current = source
        setIsPlaying(true)
        setCurrentlyPlaying(sound.id)
        source.onended = () => {
          setIsPlaying(false)
          setCurrentlyPlaying(null)
          currentSource.current = null
          progressRef.current = 0
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error)
      setIsPlaying(false)
    }
  }

  const name = displayName(sound)
  const meta = metaLine(sound)

  return (
    <article
      data-index={index}
      data-id={sound.id}
      className="peal-library-card"
    >
      <div className="peal-library-card__head">
        <span className="peal-library-card__type">{sound.type}</span>
        <span className="peal-library-card__duration">{sound.duration}ms</span>
      </div>

      <div className="peal-library-card__scope">
        <canvas ref={canvasRef} width={280} height={56} className="peal-library-card__canvas" />
        {waveformLoading && !waveformPreview && (
          <span className="peal-library-card__scope-loading">···</span>
        )}
      </div>

      <h3 className="peal-library-card__name">{name}</h3>
      {meta && <p className="peal-library-card__meta">{meta}</p>}

      <div className="peal-library-card__actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handlePlay}
          className={`peal-library-card__pad peal-library-card__pad--play${isPlaying ? ' is-active' : ''}`}
          title={isPlaying ? 'Pause preview' : 'Preview'}
          aria-label={isPlaying ? 'Pause preview' : 'Preview sound'}
        >
          {isPlaying ? <PauseIcon size={11} /> : <PlayIcon size={11} />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(sound.id)
          }}
          className={`peal-library-card__pad${sound.favorite ? ' is-fav' : ''}`}
          title={sound.favorite ? 'Unfavorite' : 'Favorite'}
          aria-label={sound.favorite ? 'Unfavorite' : 'Favorite'}
        >
          <StarIcon size={11} weight={sound.favorite ? 'fill' : 'bold'} />
        </button>
        <button
          type="button"
          className="peal-library-card__pad"
          title="Waveform"
          aria-label="Waveform"
        >
          <WaveformIcon size={11} />
        </button>
        <SoundCardDropdown
          variant="rack"
          items={[
            {
              icon: <MagicWandIcon size={12} />,
              label: 'Generate variations',
              onClick: (e) => {
                e.stopPropagation()
                showVariations(sound.id)
              },
            },
          ]}
          triggerClassName="peal-library-card__pad"
          triggerIcon={<MoreIcon size={11} />}
        />
      </div>
    </article>
  )
}