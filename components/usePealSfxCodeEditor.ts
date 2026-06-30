'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Sound } from '@/store/soundStore'

export interface PealSfxCodeEditorTrack {
  id: string
  name: string
  muted: boolean
  solo: boolean
  volume: number
  startPosition?: number
  endPosition?: number
}

interface UsePealSfxCodeEditorOptions {
  currentSound: Sound | null
  tracks?: PealSfxCodeEditorTrack[]
  onSoundChange?: (sound: Sound) => void | Promise<void>
}

interface CodeVersion {
  timestamp: number
  code: string
  source: 'user' | 'studio'
  soundId: string
  description?: string
}

function generateMultiTrackCode(mainSound: Sound, tracks: PealSfxCodeEditorTrack[]) {
  const soloTracks = tracks.filter((track) => track.solo)
  const playableTracks = soloTracks.length > 0 ? soloTracks : tracks.filter((track) => !track.muted)
  const generatedAt = new Date().toLocaleTimeString()

  return `// Multi-Track Composition - ${mainSound.id}
// Main Sound: ${mainSound.type} (${mainSound.frequency}Hz)
// Total Tracks: ${tracks.length}
// Generated at: ${generatedAt}

export function playComposition(masterVolume = 0.5) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const masterGain = audioContext.createGain()
  masterGain.connect(audioContext.destination)
  masterGain.gain.setValueAtTime(masterVolume, audioContext.currentTime)

${tracks.map((track, index) => {
  const isMuted = track.muted
  const isSolo = track.solo
  const shouldPlay = !isMuted && (soloTracks.length === 0 || isSolo)
  const startPosition = track.startPosition ?? 0
  const endPosition = track.endPosition ?? 1

  return `
  // Track ${index + 1}: ${track.name}
  // Status: ${isMuted ? 'MUTED' : isSolo ? 'SOLO' : 'ACTIVE'}
  // Volume: ${track.volume}
  ${shouldPlay ? `
  const track${index}Osc = audioContext.createOscillator()
  const track${index}Gain = audioContext.createGain()
  track${index}Osc.connect(track${index}Gain)
  track${index}Gain.connect(masterGain)
  
  // Positioned at: ${startPosition * 100}% - ${endPosition * 100}%
  const track${index}StartTime = audioContext.currentTime + ${startPosition * (mainSound.parameters.duration || 0.5)}
  const track${index}Duration = ${(endPosition - startPosition) * (mainSound.parameters.duration || 0.5)}
  
  track${index}Osc.frequency.setValueAtTime(${track.name === 'Main' ? mainSound.frequency : mainSound.frequency + (index * 100)}, track${index}StartTime)
  track${index}Osc.type = '${track.name === 'Main' ? (mainSound.parameters.waveform || 'sine') : 'sine'}'
  track${index}Gain.gain.setValueAtTime(${track.volume}, track${index}StartTime)
  
  track${index}Osc.start(track${index}StartTime)
  track${index}Osc.stop(track${index}StartTime + track${index}Duration)` : `
  // Track is ${isMuted ? 'muted' : 'not playing (solo mode active)'}`}`
}).join('')}
  
  console.log('Playing composition with ${playableTracks.length} active tracks')
}`
}

function generateSoundCode(sound: Sound, tracks: PealSfxCodeEditorTrack[] = []) {
  if (tracks.length > 0) {
    return generateMultiTrackCode(sound, tracks)
  }

  const params = sound.parameters
  const hasEffects = params.effects && Object.values(params.effects).some(Boolean)
  const functionName = `play${sound.type.replace(/\s+/g, '')}Sound`
  const generatedAt = new Date().toLocaleTimeString()

  return `// ${sound.type.charAt(0).toUpperCase() + sound.type.slice(1)} Sound - ${sound.id}
// Single Track Mode
// Generated at: ${generatedAt}

export function ${functionName}(volume = ${params.volume || 0.5}) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  // Create oscillator
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  ${hasEffects ? `
  // Effects chain
  let lastNode = oscillator` : ''}
  ${params.effects?.filter ? `
  // Filter
  const filter = audioContext.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(${params.filterFrequency || 1000}, audioContext.currentTime)
  filter.Q.setValueAtTime(${params.filterQ || 1}, audioContext.currentTime)
  lastNode.connect(filter)
  lastNode = filter` : ''}
  ${params.effects?.distortion ? `
  // Distortion
  const distortion = audioContext.createWaveShaper()
  distortion.curve = makeDistortionCurve(${params.distortionAmount || 50})
  lastNode.connect(distortion)
  lastNode = distortion` : ''}
  ${params.effects?.delay ? `
  // Delay
  const delay = audioContext.createDelay()
  const delayGain = audioContext.createGain()
  delay.delayTime.setValueAtTime(${params.delayTime || 0.1}, audioContext.currentTime)
  delayGain.gain.setValueAtTime(${params.delayFeedback || 0.3}, audioContext.currentTime)
  lastNode.connect(delay)
  delay.connect(delayGain)
  delayGain.connect(delay)
  delay.connect(gainNode)` : ''}
  
  ${hasEffects ? 'lastNode.connect(gainNode)' : 'oscillator.connect(gainNode)'}
  gainNode.connect(audioContext.destination)
  
  // Sound parameters
  oscillator.frequency.setValueAtTime(${params.frequency || sound.frequency}, audioContext.currentTime)
  oscillator.type = '${params.waveform || 'sine'}'
  
  // Envelope
  const attack = ${params.attack || 0.01}
  const decay = ${params.decay || 0.1}
  const sustain = ${params.sustain || 0.7}
  const release = ${params.release || 0.1}
  const duration = ${params.duration || 0.5}
  
  // Ensure release doesn't exceed duration
  const sustainTime = Math.max(0.01, duration - attack - decay - release)
  const totalDuration = attack + decay + sustainTime + release
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + attack)
  gainNode.gain.linearRampToValueAtTime(volume * sustain, audioContext.currentTime + attack + decay)
  gainNode.gain.setValueAtTime(volume * sustain, audioContext.currentTime + attack + decay + sustainTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + totalDuration)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + totalDuration)
}${params.effects?.distortion ? `

function makeDistortionCurve(amount) {
  const samples = 44100
  const curve = new Float32Array(samples)
  const deg = Math.PI / 180
  
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
  }
  
  return curve
}` : ''}`
}

function extractSoundParams(code: string): Partial<Sound['parameters']> {
  const params: any = {}

  const freqMatches = code.matchAll(/frequency\.setValueAtTime\((\d+(?:\.\d+)?)/g)
  const frequencies = Array.from(freqMatches).map((match) => parseFloat(match[1]))
  if (frequencies.length > 0) params.frequency = frequencies[0]

  const durationMatch = code.match(/const duration = ([\d.]+)/)
  if (durationMatch) params.duration = parseFloat(durationMatch[1])

  const waveformMatch = code.match(/oscillator\.type = '(sine|square|sawtooth|triangle)'/)
  if (waveformMatch) params.waveform = waveformMatch[1]

  const volumeMatch = code.match(/volume = ([\d.]+)/)
  if (volumeMatch) params.volume = parseFloat(volumeMatch[1])

  const attackMatch = code.match(/const attack = ([\d.]+)/)
  if (attackMatch) params.attack = parseFloat(attackMatch[1])

  const decayMatch = code.match(/const decay = ([\d.]+)/)
  if (decayMatch) params.decay = parseFloat(decayMatch[1])

  const sustainMatch = code.match(/const sustain = ([\d.]+)/)
  if (sustainMatch) params.sustain = parseFloat(sustainMatch[1])

  const releaseMatch = code.match(/const release = ([\d.]+)/)
  if (releaseMatch) params.release = parseFloat(releaseMatch[1])

  const filterMatch = code.match(/filter\.frequency\.setValueAtTime\((\d+(?:\.\d+)?)/)
  if (filterMatch) {
    params.filterFrequency = parseFloat(filterMatch[1])
    params.effects = { ...(params.effects ?? {}), filter: true }
  }

  const filterQMatch = code.match(/filter\.Q\.setValueAtTime\((\d+(?:\.\d+)?)/)
  if (filterQMatch) params.filterQ = parseFloat(filterQMatch[1])

  const delayTimeMatch = code.match(/delay\.delayTime\.setValueAtTime\(([\d.]+)/)
  if (delayTimeMatch) {
    params.delayTime = parseFloat(delayTimeMatch[1])
    params.effects = { ...(params.effects ?? {}), delay: true }
  }

  const delayFeedbackMatch = code.match(/delayGain\.gain\.setValueAtTime\(([\d.]+)/)
  if (delayFeedbackMatch) params.delayFeedback = parseFloat(delayFeedbackMatch[1])

  const distortionMatch = code.match(/makeDistortionCurve\((\d+(?:\.\d+)?)/)
  if (distortionMatch) {
    params.distortionAmount = parseFloat(distortionMatch[1])
    params.effects = { ...(params.effects ?? {}), distortion: true }
  }

  return params
}

export function usePealSfxCodeEditor({
  currentSound,
  tracks = [],
  onSoundChange,
}: UsePealSfxCodeEditorOptions) {
  const generatedCode = useMemo(
    () => (currentSound ? generateSoundCode(currentSound, tracks) : ''),
    [currentSound, tracks],
  )

  const [copied, setCopied] = useState(false)
  const [editorValue, setEditorValue] = useState('')
  const [isUserEditing, setIsUserEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [studioHasChanged, setStudioHasChanged] = useState(false)
  const [showVersionControl, setShowVersionControl] = useState(false)
  const [versions, setVersions] = useState<CodeVersion[]>([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastStudioCode = useRef('')
  const lastUserCode = useRef('')
  const suppressNextEditorChange = useRef<string | null>(null)
  const versionsRef = useRef<CodeVersion[]>([])

  useEffect(() => {
    versionsRef.current = versions
  }, [versions])

  useEffect(() => {
    lastStudioCode.current = ''
    lastUserCode.current = ''
    setVersions([])
    setCurrentVersionIndex(-1)
    setStudioHasChanged(false)
    setHasUnsavedChanges(false)
    setIsUserEditing(false)
  }, [currentSound?.id])

  const addVersion = useCallback((newCode: string, source: CodeVersion['source'], description?: string) => {
    if (!currentSound) return

    const newVersion: CodeVersion = {
      timestamp: Date.now(),
      code: newCode,
      source,
      soundId: currentSound.id,
      description,
    }

    setVersions((previous) => {
      const next = [...previous, newVersion]
      setCurrentVersionIndex(next.length - 1)
      return next
    })
  }, [currentSound])

  const setEditorValueFromStudio = useCallback((nextCode: string) => {
    suppressNextEditorChange.current = nextCode
    setEditorValue(nextCode)
  }, [])

  useEffect(() => {
    if (!currentSound) {
      lastStudioCode.current = ''
      setEditorValueFromStudio('')
      return
    }

    if (isUserEditing && hasUnsavedChanges) {
      if (generatedCode !== lastStudioCode.current) {
        lastStudioCode.current = generatedCode
        setStudioHasChanged(true)
      }
      return
    }

    if (generatedCode !== lastStudioCode.current) {
      const oldCode = lastStudioCode.current
      lastStudioCode.current = generatedCode
      setEditorValueFromStudio(generatedCode)
      setHasUnsavedChanges(false)
      setStudioHasChanged(false)
      setIsUserEditing(false)

      const isSignificantChange = Boolean(oldCode) && (
        (oldCode.match(/Track \d+:/g) || []).length !== (generatedCode.match(/Track \d+:/g) || []).length ||
        Math.abs(
          parseFloat(oldCode.match(/frequency\.setValueAtTime\((\d+)/)?.[1] || '0') -
          parseFloat(generatedCode.match(/frequency\.setValueAtTime\((\d+)/)?.[1] || '0'),
        ) > 50 ||
        oldCode.match(/type = '(\w+)'/)?.[1] !== generatedCode.match(/type = '(\w+)'/)?.[1]
      )

      if (isSignificantChange) {
        addVersion(generatedCode, 'studio', 'Studio parameters updated')
      }
    }
  }, [addVersion, currentSound, generatedCode, hasUnsavedChanges, isUserEditing, setEditorValueFromStudio])

  const handleEditorChange = useCallback((value: string) => {
    if (suppressNextEditorChange.current === value) {
      suppressNextEditorChange.current = null
      return
    }

    setEditorValue(value)
    setIsUserEditing(true)
    setError(null)

    const hasChanges = value !== lastStudioCode.current
    setHasUnsavedChanges(hasChanges)

    if (hasChanges && value !== lastUserCode.current) {
      lastUserCode.current = value
      const previousVersions = versionsRef.current
      const latestVersion = previousVersions[previousVersions.length - 1]
      const significantEdit =
        Math.abs(value.length - lastStudioCode.current.length) > 50 ||
        value.split('\n').length !== lastStudioCode.current.split('\n').length

      if (significantEdit && (!latestVersion || Date.now() - latestVersion.timestamp > 5000)) {
        addVersion(value, 'user', 'Code edited')
      }
    }
  }, [addVersion])

  const syncWithStudio = useCallback((description?: string) => {
    setEditorValueFromStudio(generatedCode)
    setHasUnsavedChanges(false)
    setIsUserEditing(false)
    setStudioHasChanged(false)
    setError(null)
    lastStudioCode.current = generatedCode
    if (description) addVersion(generatedCode, 'studio', description)
  }, [addVersion, generatedCode, setEditorValueFromStudio])

  const mergeWithStudioChanges = useCallback(() => {
    const keepUserEdits = window.confirm('Studio parameters changed. Keep your edits (OK) or use studio version (Cancel)?')

    if (keepUserEdits) {
      setStudioHasChanged(false)
      return
    }

    syncWithStudio('Reverted to studio version')
  }, [syncWithStudio])

  const refreshFromStudio = useCallback(() => {
    setIsRefreshing(true)
    syncWithStudio()
    window.setTimeout(() => setIsRefreshing(false), 500)
  }, [syncWithStudio])

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editorValue || generatedCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (copyError) {
      console.error('Failed to copy Web Audio code:', copyError)
      setError('Copy failed')
    }
  }, [editorValue, generatedCode])

  const applyCode = useCallback(async (content = editorValue) => {
    if (!currentSound || !onSoundChange) return

    setIsApplying(true)
    setError(null)

    try {
      const newParams = extractSoundParams(content)
      const updatedSound: Sound = {
        ...currentSound,
        parameters: {
          ...currentSound.parameters,
          ...newParams,
        },
        frequency: newParams.frequency || currentSound.frequency,
        duration: newParams.duration ? Math.round(newParams.duration * 1000) : currentSound.duration,
      }

      await onSoundChange(updatedSound)
      lastStudioCode.current = content
      setEditorValueFromStudio(content)
      setIsUserEditing(false)
      setHasUnsavedChanges(false)
      setStudioHasChanged(false)
      addVersion(content, 'user', 'Applied code changes')
    } catch (applyError) {
      console.error('Error applying code changes:', applyError)
      setError('Apply failed')
    } finally {
      setIsApplying(false)
    }
  }, [addVersion, currentSound, editorValue, onSoundChange, setEditorValueFromStudio])

  const switchToVersion = useCallback(async (index: number) => {
    const version = versionsRef.current[index]
    if (!version || !currentSound || !onSoundChange) return

    setEditorValue(version.code)
    setCurrentVersionIndex(index)
    setHasUnsavedChanges(version.code !== lastStudioCode.current)
    lastUserCode.current = version.code

    try {
      const versionParams = extractSoundParams(version.code)
      const updatedSound: Sound = {
        ...currentSound,
        parameters: {
          ...currentSound.parameters,
          ...versionParams,
        },
        frequency: versionParams.frequency || currentSound.frequency,
        duration: versionParams.duration ? Math.round(versionParams.duration * 1000) : currentSound.duration,
      }

      await onSoundChange(updatedSound)
    } catch (versionError) {
      console.error('Error switching code version:', versionError)
      setError('Version restore failed')
    }
  }, [currentSound, onSoundChange])

  return {
    editorValue,
    filename: currentSound ? `${currentSound.type}-sound.js` : 'web-audio.js',
    copied,
    isRefreshing,
    isApplying,
    error,
    hasUnsavedChanges,
    studioHasChanged,
    showVersionControl,
    versions,
    currentVersionIndex,
    setShowVersionControl,
    handleEditorChange,
    applyCode,
    copyToClipboard,
    refreshFromStudio,
    mergeWithStudioChanges,
    switchToVersion,
  }
}
