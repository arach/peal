'use client'

import { useState, useRef, useEffect } from 'react'
import { Sound, useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { exportAudioAsWAV, generateSoundFilename } from '@/utils/audioExport'
import { Play, Pause, Star, Sliders, MoreVertical } from 'lucide-react'
import SoundCardDropdown from './SoundCardDropdown'
import { useRouter } from 'next/navigation'

interface SoundCardProps {
  sound: Sound
  index: number
}


export default function SoundCardRedesign({ sound, index }: SoundCardProps) {
  const {
    selectedSounds,
    currentlyPlaying,
    toggleSelection,
    toggleFavorite,
    showVariations,
    setCurrentlyPlaying,
    addTag,
    removeTag
  } = useSoundStore()

  const { playSound } = useSoundGeneration()
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentSource = useRef<AudioBufferSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const progressRef = useRef(0)

  const isSelected = selectedSounds.has(sound.id)

  useEffect(() => {
    if (canvasRef.current && sound.waveformData) {
      drawWaveform()
    }
  }, [sound.waveformData, isPlaying])

  useEffect(() => {
    if (!isPlaying) {
      progressRef.current = 0
    }
  }, [isPlaying])

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      // Draw waveform bars
      const barCount = 40
      const barWidth = width / barCount
      const barGap = 2
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * sound.waveformData.length)
        const value = sound.waveformData[dataIndex] || 0.5
        const barHeight = value * height * 0.7
        const x = i * barWidth
        const y = (height - barHeight) / 2
        
        // Determine if this bar has been "played"
        const isPlayed = isPlaying && (i / barCount) < progressRef.current
        
        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        
        if (isPlayed) {
          gradient.addColorStop(0, 'rgba(74, 158, 255, 0.8)')
          gradient.addColorStop(0.5, 'rgba(74, 158, 255, 1)')
          gradient.addColorStop(1, 'rgba(74, 158, 255, 0.8)')
        } else {
          gradient.addColorStop(0, 'rgba(74, 158, 255, 0.3)')
          gradient.addColorStop(0.5, 'rgba(74, 158, 255, 0.4)')
          gradient.addColorStop(1, 'rgba(74, 158, 255, 0.3)')
        }
        
        ctx.fillStyle = gradient
        ctx.fillRect(x + barGap/2, y, barWidth - barGap, barHeight)
      }
      
      if (isPlaying) {
        progressRef.current += 0.02
        if (progressRef.current > 1) progressRef.current = 0
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (currentSource.current) {
      currentSource.current.stop()
      currentSource.current = null
    }
    
    if (currentlyPlaying === sound.id) {
      setCurrentlyPlaying(null)
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
    toggleSelection(sound.id)
  }

  const handleStudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/studio?sound=${sound.id}`)
  }

  return (
    <div
      data-index={index}
      data-id={sound.id}
      onClick={handleCardClick}
      className={`
        relative group bg-white dark:bg-gray-900/50 rounded-xl 
        border-2 transition-all cursor-pointer
        ${isSelected 
          ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20' 
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg'
        }
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-lg">
          ✓
        </div>
      )}


      <div className="p-4">
        {/* Sound type and info */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {sound.type}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {sound.duration}ms
          </span>
        </div>

        {/* Waveform visualization */}
        <div className="relative h-20 mb-3 rounded-lg overflow-hidden bg-blue-50 dark:bg-gray-900/50">
          <canvas
            ref={canvasRef}
            width={240}
            height={80}
            className="w-full h-full"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
          {sound.tags.map(tag => (
            <span
              key={tag}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {sound.tags.length === 0 && (
            <span className="text-gray-400 dark:text-gray-600 text-xs italic">
              No tags
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Play button */}
          <button
            onClick={handlePlay}
            className={`
              flex-1 flex items-center justify-center gap-2 h-9 rounded-lg font-medium text-sm transition-all
              ${isPlaying 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }
            `}
            title="Play"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Playing' : 'Play'}
          </button>

          {/* Star button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(sound.id)
            }}
            className={`
              w-9 h-9 flex items-center justify-center rounded-lg transition-all
              ${sound.favorite 
                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' 
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }
            `}
            title="Favorite"
          >
            <Star size={16} fill={sound.favorite ? 'currentColor' : 'none'} />
          </button>

          {/* Studio button */}
          <button
            onClick={handleStudio}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
            title="Edit in Studio"
          >
            <Sliders size={16} />
          </button>

          {/* More options */}
          <SoundCardDropdown 
            items={[
              {
                icon: <Sparkles size={14} />,
                label: 'Generate variations',
                onClick: (e) => {
                  e.stopPropagation()
                  showVariations(sound.id)
                }
              }
            ]}
          />
        </div>
      </div>
    </div>
  )
}