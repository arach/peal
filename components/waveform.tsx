"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface WaveformProps {
  isGenerating?: boolean
  isPlaying?: boolean
  audioUrl?: string
  className?: string
}

export function Waveform({ isGenerating = false, isPlaying = false, audioUrl, className }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined)
  const audioContextRef = useRef<AudioContext | undefined>(undefined)
  const analyserRef = useRef<AnalyserNode | undefined>(undefined)
  const dataArrayRef = useRef<Uint8Array | undefined>(undefined)
  const [waveformData, setWaveformData] = useState<number[]>([])

  // Generate static waveform data for non-playing states
  useEffect(() => {
    if (!isPlaying && !isGenerating) {
      // Generate a static waveform pattern
      const staticData = Array.from({ length: 64 }, (_, i) => {
        const x = i / 64
        return (
          Math.sin(x * Math.PI * 4) * 0.3 +
          Math.sin(x * Math.PI * 8) * 0.2 +
          Math.sin(x * Math.PI * 16) * 0.1 +
          Math.random() * 0.1
        )
      })
      setWaveformData(staticData)
    }
  }, [isPlaying, isGenerating])

  // Setup audio analysis for playback
  useEffect(() => {
    if (isPlaying && audioUrl) {
      const setupAudioAnalysis = async () => {
        try {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
          }

          if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl)
            audioRef.current.crossOrigin = "anonymous"
          }

          const analyser = audioContextRef.current.createAnalyser()
          analyser.fftSize = 128
          analyserRef.current = analyser

          const source = audioContextRef.current.createMediaElementSource(audioRef.current)
          source.connect(analyser)
          analyser.connect(audioContextRef.current.destination)

          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

          audioRef.current.play()
        } catch (error) {
          console.error("Audio analysis setup failed:", error)
          // Fallback to animated waveform
          generateAnimatedWaveform()
        }
      }

      setupAudioAnalysis()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = undefined
      }
    }
  }, [isPlaying, audioUrl])

  const generateAnimatedWaveform = () => {
    const bars = 64
    const data = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2)
    setWaveformData(data)
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    let data: number[] = []

    if (isGenerating) {
      // Animated generation waveform
      const bars = 64
      data = Array.from({ length: bars }, (_, i) => {
        const time = Date.now() * 0.005
        const wave1 = Math.sin(time + i * 0.2) * 0.4
        const wave2 = Math.sin(time * 1.5 + i * 0.1) * 0.3
        const wave3 = Math.sin(time * 2 + i * 0.05) * 0.2
        return Math.abs(wave1 + wave2 + wave3) + 0.1
      })
    } else if (isPlaying && analyserRef.current && dataArrayRef.current) {
      // Real-time audio analysis
      analyserRef.current.getByteFrequencyData(dataArrayRef.current)
      data = Array.from(dataArrayRef.current).map((value) => value / 255)
    } else {
      // Static waveform
      data = waveformData
    }

    if (data.length === 0) return

    const barWidth = width / data.length
    const centerY = height / 2

    data.forEach((value, index) => {
      const barHeight = Math.max(2, value * height * 0.8)
      const x = index * barWidth
      const y = centerY - barHeight / 2

      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)

      if (isGenerating) {
        gradient.addColorStop(0, "#60a5fa")
        gradient.addColorStop(0.5, "#3b82f6")
        gradient.addColorStop(1, "#1d4ed8")
      } else if (isPlaying) {
        gradient.addColorStop(0, "#34d399")
        gradient.addColorStop(0.5, "#10b981")
        gradient.addColorStop(1, "#059669")
      } else {
        gradient.addColorStop(0, "#4b5563")
        gradient.addColorStop(0.5, "#374151")
        gradient.addColorStop(1, "#1f2937")
      }

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight)

      // Add glow effect for active states
      if (isGenerating || isPlaying) {
        ctx.shadowColor = isGenerating ? "#3b82f6" : "#10b981"
        ctx.shadowBlur = 4
        ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight)
        ctx.shadowBlur = 0
      }
    })
  }

  useEffect(() => {
    const animate = () => {
      drawWaveform()
      if (isGenerating || isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (isGenerating || isPlaying) {
      animate()
    } else {
      drawWaveform()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isGenerating, isPlaying, waveformData])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      drawWaveform()
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  return (
    <div className={cn("relative overflow-hidden rounded-sm bg-black/20 border border-gray-800/30", className)}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
      {isGenerating && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse" />
      )}
      {isPlaying && (
        <div className="absolute top-1 right-2">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-mono">LIVE</span>
          </div>
        </div>
      )}
    </div>
  )
}