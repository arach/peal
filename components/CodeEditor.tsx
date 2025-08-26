'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Code2, Play, RefreshCw, AlertCircle, GitBranch } from 'lucide-react'
import { Sound } from '@/store/soundStore'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  currentSound: Sound | null
  onSoundChange?: (sound: Sound) => void
  tracks?: Array<{
    id: string
    name: string
    muted: boolean
    solo: boolean
    volume: number
  }>
}

interface CodeVersion {
  timestamp: number
  code: string
  source: 'user' | 'studio'
  soundId: string
  description?: string
}

export default function CodeEditor({ currentSound, onSoundChange, tracks }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [forceRefresh, setForceRefresh] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editorValue, setEditorValue] = useState('')
  const [isUserEditing, setIsUserEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [studioHasChanged, setStudioHasChanged] = useState(false)
  const [showVersionControl, setShowVersionControl] = useState(false)
  
  // Version control state
  const [versions, setVersions] = useState<CodeVersion[]>([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const editorRef = useRef<any>(null)
  const lastStudioCode = useRef<string>('')
  const lastUserCode = useRef<string>('')

  const generateMultiTrackCode = (mainSound: Sound, tracks: any[]) => {
    const soloTracks = tracks.filter(t => t.solo)
    const playableTracks = soloTracks.length > 0 ? soloTracks : tracks.filter(t => !t.muted)
    
    // Check if the first track is the main track
    const hasMainTrack = tracks.length > 0 && tracks[0].name === 'Main'
    const additionalTracks = hasMainTrack ? tracks.slice(1) : tracks
    
    return `// Multi-Track Composition - ${mainSound.id}
// Main Sound: ${mainSound.type} (${mainSound.frequency}Hz)
// Total Tracks: ${tracks.length}
// Generated at: ${new Date().toLocaleTimeString()}

export function playComposition(masterVolume = 0.5) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const masterGain = audioContext.createGain()
  masterGain.connect(audioContext.destination)
  masterGain.gain.setValueAtTime(masterVolume, audioContext.currentTime)

${tracks.map((track, index) => {
  const isMuted = track.muted
  const isSolo = track.solo
  const shouldPlay = !isMuted && (soloTracks.length === 0 || isSolo)
  
  return `
  // Track ${index + 1}: ${track.name}
  // Status: ${isMuted ? 'MUTED' : isSolo ? 'SOLO' : 'ACTIVE'}
  // Volume: ${track.volume}
  ${shouldPlay ? `
  const track${index}Osc = audioContext.createOscillator()
  const track${index}Gain = audioContext.createGain()
  track${index}Osc.connect(track${index}Gain)
  track${index}Gain.connect(masterGain)
  
  // Positioned at: ${(track.startPosition || 0) * 100}% - ${(track.endPosition || 1) * 100}%
  const track${index}StartTime = audioContext.currentTime + ${(track.startPosition || 0) * (mainSound.parameters.duration || 0.5)}
  const track${index}Duration = ${((track.endPosition || 1) - (track.startPosition || 0)) * (mainSound.parameters.duration || 0.5)}
  
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

  const generateSoundCode = (sound: Sound) => {
    if (!sound) return ''
    
    console.log('Generating code for sound:', sound.id, 'params:', sound.parameters)
    console.log('Tracks available:', tracks)
    
    // If we have multiple tracks, show the multi-track composition
    if (tracks && tracks.length > 0) {
      return generateMultiTrackCode(sound, tracks)
    }
    
    // Single sound code generation
    const params = sound.parameters
    const hasEffects = params.effects && Object.values(params.effects).some(v => v)

    return `// ${sound.type.charAt(0).toUpperCase() + sound.type.slice(1)} Sound - ${sound.id}
// Single Track Mode
// Generated at: ${new Date().toLocaleTimeString()}

export function play${sound.type.replace(/\s+/g, '')}Sound(volume = ${params.volume || 0.5}) {
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

  const code = currentSound ? generateSoundCode(currentSound) : ''

  // Add version when code changes from studio
  const addVersion = (newCode: string, source: 'user' | 'studio', description?: string) => {
    if (!currentSound) return
    
    const newVersion: CodeVersion = {
      timestamp: Date.now(),
      code: newCode,
      source,
      soundId: currentSound.id,
      description
    }
    
    setVersions(prev => [...prev, newVersion])
    setCurrentVersionIndex(prev => prev + 1)
  }

  // Track studio changes
  useEffect(() => {
    if (!isUserEditing && code !== lastStudioCode.current) {
      const oldCode = lastStudioCode.current
      lastStudioCode.current = code
      
      // Check if this is a significant change
      const isSignificantChange = 
        oldCode && (
          // Track count changed
          (oldCode.match(/Track \d+:/g) || []).length !== (code.match(/Track \d+:/g) || []).length ||
          // Frequency changed significantly
          Math.abs((parseFloat(oldCode.match(/frequency\.setValueAtTime\((\d+)/)?.[1] || '0')) - 
                   (parseFloat(code.match(/frequency\.setValueAtTime\((\d+)/)?.[1] || '0'))) > 50 ||
          // Waveform changed
          oldCode.match(/type = '(\w+)'/)?.[1] !== code.match(/type = '(\w+)'/)?.[1]
        )
      
      // If user has made changes, notify them of studio updates
      if (hasUnsavedChanges) {
        setStudioHasChanged(true)
      } else {
        // Auto-update if no user changes
        setEditorValue(code)
        // Only add version for significant changes
        if (isSignificantChange) {
          addVersion(code, 'studio', 'Studio parameters updated')
        }
      }
    }
  }, [code, isUserEditing, hasUnsavedChanges])

  // Handle editor changes
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value)
      setIsUserEditing(true)
      const hasChanges = value !== lastStudioCode.current
      setHasUnsavedChanges(hasChanges)
      
      if (hasChanges && value !== lastUserCode.current) {
        lastUserCode.current = value
        // Only create version after significant edits (debounced to 5 seconds)
        if (versions.length === 0 || Date.now() - versions[versions.length - 1].timestamp > 5000) {
          // Check if the change is significant enough
          const significantEdit = 
            Math.abs(value.length - lastStudioCode.current.length) > 50 || // Major length change
            value.split('\n').length !== lastStudioCode.current.split('\n').length // Line count changed
          
          if (significantEdit) {
            addVersion(value, 'user', 'Code edited')
          }
        }
      }
    }
  }

  const mergeWithStudioChanges = () => {
    // In a real implementation, this could do a 3-way merge
    // For now, we'll let user choose
    const userChoice = confirm('Studio has changed. Keep your edits (OK) or use studio version (Cancel)?')
    
    if (userChoice) {
      // Keep user edits
      setStudioHasChanged(false)
    } else {
      // Use studio version
      setEditorValue(code)
      setHasUnsavedChanges(false)
      setIsUserEditing(false)
      setStudioHasChanged(false)
      lastStudioCode.current = code
      addVersion(code, 'studio', 'Reverted to studio version')
    }
  }

  const switchToVersion = (index: number) => {
    const version = versions[index]
    if (version && currentSound && onSoundChange) {
      setEditorValue(version.code)
      setCurrentVersionIndex(index)
      setHasUnsavedChanges(version.code !== lastStudioCode.current)
      lastUserCode.current = version.code
      
      // Extract parameters from the version and trigger regeneration
      const versionParams = extractSoundParams(version.code)
      const updatedSound: Sound = {
        ...currentSound,
        parameters: {
          ...currentSound.parameters,
          ...versionParams
        },
        frequency: versionParams.frequency || currentSound.frequency,
        duration: versionParams.duration ? Math.round(versionParams.duration * 1000) : currentSound.duration
      }
      
      // Trigger full regeneration for this version
      onSoundChange(updatedSound)
      console.log('Switched to version', index, '- triggering full regeneration:', updatedSound)
    }
  }

  const copyToClipboard = async () => {
    try {
      const currentCode = editorRef.current?.getValue() || code
      await navigator.clipboard.writeText(currentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const extractSoundParams = (code: string): Partial<Sound['parameters']> => {
    const params: any = {}
    
    // Extract frequency values - look for the first oscillator frequency
    const freqMatches = code.matchAll(/frequency\.setValueAtTime\((\d+(?:\.\d+)?)/g)
    const frequencies = Array.from(freqMatches).map(m => parseFloat(m[1]))
    if (frequencies.length > 0) {
      params.frequency = frequencies[0]
    }
    
    // Extract duration
    const durationMatch = code.match(/const duration = ([\d.]+)/)
    if (durationMatch) {
      params.duration = parseFloat(durationMatch[1])
    }
    
    // Extract waveform type - look for oscillator.type
    const waveformMatch = code.match(/oscillator\.type = '(sine|square|sawtooth|triangle)'/)
    if (waveformMatch) {
      params.waveform = waveformMatch[1] as any
    }
    
    // Extract volume from function parameter
    const volumeMatch = code.match(/volume = ([\d.]+)/)
    if (volumeMatch) {
      params.volume = parseFloat(volumeMatch[1])
    }
    
    // Extract envelope parameters
    const attackMatch = code.match(/const attack = ([\d.]+)/)
    if (attackMatch) params.attack = parseFloat(attackMatch[1])
    
    const decayMatch = code.match(/const decay = ([\d.]+)/)
    if (decayMatch) params.decay = parseFloat(decayMatch[1])
    
    const sustainMatch = code.match(/const sustain = ([\d.]+)/)
    if (sustainMatch) params.sustain = parseFloat(sustainMatch[1])
    
    const releaseMatch = code.match(/const release = ([\d.]+)/)
    if (releaseMatch) params.release = parseFloat(releaseMatch[1])
    
    // Extract effects parameters
    const filterMatch = code.match(/filter\.frequency\.setValueAtTime\((\d+(?:\.\d+)?)/)
    if (filterMatch) {
      params.filterFrequency = parseFloat(filterMatch[1])
      if (!params.effects) params.effects = {}
      params.effects.filter = true
    }
    
    const filterQMatch = code.match(/filter\.Q\.setValueAtTime\((\d+(?:\.\d+)?)/)
    if (filterQMatch) {
      params.filterQ = parseFloat(filterQMatch[1])
    }
    
    const delayTimeMatch = code.match(/delay\.delayTime\.setValueAtTime\(([\d.]+)/)
    if (delayTimeMatch) {
      params.delayTime = parseFloat(delayTimeMatch[1])
      if (!params.effects) params.effects = {}
      params.effects.delay = true
    }
    
    const delayFeedbackMatch = code.match(/delayGain\.gain\.setValueAtTime\(([\d.]+)/)
    if (delayFeedbackMatch) {
      params.delayFeedback = parseFloat(delayFeedbackMatch[1])
    }
    
    const distortionMatch = code.match(/makeDistortionCurve\((\d+(?:\.\d+)?)/)
    if (distortionMatch) {
      params.distortionAmount = parseFloat(distortionMatch[1])
      if (!params.effects) params.effects = {}
      params.effects.distortion = true
    }
    
    return params
  }

  const handleRunCode = async () => {
    if (!currentSound || !onSoundChange) return
    
    try {
      const currentCode = editorRef.current?.getValue() || ''
      
      // Initialize audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      // Extract parameters from edited code
      const newParams = extractSoundParams(currentCode)
      
      // Update sound with new parameters
      const updatedSound: Sound = {
        ...currentSound,
        parameters: {
          ...currentSound.parameters,
          ...newParams
        },
        frequency: newParams.frequency || currentSound.frequency,
        duration: newParams.duration ? Math.round(newParams.duration * 1000) : currentSound.duration
      }
      
      // Notify parent component to trigger full regeneration
      onSoundChange(updatedSound)
      setIsUserEditing(false) // Exit editing mode after applying changes
      lastStudioCode.current = currentCode
      setHasUnsavedChanges(false)
      setStudioHasChanged(false)
      addVersion(currentCode, 'user', 'Applied code changes')
      
      console.log('Code changes applied to Studio - triggering full regeneration:', updatedSound)
    } catch (error) {
      console.error('Error applying code changes:', error)
      alert('Error applying code changes. Check the console for details.')
    }
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode()
    })
    
    // Track when user starts editing
    editor.onDidFocusEditorText(() => {
      setIsUserEditing(true)
    })
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="font-medium text-gray-100">Code Editor</span>
            <p className="text-xs text-gray-400">Live Web Audio API implementation</p>
          </div>
        </div>
        
        {currentSound && (
          <div className="flex items-center gap-1">
            {/* Status indicators */}
            {(studioHasChanged || hasUnsavedChanges) && (
              <div className="flex items-center gap-2 mr-2">
                {studioHasChanged && (
                  <button
                    onClick={mergeWithStudioChanges}
                    className="p-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors animate-pulse"
                    title="Studio parameters have changed - click to manage"
                  >
                    <AlertCircle size={14} />
                  </button>
                )}
                {hasUnsavedChanges && (
                  <span className="text-xs text-yellow-400">•</span>
                )}
              </div>
            )}
            
            {/* Compact button group */}
            <div className="flex items-center bg-gray-700 rounded-lg">
              <button
                onClick={() => setShowVersionControl(!showVersionControl)}
                className={`p-1.5 ${showVersionControl ? 'bg-purple-600' : 'hover:bg-gray-600'} text-white rounded-l-lg transition-colors`}
                title={`Version history (${versions.length})`}
              >
                <GitBranch size={14} />
              </button>
              <div className="w-px h-6 bg-gray-600" />
              <button
                onClick={() => {
                  console.log('Refresh clicked. Current sound:', currentSound)
                  console.log('Current params:', currentSound?.parameters)
                  console.log('Tracks:', tracks)
                  setIsRefreshing(true)
                  setIsUserEditing(false) // Stop editing mode
                  setForceRefresh(prev => prev + 1)
                  setEditorValue(code)
                  setHasUnsavedChanges(false)
                  setStudioHasChanged(false)
                  lastStudioCode.current = code
                  // Don't add version for refresh
                  setTimeout(() => setIsRefreshing(false), 500)
                }}
                className="p-1.5 hover:bg-gray-600 text-white transition-colors"
                title="Sync with Studio state"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <div className="w-px h-6 bg-gray-600" />
              <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-gray-600 text-white rounded-r-lg transition-colors"
                title="Copy code"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            
            {/* Primary action */}
            <button
              onClick={handleRunCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ml-2"
              title="Apply code changes to Studio (⌘+Enter)"
            >
              <Check size={14} />
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Version Control Panel */}
      {showVersionControl && versions.length > 0 && (
        <div className="bg-gray-800 border-b border-gray-700 p-3 max-h-48 overflow-y-auto">
          <div className="space-y-1">
            {versions.map((version, index) => (
              <div
                key={version.timestamp}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  index === currentVersionIndex ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                }`}
                onClick={() => switchToVersion(index)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${version.source === 'user' ? 'bg-blue-400' : 'bg-green-400'}`} />
                  <span className="text-xs text-gray-300">
                    {version.description || `${version.source} change`}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(version.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Content */}
      <div className="flex-1 overflow-hidden">
        {currentSound ? (
          <div className="h-full bg-gray-900">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <span className="text-xs text-gray-400 font-mono">{currentSound.type}-sound.js</span>
              </div>
              <span className="text-xs text-gray-500">
                {currentSound.frequency}Hz • {currentSound.duration}ms • Tracks: {tracks?.length || 0}
              </span>
            </div>
            <div className="h-full">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={editorValue}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
                  wordWrap: 'off',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  readOnly: false,
                  domReadOnly: false,
                  cursorStyle: 'line',
                  selectOnLineNumbers: true,
                  renderWhitespace: 'none',
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  scrollbar: {
                    horizontal: 'auto',
                    vertical: 'auto',
                    horizontalScrollbarSize: 10,
                    verticalScrollbarSize: 10
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-sm">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Code Editor
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Load or generate a sound to see the live Web Audio API implementation here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}