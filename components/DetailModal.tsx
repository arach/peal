'use client'

import { useEffect, useRef } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { X } from 'lucide-react'

export default function DetailModal() {
  const { 
    detailSoundId, 
    sounds, 
    hideDetail 
  } = useSoundStore()
  
  const waveformRef = useRef<HTMLCanvasElement>(null)
  const spectralRef = useRef<HTMLCanvasElement>(null)

  const sound = sounds.find(s => s.id === detailSoundId)

  useEffect(() => {
    if (sound && waveformRef.current) {
      drawLargeWaveform(waveformRef.current, sound.waveformData)
    }
    if (sound && spectralRef.current) {
      drawSpectralView(spectralRef.current, sound.audioBuffer)
    }
  }, [sound])

  const drawLargeWaveform = (canvas: HTMLCanvasElement, waveformData: number[] | null) => {
    if (!waveformData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Background grid
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i < 10; i++) {
      const y = (height / 10) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Waveform
    ctx.strokeStyle = '#4a9eff'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    waveformData.forEach((value, i) => {
      const x = (i / waveformData.length) * width
      const y = height / 2 - (value * height * 0.8)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
    
    // Mirror
    ctx.strokeStyle = '#4a9eff40'
    ctx.beginPath()
    
    waveformData.forEach((value, i) => {
      const x = (i / waveformData.length) * width
      const y = height / 2 + (value * height * 0.8)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
  }

  const drawSpectralView = (canvas: HTMLCanvasElement, audioBuffer: AudioBuffer | null) => {
    if (!audioBuffer) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Simple frequency representation
    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, '#4a9eff00')
    gradient.addColorStop(1, '#4a9eff')
    
    ctx.fillStyle = gradient
    
    for (let i = 0; i < 50; i++) {
      const x = (i / 50) * width
      const barHeight = Math.random() * height * 0.8
      ctx.fillRect(x, height - barHeight, width / 50 - 1, barHeight)
    }
  }

  if (!sound) return null

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="surface-primary rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-medium text-text-primary dark:text-gray-100">
            {sound.type} - {sound.duration}ms
          </h3>
          <button
            onClick={hideDetail}
            className="flex items-center justify-center w-8 h-8 bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 text-text-primary dark:text-gray-100 rounded transition-all hover:bg-background-tertiary dark:hover:bg-gray-700 focus-ring"
          >
            <X size={16} />
          </button>
        </div>

        <canvas
          ref={waveformRef}
          width={550}
          height={150}
          className="w-full h-37.5 bg-background-tertiary dark:bg-gray-950 rounded-lg mb-5 border border-border dark:border-gray-800"
        />

        <canvas
          ref={spectralRef}
          width={550}
          height={100}
          className="w-full h-25 bg-background-tertiary dark:bg-gray-950 rounded-lg mb-5 border border-border dark:border-gray-800"
        />

        <div>
          <h4 className="text-primary-500 font-medium mb-3">Parameters</h4>
          <pre className="bg-background-tertiary dark:bg-gray-950 p-4 rounded-lg text-sm text-text-primary dark:text-gray-300 overflow-x-auto border border-border dark:border-gray-800">
            {JSON.stringify(sound.parameters, null, 2)}
          </pre>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-surface-elevated dark:bg-gray-800 px-3 py-1 rounded text-sm text-text-primary dark:text-gray-100">
            Frequency: {sound.frequency}Hz
          </span>
          <span className="bg-surface-elevated dark:bg-gray-800 px-3 py-1 rounded text-sm text-text-primary dark:text-gray-100">
            Brightness: {sound.brightness}%
          </span>
          <span className="bg-surface-elevated dark:bg-gray-800 px-3 py-1 rounded text-sm text-text-primary dark:text-gray-100">
            Created: {sound.created instanceof Date ? sound.created.toLocaleString() : new Date(sound.created).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}