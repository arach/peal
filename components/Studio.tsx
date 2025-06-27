'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Play, Pause, Square, Save, FolderOpen, Settings, Sparkles, Volume2, SkipBack, ChevronLeft, ChevronRight, Scissors, Edit3, Wand2 } from 'lucide-react'
import { useSoundStore, Sound } from '@/store/soundStore'
import { useSoundGeneration } from '@/hooks/useSoundGeneration'
import { VibeParser } from '@/lib/vibeParser'

export default function Studio() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { sounds } = useSoundStore()
  const { playSound } = useSoundGeneration()
  
  const [currentSound, setCurrentSound] = useState<Sound | null>(null)
  const [editedParams, setEditedParams] = useState<any>(null)
  const [previewSound, setPreviewSound] = useState<Sound | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [showVibePanel, setShowVibePanel] = useState(true)
  const [showParametersPanel, setShowParametersPanel] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [trimMode, setTrimMode] = useState(false)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(1)
  const [editStart, setEditStart] = useState(0.3)
  const [editEnd, setEditEnd] = useState(0.7)
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'region' | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  
  // Vibe Designer state
  const [vibePrompt, setVibePrompt] = useState('')
  const [vibeSuggestions, setVibeSuggestions] = useState<string[]>([])
  const [isVibeGenerating, setIsVibeGenerating] = useState(false)
  const [vibeGeneratedSounds, setVibeGeneratedSounds] = useState<Sound[]>([])
  
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const timelineCanvasRef = useRef<HTMLCanvasElement>(null)
  const currentSource = useRef<AudioBufferSourceNode | null>(null)
  const regenTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playbackStartTime = useRef<number>(0)
  const pausedAt = useRef<number>(0)
  
  // Create a generator instance for the studio
  const [generator] = useState(() => {
    const { SoundGenerator } = require('@/hooks/useSoundGeneration')
    return new SoundGenerator()
  })

  // Load sound from URL parameters
  useEffect(() => {
    const soundId = searchParams.get('sound')
    if (soundId && sounds.length > 0) {
      const sound = sounds.find(s => s.id === soundId)
      if (sound) {
        setCurrentSound(sound)
        setEditedParams(sound.parameters)
        setShowParametersPanel(true)
      }
    }
  }, [searchParams, sounds])

  // Draw main waveform (clean, no trim overlays)
  const drawWaveform = (canvas: HTMLCanvasElement | null, waveformData: number[] | null, isPreview = false) => {
    if (!canvas || !waveformData) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    
    // Horizontal center line
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
    
    // Vertical grid lines every 10%
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    ctx.setLineDash([])
    
    // Draw waveform
    ctx.strokeStyle = isPreview ? '#10b981' : '#3b82f6'
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

  // Draw timeline with trim controls
  const drawTimeline = (canvas: HTMLCanvasElement | null, waveformData: number[] | null) => {
    if (!canvas || !waveformData) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw timeline background
    ctx.fillStyle = 'rgba(75, 85, 99, 0.1)'
    ctx.fillRect(0, 0, width, height)
    
    // Draw simplified waveform for timeline
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    
    const step = width / waveformData.length
    const amplitude = height / 3 // Smaller amplitude for timeline
    const centerY = height / 2
    
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * step
      const y = centerY - (waveformData[i] * amplitude)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()
    
    // Always show playback position (base layer)
    const playbackX = playbackPosition * width
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(playbackX, 0)
    ctx.lineTo(playbackX, height)
    ctx.stroke()
    
    // Playback position handle
    ctx.fillStyle = '#10b981'
    ctx.fillRect(playbackX - 1, height/2 - 4, 2, 8)

    // Overlay: Trim mode
    if (trimMode) {
      const trimStartX = trimStart * width
      const trimEndX = trimEnd * width
      
      // Dimmed areas (what will be removed)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, trimStartX, height)
      ctx.fillRect(trimEndX, 0, width - trimEndX, height)
      
      // Selection border (what will be kept)
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.strokeRect(trimStartX, 0, trimEndX - trimStartX, height)
      
      // Draw trim handles
      ctx.fillStyle = '#f59e0b'
      
      // Start handle
      ctx.fillRect(trimStartX - 4, 0, 8, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(trimStartX - 2, height/4, 4, height/2)
      
      // End handle  
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(trimEndX - 4, 0, 8, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(trimEndX - 2, height/4, 4, height/2)
      
      // Add drag indicator in center (subtle dots)
      const centerX = (trimStartX + trimEndX) / 2
      ctx.fillStyle = '#ffffff'
      const dotSpacing = 4
      const numDots = 3
      const totalWidth = (numDots - 1) * dotSpacing
      const startX = centerX - totalWidth / 2
      
      for (let i = 0; i < numDots; i++) {
        const x = startX + i * dotSpacing
        ctx.beginPath()
        ctx.arc(x, height/2, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // Overlay: Edit mode
    if (editMode) {
      const editStartX = editStart * width
      const editEndX = editEnd * width
      
      // Focus area background
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.fillRect(editStartX, 0, editEndX - editStartX, height)
      
      // Focus area border
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.strokeRect(editStartX, 0, editEndX - editStartX, height)
      
      // Draw edit handles
      ctx.fillStyle = '#3b82f6'
      
      // Start handle
      ctx.fillRect(editStartX - 4, 0, 8, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(editStartX - 2, height/4, 4, height/2)
      
      // End handle  
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(editEndX - 4, 0, 8, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(editEndX - 2, height/4, 4, height/2)
      
      // Add drag indicator in center (subtle dots)
      const centerX = (editStartX + editEndX) / 2
      ctx.fillStyle = '#ffffff'
      const dotSpacing = 4
      const numDots = 3
      const totalWidth = (numDots - 1) * dotSpacing
      const startX = centerX - totalWidth / 2
      
      for (let i = 0; i < numDots; i++) {
        const x = startX + i * dotSpacing
        ctx.beginPath()
        ctx.arc(x, height/2, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // Draw time markers
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
    ctx.font = '10px sans-serif'
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      const timeMs = currentSound ? (i / 10) * currentSound.duration : 0
      ctx.fillText(`${timeMs.toFixed(0)}ms`, x + 2, height - 2)
    }
  }

  // Draw main waveform when sound or preview changes
  useEffect(() => {
    const soundToDisplay = previewSound || currentSound
    if (soundToDisplay?.waveformData) {
      drawWaveform(waveformCanvasRef.current, soundToDisplay.waveformData, !!previewSound)
    }
  }, [currentSound?.waveformData, previewSound?.waveformData])

  // Draw timeline when sound, selection values, or mode changes
  useEffect(() => {
    const soundToDisplay = previewSound || currentSound
    if (soundToDisplay?.waveformData) {
      drawTimeline(timelineCanvasRef.current, soundToDisplay.waveformData)
    }
  }, [currentSound?.waveformData, previewSound?.waveformData, trimStart, trimEnd, editStart, editEnd, editMode, trimMode, playbackPosition])

  // Debounced real-time regeneration (regional when in edit mode)
  const debouncedRegenerate = useCallback(() => {
    if (regenTimeoutRef.current) {
      clearTimeout(regenTimeoutRef.current)
    }
    
    regenTimeoutRef.current = setTimeout(async () => {
      if (currentSound && editedParams) {
        if (editMode) {
          await generateRegionalPreview()
        } else {
          await generatePreview()
        }
      }
    }, 300) // 300ms debounce
  }, [currentSound, editedParams, editMode])

  const updateParam = (key: string, value: any) => {
    setEditedParams((prev: any) => {
      const newParams = {
        ...prev,
        [key]: value
      }
      return newParams
    })
    debouncedRegenerate()
  }

  const updateEffect = (effect: string, enabled: boolean) => {
    setEditedParams((prev: any) => {
      const newParams = {
        ...prev,
        effects: {
          ...prev.effects,
          [effect]: enabled
        }
      }
      return newParams
    })
    debouncedRegenerate()
  }

  const generatePreview = async () => {
    if (isGenerating || !currentSound || !editedParams) return
    
    setIsGenerating(true)
    try {
      // Create a new sound with edited parameters
      const newSound: Sound = {
        ...currentSound,
        id: `${currentSound.id}-preview-${Date.now()}`,
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

  const generateRegionalPreview = async () => {
    if (isGenerating || !currentSound || !editedParams) return
    
    setIsGenerating(true)
    try {
      // Step 1: Generate full sound with new parameters BUT preserve original duration
      // This ensures the splice calculations work correctly
      const newSound: Sound = {
        ...currentSound,
        id: `${currentSound.id}-regional-${Date.now()}`,
        parameters: {
          ...editedParams,
          // CRITICAL: Force same duration as original to maintain timing alignment
          duration: currentSound.parameters.duration
        },
        audioBuffer: null,
        waveformData: null
      }

      await (generator as any).renderSound(newSound)
      
      if (!newSound.audioBuffer || !currentSound.audioBuffer) {
        throw new Error('Failed to generate audio buffers')
      }

      // Step 2: Create composite buffer by splicing region
      const compositBuffer = await spliceRegion(
        currentSound.audioBuffer,
        newSound.audioBuffer,
        editStart,
        editEnd
      )

      if (compositBuffer) {
        // Step 3: Create preview sound with spliced audio
        const regionalPreview: Sound = {
          ...currentSound,
          id: `${currentSound.id}-regional-preview-${Date.now()}`,
          audioBuffer: compositBuffer,
          waveformData: generateWaveformData(compositBuffer)
        }

        setPreviewSound(regionalPreview)
      }
    } catch (error) {
      console.error('Error generating regional preview:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = async () => {
    const soundToPlay = previewSound || currentSound
    if (!soundToPlay) return

    if (isPaused) {
      // Resume from paused position
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.createBufferSource()
        source.buffer = soundToPlay.audioBuffer
        source.connect(audioContext.destination)
        
        const resumePosition = pausedAt.current
        const remainingDuration = (soundToPlay.audioBuffer?.duration || 0) - resumePosition
        
        source.start(0, resumePosition, remainingDuration)
        currentSource.current = source
        
        playbackStartTime.current = audioContext.currentTime - resumePosition
        setIsPlaying(true)
        setIsPaused(false)
        
        source.onended = () => {
          setIsPlaying(false)
          setIsPaused(false)
          setPlaybackPosition(0)
          pausedAt.current = 0
          currentSource.current = null
        }
      } catch (error) {
        console.error('Error resuming sound:', error)
      }
    } else {
      // Start from beginning
      try {
        const source = await generator.playSound(soundToPlay)
        if (source) {
          currentSource.current = source
          setIsPlaying(true)
          setIsPaused(false)
          playbackStartTime.current = Date.now() / 1000
          pausedAt.current = 0
          
          source.onended = () => {
            setIsPlaying(false)
            setIsPaused(false)
            setPlaybackPosition(0)
            pausedAt.current = 0
            currentSource.current = null
          }
        }
      } catch (error) {
        console.error('Error playing sound:', error)
        setIsPlaying(false)
      }
    }
  }

  const handlePause = () => {
    if (currentSource.current && isPlaying) {
      const currentTime = Date.now() / 1000
      pausedAt.current = currentTime - playbackStartTime.current
      
      currentSource.current.stop()
      currentSource.current = null
      
      setIsPlaying(false)
      setIsPaused(true)
    }
  }

  const handleStop = () => {
    if (currentSource.current) {
      currentSource.current.stop()
      currentSource.current = null
    }
    setIsPlaying(false)
    setIsPaused(false)
    setPlaybackPosition(0)
    pausedAt.current = 0
  }

  // Timeline interaction handlers
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editMode && !trimMode) return // Only interact when in edit or trim mode
    
    const canvas = timelineCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const normalizedX = x / canvas.offsetWidth

    const HANDLE_TOLERANCE = 0.02 // 2% of width

    if (trimMode) {
      const trimStartX = trimStart
      const trimEndX = trimEnd
      
      // Check if clicking near trim handles
      if (Math.abs(normalizedX - trimStartX) < HANDLE_TOLERANCE) {
        setIsDragging('start')
      } else if (Math.abs(normalizedX - trimEndX) < HANDLE_TOLERANCE) {
        setIsDragging('end')
      } else if (normalizedX > trimStartX + HANDLE_TOLERANCE && normalizedX < trimEndX - HANDLE_TOLERANCE) {
        // Clicking inside trim region - drag entire region
        setIsDragging('region')
        setDragOffset(normalizedX - trimStartX)
      }
    } else if (editMode) {
      const editStartX = editStart
      const editEndX = editEnd
      
      // Check if clicking near edit handles
      if (Math.abs(normalizedX - editStartX) < HANDLE_TOLERANCE) {
        setIsDragging('start')
      } else if (Math.abs(normalizedX - editEndX) < HANDLE_TOLERANCE) {
        setIsDragging('end')
      } else if (normalizedX > editStartX + HANDLE_TOLERANCE && normalizedX < editEndX - HANDLE_TOLERANCE) {
        // Clicking inside edit region - drag entire region
        setIsDragging('region')
        setDragOffset(normalizedX - editStartX)
      }
    }
  }

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const canvas = timelineCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const normalizedX = Math.max(0, Math.min(1, x / canvas.offsetWidth))

    if (trimMode) {
      if (isDragging === 'start') {
        setTrimStart(Math.min(normalizedX, trimEnd - 0.01))
      } else if (isDragging === 'end') {
        setTrimEnd(Math.max(normalizedX, trimStart + 0.01))
      } else if (isDragging === 'region') {
        // Drag entire trim region
        const regionWidth = trimEnd - trimStart
        const newStart = Math.max(0, Math.min(1 - regionWidth, normalizedX - dragOffset))
        const newEnd = newStart + regionWidth
        setTrimStart(newStart)
        setTrimEnd(newEnd)
      }
    } else if (editMode) {
      if (isDragging === 'start') {
        setEditStart(Math.min(normalizedX, editEnd - 0.01))
      } else if (isDragging === 'end') {
        setEditEnd(Math.max(normalizedX, editStart + 0.01))
      } else if (isDragging === 'region') {
        // Drag entire edit region
        const regionWidth = editEnd - editStart
        const newStart = Math.max(0, Math.min(1 - regionWidth, normalizedX - dragOffset))
        const newEnd = newStart + regionWidth
        setEditStart(newStart)
        setEditEnd(newEnd)
      }
    }
  }

  const handleTimelineMouseUp = () => {
    setIsDragging(null)
    setDragOffset(0)
  }

  // Update timeline canvas cursor based on hover position
  const handleTimelineMouseHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = timelineCanvasRef.current
    if (!canvas) return

    if (!editMode && !trimMode) {
      canvas.style.cursor = 'default'
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const normalizedX = x / canvas.offsetWidth

    const HANDLE_TOLERANCE = 0.02
    let cursor = 'default'

    if (trimMode) {
      const nearStartHandle = Math.abs(normalizedX - trimStart) < HANDLE_TOLERANCE
      const nearEndHandle = Math.abs(normalizedX - trimEnd) < HANDLE_TOLERANCE
      const insideRegion = normalizedX > trimStart + HANDLE_TOLERANCE && normalizedX < trimEnd - HANDLE_TOLERANCE
      
      if (nearStartHandle || nearEndHandle) {
        cursor = 'col-resize'
      } else if (insideRegion) {
        cursor = isDragging === 'region' ? 'grabbing' : 'grab'
      }
    } else if (editMode) {
      const nearStartHandle = Math.abs(normalizedX - editStart) < HANDLE_TOLERANCE
      const nearEndHandle = Math.abs(normalizedX - editEnd) < HANDLE_TOLERANCE
      const insideRegion = normalizedX > editStart + HANDLE_TOLERANCE && normalizedX < editEnd - HANDLE_TOLERANCE
      
      if (nearStartHandle || nearEndHandle) {
        cursor = 'col-resize'
      } else if (insideRegion) {
        cursor = isDragging === 'region' ? 'grabbing' : 'grab'
      }
    }

    canvas.style.cursor = cursor
  }

  // Navigation functions
  const navigateToPrevious = () => {
    if (!currentSound) return
    const currentIndex = sounds.findIndex(s => s.id === currentSound.id)
    if (currentIndex > 0) {
      const prevSound = sounds[currentIndex - 1]
      router.push(`/studio?sound=${prevSound.id}`)
    }
  }

  const navigateToNext = () => {
    if (!currentSound) return
    const currentIndex = sounds.findIndex(s => s.id === currentSound.id)
    if (currentIndex < sounds.length - 1) {
      const nextSound = sounds[currentIndex + 1]
      router.push(`/studio?sound=${nextSound.id}`)
    }
  }

  const getCurrentSoundIndex = () => {
    if (!currentSound) return { current: 0, total: 0 }
    const currentIndex = sounds.findIndex(s => s.id === currentSound.id)
    return { current: currentIndex + 1, total: sounds.length }
  }

  // Audio splicing utility
  const spliceRegion = async (
    originalBuffer: AudioBuffer, 
    modifiedBuffer: AudioBuffer, 
    startRatio: number, 
    endRatio: number
  ): Promise<AudioBuffer | null> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Validate buffers have same properties
      if (originalBuffer.length !== modifiedBuffer.length) {
        console.error('Buffer length mismatch:', originalBuffer.length, 'vs', modifiedBuffer.length)
        return null
      }
      
      if (originalBuffer.sampleRate !== modifiedBuffer.sampleRate) {
        console.error('Sample rate mismatch:', originalBuffer.sampleRate, 'vs', modifiedBuffer.sampleRate)
        return null
      }
      
      // Calculate sample positions
      const startSample = Math.floor(startRatio * originalBuffer.length)
      const endSample = Math.floor(endRatio * originalBuffer.length)
      const regionLength = endSample - startSample
      
      // Validate region bounds
      if (startSample < 0 || endSample > originalBuffer.length || startSample >= endSample) {
        console.error('Invalid region bounds:', { startSample, endSample, bufferLength: originalBuffer.length })
        return null
      }
      
      console.log('Splicing region:', {
        startRatio: (startRatio * 100).toFixed(1) + '%',
        endRatio: (endRatio * 100).toFixed(1) + '%',
        startSample,
        endSample,
        regionLength,
        bufferLength: originalBuffer.length,
        regionDurationMs: (regionLength / originalBuffer.sampleRate * 1000).toFixed(1)
      })
      
      // Create output buffer with same length as original
      const outputBuffer = audioContext.createBuffer(
        originalBuffer.numberOfChannels,
        originalBuffer.length,
        originalBuffer.sampleRate
      )
      
      // Copy data for each channel
      for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel)
        const modifiedData = modifiedBuffer.getChannelData(channel)
        const outputData = outputBuffer.getChannelData(channel)
        
        // Start with original audio (full copy)
        outputData.set(originalData)
        
        // Extract and splice in the modified region
        // Take the region from the modified buffer and put it in the same position in output
        const modifiedRegion = modifiedData.slice(startSample, endSample)
        outputData.set(modifiedRegion, startSample)
        
        console.log(`Channel ${channel}: Spliced ${modifiedRegion.length} samples at position ${startSample}`)
      }
      
      await audioContext.close()
      return outputBuffer
    } catch (error) {
      console.error('Error splicing audio region:', error)
      return null
    }
  }

  // Generate waveform data from audio buffer
  const generateWaveformData = (buffer: AudioBuffer): number[] => {
    const channelData = buffer.getChannelData(0)
    const sampleStep = Math.floor(channelData.length / 100) // 100 data points
    const waveformData: number[] = []
    
    for (let i = 0; i < 100; i++) {
      const start = i * sampleStep
      const end = Math.min(start + sampleStep, channelData.length)
      
      let max = 0
      for (let j = start; j < end; j++) {
        max = Math.max(max, Math.abs(channelData[j]))
      }
      waveformData.push(max)
    }
    
    return waveformData
  }

  // Vibe Designer functions
  useEffect(() => {
    // Update vibe suggestions as user types
    const newSuggestions = VibeParser.getSuggestions(vibePrompt)
    setVibeSuggestions(newSuggestions)
  }, [vibePrompt])

  const handleVibeGenerate = async () => {
    if (!vibePrompt.trim() || isVibeGenerating) return

    setIsVibeGenerating(true)
    setVibeGeneratedSounds([])

    try {
      // Parse the prompt
      const intent = VibeParser.parsePrompt(vibePrompt)
      const paramsList = VibeParser.generateParameters(intent)

      // Generate all individual sounds
      const individualSounds: (Sound & { delay?: number })[] = []
      
      for (let i = 0; i < paramsList.length; i++) {
        const params = paramsList[i]
        
        // Create sound object
        const sound: Sound & { delay?: number } = {
          id: `vibe-${Date.now()}-${i}`,
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
            },
            clickDuration: params.clickDuration,
            direction: params.direction,
            volume: params.volume
          },
          created: new Date(),
          favorite: false,
          tags: ['vibe-generated'],
          audioBuffer: null,
          waveformData: null,
          delay: params.delay
        }

        // Generate audio
        await (generator as any).renderSound(sound)
        individualSounds.push(sound)
      }

      // If multiple sounds, create a composite sound
      if (individualSounds.length > 1) {
        // Calculate total duration including delays
        let totalDuration = 0
        for (const sound of individualSounds) {
          const delay = sound.delay || 0
          totalDuration = Math.max(totalDuration, delay + (sound.parameters.duration || 0))
        }

        // Create composite audio buffer
        const compositeBuffer = await createVibeCompositeBuffer(individualSounds, totalDuration)
        
        const compositeSound: Sound = {
          id: `vibe-${Date.now()}`,
          type: individualSounds[0].type,
          frequency: individualSounds[0].frequency,
          duration: Math.round(totalDuration * 1000),
          parameters: {
            frequency: individualSounds[0].frequency,
            duration: totalDuration,
            waveform: individualSounds[0].parameters.waveform || 'sine',
            attack: individualSounds[0].parameters.attack || 0.01,
            decay: individualSounds[0].parameters.decay || 0.1,
            sustain: individualSounds[0].parameters.sustain || 0.5,
            release: individualSounds[0].parameters.release || 0.1,
            effects: individualSounds[0].parameters.effects || {
              reverb: false,
              delay: false,
              filter: false,
              distortion: false,
              compression: false
            }
          },
          created: new Date(),
          favorite: false,
          tags: ['vibe-generated', ...vibePrompt.split(' ').filter(w => w.length > 3)],
          audioBuffer: compositeBuffer,
          waveformData: compositeBuffer ? generateWaveformData(compositeBuffer) : null
        }

        setVibeGeneratedSounds([compositeSound])
      } else {
        setVibeGeneratedSounds(individualSounds)
      }
    } catch (error) {
      console.error('Error generating vibe sounds:', error)
    } finally {
      setIsVibeGenerating(false)
    }
  }

  const handleVibeLoadToStudio = (sound: Sound) => {
    // Load the generated sound into the studio for editing
    setCurrentSound(sound)
    setEditedParams(sound.parameters)
    setPreviewSound(null)
    setVibeGeneratedSounds([])
    setVibePrompt('')
  }

  const handleVibePlaySound = async (sound: Sound) => {
    try {
      await generator.playSound(sound)
    } catch (error) {
      console.error('Error playing vibe sound:', error)
    }
  }

  // Helper function to create composite audio buffer for vibe sounds
  const createVibeCompositeBuffer = async (sounds: (Sound & { delay?: number })[], totalDuration: number): Promise<AudioBuffer | null> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const bufferLength = Math.floor(totalDuration * sampleRate)
      
      const compositeBuffer = audioContext.createBuffer(1, bufferLength, sampleRate)
      const compositeData = compositeBuffer.getChannelData(0)
      
      for (const sound of sounds) {
        if (!sound.audioBuffer) continue
        
        const delay = sound.delay || 0
        const startSample = Math.floor(delay * sampleRate)
        const soundData = sound.audioBuffer.getChannelData(0)
        
        // Mix the sound into the composite buffer
        for (let i = 0; i < soundData.length && (startSample + i) < bufferLength; i++) {
          compositeData[startSample + i] += soundData[i] * 0.5 // Reduce volume to prevent clipping
        }
      }
      
      await audioContext.close()
      return compositeBuffer
    } catch (error) {
      console.error('Error creating vibe composite buffer:', error)
      return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        {/* Left - Navigation & Project */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Library
          </button>
          
          <div className="w-px h-6 bg-gray-700"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Volume2 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Sound Studio</h1>
              <p className="text-xs text-gray-400">Untitled Project</p>
            </div>
          </div>
        </div>

        {/* Center - Navigation Controls */}
        {currentSound && (
          <div className="flex items-center gap-3">
            <button 
              onClick={navigateToPrevious}
              disabled={!currentSound || sounds.findIndex(s => s.id === currentSound.id) === 0}
              className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Previous sound"
            >
              <ChevronLeft size={18} className="text-gray-300" />
            </button>
            
            <div className="text-center px-3">
              <div className="text-sm font-medium text-gray-100">
                Sound {getCurrentSoundIndex().current} of {getCurrentSoundIndex().total}
              </div>
              <div className="text-xs text-gray-400">
                Navigate Library
              </div>
            </div>
            
            <button 
              onClick={navigateToNext}
              disabled={!currentSound || sounds.findIndex(s => s.id === currentSound.id) === sounds.length - 1}
              className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Next sound"
            >
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        )}

        {/* Right - Project Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors">
            <FolderOpen size={16} />
            Open
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-lg transition-colors">
            <Save size={16} />
            Save
          </button>
          <button 
            onClick={() => setShowParametersPanel(!showParametersPanel)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              showParametersPanel ? 'bg-gray-700 text-gray-100' : 'bg-gray-800 text-gray-400 hover:text-gray-100'
            }`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Vibe Designer */}
        <div className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          showVibePanel ? 'w-80' : 'w-0'
        } overflow-hidden`}>
          {showVibePanel && (
            <div className="h-full flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <span className="font-medium">Vibe Designer</span>
                    <p className="text-xs text-gray-400">AI-powered sound creation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowVibePanel(false)}
                  className="text-gray-400 hover:text-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* Panel Content */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Input Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Describe your sound
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vibePrompt}
                      onChange={(e) => setVibePrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVibeGenerate()}
                      placeholder="Try: 'a short high beep' or '3 quick clicks'"
                      className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button 
                      onClick={handleVibeGenerate}
                      disabled={!vibePrompt.trim() || isVibeGenerating}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Wand2 size={14} />
                    </button>
                  </div>

                  {/* Suggestions */}
                  {vibeSuggestions.length > 0 && vibePrompt.length < 20 && (
                    <div className="space-y-1">
                      {vibeSuggestions.slice(0, 4).map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setVibePrompt(suggestion)
                            setTimeout(() => handleVibeGenerate(), 100)
                          }}
                          className="block w-full text-left px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Loading State */}
                {isVibeGenerating && (
                  <div className="text-center py-6">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-400">Generating from your vibe...</p>
                  </div>
                )}

                {/* Generated Sounds */}
                {vibeGeneratedSounds.length > 0 && !isVibeGenerating && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300">
                      Generated Sound
                    </h3>
                    <div className="space-y-2">
                      {vibeGeneratedSounds.map((sound) => (
                        <div
                          key={sound.id}
                          className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-purple-400">
                                "{vibePrompt}"
                              </span>
                            </div>
                            <button
                              onClick={() => handleVibePlaySound(sound)}
                              className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                            >
                              ▶ Test
                            </button>
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-3">
                            {sound.type} • {sound.duration}ms • {sound.frequency}Hz
                          </div>

                          <button
                            onClick={() => handleVibeLoadToStudio(sound)}
                            className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                          >
                            Load to Studio
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setVibeGeneratedSounds([])
                          setVibePrompt('')
                        }}
                        className="flex-1 px-3 py-2 text-gray-400 text-sm hover:text-gray-200 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Example Prompts */}
                {vibeGeneratedSounds.length === 0 && !isVibeGenerating && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Example Prompts
                    </label>
                    <div className="space-y-2">
                      {[
                        "A gentle notification chime",
                        "Three short beeps increasing in pitch", 
                        "Quick, punchy interface clicks",
                        "A bright success ding",
                        "A deep, smooth swoosh sound"
                      ].map((example, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setVibePrompt(example)
                            setTimeout(() => handleVibeGenerate(), 100)
                          }}
                          className="block w-full text-left text-sm px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                        >
                          "{example}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Main Canvas */}
        <div className="flex-1 flex flex-col bg-gray-950">
          {/* Canvas Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-4">
              {!showVibePanel && (
                <button 
                  onClick={() => setShowVibePanel(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Sparkles size={16} />
                  Vibe Designer
                </button>
              )}
              <div className="text-sm text-gray-400">
                {currentSound ? `Editing: ${currentSound.type} sound` : 'Ready to create your perfect sound'}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>44.1 kHz</span>
              <span>•</span>
              <span>16-bit</span>
              <span>•</span>
              <span>Mono</span>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {currentSound ? (
              <>
                {/* Sound Info Header */}
                <div className="px-6 py-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">
                        {currentSound.type} - {currentSound.duration}ms
                      </h3>
                      <p className="text-sm text-gray-400">
                        {currentSound.frequency}Hz • {currentSound.tags.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewSound && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          Preview Ready
                        </span>
                      )}
                      {isGenerating && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          Regenerating...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Waveform Display */}
                <div className="flex-1 flex flex-col p-8">
                  <div className="w-full max-w-4xl mx-auto space-y-6">
                    {/* Main Waveform */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          Waveform {previewSound ? '(Preview)' : '(Original)'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{currentSound.duration}ms</span>
                          <span>•</span>
                          <span>{currentSound.frequency}Hz</span>
                        </div>
                      </div>
                      <div className="bg-gray-950 rounded-lg overflow-hidden">
                        <canvas
                          ref={waveformCanvasRef}
                          width={800}
                          height={200}
                          className="w-full h-48"
                        />
                      </div>
                    </div>

                    {/* Timeline & Trimmer */}
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <h4 className="text-sm font-medium text-gray-300">Timeline</h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditMode(!editMode)
                                if (!editMode) setTrimMode(false) // Only one mode at a time
                              }}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                editMode
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                              }`}
                            >
                              <Edit3 size={10} />
                              {editMode ? 'Exit Edit' : 'Edit Mode'}
                            </button>
                            <button
                              onClick={() => {
                                setTrimMode(!trimMode)
                                if (!trimMode) setEditMode(false) // Only one mode at a time
                              }}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                trimMode
                                  ? 'bg-yellow-600 text-white' 
                                  : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                              }`}
                            >
                              <Scissors size={10} />
                              {trimMode ? 'Exit Trim' : 'Trim Mode'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Mode-specific info */}
                          {trimMode && (
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>Selection: {Math.round(trimStart * 100)}% - {Math.round(trimEnd * 100)}%</span>
                              <span>Duration: {currentSound ? Math.round((trimEnd - trimStart) * currentSound.duration) : 0}ms</span>
                            </div>
                          )}
                          {editMode && (
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>Edit Region: {Math.round(editStart * 100)}% - {Math.round(editEnd * 100)}%</span>
                              <span className="text-blue-400">Parameters apply here only</span>
                            </div>
                          )}
                          
                          {/* Always show transport controls */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={handleStop}
                              disabled={!isPlaying && !isPaused}
                              className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded transition-colors"
                              title="Stop and return to beginning"
                            >
                              <Square size={14} className="text-gray-300" />
                            </button>
                            
                            {isPlaying ? (
                              <button 
                                onClick={handlePause}
                                className="flex items-center justify-center w-8 h-8 bg-yellow-500 hover:bg-yellow-400 rounded transition-colors"
                                title="Pause"
                              >
                                <Pause size={14} className="text-white" />
                              </button>
                            ) : (
                              <button 
                                onClick={handlePlay}
                                disabled={!currentSound && !previewSound}
                                className="flex items-center justify-center w-8 h-8 bg-primary-500 hover:bg-primary-400 disabled:bg-gray-700 disabled:cursor-not-allowed rounded transition-colors"
                                title={isPaused ? "Resume" : "Play"}
                              >
                                <Play size={14} className="text-white ml-0.5" />
                              </button>
                            )}
                            
                            <button 
                              onClick={() => {
                                handleStop()
                                setTimeout(() => handlePlay(), 100)
                              }}
                              disabled={!currentSound && !previewSound}
                              className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded transition-colors"
                              title="Restart from beginning"
                            >
                              <SkipBack size={14} className="text-gray-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-950 rounded-lg overflow-hidden mb-3">
                        <canvas
                          ref={timelineCanvasRef}
                          width={800}
                          height={80}
                          className="w-full h-20"
                          onMouseDown={handleTimelineMouseDown}
                          onMouseMove={isDragging ? handleTimelineMouseMove : handleTimelineMouseHover}
                          onMouseUp={handleTimelineMouseUp}
                          onMouseLeave={handleTimelineMouseUp}
                        />
                      </div>

                      {/* Mode-specific Controls */}
                      {trimMode && (
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Drag the orange handles to select audio portion to keep
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setTrimStart(0)
                                setTrimEnd(1)
                              }}
                              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300"
                            >
                              Reset Selection
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Apply trim to audio buffer
                                console.log('Apply trim:', trimStart, trimEnd)
                              }}
                              disabled={trimStart === 0 && trimEnd === 1}
                              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs"
                            >
                              Apply Trim
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {editMode && (
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Drag the blue handles to select region • Parameter changes automatically apply to selected region only
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditStart(0.3)
                                setEditEnd(0.7)
                              }}
                              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300"
                            >
                              Reset Focus
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {!trimMode && !editMode && (
                        <div className="flex justify-center">
                          <div className="text-xs text-gray-500">
                            Playback timeline • Enable Edit mode for regional parameter changes • Enable Trim mode for audio length editing
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Volume2 size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-2">
                      Welcome to Sound Studio
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                      Create, edit, and perfect your sounds with AI-powered design tools and precision controls.
                      Use the Vibe Designer to describe what you want, or dive into the parameters for detailed editing.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => setShowVibePanel(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      <Sparkles size={16} />
                      Start with Vibe
                    </button>
                    <button 
                      onClick={() => router.push('/')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Settings size={16} />
                      Browse Library
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Parameters */}
        <div className={`bg-gray-900 border-l border-gray-800 transition-all duration-300 ${
          showParametersPanel ? 'w-80' : 'w-0'
        } overflow-hidden`}>
          {showParametersPanel && (
            <div className="h-full flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-primary-400" />
                  <span className="font-medium">Parameters</span>
                  {editMode && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      Regional Edit
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setShowParametersPanel(false)}
                  className="text-gray-400 hover:text-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* Panel Content */}
              <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                {currentSound && editedParams ? (
                  <>
                    {/* Basic Parameters */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Basic Parameters</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Frequency: {Math.round(editedParams.frequency)}Hz
                          </label>
                          <input
                            type="range"
                            min="100"
                            max="2000"
                            value={editedParams.frequency}
                            onChange={(e) => updateParam('frequency', Number(e.target.value))}
                            className="w-full accent-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Duration: {Math.round(editedParams.duration * 1000)}ms
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.01"
                            value={editedParams.duration}
                            onChange={(e) => updateParam('duration', Number(e.target.value))}
                            className="w-full accent-primary-500"
                          />
                        </div>
                        
                        {editedParams.waveform && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">Waveform</label>
                            <select
                              value={editedParams.waveform}
                              onChange={(e) => updateParam('waveform', e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100 text-sm"
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
                    {currentSound.type === 'tone' && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-300">ADSR Envelope</h3>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">
                              Attack: {(editedParams.attack * 1000).toFixed(0)}ms
                            </label>
                            <input
                              type="range"
                              min="0.001"
                              max="0.1"
                              step="0.001"
                              value={editedParams.attack || 0.01}
                              onChange={(e) => updateParam('attack', Number(e.target.value))}
                              className="w-full accent-primary-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">
                              Decay: {(editedParams.decay * 1000).toFixed(0)}ms
                            </label>
                            <input
                              type="range"
                              min="0.001"
                              max="0.2"
                              step="0.001"
                              value={editedParams.decay || 0.05}
                              onChange={(e) => updateParam('decay', Number(e.target.value))}
                              className="w-full accent-primary-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">
                              Sustain: {(editedParams.sustain * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={editedParams.sustain || 0.5}
                              onChange={(e) => updateParam('sustain', Number(e.target.value))}
                              className="w-full accent-primary-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-2">
                              Release: {(editedParams.release * 1000).toFixed(0)}ms
                            </label>
                            <input
                              type="range"
                              min="0.001"
                              max="0.5"
                              step="0.001"
                              value={editedParams.release || 0.1}
                              onChange={(e) => updateParam('release', Number(e.target.value))}
                              className="w-full accent-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Effects */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Effects</h3>
                      
                      <div className="space-y-2">
                        {editedParams.effects && Object.entries(editedParams.effects).map(([effect, enabled]) => (
                          <label key={effect} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(enabled)}
                              onChange={(e) => updateEffect(effect, e.target.checked)}
                              className="w-4 h-4 accent-primary-500"
                            />
                            <span className="capitalize text-gray-300">{effect}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    Select or create a sound to see parameters
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}