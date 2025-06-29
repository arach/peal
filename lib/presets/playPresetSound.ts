import { modernAppPresets } from './modernAppSounds'

// Play a preset sound by ID
export async function playPresetSound(presetId: string, volume: number = 0.3) {
  const preset = modernAppPresets.find(p => p.id === presetId)
  if (!preset) {
    console.warn(`Preset sound not found: ${presetId}`)
    return
  }

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const sampleRate = 44100
    const duration = preset.parameters.duration || 0.2
    const offlineContext = new OfflineAudioContext(1, sampleRate * duration, sampleRate)

    // Create oscillator
    const osc = offlineContext.createOscillator()
    const gain = offlineContext.createGain()
    
    // Set oscillator parameters
    osc.type = preset.parameters.oscillator?.waveform || preset.parameters.type || 'sine'
    osc.frequency.value = preset.parameters.oscillator?.frequency || preset.parameters.frequency || 440
    if (preset.parameters.oscillator?.detune) {
      osc.detune.value = preset.parameters.oscillator.detune
    }

    // Apply envelope if available
    const env = preset.parameters.envelope || { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 }
    const now = 0
    
    // Ensure envelope times don't exceed duration
    const safeAttack = Math.min(env.attack, duration * 0.2)
    const safeDecay = Math.min(env.decay, duration * 0.3)
    const safeRelease = Math.min(env.release, duration * 0.3)
    const sustainTime = Math.max(0, duration - safeAttack - safeDecay - safeRelease)
    
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + safeAttack)
    gain.gain.linearRampToValueAtTime(env.sustain * volume, now + safeAttack + safeDecay)
    
    if (sustainTime > 0) {
      gain.gain.setValueAtTime(env.sustain * volume, now + safeAttack + safeDecay + sustainTime)
    }
    
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    // Connect and render
    osc.connect(gain)
    gain.connect(offlineContext.destination)
    osc.start(now)
    osc.stop(now + duration)

    const buffer = await offlineContext.startRendering()
    
    // Play the rendered buffer
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start()
  } catch (error) {
    console.error('Error playing preset sound:', error)
  }
}