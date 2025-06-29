import { premiumUIPresets } from './premiumUIPresets'

// Cache for loaded audio buffers
const audioBufferCache = new Map<string, AudioBuffer>()

// Play a premium preset sound by ID
export async function playPremiumSound(presetId: string, volume: number = 0.5) {
  const preset = premiumUIPresets.find(p => p.id === presetId)
  if (!preset) {
    console.warn(`Premium preset sound not found: ${presetId}`)
    return
  }

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Check cache first
    let buffer = audioBufferCache.get(preset.audioFile)
    
    if (!buffer) {
      // Load the WAV file
      const response = await fetch(preset.audioFile)
      const arrayBuffer = await response.arrayBuffer()
      buffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // Cache the decoded buffer
      audioBufferCache.set(preset.audioFile, buffer)
    }
    
    // Create source and play
    const source = audioContext.createBufferSource()
    const gainNode = audioContext.createGain()
    
    source.buffer = buffer
    gainNode.gain.value = volume
    
    // Connect nodes
    source.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Play the sound
    source.start(0)
    
    // Clean up after playback
    source.onended = () => {
      source.disconnect()
      gainNode.disconnect()
    }
    
  } catch (error) {
    console.error('Error playing premium sound:', error)
  }
}

// Preload sounds for better performance
export async function preloadPremiumSounds(presetIds?: string[]) {
  const presetsToLoad = presetIds 
    ? premiumUIPresets.filter(p => presetIds.includes(p.id))
    : premiumUIPresets
    
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  
  const loadPromises = presetsToLoad.map(async (preset) => {
    try {
      if (!audioBufferCache.has(preset.audioFile)) {
        const response = await fetch(preset.audioFile)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await audioContext.decodeAudioData(arrayBuffer)
        audioBufferCache.set(preset.audioFile, buffer)
      }
    } catch (error) {
      console.error(`Failed to preload ${preset.id}:`, error)
    }
  })
  
  await Promise.all(loadPromises)
}

// Compare modern vs futuristic sounds
export async function playComparisonPair(soundType: 'tap' | 'click' | 'success' | 'error', volume: number = 0.5) {
  const modernId = `modern-${soundType}`
  const futuristicId = `futuristic-${soundType}`
  
  // Play modern sound first
  await playPremiumSound(modernId, volume)
  
  // Wait a bit, then play futuristic
  setTimeout(() => {
    playPremiumSound(futuristicId, volume)
  }, 1000)
}

// Play a sequence of sounds for demo
export async function playPremiumSoundDemo() {
  const demoSequence = [
    { id: 'modern-tap', delay: 0 },
    { id: 'modern-click', delay: 500 },
    { id: 'modern-notification', delay: 1000 },
    { id: 'modern-success', delay: 1500 },
    { id: 'modern-transition', delay: 2500 },
    { id: 'modern-message', delay: 3000 },
  ]
  
  for (const { id, delay } of demoSequence) {
    setTimeout(() => playPremiumSound(id, 0.4), delay)
  }
}