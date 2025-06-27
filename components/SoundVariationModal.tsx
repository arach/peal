'use client'

import { useState, useRef, useEffect } from 'react'
import { Sound, useSoundStore } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { SoundVariationGenerator, VariationParameters, variationPresets } from '@/lib/soundVariations'
import { X, Shuffle, Play, Download, Sliders, Check } from 'lucide-react'

interface SoundVariationModalProps {
  sound: Sound
  onClose: () => void
}

// Mini waveform component for variations
function VariationWaveform({ variation }: { variation: Sound }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!canvasRef.current || !variation.waveformData) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const { width, height } = canvas
    const data = variation.waveformData
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw waveform
    ctx.strokeStyle = '#4a9eff'
    ctx.lineWidth = 1
    ctx.beginPath()
    
    const step = width / data.length
    const amplitude = height / 2
    
    for (let i = 0; i < data.length; i++) {
      const x = i * step
      const y = amplitude - (data[i] * amplitude * 0.8) + amplitude
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()
  }, [variation.waveformData])
  
  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={40}
      className="w-full h-10 bg-gray-900/50 rounded"
    />
  )
}

export default function SoundVariationModal({ sound, onClose }: SoundVariationModalProps) {
  const { addSounds } = useSoundStore()
  const { generator } = useSoundGeneration()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVariations, setGeneratedVariations] = useState<Sound[]>([])
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof variationPresets>('moderate')
  const [customParams, setCustomParams] = useState<VariationParameters>(variationPresets.moderate)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [selectedVariations, setSelectedVariations] = useState<Set<string>>(new Set())
  
  const generateVariations = async (count: number = 10) => {
    setIsGenerating(true)
    setGeneratedVariations([])
    
    try {
      const variationGen = new SoundVariationGenerator(sound, customParams)
      const paramVariations = variationGen.generateBatch(count)
      
      const newSounds: Sound[] = []
      
      for (let i = 0; i < paramVariations.length; i++) {
        const variation = paramVariations[i]
        
        // Create new sound with varied parameters
        const newSound: Sound = {
          ...sound,
          id: `${sound.id}-var-${Date.now()}-${i}`,
          parameters: {
            ...sound.parameters,
            ...variation
          },
          created: new Date(),
          tags: [...sound.tags, 'variation'],
          audioBuffer: null,
          waveformData: null
        }
        
        // Generate audio for the variation
        await (generator as any).renderSound(newSound)
        newSounds.push(newSound)
      }
      
      setGeneratedVariations(newSounds)
    } catch (error) {
      console.error('Error generating variations:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const playVariation = async (variation: Sound) => {
    if (playingId === variation.id) {
      setPlayingId(null)
      return
    }
    
    setPlayingId(variation.id)
    try {
      const source = await generator.playSound(variation)
      if (source) {
        source.onended = () => setPlayingId(null)
      }
    } catch (error) {
      console.error('Error playing variation:', error)
      setPlayingId(null)
    }
  }
  
  const toggleVariationSelection = (id: string) => {
    setSelectedVariations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }
  
  const saveSelected = () => {
    const toSave = selectedVariations.size > 0 
      ? generatedVariations.filter(v => selectedVariations.has(v.id))
      : generatedVariations
    
    if (toSave.length > 0) {
      addSounds(toSave)
      onClose()
    }
  }
  
  const updateParam = (key: keyof VariationParameters, value: any) => {
    setCustomParams(prev => ({ ...prev, [key]: value }))
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface dark:bg-gray-900 border border-border dark:border-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-primary-500">
              Generate Variations
            </h2>
            <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
              Create variations of "{sound.type}" sound ({sound.duration}ms, {sound.frequency}Hz)
            </p>
          </div>
          
          {/* Original sound preview */}
          <div className="mx-6 bg-surface-secondary dark:bg-gray-800 rounded-lg p-3 border border-border dark:border-gray-700">
            <p className="text-xs text-text-secondary dark:text-gray-400 mb-2">Original</p>
            <VariationWaveform variation={sound} />
          </div>
          
          <button
            onClick={onClose}
            className="text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Preset Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-primary dark:text-gray-100 mb-3">
            Variation Style
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(variationPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedPreset(key as keyof typeof variationPresets)
                  setCustomParams(preset)
                }}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${selectedPreset === key 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-surface-secondary dark:bg-gray-800 text-text-primary dark:text-gray-100 hover:bg-background-tertiary dark:hover:bg-gray-700'
                  }
                `}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Advanced Parameters */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-400 mb-3"
          >
            <Sliders size={16} />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Parameters
          </button>
          
          {showAdvanced && (
            <div className="bg-background-secondary dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
              {/* Duration Variance */}
              <div>
                <label className="block text-sm text-text-secondary dark:text-gray-300 mb-2">
                  Duration Variance: {customParams.durationVariance}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={customParams.durationVariance}
                  onChange={(e) => updateParam('durationVariance', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Frequency Variance */}
              <div>
                <label className="block text-sm text-text-secondary dark:text-gray-300 mb-2">
                  Frequency Variance: {customParams.frequencyVariance}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={customParams.frequencyVariance}
                  onChange={(e) => updateParam('frequencyVariance', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Envelope Variance (for tones) */}
              {sound.type === 'tone' && (
                <div>
                  <label className="block text-sm text-text-secondary dark:text-gray-300 mb-2">
                    Envelope Variance: {customParams.envelopeVariance}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={customParams.envelopeVariance}
                    onChange={(e) => updateParam('envelopeVariance', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Effect Probability */}
              <div>
                <label className="block text-sm text-text-secondary dark:text-gray-300 mb-2">
                  Effect Toggle Chance: {customParams.effectProbability}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customParams.effectProbability}
                  onChange={(e) => updateParam('effectProbability', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Preserve Character */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preserveCharacter"
                  checked={customParams.preserveCharacter}
                  onChange={(e) => updateParam('preserveCharacter', e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
                <label htmlFor="preserveCharacter" className="text-sm text-text-secondary dark:text-gray-300">
                  Preserve original character (keep variations subtle)
                </label>
              </div>
            </div>
          )}
        </div>
        
        {/* Generate Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => generateVariations(10)}
            disabled={isGenerating}
            className="btn-base bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50"
          >
            <Shuffle size={20} />
            Generate 10 Variations
          </button>
          <button
            onClick={() => generateVariations(25)}
            disabled={isGenerating}
            className="btn-base bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50"
          >
            <Shuffle size={20} />
            Generate 25 Variations
          </button>
          <button
            onClick={() => generateVariations(50)}
            disabled={isGenerating}
            className="btn-base bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50"
          >
            <Shuffle size={20} />
            Generate 50 Variations
          </button>
        </div>
        
        {/* Loading State */}
        {isGenerating && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-border dark:border-gray-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary dark:text-gray-400">Generating variations...</p>
          </div>
        )}
        
        {/* Generated Variations Grid */}
        {generatedVariations.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-text-primary dark:text-gray-100">
                Generated Variations ({generatedVariations.length})
                {selectedVariations.size > 0 && (
                  <span className="text-primary-500 ml-2">
                    ({selectedVariations.size} selected)
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                {selectedVariations.size > 0 && (
                  <button
                    onClick={() => setSelectedVariations(new Set())}
                    className="btn-base btn-sm bg-surface-secondary dark:bg-gray-800 text-text-primary dark:text-gray-100 hover:bg-background-tertiary dark:hover:bg-gray-700"
                  >
                    Clear Selection
                  </button>
                )}
                <button
                  onClick={saveSelected}
                  className="btn-base btn-sm bg-green-600 text-white hover:bg-green-500"
                >
                  <Download size={16} />
                  Save {selectedVariations.size > 0 ? `${selectedVariations.size} Selected` : 'All'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
              {generatedVariations.map((variation, index) => {
                const isSelected = selectedVariations.has(variation.id)
                return (
                  <div
                    key={variation.id}
                    className={`
                      bg-surface-secondary dark:bg-gray-800 rounded-lg p-3 cursor-pointer 
                      transition-all relative border-2
                      ${isSelected 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' 
                        : 'border-transparent hover:bg-background-tertiary dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleVariationSelection(variation.id)
                        }}
                        className={`
                          w-5 h-5 rounded flex items-center justify-center text-xs
                          ${isSelected 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                          }
                        `}
                      >
                        {isSelected && <Check size={12} />}
                      </button>
                    </div>
                    
                    {/* Variation header */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-primary-500">
                        Var {index + 1}
                      </span>
                      {playingId === variation.id && (
                        <Play size={14} className="text-green-500 animate-pulse" />
                      )}
                    </div>
                    
                    {/* Waveform preview */}
                    <div 
                      onClick={() => playVariation(variation)}
                      className="mb-2"
                    >
                      <VariationWaveform variation={variation} />
                    </div>
                    
                    {/* Sound parameters */}
                    <div className="space-y-1 text-xs text-text-secondary dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>{Math.round(variation.parameters.duration * 1000)}ms</span>
                        <span className={`
                          ${variation.parameters.duration > sound.parameters.duration 
                            ? 'text-green-500' 
                            : variation.parameters.duration < sound.parameters.duration 
                              ? 'text-red-500' 
                              : 'text-gray-500'
                          }
                        `}>
                          {variation.parameters.duration > sound.parameters.duration ? '+' : ''}
                          {Math.round(((variation.parameters.duration - sound.parameters.duration) / sound.parameters.duration) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{Math.round(variation.parameters.frequency)}Hz</span>
                        <span className={`
                          ${variation.parameters.frequency > sound.parameters.frequency 
                            ? 'text-green-500' 
                            : variation.parameters.frequency < sound.parameters.frequency 
                              ? 'text-red-500' 
                              : 'text-gray-500'
                          }
                        `}>
                          {variation.parameters.frequency > sound.parameters.frequency ? '+' : ''}
                          {Math.round(((variation.parameters.frequency - sound.parameters.frequency) / sound.parameters.frequency) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}