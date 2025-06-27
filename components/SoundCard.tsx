'use client'

import { useState, useRef, useEffect } from 'react'
import { Sound, useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { exportAudioAsWAV, generateSoundFilename } from '@/utils/audioExport'
import { Play, Square, Star, Hash, Edit, Download, Shuffle } from 'lucide-react'
import SoundCardDropdown from './SoundCardDropdown'

interface SoundCardProps {
  sound: Sound
  index: number
}

export default function SoundCard({ sound, index }: SoundCardProps) {
  const {
    selectedSounds,
    currentlyPlaying,
    focusedIndex,
    toggleSelection,
    toggleFavorite,
    showEditor,
    showVariations,
    setCurrentlyPlaying,
    setFocusedIndex,
    addTag,
    removeTag
  } = useSoundStore()

  const { playSound } = useSoundGeneration()
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentSource = useRef<AudioBufferSourceNode | null>(null)

  const isSelected = selectedSounds.has(sound.id)
  const isFocused = focusedIndex === index

  useEffect(() => {
    if (canvasRef.current && sound.waveformData) {
      drawMiniWaveform(canvasRef.current, sound.waveformData)
    }
  }, [sound.waveformData])

  const drawMiniWaveform = (canvas: HTMLCanvasElement, waveformData: number[]) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = '#4a9eff'
    ctx.lineWidth = 1
    ctx.beginPath()
    
    const barWidth = width / waveformData.length
    
    waveformData.forEach((value, i) => {
      const x = i * barWidth
      const barHeight = value * height * 0.8
      const y = (height - barHeight) / 2
      
      ctx.moveTo(x, height / 2)
      ctx.lineTo(x, y)
      ctx.lineTo(x, height - y)
    })
    
    ctx.stroke()
  }

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Stop currently playing sound
    if (currentSource.current) {
      currentSource.current.stop()
      currentSource.current = null
    }
    
    if (currentlyPlaying) {
      setCurrentlyPlaying(null)
    }

    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    try {
      const source = await playSound(sound)
      if (source) {
        currentSource.current = source
        setIsPlaying(true)
        setCurrentlyPlaying(sound.id)
        
        source.onended = () => {
          setIsPlaying(false)
          setCurrentlyPlaying(null)
          currentSource.current = null
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error)
      setIsPlaying(false)
    }
  }

  const handleCardClick = () => {
    setFocusedIndex(index)
    toggleSelection(sound.id)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(sound.id)
  }

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim()) {
      addTag(sound.id, newTag.trim())
      setNewTag('')
      setShowTagInput(false)
    }
  }

  const handleRemoveTag = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeTag(sound.id, tag)
  }

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!sound.audioBuffer) {
      // Regenerate audio buffer if needed
      const { SoundGenerator } = require('@/hooks/useSoundGeneration')
      const generator = new SoundGenerator()
      await generator.renderSound(sound)
      
      if (!sound.audioBuffer) {
        console.error('Failed to generate audio buffer for export')
        return
      }
    }
    
    const filename = generateSoundFilename(sound)
    exportAudioAsWAV(sound.audioBuffer, filename)
  }

  return (
    <div
      data-index={index}
      data-id={sound.id}
      onClick={handleCardClick}
      onMouseEnter={() => setFocusedIndex(index)}
      className={`
        surface-primary rounded-xl p-4 cursor-pointer transition-all
        hover:border-primary-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/50
        ${isSelected ? 'border-primary-400 bg-primary-50 dark:bg-primary-400/10' : ''}
        ${isFocused ? 'ring-2 ring-primary-400/50' : ''}
        relative shadow-sm
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary-500/90 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium z-10 shadow-sm">
          ✓
        </div>
      )}

      {/* Waveform visualization */}
      <div className="w-full h-15 bg-background-tertiary dark:bg-gray-950 rounded mb-3 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={180}
          height={60}
          className="w-full h-full"
        />
      </div>

      {/* Sound info */}
      <div className="flex justify-between items-center text-xs text-text-tertiary dark:text-gray-400 mb-2">
        <span>{sound.duration}ms</span>
        <span className="bg-surface-elevated dark:bg-gray-800 px-2 py-1 rounded text-primary-500">
          {sound.type}
        </span>
      </div>

      {/* Tags */}
      {sound.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {sound.tags.map(tag => (
            <span
              key={tag}
              onClick={(e) => handleRemoveTag(tag, e)}
              className="bg-primary-100 dark:bg-blue-900/50 text-primary-600 dark:text-blue-300 text-xs px-2 py-0.5 rounded cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              title="Click to remove"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Tag input */}
      {showTagInput && (
        <form onSubmit={handleAddTag} className="mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag..."
            className="w-full bg-surface dark:bg-gray-800 border border-border dark:border-gray-600 rounded px-2 py-1 text-xs text-text-primary dark:text-gray-100 focus-ring"
            autoFocus
            onBlur={() => setShowTagInput(false)}
          />
        </form>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handlePlay}
          className={`
            flex items-center justify-center min-w-[32px] h-8 px-3 border rounded transition-all
            ${isPlaying 
              ? 'bg-primary-500 border-primary-500 text-white' 
              : 'bg-surface dark:bg-gray-800 border-border dark:border-gray-700 text-text-primary dark:text-gray-100 hover:bg-background-tertiary dark:hover:bg-gray-700 hover:border-primary-400 hover:text-primary-500'
            }
          `}
          title="Play"
        >
          {isPlaying ? <Square size={14} /> : <Play size={14} />}
        </button>
        
        <button
          onClick={handleFavorite}
          className={`
            flex items-center justify-center w-8 h-8 border rounded transition-all
            ${sound.favorite 
              ? 'bg-yellow-500 border-yellow-500 text-white' 
              : 'bg-surface dark:bg-gray-800 border-border dark:border-gray-700 text-text-primary dark:text-gray-100 hover:bg-background-tertiary dark:hover:bg-gray-700 hover:border-yellow-400 hover:text-yellow-500'
            }
          `}
          title="Favorite"
        >
          <Star size={14} fill={sound.favorite ? 'currentColor' : 'none'} />
        </button>
        
        <SoundCardDropdown 
          items={[
            {
              icon: <Edit size={14} />,
              label: 'Edit sound',
              onClick: (e) => {
                e.stopPropagation()
                showEditor(sound.id)
              }
            },
            {
              icon: <Shuffle size={14} />,
              label: 'Generate variations',
              onClick: (e) => {
                e.stopPropagation()
                showVariations(sound.id)
              }
            },
            {
              icon: <Hash size={14} />,
              label: 'Add tag',
              onClick: (e) => {
                e.stopPropagation()
                setShowTagInput(!showTagInput)
              }
            },
            {
              icon: <Download size={14} />,
              label: 'Export WAV',
              onClick: handleExport,
              divider: true
            }
          ]}
        />
      </div>
    </div>
  )
}