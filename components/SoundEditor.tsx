'use client'

import { useState, useRef, useEffect } from 'react'
import { Sound, useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { Sparkles } from 'lucide-react'

interface SoundEditorProps {
  sound: Sound
  onClose: () => void
}

export default function SoundEditor({ sound, onClose }: SoundEditorProps) {
  const { addSounds, updateSound } = useSoundStore()
  const { playSound } = useSoundGeneration()
  // Create a generator instance for this editor
  const [generator] = useState(() => {
    const { SoundGenerator } = require('@/hooks/useSoundGeneration')
    return new SoundGenerator()
  })

  // Don't allow editing composite sounds
  if (sound.type === 'composite') {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              Composite Sound: {sound.duration}ms
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="text-purple-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Composite sounds can't be edited
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              This sound was created from multiple parts. To modify it, create a new sound using the Vibe Designer with your updated description.
            </p>
            
            {/* Show composite structure */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left max-w-md mx-auto">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sound Structure:
              </h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {(sound as any).compositeSounds?.map((subSound: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{subSound.delay ? `${(subSound.delay * 1000).toFixed(0)}ms:` : '0ms:'}</span>
                    <span>{subSound.type} ({subSound.frequency}Hz)</span>
                  </div>
                )) || (
                  <div className="text-center text-gray-500">No structure data available</div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }
  const [editedParams, setEditedParams] = useState(sound.parameters)
  const [previewSound, setPreviewSound] = useState<Sound | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Draw waveform on canvas
  const drawWaveform = (canvas: HTMLCanvasElement | null, waveformData: number[] | null) => {
    if (!canvas || !waveformData) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw waveform - use different color for light/dark mode
    const isDark = document.documentElement.classList.contains('dark')
    ctx.strokeStyle = isDark ? '#4a9eff' : '#2563eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    const step = width / waveformData.length
    const amplitude = height / 2
    
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * step
      const y = amplitude - (waveformData[i] * amplitude * 0.8)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()
  }
  
  // Draw original waveform on mount
  useEffect(() => {
    drawWaveform(originalCanvasRef.current, sound.waveformData)
  }, [sound.waveformData])
  
  // Draw preview waveform when generated
  useEffect(() => {
    if (previewSound) {
      drawWaveform(previewCanvasRef.current, previewSound.waveformData)
    }
  }, [previewSound])

  const updateParam = (key: string, value: any) => {
    setEditedParams(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateEffect = (effect: string, enabled: boolean) => {
    setEditedParams(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [effect]: enabled
      }
    }))
  }

  const generatePreview = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    try {
      // Create a new sound with edited parameters
      const newSound: Sound = {
        ...sound,
        id: `${sound.id}-preview-${Date.now()}`,
        parameters: editedParams,
        audioBuffer: null,
        waveformData: null
      }

      // Generate the audio
      await (generator as any).renderSound(newSound)
      setPreviewSound(newSound)
    } catch (error) {
      console.error('Error generating preview:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const playPreview = async () => {
    if (!previewSound) return
    try {
      await generator.playSound(previewSound)
    } catch (error) {
      console.error('Error playing preview:', error)
    }
  }

  const saveAsNew = () => {
    if (!previewSound) return
    
    const newSound: Sound = {
      ...previewSound,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created: new Date(),
      favorite: false,
      tags: [...sound.tags, 'edited']
    }

    addSounds([newSound])
    onClose()
  }

  const replaceOriginal = () => {
    if (!previewSound) return
    
    // Update the original sound with new parameters and audio data
    updateSound(sound.id, {
      parameters: editedParams,
      audioBuffer: previewSound.audioBuffer,
      waveformData: previewSound.waveformData
    })
    
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            Edit Sound: {sound.type} - {sound.duration}ms
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Sound */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Original</h3>
            
            {/* Original Waveform */}
            <div className="w-full h-20 bg-gray-200 dark:bg-gray-950 rounded mb-4 relative overflow-hidden">
              <canvas
                ref={originalCanvasRef}
                width={300}
                height={80}
                className="w-full h-full"
              />
            </div>
            
            <button
              onClick={() => playSound(sound)}
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 dark:hover:bg-blue-400"
            >
              ▶ Play Original
            </button>
            <div className="space-y-2 text-sm">
              <div>Duration: {sound.duration}ms</div>
              <div>Frequency: {sound.frequency}Hz</div>
              <div>Type: {sound.type}</div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Preview</h3>
            
            {/* Preview Waveform */}
            <div className="w-full h-20 bg-gray-200 dark:bg-gray-950 rounded mb-4 relative overflow-hidden">
              {previewSound ? (
                <canvas
                  ref={previewCanvasRef}
                  width={300}
                  height={80}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-600 text-sm">
                  Generate preview to see waveform
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={generatePreview}
                disabled={isGenerating}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : '🔄 Generate Preview'}
              </button>
              {previewSound && (
                <button
                  onClick={playPreview}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
                >
                  ▶ Play Preview
                </button>
              )}
            </div>
            {previewSound && (
              <div className="space-y-2 text-sm text-green-300">
                <div>✓ Preview generated</div>
                <div>Duration: {editedParams.duration * 1000}ms</div>
                <div>Frequency: {editedParams.frequency}Hz</div>
              </div>
            )}
          </div>
        </div>

        {/* Parameter Controls */}
        <div className="mt-6 space-y-6">
          {/* Basic Parameters */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 text-blue-600 dark:text-blue-400">Basic Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Frequency: {Math.round(editedParams.frequency)}Hz
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  value={editedParams.frequency}
                  onChange={(e) => updateParam('frequency', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Duration: {Math.round(editedParams.duration * 1000)}ms
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.01"
                  value={editedParams.duration}
                  onChange={(e) => updateParam('duration', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              {editedParams.waveform && (
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Waveform</label>
                  <select
                    value={editedParams.waveform}
                    onChange={(e) => updateParam('waveform', e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-gray-100"
                  >
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                    <option value="sawtooth">Sawtooth</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ADSR Envelope (for tone sounds) */}
          {sound.type === 'tone' && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 text-blue-600 dark:text-blue-400">ADSR Envelope</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Attack: {(editedParams.attack * 1000).toFixed(0)}ms
                  </label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={editedParams.attack || 0.01}
                    onChange={(e) => updateParam('attack', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Decay: {(editedParams.decay * 1000).toFixed(0)}ms
                  </label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.2"
                    step="0.001"
                    value={editedParams.decay || 0.05}
                    onChange={(e) => updateParam('decay', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Sustain: {(editedParams.sustain * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={editedParams.sustain || 0.5}
                    onChange={(e) => updateParam('sustain', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Release: {(editedParams.release * 1000).toFixed(0)}ms
                  </label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.5"
                    step="0.001"
                    value={editedParams.release || 0.1}
                    onChange={(e) => updateParam('release', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Effects */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 text-blue-600 dark:text-blue-400">Effects</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(editedParams.effects).map(([effect, enabled]) => (
                <label key={effect} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => updateEffect(effect, e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="capitalize">{effect}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          {previewSound && (
            <>
              <button
                onClick={saveAsNew}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400"
              >
                Save as New
              </button>
              <button
                onClick={replaceOriginal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
              >
                Replace Original
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}