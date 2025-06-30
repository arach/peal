'use client'

import { useState, useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { Play, Pause, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SoundPlayerProps {
  soundFile: string
  soundName?: string
  className?: string
  showLabel?: boolean
  onPlay?: () => void
  onStop?: () => void
  onError?: (error: Error) => void
}

export default function SoundPlayer({ 
  soundFile, 
  soundName = 'Sound',
  className = '',
  showLabel = true,
  onPlay,
  onStop,
  onError
}: SoundPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const soundRef = useRef<Howl | null>(null)

  useEffect(() => {
    // Preload the sound
    soundRef.current = new Howl({
      src: [soundFile],
      onload: () => {
        setIsLoading(false)
        setError(null)
      },
      onloaderror: (id: number, error: unknown) => {
        setIsLoading(false)
        setError('Failed to load sound')
        onError?.(new Error(String(error)))
      },
      onplay: () => {
        setIsPlaying(true)
        onPlay?.()
      },
      onend: () => {
        setIsPlaying(false)
        onStop?.()
      },
      onpause: () => {
        setIsPlaying(false)
        onStop?.()
      },
      onstop: () => {
        setIsPlaying(false)
        onStop?.()
      }
    })

    return () => {
      soundRef.current?.unload()
    }
  }, [soundFile, onPlay, onStop, onError])

  const handlePlayPause = () => {
    if (!soundRef.current) return

    try {
      if (isPlaying) {
        soundRef.current.pause()
      } else {
        setIsLoading(true)
        soundRef.current.play()
        setIsLoading(false)
      }
    } catch (err) {
      setError('Failed to play sound')
      setIsLoading(false)
      onError?.(err as Error)
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePlayPause}
        disabled={isLoading || !!error}
        className={`
          relative p-3 rounded-lg transition-all
          ${error 
            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
            : isPlaying 
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
          ${error ? 'cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        `}
        title={error || (isPlaying ? 'Pause' : 'Play')}
      >
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <AlertCircle size={20} />
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
            />
          ) : isPlaying ? (
            <motion.div
              key="pause"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Pause size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Play size={20} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Playing animation */}
        {isPlaying && !error && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 rounded-lg bg-blue-500"
          />
        )}
      </button>

      {showLabel && (
        <span className={`text-sm font-medium ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {soundName}
        </span>
      )}

      {/* Error tooltip */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}