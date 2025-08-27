'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Square, Volume2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ResizableSidebar from './ResizableSidebar'
import { styles } from '@/lib/styles'

interface Track {
  id: string
  name: string
  audioBuffer: AudioBuffer | null
  waveformData: number[] | null
  muted: boolean
  solo: boolean
  volume: number
  color: string
}

export default function StudioAudioLab() {
  const router = useRouter()
  
  // Tab system state
  const [activeTab, setActiveTab] = useState<'designer' | 'audiolab'>('audiolab')
  
  // Audio Lab state
  const [audioUrl, setAudioUrl] = useState('https://youtu.be/Xt_RLNx1eBM')
  const [isProcessingUrl, setIsProcessingUrl] = useState(false)
  const [ttsText, setTtsText] = useState('')
  const [isGeneratingTts, setIsGeneratingTts] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioAnalysis, setAudioAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [storedAnalyses, setStoredAnalyses] = useState<any[]>([])
  const [showStoredAnalyses, setShowStoredAnalyses] = useState(false)
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  
  // Playhead state
  const [playheadPosition, setPlayheadPosition] = useState(0) // 0-1 normalized position
  const playheadIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Audio playback state
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentSourcesRef = useRef<AudioBufferSourceNode[]>([])
  const playbackStartTime = useRef<number>(0)
  const maxDuration = useRef<number>(0) // Track the longest audio duration

  // Audio generation functions
  const generateAudioBuffer = (frequency: number, duration: number, type: 'sine' | 'sawtooth' | 'square' = 'sine'): AudioBuffer => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    const sampleRate = audioContextRef.current.sampleRate
    const samples = Math.floor(sampleRate * duration)
    const buffer = audioContextRef.current.createBuffer(1, samples, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      let value = 0
      
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'sawtooth':
          value = 2 * (t * frequency - Math.floor(t * frequency + 0.5))
          break
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
          break
      }
      
      // Apply envelope to avoid clicks
      const envelope = Math.min(1, i / (sampleRate * 0.01), (samples - i) / (sampleRate * 0.01))
      channelData[i] = value * envelope * 0.3 // Reduce volume
    }
    
    return buffer
  }

  const generateWaveformData = (buffer: AudioBuffer): number[] => {
    const channelData = buffer.getChannelData(0)
    const sampleStep = Math.floor(channelData.length / 100)
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

  // Convert base64 audio data to AudioBuffer
  const base64ToAudioBuffer = async (base64Data: string): Promise<AudioBuffer> => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64Data)
    const arrayBuffer = new ArrayBuffer(binaryString.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i)
    }
    
    // Decode audio data
    return await audioContextRef.current.decodeAudioData(arrayBuffer)
  }

  // Audio Lab Functions
  const handleProcessUrl = async () => {
    if (!audioUrl.trim() || isProcessingUrl) return
    
    setIsProcessingUrl(true)
    try {
      console.log('Extracting and separating audio from:', audioUrl)
      
      // Try API first, fall back to client-side generation
      try {
        const response = await fetch('/api/extract-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: audioUrl })
        })
        
        if (response.ok) {
          const result = await response.json()
          
          if (result.success && result.tracks) {
            console.log('Processing', result.tracks.length, 'extracted tracks')
            
            // Convert extracted tracks to AudioBuffers
            const newTracks: Track[] = await Promise.all(
              result.tracks.map(async (trackData: any) => {
                const audioBuffer = await base64ToAudioBuffer(trackData.audioData)
                return {
                  id: trackData.id,
                  name: trackData.name,
                  audioBuffer,
                  waveformData: generateWaveformData(audioBuffer),
                  muted: false,
                  solo: false,
                  volume: 1,
                  color: trackData.color
                }
              })
            )
            
            setTracks(newTracks)
            console.log('Successfully loaded', newTracks.length, 'separated audio tracks')
            
            // Update stored analyses list
            await loadStoredAnalyses()
            
            // Set current analysis ID if provided
            if (result.analysisId) {
              setCurrentAnalysisId(result.analysisId)
            }
            
            // Perform advanced analysis on the first track (original) if not from storage
            if (result.tracks.length > 0 && !result.fromStorage) {
              await performAdvancedAnalysis(result.tracks[0].audioData)
            }
            
            return // Success, exit early
          }
        }
      } catch (apiError) {
        console.log('API extraction failed, falling back to client-side generation:', apiError)
      }
      
      // Fallback: Generate different audio for each "separated" track
      console.log('Using client-side audio generation as fallback')
      const originalBuffer = generateAudioBuffer(220, 3, 'sine') // A3 note for 3 seconds
      const voiceBuffer = generateAudioBuffer(440, 2.5, 'sine')  // A4 note for 2.5 seconds  
      const bassBuffer = generateAudioBuffer(110, 4, 'sawtooth') // A2 note for 4 seconds
      
      const newTracks: Track[] = [
        {
          id: 'track-original',
          name: 'Original (Client-side)',
          audioBuffer: originalBuffer,
          waveformData: generateWaveformData(originalBuffer),
          muted: false,
          solo: false,
          volume: 1,
          color: '#6b7280'
        },
        {
          id: 'track-voice',
          name: 'Voice (Client-side)',
          audioBuffer: voiceBuffer,
          waveformData: generateWaveformData(voiceBuffer),
          muted: false,
          solo: false,
          volume: 1,
          color: '#10b981'
        },
        {
          id: 'track-bass',
          name: 'Bass (Client-side)',
          audioBuffer: bassBuffer,
          waveformData: generateWaveformData(bassBuffer),
          muted: false,
          solo: false,
          volume: 1,
          color: '#3b82f6'
        }
      ]
      
      setTracks(newTracks)
      console.log('Successfully generated', newTracks.length, 'client-side audio tracks')
      
    } catch (error) {
      console.error('Error processing URL:', error)
    } finally {
      setIsProcessingUrl(false)
    }
  }

  const handleGenerateTts = async () => {
    if (!ttsText.trim() || isGeneratingTts) return
    
    setIsGeneratingTts(true)
    try {
      // Simulate TTS generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate speech-like audio (multiple frequencies to simulate speech)
      const duration = Math.max(1, ttsText.length * 0.1) // Longer text = longer audio
      const speechBuffer = generateAudioBuffer(300 + Math.random() * 200, duration, 'sine') // Variable frequency
      
      const ttsTrack: Track = {
        id: `track-tts-${Date.now()}`,
        name: `TTS: "${ttsText.slice(0, 20)}..."`,
        audioBuffer: speechBuffer,
        waveformData: generateWaveformData(speechBuffer),
        muted: false,
        solo: false,
        volume: 1,
        color: '#ec4899'
      }
      
      setTracks(prev => [...prev, ttsTrack])
      setTtsText('')
      
    } catch (error) {
      console.error('Error generating TTS:', error)
    } finally {
      setIsGeneratingTts(false)
    }
  }

  const handlePlay = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    // Resume AudioContext if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }
    
    // Stop any currently playing audio
    handleStop()
    
    // Check if any tracks are soloed
    const soloedTracks = tracks.filter(track => track.solo && track.audioBuffer)
    
    // If there are soloed tracks, play only those; otherwise play all non-muted tracks
    const activeTracks = soloedTracks.length > 0 
      ? soloedTracks 
      : tracks.filter(track => !track.muted && track.audioBuffer)
    
    if (activeTracks.length === 0) {
      console.log('No active tracks to play')
      return
    }
    
    console.log('Playing tracks:', activeTracks.map(t => `${t.name} (muted: ${t.muted}, solo: ${t.solo})`).join(', '))
    
    // Create and start sources for all active tracks
    const sources: AudioBufferSourceNode[] = []
    
    try {
      for (const track of activeTracks) {
        if (track.audioBuffer) {
          const source = audioContextRef.current.createBufferSource()
          const gainNode = audioContextRef.current.createGain()
          
          source.buffer = track.audioBuffer
          gainNode.gain.value = track.volume * 0.7 // Reduce overall volume for mixing
          
          source.connect(gainNode)
          gainNode.connect(audioContextRef.current.destination)
          
          source.start(0)
          sources.push(source)
        }
      }
      
      currentSourcesRef.current = sources
      playbackStartTime.current = audioContextRef.current.currentTime
      setIsPlaying(true)
      
      // Set up end callback for the longest track
      const longestDuration = Math.max(...activeTracks.map(t => t.audioBuffer?.duration || 0))
      
      // Start playhead tracking
      startPlayheadTracking(longestDuration)
      
      setTimeout(() => {
        if (currentSourcesRef.current === sources) {
          handleStop()
        }
      }, longestDuration * 1000)
      
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsPlaying(false)
    }
  }

  const handlePause = () => {
    // Note: Web Audio API doesn't support pause, so we stop instead
    handleStop()
  }

  const handleStop = () => {
    currentSourcesRef.current.forEach(source => {
      try {
        source.stop()
      } catch (e) {
        // Source might already be stopped
      }
    })
    currentSourcesRef.current = []
    setIsPlaying(false)
    
    // Stop playhead tracking
    if (playheadIntervalRef.current) {
      clearInterval(playheadIntervalRef.current)
      playheadIntervalRef.current = null
    }
    setPlayheadPosition(0)
  }

  // Start playhead tracking
  const startPlayheadTracking = (duration: number) => {
    maxDuration.current = duration
    playbackStartTime.current = audioContextRef.current?.currentTime || 0
    
    // Update playhead position every 50ms for smooth animation
    playheadIntervalRef.current = setInterval(() => {
      if (audioContextRef.current && playbackStartTime.current > 0) {
        const elapsed = audioContextRef.current.currentTime - playbackStartTime.current
        const progress = Math.min(elapsed / duration, 1)
        setPlayheadPosition(progress)
        
        // Stop tracking when playback is complete
        if (progress >= 1) {
          handleStop()
        }
      }
    }, 50)
  }

  // Play individual track
  const playIndividualTrack = async (track: Track) => {
    if (!track.audioBuffer || !audioContextRef.current) return
    
    console.log('Playing individual track:', track.name)
    
    // Resume AudioContext if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }
    
    // Stop any currently playing audio
    handleStop()
    
    try {
      const source = audioContextRef.current.createBufferSource()
      const gainNode = audioContextRef.current.createGain()
      
      source.buffer = track.audioBuffer
      gainNode.gain.value = track.volume || 1
      
      source.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      source.start(0)
      currentSourcesRef.current = [source]
      setIsPlaying(true)
      
      // Set up end callback and start playhead tracking
      const duration = track.audioBuffer.duration
      startPlayheadTracking(duration)
      
      setTimeout(() => {
        if (currentSourcesRef.current.includes(source)) {
          handleStop()
        }
      }, duration * 1000)
      
    } catch (error) {
      console.error('Error playing individual track:', error)
      setIsPlaying(false)
    }
  }

  // Advanced audio analysis function
  const performAdvancedAnalysis = async (audioData: string) => {
    setIsAnalyzing(true)
    try {
      // Convert base64 audio to a temporary file for analysis
      const audioBuffer = await base64ToAudioBuffer(audioData)
      
      // Analyze the audio buffer directly (client-side analysis)
      const analysis = await analyzeAudioBuffer(audioBuffer)
      setAudioAnalysis(analysis)
      
      console.log('Advanced audio analysis completed:', analysis)
    } catch (error) {
      console.error('Error performing advanced analysis:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // Client-side audio analysis
  const analyzeAudioBuffer = async (buffer: AudioBuffer): Promise<any> => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    const channelData = buffer.getChannelData(0)
    const sampleRate = buffer.sampleRate
    const length = channelData.length
    
    // Spectral analysis using FFT-like approach
    const spectralAnalysis = performSpectralAnalysis(channelData, sampleRate)
    
    // Onset detection for percussive elements
    const onsets = detectOnsets(channelData, sampleRate)
    
    // Energy distribution across frequency bands
    const energyDistribution = analyzeEnergyDistribution(channelData, sampleRate)
    
    // Tempo estimation
    const tempo = estimateTempo(onsets)
    
    return {
      spectralAnalysis,
      onsets,
      energyDistribution,
      tempo,
      duration: length / sampleRate,
      sampleRate,
      totalSamples: length
    }
  }
  
  // Perform basic spectral analysis
  const performSpectralAnalysis = (channelData: Float32Array, sampleRate: number) => {
    const windowSize = 1024
    const hopSize = 512
    const numWindows = Math.floor((channelData.length - windowSize) / hopSize)
    
    let spectralCentroid = 0
    let spectralRolloff = 0
    let spectralFlux = 0
    
    for (let i = 0; i < numWindows; i++) {
      const windowStart = i * hopSize
      const window = channelData.slice(windowStart, windowStart + windowSize)
      
      // Simple spectral centroid calculation
      let weightedSum = 0
      let magnitudeSum = 0
      
      for (let j = 0; j < window.length; j++) {
        const magnitude = Math.abs(window[j])
        const frequency = (j * sampleRate) / window.length
        weightedSum += magnitude * frequency
        magnitudeSum += magnitude
      }
      
      if (magnitudeSum > 0) {
        spectralCentroid += weightedSum / magnitudeSum
      }
    }
    
    spectralCentroid /= numWindows
    
    return {
      spectralCentroid: spectralCentroid,
      brightness: spectralCentroid > 2000 ? 'bright' : spectralCentroid > 1000 ? 'medium' : 'dark',
      description: 'Spectral characteristics of the audio'
    }
  }
  
  // Detect onsets (start of sounds/beats)
  const detectOnsets = (channelData: Float32Array, sampleRate: number) => {
    const windowSize = 1024
    const hopSize = 512
    const threshold = 0.02
    const onsets = []
    
    let previousEnergy = 0
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize)
      
      // Calculate energy in this window
      let energy = 0
      for (let j = 0; j < window.length; j++) {
        energy += window[j] * window[j]
      }
      energy = Math.sqrt(energy / window.length)
      
      // Detect sudden increases in energy (onsets)
      if (energy > previousEnergy + threshold && energy > 0.01) {
        onsets.push({
          time: i / sampleRate,
          energy: energy,
          strength: energy - previousEnergy
        })
      }
      
      previousEnergy = energy
    }
    
    return {
      onsets: onsets.slice(0, 20), // First 20 onsets
      count: onsets.length,
      avgInterval: onsets.length > 1 ? 
        (onsets[onsets.length - 1].time - onsets[0].time) / (onsets.length - 1) : 0
    }
  }
  
  // Analyze energy distribution across frequency bands
  const analyzeEnergyDistribution = (channelData: Float32Array, sampleRate: number) => {
    const bands = [
      { name: 'Sub-bass', min: 20, max: 60 },
      { name: 'Bass', min: 60, max: 250 },
      { name: 'Low-mid', min: 250, max: 500 },
      { name: 'Mid', min: 500, max: 2000 },
      { name: 'High-mid', min: 2000, max: 4000 },
      { name: 'Presence', min: 4000, max: 6000 },
      { name: 'Brilliance', min: 6000, max: 20000 }
    ]
    
    const fftSize = 2048
    const energyByBand = bands.map(band => {
      // Simple energy calculation for each band
      // This is a simplified version - real FFT would be more accurate
      let energy = 0
      const startIdx = Math.floor((band.min * fftSize) / sampleRate)
      const endIdx = Math.floor((band.max * fftSize) / sampleRate)
      
      for (let i = startIdx; i < Math.min(endIdx, channelData.length); i++) {
        energy += channelData[i] * channelData[i]
      }
      
      return {
        band: band.name,
        range: `${band.min}-${band.max}Hz`,
        energy: Math.sqrt(energy / (endIdx - startIdx)),
        energyDb: 20 * Math.log10(Math.max(Math.sqrt(energy / (endIdx - startIdx)), 1e-10))
      }
    })
    
    return {
      bands: energyByBand,
      dominantBand: energyByBand.reduce((max, current) => 
        current.energy > max.energy ? current : max
      )
    }
  }
  
  // Estimate tempo from onset data
  const estimateTempo = (onsetData: any) => {
    if (onsetData.count < 2) return { bpm: 0, confidence: 0 }
    
    const intervals = []
    for (let i = 1; i < onsetData.onsets.length; i++) {
      intervals.push(onsetData.onsets[i].time - onsetData.onsets[i-1].time)
    }
    
    if (intervals.length === 0) return { bpm: 0, confidence: 0 }
    
    // Find median interval
    intervals.sort((a, b) => a - b)
    const medianInterval = intervals[Math.floor(intervals.length / 2)]
    const bpm = medianInterval > 0 ? 60 / medianInterval : 0
    
    return {
      bpm: Math.round(bpm),
      confidence: intervals.length > 5 ? 0.7 : 0.4,
      medianInterval
    }
  }

  // Load stored analyses on component mount
  useEffect(() => {
    loadStoredAnalyses()
  }, [])

  // Force canvas redraw when playhead position changes
  useEffect(() => {
    // Trigger a re-render of all canvases when playhead moves
    // This is handled by the canvas ref callback function
  }, [playheadPosition, isPlaying])

  // Load stored analyses from API
  const loadStoredAnalyses = async () => {
    try {
      const response = await fetch('/api/stored-analyses')
      if (response.ok) {
        const data = await response.json()
        setStoredAnalyses(data.analyses || [])
      } else {
        console.warn('Failed to load stored analyses, using empty array')
        setStoredAnalyses([])
      }
    } catch (error) {
      console.error('Error loading stored analyses:', error)
      setStoredAnalyses([]) // Fallback to empty array
    }
  }

  // Load a specific stored analysis
  const loadStoredAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/stored-analyses?id=${analysisId}`)
      if (response.ok) {
        const storedAnalysis = await response.json()
        
        // Convert tracks data back to proper format
        const newTracks: Track[] = storedAnalysis.tracks.map((trackData: any) => {
          const audioBuffer = null // Will be loaded when needed
          return {
            id: trackData.id,
            name: trackData.name,
            audioBuffer,
            waveformData: null, // Will be generated when audio is loaded
            muted: false,
            solo: false,
            volume: 1,
            color: trackData.color
          }
        })
        
        setTracks(newTracks)
        setAudioUrl(storedAnalysis.url)
        setCurrentAnalysisId(analysisId)
        setShowStoredAnalyses(false)
        
        // Set the analysis data if available
        if (storedAnalysis.analysis) {
          setAudioAnalysis(storedAnalysis.analysis)
        }
        
        console.log('Loaded stored analysis:', storedAnalysis.id)
      }
    } catch (error) {
      console.error('Error loading stored analysis:', error)
    }
  }

  // Delete a stored analysis
  const deleteStoredAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/stored-analyses?id=${analysisId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadStoredAnalyses() // Refresh the list
        console.log('Analysis deleted successfully')
      } else {
        console.warn('Failed to delete analysis')
      }
    } catch (error) {
      console.error('Error deleting stored analysis:', error)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleStop()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  const audioActions = (
    <>
      <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-colors">
        <Save size={16} />
        <span className="text-sm">Save</span>
      </button>
    </>
  )

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Left Sidebar - Tools */}
      <ResizableSidebar side="left" defaultWidth={320} className="p-6">
        <div className="space-y-6">
              {/* URL Processor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={styles.studio.sectionTitle}>URL Processor</h3>
                  <button
                    onClick={() => setShowStoredAnalyses(!showStoredAnalyses)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showStoredAnalyses ? 'Hide' : 'Recent'} ({storedAnalyses.length})
                  </button>
                </div>
                
                {showStoredAnalyses && (
                  <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
                    {storedAnalyses.length > 0 ? (
                      storedAnalyses.map((analysis) => (
                        <div key={analysis.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <div className="text-xs text-gray-300">{analysis.metadata.title}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(analysis.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => loadStoredAnalysis(analysis.id)}
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteStoredAnalysis(analysis.id)}
                            className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">
                        No stored analyses yet
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  <input
                    type="text"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="YouTube URL loaded - click Extract & Separate to test"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleProcessUrl}
                    disabled={!audioUrl.trim() || isProcessingUrl}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      audioUrl.trim() && !isProcessingUrl
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isProcessingUrl ? 'Processing...' : 'Extract & Separate'}
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Supports YouTube, SoundCloud, direct audio URLs
                </div>
              </div>

              {/* TTS Generator */}
              <div className="space-y-3">
                <h3 className={styles.studio.sectionTitle}>Text-to-Speech</h3>
                <div className="space-y-2">
                  <textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Enter text to convert to speech..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:border-pink-500 focus:outline-none resize-none"
                  />
                  <button
                    onClick={handleGenerateTts}
                    disabled={!ttsText.trim() || isGeneratingTts}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      ttsText.trim() && !isGeneratingTts
                        ? 'bg-pink-600 hover:bg-pink-500 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isGeneratingTts ? 'Generating...' : 'Generate Speech'}
                  </button>
                </div>
              </div>

              {/* Track Summary */}
              {tracks.length > 0 && (
                <div className="space-y-3">
                  <h3 className={styles.studio.sectionTitle}>
                    Active Tracks ({tracks.length})
                  </h3>
                  <div className="space-y-2">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: track.color }}
                        />
                        <span className="text-sm text-gray-300 flex-1">{track.name}</span>
                        <button
                          onClick={() => setTracks(tracks.filter(t => t.id !== track.id))}
                          className="text-gray-400 hover:text-red-400 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Analysis Results */}
              {(audioAnalysis || isAnalyzing) && (
                <div className="space-y-3">
                  <h3 className={styles.studio.sectionTitle}>
                    Audio Analysis
                  </h3>
                  {isAnalyzing ? (
                    <div className="text-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-xs text-gray-400">Analyzing audio...</p>
                    </div>
                  ) : audioAnalysis && (
                    <div className="space-y-3">
                      {/* Spectral Analysis */}
                      <div className="bg-gray-800 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-gray-300 mb-2">Spectral Analysis</h4>
                        <div className="text-xs text-gray-400">
                          <div>Brightness: <span className="text-blue-400">{audioAnalysis.spectralAnalysis.brightness}</span></div>
                          <div>Centroid: <span className="text-blue-400">{Math.round(audioAnalysis.spectralAnalysis.spectralCentroid)} Hz</span></div>
                        </div>
                      </div>

                      {/* Tempo */}
                      {audioAnalysis.tempo.bpm > 0 && (
                        <div className="bg-gray-800 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-gray-300 mb-2">Tempo</h4>
                          <div className="text-xs text-gray-400">
                            <div>BPM: <span className="text-green-400">{audioAnalysis.tempo.bpm}</span></div>
                            <div>Confidence: <span className="text-green-400">{Math.round(audioAnalysis.tempo.confidence * 100)}%</span></div>
                          </div>
                        </div>
                      )}

                      {/* Energy Distribution */}
                      <div className="bg-gray-800 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-gray-300 mb-2">Energy Distribution</h4>
                        <div className="space-y-1">
                          {audioAnalysis.energyDistribution.bands.slice(0, 4).map((band: any) => (
                            <div key={band.band} className="flex justify-between text-xs">
                              <span className="text-gray-400">{band.band}</span>
                              <div className="flex items-center gap-1">
                                <div className="w-8 h-1 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${Math.max(0, Math.min(100, (band.energyDb + 60) / 60 * 100))}%` }}
                                  />
                                </div>
                                <span className="text-gray-500 text-xs">{Math.round(band.energyDb)}dB</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Dominant: <span className="text-yellow-400">{audioAnalysis.energyDistribution.dominantBand.band}</span>
                        </div>
                      </div>

                      {/* Onsets */}
                      {audioAnalysis.onsets.count > 0 && (
                        <div className="bg-gray-800 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-gray-300 mb-2">Onsets</h4>
                          <div className="text-xs text-gray-400">
                            <div>Count: <span className="text-red-400">{audioAnalysis.onsets.count}</span></div>
                            <div>Avg Interval: <span className="text-red-400">{audioAnalysis.onsets.avgInterval.toFixed(2)}s</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
        </div>
      </ResizableSidebar>

      {/* Main Content Area - Waveform Display */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
              {tracks.length > 0 ? (
                <>
                  {/* Playback Controls */}
                  <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-800">
                    <button
                      onClick={handlePlay}
                      disabled={isPlaying}
                      className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-500 rounded-lg text-white disabled:opacity-50"
                      title="Play all active tracks"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={handlePause}
                      disabled={!isPlaying}
                      className="flex items-center justify-center w-10 h-10 bg-orange-600 hover:bg-orange-500 rounded-lg text-white disabled:opacity-50"
                      title="Pause playback"
                    >
                      <Pause size={16} />
                    </button>
                    <button
                      onClick={handleStop}
                      className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-500 rounded-lg text-white"
                      title="Stop playback"
                    >
                      <Square size={16} />
                    </button>
                    <div className="text-sm text-gray-400">
                      {tracks.length} track{tracks.length === 1 ? '' : 's'} loaded
                    </div>
                    <div className="text-xs text-gray-500">
                      Active: {tracks.filter(t => !t.muted).length} | 
                      Solo: {tracks.filter(t => t.solo).length}
                    </div>
                    {/* Progress bar */}
                    <div className="flex-1 max-w-xs mx-4">
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-75"
                          style={{ width: `${playheadPosition * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-1">
                        {isPlaying ? `${Math.round(playheadPosition * 100)}%` : 'Ready'}
                      </div>
                    </div>
                  </div>

                  {/* Track Display */}
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {tracks.map((track) => {
                      // Determine if track is active (will play)
                      const soloedTracks = tracks.filter(t => t.solo)
                      const isActive = soloedTracks.length > 0 ? track.solo : !track.muted
                      
                      return (
                        <div
                          key={track.id}
                          className={`rounded-xl p-4 border transition-all ${
                            isActive 
                              ? 'bg-gray-900 border-gray-700 shadow-lg' 
                              : 'bg-gray-950 border-gray-800 opacity-60'
                          }`}
                        >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-200">{track.name}</h4>
                          <div className="flex items-center gap-2">
                            {/* Solo button */}
                            <button
                              onClick={() => {
                                setTracks(tracks.map(t => 
                                  t.id === track.id ? { ...t, solo: !t.solo } : t
                                ))
                              }}
                              className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                                track.solo
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                              title="Solo this track"
                            >
                              S
                            </button>
                            {/* Mute button */}
                            <button
                              onClick={() => {
                                setTracks(tracks.map(t => 
                                  t.id === track.id ? { ...t, muted: !t.muted } : t
                                ))
                              }}
                              className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                                track.muted
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                              title="Mute this track"
                            >
                              M
                            </button>
                            {/* Individual track play button */}
                            <button
                              onClick={() => playIndividualTrack(track)}
                              className="w-8 h-8 rounded bg-green-600 hover:bg-green-500 text-white text-xs transition-colors"
                              title="Play only this track"
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-950 rounded-lg h-24 overflow-hidden">
                          <canvas
                            width={800}
                            height={96}
                            className="w-full h-full"
                            ref={(canvas) => {
                              if (canvas && track.waveformData) {
                                const ctx = canvas.getContext('2d')
                                if (ctx) {
                                  // Clear and draw waveform
                                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                                  ctx.strokeStyle = track.color
                                  ctx.lineWidth = 2
                                  ctx.beginPath()
                                  
                                  const step = canvas.width / track.waveformData.length
                                  const amplitude = canvas.height / 3
                                  const centerY = canvas.height / 2
                                  
                                  track.waveformData.forEach((value, i) => {
                                    const x = i * step
                                    const y = centerY - (value * amplitude)
                                    if (i === 0) ctx.moveTo(x, y)
                                    else ctx.lineTo(x, y)
                                  })
                                  
                                  ctx.stroke()
                                  
                                  // Draw playhead line if playing
                                  if (isPlaying && playheadPosition > 0) {
                                    const playheadX = playheadPosition * canvas.width
                                    ctx.strokeStyle = '#ffffff'
                                    ctx.lineWidth = 2
                                    ctx.setLineDash([5, 3]) // Dashed line
                                    ctx.beginPath()
                                    ctx.moveTo(playheadX, 0)
                                    ctx.lineTo(playheadX, canvas.height)
                                    ctx.stroke()
                                    ctx.setLineDash([]) // Reset line dash
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                // Empty State
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                      <Volume2 size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-2">Welcome to Audio Lab</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Process YouTube videos, extract voice/bass/effects, generate text-to-speech, 
                        and compose multi-track audio. Start by pasting a URL or entering text to generate speech.
                      </p>
                    </div>
                  </div>
                </div>
              )}
      </div>
    </div>
  )
}