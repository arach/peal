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
  const [insertMode, setInsertMode] = useState(false)
  const [trimMode, setTrimMode] = useState(false)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(1)
  const [editStart, setEditStart] = useState(0.3)
  const [editEnd, setEditEnd] = useState(0.7)
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'region' | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  
  // Track system state
  interface Track {
    id: string
    name: string
    audioBuffer: AudioBuffer | null
    waveformData: number[] | null
    muted: boolean
    solo: boolean
    volume: number
    color: string
    startPosition?: number // Position in the timeline (0-1)
    endPosition?: number   // End position in the timeline (0-1)
  }
  
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [showTracks, setShowTracks] = useState(false)
  
  // Vibe Designer state
  const [vibePrompt, setVibePrompt] = useState('')
  const [vibeSuggestions, setVibeSuggestions] = useState<string[]>([])
  const [isVibeGenerating, setIsVibeGenerating] = useState(false)
  const [vibeGeneratedSounds, setVibeGeneratedSounds] = useState<Sound[]>([])
  
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const timelineCanvasRef = useRef<HTMLCanvasElement>(null)
  const currentSource = useRef<AudioBufferSourceNode | null>(null)
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
        setHasUnappliedChanges(false)
        setPreviewSound(null)
        
        // Create main track for the loaded sound
        const mainTrack: Track = {
          id: `track-main-${sound.id}`,
          name: 'Main',
          audioBuffer: sound.audioBuffer,
          waveformData: sound.waveformData,
          muted: false,
          solo: false,
          volume: 1,
          color: '#6b7280' // Gray for main track
        }
        setTracks([mainTrack])
        
        // Generate buffer for main track if it doesn't exist
        if (!sound.audioBuffer) {
          console.log('Generating buffer for main track...')
          setTimeout(async () => {
            await (generator as any).renderSound(sound)
            console.log('Main track buffer generated:', !!sound.audioBuffer)
            // Update the main track with the generated buffer
            setTracks(prevTracks => {
              const updated = prevTracks.map(t => 
                t.id === mainTrack.id 
                  ? { ...t, audioBuffer: sound.audioBuffer, waveformData: sound.waveformData }
                  : t
              )
              console.log('Updated main track with buffer')
              return updated
            })
          }, 100)
        }
      }
    }
  }, [searchParams, sounds, generator])

  // Draw main waveform (clean, no trim overlays)
  const drawWaveform = (canvas: HTMLCanvasElement | null, waveformData: number[] | null, isPreview = false) => {
    if (!canvas || !waveformData) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // If in edit mode, highlight the edit region
    if (editMode && !isPreview) {
      const editStartX = editStart * width
      const editEndX = editEnd * width
      
      // Dim non-edit regions
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fillRect(0, 0, editStartX, height)
      ctx.fillRect(editEndX, 0, width - editEndX, height)
      
      // Highlight edit region
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.fillRect(editStartX, 0, editEndX - editStartX, height)
      
      // Draw edit boundaries
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      ctx.beginPath()
      ctx.moveTo(editStartX, 0)
      ctx.lineTo(editStartX, height)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(editEndX, 0)
      ctx.lineTo(editEndX, height)
      ctx.stroke()
      
      ctx.setLineDash([])
    }
    
    // If in insert mode, highlight the insert region
    if (insertMode && !isPreview) {
      const editStartX = editStart * width
      const editEndX = editEnd * width
      
      // Dim non-insert regions
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fillRect(0, 0, editStartX, height)
      ctx.fillRect(editEndX, 0, width - editEndX, height)
      
      // Highlight insert region with purple
      ctx.fillStyle = 'rgba(147, 51, 234, 0.1)'
      ctx.fillRect(editStartX, 0, editEndX - editStartX, height)
      
      // Draw insert boundaries
      ctx.strokeStyle = '#9333ea'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      ctx.beginPath()
      ctx.moveTo(editStartX, 0)
      ctx.lineTo(editStartX, height)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(editEndX, 0)
      ctx.lineTo(editEndX, height)
      ctx.stroke()
      
      ctx.setLineDash([])
    }
    
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
    
    // Draw playhead on waveform
    if (playbackPosition > 0 && playbackPosition <= 1) {
      const playheadX = playbackPosition * width
      
      // Draw playhead line
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, height)
      ctx.stroke()
    }
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
    
    // Overlay: Insert mode
    if (insertMode) {
      const editStartX = editStart * width
      const editEndX = editEnd * width
      
      // Focus area background with purple
      ctx.fillStyle = 'rgba(147, 51, 234, 0.2)'
      ctx.fillRect(editStartX, 0, editEndX - editStartX, height)
      
      // Focus area border
      ctx.strokeStyle = '#9333ea'
      ctx.lineWidth = 2
      ctx.strokeRect(editStartX, 0, editEndX - editStartX, height)
      
      // Draw insert handles
      ctx.fillStyle = '#9333ea'
      
      // Start handle
      ctx.fillRect(editStartX - 4, 0, 8, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(editStartX - 2, height/4, 4, height/2)
      
      // End handle  
      ctx.fillStyle = '#9333ea'
      ctx.fillRect(editEndX - 4, 0, 8, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(editEndX - 2, height/4, 4, height/2)
      
      // Add plus icon in center to indicate insertion
      const centerX = (editStartX + editEndX) / 2
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      
      // Draw plus sign
      const plusSize = 8
      ctx.beginPath()
      ctx.moveTo(centerX - plusSize/2, height/2)
      ctx.lineTo(centerX + plusSize/2, height/2)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(centerX, height/2 - plusSize/2)
      ctx.lineTo(centerX, height/2 + plusSize/2)
      ctx.stroke()
    }
    
    // Draw time markers
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
    ctx.font = '10px sans-serif'
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      const timeMs = currentSound ? (i / 10) * currentSound.duration : 0
      ctx.fillText(`${timeMs.toFixed(0)}ms`, x + 2, height - 2)
    }
    
    // Draw playhead
    if (playbackPosition > 0 && playbackPosition <= 1) {
      const playheadX = playbackPosition * width
      
      // Draw playhead line
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, height)
      ctx.stroke()
      
      // Draw playhead triangle at top
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(playheadX - 6, 0)
      ctx.lineTo(playheadX + 6, 0)
      ctx.lineTo(playheadX, 10)
      ctx.closePath()
      ctx.fill()
    }
  }

  // Draw main waveform when sound, preview, or edit mode changes
  useEffect(() => {
    // If a track is selected and we're in edit mode, show the track's waveform
    if (selectedTrackId && (editMode || insertMode)) {
      const selectedTrack = tracks.find(t => t.id === selectedTrackId)
      if (selectedTrack?.waveformData) {
        drawWaveform(waveformCanvasRef.current, selectedTrack.waveformData, false)
        return
      }
    }
    
    // Otherwise show the main sound or preview
    const soundToDisplay = previewSound || currentSound
    if (soundToDisplay?.waveformData) {
      drawWaveform(waveformCanvasRef.current, soundToDisplay.waveformData, !!previewSound)
    }
  }, [currentSound?.waveformData, previewSound?.waveformData, editMode, insertMode, editStart, editEnd, playbackPosition, selectedTrackId, tracks])

  // Draw timeline when sound, selection values, or mode changes
  useEffect(() => {
    const soundToDisplay = previewSound || currentSound
    if (soundToDisplay?.waveformData) {
      drawTimeline(timelineCanvasRef.current, soundToDisplay.waveformData)
    }
  }, [currentSound?.waveformData, previewSound?.waveformData, trimStart, trimEnd, editStart, editEnd, editMode, insertMode, trimMode, playbackPosition])

  // Track if parameters have changed since last generation
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false)
  
  // Update playback position during playback
  useEffect(() => {
    if (!isPlaying || isPaused) return
    
    const interval = setInterval(() => {
      const soundToPlay = previewSound || currentSound
      if (!soundToPlay?.audioBuffer) return
      
      const currentTime = Date.now() / 1000
      const elapsed = currentTime - playbackStartTime.current
      const duration = soundToPlay.audioBuffer.duration
      const position = Math.min(elapsed / duration, 1)
      
      setPlaybackPosition(position)
      
      if (position >= 1) {
        clearInterval(interval)
      }
    }, 16) // ~60fps update rate
    
    return () => clearInterval(interval)
  }, [isPlaying, isPaused, currentSound, previewSound])

  const updateParam = (key: string, value: any) => {
    setEditedParams((prev: any) => {
      const newParams = {
        ...prev,
        [key]: value
      }
      return newParams
    })
    setHasUnappliedChanges(true)
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
    setHasUnappliedChanges(true)
  }

  const applyChanges = async () => {
    if (!hasUnappliedChanges || !currentSound || !editedParams) return
    
    if (insertMode) {
      await generateInsertPreview()
    } else if (editMode && selectedTrackId) {
      // If a track is selected, apply changes to that track
      await generateRegionalPreviewForTrack()
    } else if (editMode) {
      await generateRegionalPreview()
    } else {
      await generatePreview()
    }
    setHasUnappliedChanges(false)
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

  const generateRegionalPreviewForTrack = async () => {
    if (isGenerating || !currentSound || !editedParams || !selectedTrackId) return
    
    const track = tracks.find(t => t.id === selectedTrackId)
    if (!track || !track.audioBuffer) return
    
    setIsGenerating(true)
    try {
      // Step 1: Generate a FULL sound with ALL new parameters
      const workingSound: Sound = {
        ...currentSound,
        id: `${currentSound.id}-track-working-${Date.now()}`,
        parameters: editedParams,
        audioBuffer: null,
        waveformData: null
      }

      await (generator as any).renderSound(workingSound)
      
      await new Promise(resolve => setTimeout(resolve, 50))
      
      if (!workingSound.audioBuffer) {
        throw new Error('Failed to generate working buffer')
      }

      // Step 2: Extract the time-based region from the working buffer
      const extractedRegion = await extractTimeRegion(
        workingSound.audioBuffer,
        editStart,
        editEnd,
        currentSound.parameters.duration
      )

      if (!extractedRegion) {
        throw new Error('Failed to extract region from working buffer')
      }

      // Step 3: Paste the extracted region into the track's buffer
      const compositBuffer = await pasteRegionIntoOriginal(
        track.audioBuffer,
        extractedRegion,
        editStart,
        editEnd
      )

      if (!compositBuffer) {
        throw new Error('Failed to create composite buffer')
      }

      // Update the track with the new buffer
      setTracks(tracks.map(t => 
        t.id === selectedTrackId
          ? {
              ...t,
              audioBuffer: compositBuffer,
              waveformData: generateWaveformData(compositBuffer)
            }
          : t
      ))
      
      // Clear preview since we've updated the track directly
      setPreviewSound(null)
    } catch (error) {
      console.error('Error generating track regional preview:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateRegionalPreview = async () => {
    if (isGenerating || !currentSound || !editedParams) return
    
    setIsGenerating(true)
    try {
      // For now, disable regional editing for composite/click sounds with delays
      // These sounds have complex timing that makes regional editing challenging
      if (currentSound.type === 'click' && currentSound.tags.includes('vibe-generated')) {
        console.warn('Regional editing not yet supported for composite click sounds')
        // Fall back to full preview generation
        await generatePreview()
        return
      }

      // Ensure current sound has audio buffer
      if (!currentSound.audioBuffer) {
        console.log('Current sound missing audio buffer, regenerating...')
        await (generator as any).renderSound(currentSound)
        // Give it time to set the buffer
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!currentSound.audioBuffer) {
          console.error('Failed to generate audio buffer for current sound')
          throw new Error('Could not generate audio buffer for current sound')
        }
      }

      // Step 1: Generate a FULL sound with ALL new parameters
      // This is our "working buffer" that might have different duration/characteristics
      const workingSound: Sound = {
        ...currentSound,
        id: `${currentSound.id}-working-${Date.now()}`,
        parameters: editedParams, // Use ALL edited params including duration changes
        audioBuffer: null,
        waveformData: null
      }

      await (generator as any).renderSound(workingSound)
      
      // Wait a moment for the buffer to be set
      await new Promise(resolve => setTimeout(resolve, 50))
      
      if (!workingSound.audioBuffer) {
        console.error('Failed to generate working buffer')
        throw new Error('Failed to generate working buffer')
      }

      // Step 2: Extract the time-based region from the working buffer
      // This handles cases where duration/effects change the waveform timing
      const extractedRegion = await extractTimeRegion(
        workingSound.audioBuffer,
        editStart,
        editEnd,
        currentSound.parameters.duration
      )

      if (!extractedRegion) {
        throw new Error('Failed to extract region from working buffer')
      }

      // Step 3: Paste the extracted region into the original sound
      const compositBuffer = await pasteRegionIntoOriginal(
        currentSound.audioBuffer,
        extractedRegion,
        editStart,
        editEnd
      )

      if (compositBuffer) {
        // Step 4: Create preview sound with the composite audio
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

  const generateInsertPreview = async () => {
    if (isGenerating || !currentSound || !editedParams) return
    
    setIsGenerating(true)
    try {
      // Ensure current sound has audio buffer
      if (!currentSound.audioBuffer) {
        console.log('Current sound missing audio buffer, regenerating...')
        await (generator as any).renderSound(currentSound)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (!currentSound.audioBuffer) {
        throw new Error('Failed to get audio buffer for current sound')
      }

      // Create new sound for the insert region
      const insertSound: Sound = {
        ...currentSound,
        id: `${currentSound.id}-insert-${Date.now()}`,
        parameters: editedParams,
        audioBuffer: null,
        waveformData: null
      }

      // Generate the insert sound
      console.log('Generating insert sound:', insertSound.id, 'type:', insertSound.type)
      await (generator as any).renderSound(insertSound)
      
      if (!insertSound.audioBuffer) {
        throw new Error('Failed to generate insert sound')
      }

      // Create composite buffer with the inserted sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const originalBuffer = currentSound.audioBuffer
      const insertBuffer = insertSound.audioBuffer
      
      // Calculate insertion points
      const insertStartSample = Math.floor(editStart * originalBuffer.length)
      const insertEndSample = Math.floor(editEnd * originalBuffer.length)
      const regionSamples = insertEndSample - insertStartSample
      
      // Create output buffer
      const outputBuffer = audioContext.createBuffer(
        originalBuffer.numberOfChannels,
        originalBuffer.length,
        originalBuffer.sampleRate
      )
      
      // Process each channel
      for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel)
        const insertData = insertBuffer.getChannelData(channel)
        const outputData = outputBuffer.getChannelData(channel)
        
        // Copy original data
        outputData.set(originalData)
        
        // Insert the new sound in the region
        const samplesToInsert = Math.min(insertBuffer.length, regionSamples)
        const crossfadeSamples = Math.min(256, Math.floor(samplesToInsert * 0.05)) // 5% or 256 samples
        
        for (let i = 0; i < samplesToInsert; i++) {
          if (insertStartSample + i < outputBuffer.length) {
            let insertValue = insertData[i] || 0
            let originalValue = originalData[insertStartSample + i] || 0
            
            // Apply crossfade at boundaries
            let mixRatio = 1.0
            if (i < crossfadeSamples) {
              // Fade in
              mixRatio = i / crossfadeSamples
            } else if (i > samplesToInsert - crossfadeSamples) {
              // Fade out
              mixRatio = (samplesToInsert - i) / crossfadeSamples
            }
            
            // Mix insert with original (additive)
            outputData[insertStartSample + i] = originalValue * (1 - mixRatio) + insertValue * mixRatio + originalValue * mixRatio * 0.5
            
            // Prevent clipping
            outputData[insertStartSample + i] = Math.max(-1, Math.min(1, outputData[insertStartSample + i]))
          }
        }
      }
      
      await audioContext.close()
      
      // Create the preview sound
      // Don't create a preview - inserts should only add tracks
      // Clear any existing preview
      setPreviewSound(null)
      
      // Auto-create a track for the inserted sound with position info
      // Use the insertSound's buffer directly, not the composite
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        name: `Insert ${tracks.filter(t => t.name.includes('Insert')).length + 1}`,
        audioBuffer: insertSound.audioBuffer,
        waveformData: insertSound.waveformData,
        muted: false,
        solo: false,
        volume: 1,
        color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][tracks.length % 5],
        startPosition: editStart,
        endPosition: editEnd
      }
      setTracks([...tracks, newTrack])
      setSelectedTrackId(newTrack.id)
      
      // Auto-show tracks panel when creating a new track
      if (!showTracks) {
        setShowTracks(true)
      }
    } catch (error) {
      console.error('Error generating insert preview:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Mix all tracks into a single buffer for playback
  const mixTracks = async (): Promise<AudioBuffer | null> => {
    console.log('mixTracks called, all tracks:', tracks.map(t => ({ name: t.name, muted: t.muted, hasBuffer: !!t.audioBuffer })))
    const activeTracks = tracks.filter(t => t.audioBuffer && !t.muted)
    console.log('Active tracks (not muted with buffer):', activeTracks.length)
    if (activeTracks.length === 0) return null
    
    // Handle solo mode
    const soloTracks = activeTracks.filter(t => t.solo)
    const tracksToMix = soloTracks.length > 0 ? soloTracks : activeTracks
    console.log('Tracks to mix:', tracksToMix.length, 'solo mode:', soloTracks.length > 0)
    
    if (tracksToMix.length === 0) return null
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const sampleRate = tracksToMix[0].audioBuffer!.sampleRate
    const numberOfChannels = tracksToMix[0].audioBuffer!.numberOfChannels
    
    // Calculate total duration needed based on track positions and durations
    let totalDuration = 0
    for (const track of tracksToMix) {
      const startPos = track.startPosition || 0
      const trackDuration = track.audioBuffer!.length / sampleRate
      const endTime = startPos * (currentSound?.duration || 1000) / 1000 + trackDuration
      totalDuration = Math.max(totalDuration, endTime)
    }
    
    const totalSamples = Math.ceil(totalDuration * sampleRate)
    const mixedBuffer = audioContext.createBuffer(numberOfChannels, totalSamples, sampleRate)
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const mixedData = mixedBuffer.getChannelData(channel)
      
      for (const track of tracksToMix) {
        const trackData = track.audioBuffer!.getChannelData(channel)
        const startPos = track.startPosition || 0
        const startSample = Math.floor(startPos * (currentSound?.duration || 1000) / 1000 * sampleRate)
        
        // Copy track data to the correct position in the mixed buffer
        for (let i = 0; i < trackData.length; i++) {
          if (startSample + i < totalSamples) {
            mixedData[startSample + i] += trackData[i] * track.volume
          }
        }
      }
      
      // Normalize to prevent clipping
      const maxValue = Math.max(...mixedData.map(Math.abs))
      if (maxValue > 1) {
        for (let i = 0; i < mixedData.length; i++) {
          mixedData[i] /= maxValue
        }
      }
    }
    
    await audioContext.close()
    return mixedBuffer
  }

  const handlePlay = async () => {
    let soundToPlay = previewSound || currentSound
    
    // If we have tracks, always use the mixed output (regardless of panel visibility)
    if (tracks.length > 0 && !previewSound) {
      console.log('Mixing tracks:', tracks.length, 'tracks')
      const mixedBuffer = await mixTracks()
      if (mixedBuffer) {
        console.log('Mixed buffer created, duration:', mixedBuffer.duration)
        soundToPlay = {
          ...currentSound!,
          audioBuffer: mixedBuffer,
          waveformData: generateWaveformData(mixedBuffer)
        }
      } else {
        console.log('No mixed buffer returned')
      }
    }
    
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
          
          // Update main track buffer if it was just generated
          if (soundToPlay === currentSound && currentSound.audioBuffer) {
            setTracks(tracks.map(t => 
              t.id === `track-main-${currentSound.id}`
                ? { ...t, audioBuffer: currentSound.audioBuffer, waveformData: currentSound.waveformData }
                : t
            ))
          }
          
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
    if (!editMode && !trimMode && !insertMode) return // Only interact when in edit, trim, or insert mode
    
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
    } else if (editMode || insertMode) {
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
      // Define minimum region width (5% of total duration)
      const MIN_REGION_WIDTH = 0.05
      
      if (isDragging === 'start') {
        const maxStart = trimEnd - MIN_REGION_WIDTH
        setTrimStart(Math.min(normalizedX, maxStart))
      } else if (isDragging === 'end') {
        const minEnd = trimStart + MIN_REGION_WIDTH
        setTrimEnd(Math.max(normalizedX, minEnd))
      } else if (isDragging === 'region') {
        // Drag entire trim region
        const regionWidth = trimEnd - trimStart
        const newStart = Math.max(0, Math.min(1 - regionWidth, normalizedX - dragOffset))
        const newEnd = newStart + regionWidth
        setTrimStart(newStart)
        setTrimEnd(newEnd)
      }
    } else if (editMode || insertMode) {
      // Define minimum region width (5% of total duration)
      const MIN_REGION_WIDTH = 0.05
      
      if (isDragging === 'start') {
        const maxStart = editEnd - MIN_REGION_WIDTH
        setEditStart(Math.min(normalizedX, maxStart))
      } else if (isDragging === 'end') {
        const minEnd = editStart + MIN_REGION_WIDTH
        setEditEnd(Math.max(normalizedX, minEnd))
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

    if (!editMode && !trimMode && !insertMode) {
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
    } else if (editMode || insertMode) {
      const nearStartHandle = Math.abs(normalizedX - editStart) < HANDLE_TOLERANCE
      const nearEndHandle = Math.abs(normalizedX - editEnd) < HANDLE_TOLERANCE
      const insideRegion = normalizedX > editStart + HANDLE_TOLERANCE && normalizedX < editEnd - HANDLE_TOLERANCE
      
      if (nearStartHandle || nearEndHandle) {
        cursor = 'col-resize'
      } else if (insideRegion) {
        cursor = isDragging === 'region' ? 'grabbing' : 'grab'
      }
    } else if (insertMode) {
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


  // Extract a time-based region from a buffer
  const extractTimeRegion = async (
    sourceBuffer: AudioBuffer,
    startRatio: number,
    endRatio: number,
    originalDuration: number
  ): Promise<AudioBuffer | null> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Calculate the TIME boundaries in the original sound
      const startTime = startRatio * originalDuration
      const endTime = endRatio * originalDuration
      const regionDuration = endTime - startTime
      
      // Calculate corresponding sample positions in the source buffer
      // This handles cases where the source might have different duration
      const sourceDuration = sourceBuffer.length / sourceBuffer.sampleRate
      const sourceStartRatio = startTime / sourceDuration
      const sourceEndRatio = endTime / sourceDuration
      
      // Clamp ratios to valid range
      const clampedStartRatio = Math.max(0, Math.min(1, sourceStartRatio))
      const clampedEndRatio = Math.max(0, Math.min(1, sourceEndRatio))
      
      let startSample = Math.floor(clampedStartRatio * sourceBuffer.length)
      let endSample = Math.floor(clampedEndRatio * sourceBuffer.length)
      let sampleCount = endSample - startSample
      
      // Ensure we have at least some samples to extract
      const minSamples = 256 // Minimum reasonable size
      
      // Special case: if the source buffer is smaller than minSamples
      if (sourceBuffer.length < minSamples) {
        console.warn(`Source buffer too small (${sourceBuffer.length} samples), using entire buffer`)
        startSample = 0
        endSample = sourceBuffer.length
        sampleCount = sourceBuffer.length
      } else if (sampleCount < minSamples) {
        console.warn(`Region too small (${sampleCount} samples), using minimum size of ${minSamples}`)
        
        // Try to extend the region to meet minimum size
        const halfMin = Math.floor(minSamples / 2)
        let newStartSample = Math.max(0, startSample - halfMin)
        let newEndSample = Math.min(sourceBuffer.length, newStartSample + minSamples)
        
        // If we hit the end, adjust start
        if (newEndSample - newStartSample < minSamples) {
          newStartSample = Math.max(0, newEndSample - minSamples)
        }
        
        console.log('Adjusted extraction:', {
          original: { startSample, endSample, sampleCount },
          adjusted: { startSample: newStartSample, endSample: newEndSample, sampleCount: newEndSample - newStartSample }
        })
        
        startSample = newStartSample
        endSample = newEndSample
        sampleCount = endSample - startSample
      }
      
      console.log('Extracting time region:', {
        originalTiming: { startTime, endTime, regionDuration },
        sourceMapping: { sourceStartRatio, sourceEndRatio },
        samples: { startSample, endSample, sampleCount }
      })
      
      // Always create a buffer with at least minSamples (will pad with silence if needed)
      const finalSampleCount = Math.max(minSamples, sampleCount)
      
      // Create a buffer containing just the extracted region
      const extractedBuffer = audioContext.createBuffer(
        sourceBuffer.numberOfChannels,
        finalSampleCount,
        sourceBuffer.sampleRate
      )
      
      // Copy the region data
      for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel++) {
        const sourceData = sourceBuffer.getChannelData(channel)
        const extractedData = extractedBuffer.getChannelData(channel)
        
        // Copy the samples from the adjusted region
        for (let i = 0; i < finalSampleCount; i++) {
          if (startSample + i < sourceBuffer.length) {
            extractedData[i] = sourceData[startSample + i]
          } else {
            extractedData[i] = 0 // Pad with silence if we run out of samples
          }
        }
      }
      
      await audioContext.close()
      return extractedBuffer
    } catch (error) {
      console.error('Error extracting time region:', error)
      return null
    }
  }

  // Paste an extracted region into the original sound at the correct position
  const pasteRegionIntoOriginal = async (
    originalBuffer: AudioBuffer,
    extractedRegion: AudioBuffer,
    startRatio: number,
    endRatio: number
  ): Promise<AudioBuffer | null> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Calculate where to paste in the original
      const startSample = Math.floor(startRatio * originalBuffer.length)
      const endSample = Math.floor(endRatio * originalBuffer.length)
      const expectedSampleCount = endSample - startSample
      
      console.log('Pasting region:', {
        originalLength: originalBuffer.length,
        extractedLength: extractedRegion.length,
        pastePosition: { startSample, endSample, expectedSampleCount }
      })
      
      // Create output buffer (copy of original)
      const outputBuffer = audioContext.createBuffer(
        originalBuffer.numberOfChannels,
        originalBuffer.length,
        originalBuffer.sampleRate
      )
      
      // Process each channel
      for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel)
        const extractedData = extractedRegion.getChannelData(channel)
        const outputData = outputBuffer.getChannelData(channel)
        
        // Copy all original data first
        outputData.set(originalData)
        
        // Paste the extracted region with crossfade at boundaries
        const samplesToWrite = Math.min(extractedRegion.length, expectedSampleCount)
        const crossfadeSamples = Math.min(256, Math.floor(samplesToWrite * 0.01)) // 1% or 256 samples
        
        for (let i = 0; i < samplesToWrite; i++) {
          if (startSample + i < outputBuffer.length) {
            let fadeAmount = 1.0
            
            // Fade in at start
            if (i < crossfadeSamples) {
              fadeAmount = i / crossfadeSamples
            }
            // Fade out at end
            else if (i >= samplesToWrite - crossfadeSamples) {
              fadeAmount = (samplesToWrite - i) / crossfadeSamples
            }
            
            // Crossfade between original and extracted
            outputData[startSample + i] = 
              originalData[startSample + i] * (1 - fadeAmount) +
              extractedData[i] * fadeAmount
          }
        }
        
        console.log(`Channel ${channel}: Pasted ${samplesToWrite} samples at position ${startSample} with ${crossfadeSamples}-sample crossfade`)
      }
      
      await audioContext.close()
      return outputBuffer
    } catch (error) {
      console.error('Error pasting region:', error)
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
    setHasUnappliedChanges(false)
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

        {/* Center - Empty for now */}
        <div></div>

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
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Main Waveform */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-300">
                          Waveform {selectedTrackId && (editMode || insertMode) 
                            ? `(${tracks.find(t => t.id === selectedTrackId)?.name || 'Track'})`
                            : previewSound 
                              ? '(Preview)' 
                              : '(Original)'
                          }
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
                    <div className="bg-gray-900 rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900/50">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Timeline</h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditMode(!editMode)
                                if (!editMode) {
                                  setTrimMode(false)
                                  setInsertMode(false)
                                }
                              }}
                              className={`flex items-center gap-0.5 px-2 py-1 text-[10px] font-medium rounded transition-all ${
                                editMode
                                  ? 'bg-blue-500 text-white shadow-sm' 
                                  : 'bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                              }`}
                              title="Modify existing audio in selected region"
                            >
                              <Edit3 size={10} />
                              {editMode ? 'Exit' : 'Edit'}
                            </button>
                            <button
                              onClick={() => {
                                setInsertMode(!insertMode)
                                if (!insertMode) {
                                  setEditMode(false)
                                  setTrimMode(false)
                                }
                              }}
                              className={`flex items-center gap-0.5 px-2 py-1 text-[10px] font-medium rounded transition-all ${
                                insertMode
                                  ? 'bg-purple-500 text-white shadow-sm' 
                                  : 'bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                              }`}
                              title="Insert new sound in selected region"
                            >
                              <Wand2 size={10} />
                              {insertMode ? 'Exit' : 'Insert'}
                            </button>
                            <button
                              onClick={() => {
                                setTrimMode(!trimMode)
                                if (!trimMode) {
                                  setEditMode(false)
                                  setInsertMode(false)
                                }
                              }}
                              className={`flex items-center gap-0.5 px-2 py-1 text-[10px] font-medium rounded transition-all ${
                                trimMode
                                  ? 'bg-yellow-500 text-white shadow-sm' 
                                  : 'bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                              }`}
                              title="Trim audio to keep only selected region"
                            >
                              <Scissors size={10} />
                              {trimMode ? 'Exit' : 'Trim'}
                            </button>
                            
                            <div className="w-px h-3.5 bg-gray-700 mx-1"></div>
                            
                            <button
                              onClick={() => setShowTracks(!showTracks)}
                              className={`flex items-center gap-0.5 px-2 py-1 text-[10px] font-medium rounded transition-all ${
                                showTracks
                                  ? 'bg-gray-600 text-gray-100' 
                                  : 'bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                              }`}
                              title="Show/hide track layers"
                            >
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                                <rect x="0" y="0" width="8" height="1.5" />
                                <rect x="0" y="3" width="8" height="1.5" />
                                <rect x="0" y="6" width="8" height="1.5" />
                              </svg>
                              Tracks
                              {tracks.length > 0 && (
                                <span className="ml-0.5 px-1 bg-gray-600 rounded text-[9px]">
                                  {tracks.length}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Mode-specific info */}
                          {trimMode && (
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>Selection: {Math.round(trimStart * 100)}%-{Math.round(trimEnd * 100)}%</span>
                              <span className="text-gray-600">•</span>
                              <span>{currentSound ? Math.round((trimEnd - trimStart) * currentSound.duration) : 0}ms</span>
                            </div>
                          )}
                          {editMode && (
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>Region: {Math.round(editStart * 100)}%-{Math.round(editEnd * 100)}%</span>
                              {currentSound?.type === 'click' && currentSound?.tags.includes('vibe-generated') ? (
                                <span className="text-yellow-400">Full edit</span>
                              ) : (
                                <span className="text-blue-400">Regional</span>
                              )}
                            </div>
                          )}
                          {insertMode && (
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>Insert: {Math.round(editStart * 100)}%-{Math.round(editEnd * 100)}%</span>
                              <span className="text-purple-400">New sound</span>
                            </div>
                          )}
                          
                          {/* Mode info display */}
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            {trimMode && <span>Trim: {Math.round(trimStart * 100)}%-{Math.round(trimEnd * 100)}%</span>}
                            {editMode && <span>Edit: {Math.round(editStart * 100)}%-{Math.round(editEnd * 100)}%</span>}
                            {insertMode && <span>Insert: {Math.round(editStart * 100)}%-{Math.round(editEnd * 100)}%</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <div className="bg-gray-950 rounded-lg overflow-hidden">
                          <canvas
                            ref={timelineCanvasRef}
                            width={800}
                            height={60}
                            className="w-full h-16"
                            onMouseDown={handleTimelineMouseDown}
                            onMouseMove={isDragging ? handleTimelineMouseMove : handleTimelineMouseHover}
                            onMouseUp={handleTimelineMouseUp}
                            onMouseLeave={handleTimelineMouseUp}
                          />
                        </div>

                        {/* Mode-specific Controls */}
                        {trimMode && (
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-[10px] text-gray-500">
                              Drag handles to select portion to keep
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setTrimStart(0)
                                  setTrimEnd(1)
                                }}
                                className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-gray-300 transition-colors"
                              >
                                Reset
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Apply trim to audio buffer
                                  console.log('Apply trim:', trimStart, trimEnd)
                                }}
                                disabled={trimStart === 0 && trimEnd === 1}
                                className="px-2 py-0.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-[10px] font-medium transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {editMode && (
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-[10px] text-gray-500">
                              Drag handles • Parameters apply to selection only
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditStart(0.3)
                                  setEditEnd(0.7)
                                }}
                                className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-gray-300 transition-colors"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {insertMode && (
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-[10px] text-gray-500">
                              Drag handles • New sound will be inserted
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditStart(0.3)
                                  setEditEnd(0.7)
                                }}
                                className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-gray-300 transition-colors"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {!trimMode && !editMode && !insertMode && (
                          <div className="flex justify-center mt-2">
                            <div className="text-[10px] text-gray-500">
                              Select a mode above to edit your sound
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Central Transport Controls */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={handleStop}
                          disabled={!isPlaying && !isPaused}
                          className="flex items-center justify-center w-14 h-14 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded-full transition-all"
                          title="Stop"
                        >
                          <Square size={20} className="text-gray-300" />
                        </button>
                        
                        {isPlaying ? (
                          <button 
                            onClick={handlePause}
                            className="flex items-center justify-center w-20 h-20 bg-yellow-500 hover:bg-yellow-400 rounded-full shadow-lg transition-all transform hover:scale-105"
                            title="Pause"
                          >
                            <Pause size={32} className="text-white" />
                          </button>
                        ) : (
                          <button 
                            onClick={handlePlay}
                            disabled={!currentSound && !previewSound}
                            className="flex items-center justify-center w-20 h-20 bg-primary-500 hover:bg-primary-400 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
                            title={isPaused ? "Resume" : "Play"}
                          >
                            <Play size={32} className="text-white ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Tracks Panel - Below transport controls */}
                    {showTracks && (
                      <div className="bg-gray-900 rounded-xl border border-gray-800 transition-all duration-300 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900/50">
                        <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Tracks</h4>
                        <button
                          onClick={() => {
                            // Add new empty track
                            const newTrack: Track = {
                              id: `track-${Date.now()}`,
                              name: `Track ${tracks.length + 1}`,
                              audioBuffer: null,
                              waveformData: null,
                              muted: false,
                              solo: false,
                              volume: 1,
                              color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][tracks.length % 5]
                            }
                            setTracks([...tracks, newTrack])
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Add Track
                        </button>
                      </div>
                      
                      {tracks.length === 0 ? (
                        <div className="text-center py-6 px-4 text-gray-500 text-xs">
                          No tracks yet. Insert sounds to create tracks automatically,<br/>
                          or click "Add Track" to create one manually.
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
                          {tracks.map((track, index) => (
                            <div
                              key={track.id}
                              className={`group relative transition-all cursor-pointer ${
                                selectedTrackId === track.id 
                                  ? 'bg-blue-500/10 border-l-2 border-blue-500' 
                                  : 'hover:bg-gray-800/15 border-l-2 border-transparent'
                              }`}
                              onClick={() => setSelectedTrackId(track.id)}
                            >
                              <div className="px-3 py-2">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <div 
                                      className={`w-2 h-2 rounded-full flex-shrink-0 ring-2 ${
                                        selectedTrackId === track.id ? 'ring-blue-500/50' : 'ring-gray-800/50'
                                      }`}
                                      style={{ backgroundColor: track.color }}
                                    />
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <input
                                        type="text"
                                        value={track.name}
                                        onChange={(e) => {
                                          if (track.name !== 'Main') {
                                            setTracks(tracks.map(t => 
                                              t.id === track.id 
                                                ? { ...t, name: e.target.value }
                                                : t
                                            ))
                                          }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`bg-transparent text-xs font-medium outline-none border-b border-transparent transition-colors ${
                                          track.name === 'Main' 
                                            ? 'text-gray-300 cursor-default' 
                                            : 'text-gray-200 hover:border-gray-600 focus:border-blue-500'
                                        } w-full max-w-[100px]`}
                                        readOnly={track.name === 'Main'}
                                      />
                                      {track.name === 'Main' && (
                                        <span className="text-[10px] text-gray-500 font-normal">(Original)</span>
                                      )}
                                      {track.startPosition !== undefined && (
                                        <span className="text-[10px] text-gray-500 font-normal">
                                          @{Math.round(track.startPosition * 100)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setTracks(tracks.map(t => 
                                          t.id === track.id 
                                            ? { ...t, solo: !t.solo }
                                            : { ...t, solo: false }
                                        ))
                                      }}
                                      className={`w-6 h-6 text-[10px] font-semibold rounded transition-all ${
                                        track.solo 
                                          ? 'bg-yellow-500 text-white shadow-sm' 
                                          : 'bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                                      }`}
                                      title={track.solo ? 'Disable Solo - Hear all tracks' : 'Solo - Only hear this track'}
                                    >
                                      S
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setTracks(tracks.map(t => 
                                          t.id === track.id 
                                            ? { ...t, muted: !t.muted }
                                            : t
                                        ))
                                      }}
                                      className={`w-6 h-6 text-[10px] font-semibold rounded transition-all ${
                                        track.muted 
                                          ? 'bg-red-500 text-white shadow-sm' 
                                          : 'bg-gray-700/50 text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                                      }`}
                                      title={track.muted ? 'Unmute - Enable this track' : 'Mute - Silence this track'}
                                    >
                                      M
                                    </button>
                                    {track.name !== 'Main' && (
                                      <div className="w-px h-4 bg-gray-700 mx-0.5" />
                                    )}
                                    {track.name !== 'Main' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (confirm(`Delete "${track.name}"?`)) {
                                            setTracks(tracks.filter(t => t.id !== track.id))
                                            if (selectedTrackId === track.id) {
                                              setSelectedTrackId(null)
                                            }
                                          }
                                        }}
                                        className="w-6 h-6 text-xs bg-gray-700/50 text-gray-400 hover:bg-red-500 hover:text-white rounded transition-all"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </div>
                              
                                {track.audioBuffer && (
                                  <div className="mt-1.5">
                                    <div className="h-6 bg-gray-800/30 rounded overflow-hidden">
                                      {/* Mini waveform preview */}
                                      <canvas
                                        width={300}
                                        height={24}
                                        className={`w-full h-full ${
                                          selectedTrackId === track.id ? 'opacity-80' : 'opacity-50'
                                        }`}
                                        ref={(canvas) => {
                                          if (canvas && track.waveformData) {
                                            const ctx = canvas.getContext('2d')
                                            if (ctx) {
                                              ctx.clearRect(0, 0, canvas.width, canvas.height)
                                              ctx.strokeStyle = selectedTrackId === track.id ? '#3b82f6' : track.color
                                              ctx.lineWidth = selectedTrackId === track.id ? 1 : 0.5
                                              ctx.beginPath()
                                              
                                              const step = canvas.width / track.waveformData.length
                                              const amplitude = canvas.height / 2
                                              
                                              track.waveformData.forEach((value, i) => {
                                                const x = i * step
                                                const y = amplitude - (value * amplitude * 0.7)
                                                if (i === 0) ctx.moveTo(x, y)
                                                else ctx.lineTo(x, y)
                                              })
                                              
                                              ctx.stroke()
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      </div>
                    )}
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
                    <span className={`text-xs px-2 py-1 rounded ${
                      currentSound?.type === 'click' && currentSound?.tags.includes('vibe-generated')
                        ? 'bg-yellow-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {currentSound?.type === 'click' && currentSound?.tags.includes('vibe-generated')
                        ? 'Full Edit Only'
                        : 'Regional Edit'
                      }
                    </span>
                  )}
                  {insertMode && (
                    <span className="text-xs px-2 py-1 rounded bg-purple-600 text-white">
                      Insert Mode
                    </span>
                  )}
                  {insertMode && selectedTrackId && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                      → {tracks.find(t => t.id === selectedTrackId)?.name || 'Track'}
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
                    {/* Apply Changes Button */}
                    {hasUnappliedChanges && (
                      <div className="sticky top-0 z-10 bg-gray-900 -mx-4 px-4 pb-4 pt-2 border-b border-gray-800">
                        <button
                          onClick={applyChanges}
                          disabled={isGenerating}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            isGenerating 
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                          }`}
                        >
                          {isGenerating ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              Applying...
                            </>
                          ) : (
                            <>
                              <Settings size={16} />
                              {insertMode ? 'Insert Sound' : 'Apply Changes'}
                              {(editMode || insertMode) && (
                                <span className="text-xs opacity-90">
                                  ({insertMode ? 'in' : 'to'} {Math.round((editEnd - editStart) * 100)}% region)
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {/* Basic Parameters */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-300">Basic Parameters</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Frequency: {Math.round(editedParams.frequency)}Hz
                            {hasUnappliedChanges && currentSound && editedParams.frequency !== currentSound.parameters.frequency && (
                              <span className="ml-2 text-green-400 text-xs">(modified)</span>
                            )}
                          </label>
                          <input
                            type="range"
                            min="100"
                            max="2000"
                            value={editedParams.frequency}
                            onChange={(e) => updateParam('frequency', Number(e.target.value))}
                            className={`w-full accent-primary-500 ${
                              hasUnappliedChanges && currentSound && editedParams.frequency !== currentSound.parameters.frequency
                                ? 'accent-green-500'
                                : ''
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">
                            Duration: {Math.round(editedParams.duration * 1000)}ms
                            {hasUnappliedChanges && currentSound && editedParams.duration !== currentSound.parameters.duration && (
                              <span className="ml-2 text-green-400 text-xs">(modified)</span>
                            )}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.01"
                            value={editedParams.duration}
                            onChange={(e) => updateParam('duration', Number(e.target.value))}
                            className={`w-full accent-primary-500 ${
                              hasUnappliedChanges && currentSound && editedParams.duration !== currentSound.parameters.duration
                                ? 'accent-green-500'
                                : ''
                            }`}
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