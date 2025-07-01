'use client'

import { useState, useRef, useEffect } from 'react'
import { Howl } from 'howler'
import { Play, Pause, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'
import SoundCodeModal from './SoundCodeModal'
import { getPublicUrl } from '@/utils/url'

const heroSounds = [
  { 
    id: 'resonant-pulse',
    name: 'Resonant Pulse',
    file: getPublicUrl('/sounds/hero-sounds/resonant-pulse.wav'),
    duration: '1.4s',
    type: 'notification',
    tags: ['resonant', 'deep', 'pulse'],
    waveform: Array.from({ length: 45 }, (_, i) => {
      const resonance = Math.sin((i / 45) * Math.PI * 2) * Math.sin((i / 45) * Math.PI * 8)
      return Math.abs(resonance) * 0.8 + 0.2
    })
  },
  { 
    id: 'ethereal-chime',
    name: 'Ethereal Chime',
    file: getPublicUrl('/sounds/hero-sounds/ethereal-chime.wav'),
    duration: '1.3s',
    type: 'success',
    tags: ['ethereal', 'ambient', 'chime'],
    waveform: Array.from({ length: 40 }, (_, i) => {
      const envelope = Math.sin((i / 40) * Math.PI) 
      const harmonic = Math.sin(i * 0.5) * 0.3
      return envelope * (0.7 + harmonic) + 0.1
    })
  },
  { 
    id: 'crystal-pulse',
    name: 'Crystal Pulse',
    file: getPublicUrl('/sounds/hero-sounds/crystal-pulse.wav'),
    duration: '1.3s',
    type: 'click',
    tags: ['crystal', 'bright', 'pulse'],
    waveform: Array.from({ length: 38 }, (_, i) => {
      if (i < 3) return 0.9
      const decay = Math.exp(-i * 0.08)
      const oscillation = Math.sin(i * 0.7) * 0.2
      return decay * (0.6 + oscillation) + 0.1
    })
  },
  { 
    id: 'ripple-cascade',
    name: 'Ripple Cascade',
    file: getPublicUrl('/sounds/signature-sounds/ripple_cascade.wav'),
    duration: '1.3s',
    type: 'notification',
    tags: ['ripple', 'cascade', 'flow'],
    waveform: Array.from({ length: 42 }, (_, i) => {
      const ripple = Math.sin((i / 42) * Math.PI * 4) * Math.exp(-i * 0.05)
      const cascade = Math.sin(i * 0.3) * 0.3
      return Math.abs(ripple + cascade) * 0.7 + 0.2
    })
  },
  { 
    id: 'quantum-cascade',
    name: 'Quantum Cascade',
    file: getPublicUrl('/sounds/signature-sounds/quantum_cascade.wav'),
    duration: '1.1s',
    type: 'success',
    tags: ['futuristic', 'cascade', 'tech'],
    waveform: Array.from({ length: 40 }, (_, i) => {
      const phase = (i / 40) * Math.PI * 3
      return Math.abs(Math.sin(phase) * Math.sin(phase * 4) * 0.8) + 0.1
    })
  },
  { 
    id: 'neural-pulse',
    name: 'Neural Pulse',
    file: getPublicUrl('/sounds/dots-patterns/neural_pulse.wav'),
    duration: '428ms',
    type: 'click',
    tags: ['neural', 'pulse', 'tech'],
    waveform: Array.from({ length: 30 }, (_, i) => {
      if (i < 5) return 0.1
      if (i < 10) return 0.8 + Math.sin(i * 1.2) * 0.2
      if (i < 15) return 0.6 + Math.sin(i * 0.8) * 0.2
      if (i < 20) return 0.4 + Math.sin(i * 0.5) * 0.1
      return 0.1
    })
  }
]

interface SoundCardProps {
  sound: typeof heroSounds[0]
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  onShowCode: () => void
}

function HeroSoundCard({ sound, isPlaying, onPlay, onStop, onShowCode }: SoundCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw waveform
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const barWidth = width / sound.waveform.length
      const centerY = height / 2
      const barGap = 2

      sound.waveform.forEach((value, index) => {
        const barHeight = value * height * 0.8
        const x = index * barWidth
        const y = centerY - barHeight / 2
        
        // Highlight played portion when playing
        const isPlayed = isPlaying && (index / sound.waveform.length) < progressRef.current
        
        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
        if (isPlayed) {
          gradient.addColorStop(0, 'rgba(74, 158, 255, 1)')
          gradient.addColorStop(0.5, 'rgba(100, 180, 255, 1)')
          gradient.addColorStop(1, 'rgba(74, 158, 255, 1)')
        } else {
          gradient.addColorStop(0, 'rgba(74, 158, 255, 0.8)')
          gradient.addColorStop(0.5, 'rgba(74, 158, 255, 1)')
          gradient.addColorStop(1, 'rgba(74, 158, 255, 0.8)')
        }
        
        ctx.fillStyle = gradient
        ctx.fillRect(x + barGap/2, y, barWidth - barGap, barHeight)
        
        // Add subtle reflection
        ctx.fillStyle = isPlayed ? 'rgba(74, 158, 255, 0.2)' : 'rgba(74, 158, 255, 0.1)'
        ctx.fillRect(x + barGap/2, centerY + barHeight / 2 + 2, barWidth - barGap, barHeight * 0.2)
      })
      
      if (isPlaying) {
        progressRef.current += 0.02
        if (progressRef.current > 1) progressRef.current = 0
        animationRef.current = requestAnimationFrame(draw)
      }
    }
    
    draw()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [sound.waveform, isPlaying])
  
  useEffect(() => {
    if (!isPlaying) {
      progressRef.current = 0
    }
  }, [isPlaying])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-blue-400 dark:hover:border-gray-700 transition-all group shadow-sm hover:shadow-md cursor-pointer"
      onClick={onShowCode}
    >
      {/* Waveform */}
      <div className="h-16 mb-3 relative">
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Sound name */}
      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{sound.name}</h3>
      
      {/* Duration and action hint */}
      <div className="flex justify-between items-center mb-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400">{sound.duration}</span>
        <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Code2 size={12} /> View code
        </span>
      </div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap mb-3">
        {sound.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation()
            isPlaying ? onStop() : onPlay()
          }}
          className={`p-2 rounded transition-colors ${
            isPlaying 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onShowCode()
          }}
          className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors flex items-center gap-1"
        >
          <Code2 size={16} />
          <span className="text-xs">Code</span>
        </button>
      </div>
    </motion.div>
  )
}

export default function HeroSoundGrid() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [sounds, setSounds] = useState<{ [key: string]: Howl }>({})
  const [selectedSound, setSelectedSound] = useState<typeof heroSounds[0] | null>(null)

  useEffect(() => {
    // Preload all sounds
    const loadedSounds: { [key: string]: Howl } = {}
    heroSounds.forEach(sound => {
      loadedSounds[sound.id] = new Howl({
        src: [sound.file],
        onend: () => setPlaying(null)
      })
    })
    setSounds(loadedSounds)

    return () => {
      // Cleanup
      Object.values(loadedSounds).forEach(sound => sound.unload())
    }
  }, [])

  const playSound = (soundId: string) => {
    // Stop any currently playing sound
    if (playing && sounds[playing]) {
      sounds[playing].stop()
    }
    
    // Play new sound
    if (sounds[soundId]) {
      sounds[soundId].play()
      setPlaying(soundId)
    }
  }

  const stopSound = () => {
    if (playing && sounds[playing]) {
      sounds[playing].stop()
      setPlaying(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {heroSounds.map((sound) => (
          <HeroSoundCard
            key={sound.id}
            sound={sound}
            isPlaying={playing === sound.id}
            onPlay={() => playSound(sound.id)}
            onStop={stopSound}
            onShowCode={() => setSelectedSound(sound)}
          />
        ))}
      </div>
      
      {selectedSound && (
        <SoundCodeModal
          sound={selectedSound}
          onClose={() => setSelectedSound(null)}
        />
      )}
    </>
  )
}