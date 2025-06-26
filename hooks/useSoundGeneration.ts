import { useCallback } from 'react'
import { useSoundStore, Sound } from '@/store/soundStore'

export class SoundGenerator {
  private audioContext: AudioContext | null = null

  constructor() {
    // AudioContext will be initialized when first needed
  }

  private async getAudioContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null
    
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Resume context if it's suspended (required by many browsers)
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume()
        }
      } catch (error) {
        console.error('Failed to create AudioContext:', error)
        return null
      }
    }
    
    return this.audioContext
  }

  async generateBatch(count: number = 50, params: any): Promise<Sound[]> {
    const audioContext = await this.getAudioContext()
    if (!audioContext) return []
    
    const batch: Sound[] = []
    
    for (let i = 0; i < count; i++) {
      const type = params.enabledTypes[
        Math.floor(Math.random() * params.enabledTypes.length)
      ] as Sound['type']
      
      const sound = await this.generateSound(type, params)
      batch.push(sound)
    }
    
    return batch
  }

  private async generateSound(type: Sound['type'], params: any): Promise<Sound> {
    const duration = Math.random() * (params.durationMax - params.durationMin) + params.durationMin
    const baseFreq = Math.random() * (params.frequencyMax - params.frequencyMin) + params.frequencyMin

    const sound: Sound = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: type,
      duration: Math.round(duration),
      frequency: Math.round(baseFreq),
      brightness: Math.round(Math.random() * 100),
      created: new Date(),
      favorite: false,
      tags: [],
      parameters: this.generateParameters(type, baseFreq, duration, params),
      waveformData: null,
      audioBuffer: null
    }

    // Generate offline audio buffer
    await this.renderSound(sound)

    return sound
  }

  private generateParameters(type: Sound['type'], baseFreq: number, duration: number, params: any) {
    const soundParams = {
      type: type,
      frequency: baseFreq,
      duration: duration / 1000,
      effects: {
        reverb: params.enabledEffects.includes('reverb') && Math.random() > 0.5,
        delay: params.enabledEffects.includes('delay') && Math.random() > 0.5,
        filter: params.enabledEffects.includes('filter') && Math.random() > 0.5,
        distortion: params.enabledEffects.includes('distortion') && Math.random() > 0.5,
        modulation: params.enabledEffects.includes('modulation') && Math.random() > 0.5
      }
    }

    switch (type) {
      case 'tone':
        return {
          ...soundParams,
          waveform: ['sine', 'square', 'triangle', 'sawtooth'][Math.floor(Math.random() * 4)],
          attack: Math.random() * 0.05,
          decay: Math.random() * 0.1,
          sustain: 0.3 + Math.random() * 0.5,
          release: Math.random() * 0.2 + 0.1
        }

      case 'chime':
        return {
          ...soundParams,
          harmonics: Math.floor(Math.random() * 3) + 2,
          spread: Math.random() * 0.1,
          decay: Math.random() * 0.3 + 0.1
        }

      case 'click':
        return {
          ...soundParams,
          clickType: Math.random() > 0.5 ? 'noise' : 'tonal',
          clickDuration: Math.random() * 0.02 + 0.005,
          resonance: Math.random() * 10 + 1
        }

      case 'sweep':
        return {
          ...soundParams,
          direction: Math.random() > 0.5 ? 'up' : 'down',
          sweepRange: Math.random() * 2 + 0.5,
          sweepType: Math.random() > 0.5 ? 'linear' : 'exponential'
        }

      case 'pulse':
        return {
          ...soundParams,
          pulseRate: Math.random() * 10 + 2,
          pulseWidth: Math.random() * 0.8 + 0.1,
          pulseDecay: Math.random() * 0.5
        }

      default:
        return soundParams
    }
  }

  private async renderSound(sound: Sound) {
    const audioContext = await this.getAudioContext()
    if (!audioContext) return

    const sampleRate = 44100
    const duration = sound.parameters.duration
    const offlineContext = new OfflineAudioContext(1, sampleRate * duration, sampleRate)

    try {
      // Create sound based on type
      switch (sound.type) {
        case 'tone':
          this.createTone(offlineContext, sound.parameters)
          break
        case 'chime':
          this.createChime(offlineContext, sound.parameters)
          break
        case 'click':
          this.createClick(offlineContext, sound.parameters)
          break
        case 'sweep':
          this.createSweep(offlineContext, sound.parameters)
          break
        case 'pulse':
          this.createPulse(offlineContext, sound.parameters)
          break
      }

      console.log('Rendering sound:', sound.id, 'type:', sound.type)
      const buffer = await offlineContext.startRendering()
      sound.audioBuffer = buffer
      sound.waveformData = this.extractWaveformData(buffer)
      console.log('Sound rendered successfully:', sound.id, 'buffer length:', buffer.length)
    } catch (error) {
      console.error('Error rendering sound:', sound.id, error)
    }
  }

  private createTone(ctx: OfflineAudioContext, params: any) {
    const now = 0
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = params.waveform || 'sine'
    osc.frequency.value = params.frequency

    // ADSR envelope with safe timing
    const safeAttack = Math.max(0.001, params.attack)
    const safeDecay = Math.max(0.001, params.decay)
    const safeRelease = Math.max(0.001, Math.min(params.release, params.duration - safeAttack - safeDecay))
    const sustainStart = Math.max(safeAttack + safeDecay, 0)
    const releaseStart = Math.max(params.duration - safeRelease, sustainStart)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.5, now + safeAttack)
    gain.gain.linearRampToValueAtTime(params.sustain * 0.5, now + safeAttack + safeDecay)
    gain.gain.setValueAtTime(params.sustain * 0.5, now + releaseStart)
    gain.gain.exponentialRampToValueAtTime(0.001, now + params.duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + params.duration)
  }

  private createChime(ctx: OfflineAudioContext, params: any) {
    const now = 0
    const fundamentalFreq = params.frequency

    for (let i = 0; i < params.harmonics; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const delay = i * params.spread

      osc.frequency.value = fundamentalFreq * (i + 1)
      osc.type = 'sine'

      const safeDelay = Math.max(0, delay)
      const safeDecay = Math.max(0.01, params.decay)
      
      gain.gain.setValueAtTime(0, now + safeDelay)
      gain.gain.linearRampToValueAtTime(0.4 / (i + 1), now + safeDelay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + safeDelay + safeDecay)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + delay)
      osc.stop(now + params.duration)
    }
  }

  private createClick(ctx: OfflineAudioContext, params: any) {
    const now = 0

    if (params.clickType === 'noise') {
      // Noise click
      const bufferSize = ctx.sampleRate * params.clickDuration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 10)
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = params.frequency
      filter.Q.value = params.resonance

      noise.connect(filter)
      filter.connect(ctx.destination)
      noise.start(now)
    } else {
      // Tonal click
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.value = params.frequency
      const safeClickDuration = Math.max(0.001, params.clickDuration)
      gain.gain.setValueAtTime(0.6, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + safeClickDuration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + params.clickDuration)
    }
  }

  private createSweep(ctx: OfflineAudioContext, params: any) {
    const now = 0
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'

    const startFreq = params.direction === 'up' ? params.frequency : params.frequency * params.sweepRange
    const endFreq = params.direction === 'up' ? params.frequency * params.sweepRange : params.frequency

    osc.frequency.setValueAtTime(startFreq, now)

    if (params.sweepType === 'exponential') {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + params.duration)
    } else {
      osc.frequency.linearRampToValueAtTime(endFreq, now + params.duration)
    }

    const safeDuration = Math.max(0.1, params.duration)
    const releaseTime = Math.max(0.01, Math.min(0.05, safeDuration - 0.02))
    
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01)
    gain.gain.setValueAtTime(0.4, now + safeDuration - releaseTime)
    gain.gain.exponentialRampToValueAtTime(0.001, now + safeDuration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + params.duration)
  }

  private createPulse(ctx: OfflineAudioContext, params: any) {
    const now = 0
    const pulseDuration = 1 / params.pulseRate
    const numPulses = Math.floor(params.duration / pulseDuration)

    for (let i = 0; i < numPulses; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const pulseStart = i * pulseDuration
      const pulseLength = pulseDuration * params.pulseWidth

      osc.frequency.value = params.frequency
      osc.type = 'square'

      const amplitude = 0.4 * Math.exp(-i * params.pulseDecay)
      gain.gain.setValueAtTime(0, now + pulseStart)
      gain.gain.linearRampToValueAtTime(amplitude, now + pulseStart + 0.001)
      gain.gain.setValueAtTime(amplitude, now + pulseStart + pulseLength - 0.001)
      gain.gain.linearRampToValueAtTime(0, now + pulseStart + pulseLength)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + pulseStart)
      osc.stop(now + pulseStart + pulseLength)
    }
  }

  private extractWaveformData(buffer: AudioBuffer): number[] {
    const data = buffer.getChannelData(0)
    const samples = 200 // Number of points for visualization
    const blockSize = Math.floor(data.length / samples)
    const waveform: number[] = []

    for (let i = 0; i < samples; i++) {
      const start = blockSize * i
      let sum = 0
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(data[start + j])
      }
      waveform.push(sum / blockSize)
    }

    return waveform
  }

  async playSound(sound: Sound): Promise<AudioBufferSourceNode | null> {
    console.log('Attempting to play sound:', sound.id, 'Has buffer:', !!sound.audioBuffer)
    
    const audioContext = await this.getAudioContext()
    if (!audioContext) {
      console.error('No audio context available')
      return null
    }
    
    // If no audio buffer, regenerate it
    if (!sound.audioBuffer) {
      console.log('Regenerating audio buffer for sound:', sound.id)
      await this.renderSound(sound)
      
      if (!sound.audioBuffer) {
        console.error('Failed to generate audio buffer for sound:', sound.id)
        return null
      }
    }

    const source = audioContext.createBufferSource()
    source.buffer = sound.audioBuffer
    source.connect(audioContext.destination)
    source.start()

    console.log('Sound started playing:', sound.id)
    return source
  }
}

export function useSoundGeneration() {
  const {
    setGenerating,
    setGenerationProgress,
    setGenerationStatus,
    addSounds,
    generationParams
  } = useSoundStore()

  const generator = new SoundGenerator()

  const generateBatch = useCallback(async (count: number = 50) => {
    setGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus('Initializing sound generation...')

    try {
      const sounds: Sound[] = []
      
      for (let i = 0; i < count; i++) {
        setGenerationStatus(`Generating sound ${i + 1} of ${count}...`)
        setGenerationProgress((i + 1) / count * 100)
        
        // Generate sound with slight delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50))
        
        const type = generationParams.enabledTypes[
          Math.floor(Math.random() * generationParams.enabledTypes.length)
        ] as Sound['type']
        
        const sound = await generator.generateSound(type, generationParams)
        sounds.push(sound)
      }
      
      addSounds(sounds)
      setGenerationStatus('Generation complete!')
      
    } catch (error) {
      console.error('Error generating sounds:', error)
      setGenerationStatus('Error generating sounds')
    } finally {
      setGenerating(false)
    }
  }, [setGenerating, setGenerationProgress, setGenerationStatus, addSounds, generationParams])

  const playSound = useCallback(async (sound: Sound) => {
    return await generator.playSound(sound)
  }, [])

  return {
    generateBatch,
    playSound,
    generator
  }
}