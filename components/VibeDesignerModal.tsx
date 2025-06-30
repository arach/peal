'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Wand2, Sparkles, Play, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sound } from '@/store/soundStore'
import { VibeParser } from '@/lib/vibeParser'

interface VibeDesignerModalProps {
  isOpen: boolean
  onClose: () => void
  onSoundGenerated: (sound: Sound) => void
  generator: any
}

export default function VibeDesignerModal({ isOpen, onClose, onSoundGenerated, generator }: VibeDesignerModalProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSound, setGeneratedSound] = useState<Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<AudioBufferSourceNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const suggestions = [
    'soft notification chime',
    '3 quick UI clicks',
    'futuristic success sound',
    'deep error rumble',
    'gentle swoosh transition',
    'bright achievement ding'
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setGeneratedSound(null)

    try {
      const intent = VibeParser.parsePrompt(prompt)
      const paramsList = VibeParser.generateParameters(intent)

      if (paramsList.length === 0) return

      const params = paramsList[0]
      const sound: Sound = {
        id: `vibe-${Date.now()}`,
        type: params.type,
        frequency: params.frequency || 440,
        duration: Math.round((params.duration || 0.5) * 1000),
        parameters: {
          frequency: params.frequency || 440,
          duration: params.duration || 0.5,
          waveform: params.waveform || 'sine',
          attack: params.attack || 0.01,
          decay: params.decay || 0.1,
          sustain: params.sustain || 0.5,
          release: params.release || 0.1,
          effects: params.effects || {
            reverb: false,
            delay: false,
            filter: false,
            distortion: false,
            compression: false
          }
        },
        created: new Date(),
        favorite: false,
        tags: ['vibe-generated', ...prompt.split(' ').filter(w => w.length > 3)],
        audioBuffer: null,
        waveformData: null
      }

      await generator.renderSound(sound)
      setGeneratedSound(sound)
    } catch (error) {
      console.error('Error generating sound:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = async () => {
    if (!generatedSound?.audioBuffer) return

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.stop()
      audioRef.current = null
      setIsPlaying(false)
      return
    }

    const source = audioContextRef.current.createBufferSource()
    source.buffer = generatedSound.audioBuffer
    source.connect(audioContextRef.current.destination)
    source.start(0)
    
    source.onended = () => {
      setIsPlaying(false)
      audioRef.current = null
    }

    audioRef.current = source
    setIsPlaying(true)
  }

  const handleUseSound = () => {
    if (generatedSound) {
      onSoundGenerated(generatedSound)
      handleClose()
    }
  }

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.stop()
      audioRef.current = null
    }
    setIsPlaying(false)
    setPrompt('')
    setGeneratedSound(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="relative border-b border-gray-200 dark:border-gray-800 p-6">
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Vibe Designer
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Describe your sound in plain English
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What sound do you need?
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      placeholder="Try: 'a short high beep' or '3 quick clicks'"
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Wand2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Suggestions */}
                {!generatedSound && !isGenerating && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Popular examples:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPrompt(suggestion)
                            setTimeout(handleGenerate, 100)
                          }}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading */}
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Generating your sound...</p>
                  </div>
                )}

                {/* Generated Sound */}
                {generatedSound && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Generated Sound
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          "{prompt}"
                        </p>
                      </div>
                      <button
                        onClick={handlePlay}
                        className={`p-3 rounded-xl transition-all ${
                          isPlaying
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isPlaying ? <Volume2 size={20} /> : <Play size={20} />}
                      </button>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{generatedSound.type}</span>
                      <span>•</span>
                      <span>{generatedSound.duration}ms</span>
                      <span>•</span>
                      <span>{generatedSound.frequency}Hz</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                {generatedSound && (
                  <button
                    onClick={handleUseSound}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    Use This Sound
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}