import { useCallback, useMemo } from 'react'
import { useSoundStore, Sound } from '@/store/soundStore'
import { playPresetSound } from '@/lib/presets/playPresetSound'
import { getAutoTags } from '@/lib/presets/uiMechanicsPresets'

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

  async generateSound(type: Sound['type'], params: any): Promise<Sound> {
    const duration = Math.random() * (params.durationMax - params.durationMin) + params.durationMin
    const baseFreq = Math.random() * (params.frequencyMax - params.frequencyMin) + params.frequencyMin

    const soundParameters = this.generateParameters(type, baseFreq, duration, params)
    
    const sound: Sound = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type: type,
      duration: Math.round(duration),
      frequency: Math.round(baseFreq),
      brightness: Math.round(Math.random() * 100),
      created: new Date(),
      favorite: false,
      tags: getAutoTags(type, soundParameters),
      parameters: soundParameters,
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
    // Ensure clickDuration has a valid value
    const clickDuration = params.clickDuration || params.duration || 0.05
    const safeClickDuration = Math.max(0.001, clickDuration)

    if (params.clickType === 'noise') {
      // Noise click
      const bufferSize = Math.floor(ctx.sampleRate * safeClickDuration)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 10)
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = params.frequency || 1000
      filter.Q.value = params.resonance || 5

      noise.connect(filter)
      filter.connect(ctx.destination)
      noise.start(now)
      noise.stop(now + safeClickDuration)
    } else {
      // Tonal click
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.value = params.frequency || 1000
      gain.gain.setValueAtTime(0.6, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + safeClickDuration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + safeClickDuration)
    }
  }

  private createSweep(ctx: OfflineAudioContext, params: any) {
    const now = 0
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'

    // Validate and provide defaults for sweep parameters
    const frequency = params.frequency || 440
    const sweepRange = params.sweepRange || 2
    const direction = params.direction || 'down'
    const duration = Math.max(0.1, params.duration || 0.5)

    const startFreq = direction === 'up' ? frequency : frequency * sweepRange
    const endFreq = direction === 'up' ? frequency * sweepRange : frequency

    // Ensure frequencies are valid
    const safeStartFreq = Math.max(20, Math.min(20000, startFreq))
    const safeEndFreq = Math.max(20, Math.min(20000, endFreq))

    osc.frequency.setValueAtTime(safeStartFreq, now)

    if (params.sweepType === 'exponential' && safeEndFreq > 0) {
      osc.frequency.exponentialRampToValueAtTime(safeEndFreq, now + duration)
    } else {
      osc.frequency.linearRampToValueAtTime(safeEndFreq, now + duration)
    }

    const releaseTime = Math.max(0.01, Math.min(0.05, duration - 0.02))
    
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01)
    gain.gain.setValueAtTime(0.4, now + duration - releaseTime)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
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
        console.error('Failed to generate valid audio buffer for sound:', sound.id)
        return null
      }
    }

    try {
      const source = audioContext.createBufferSource()
      source.buffer = sound.audioBuffer
      source.connect(audioContext.destination)
      source.start()
      
      console.log('Sound started playing:', sound.id)
      return source
    } catch (error) {
      console.error('Error setting buffer:', error)
      // Try regenerating the sound
      await this.renderSound(sound)
      if (sound.audioBuffer && sound.audioBuffer instanceof AudioBuffer) {
        const source = audioContext.createBufferSource()
        source.buffer = sound.audioBuffer
        source.connect(audioContext.destination)
        source.start()
        return source
      }
      return null
    }
  }

  async renderSequence(sound: Sound, paramsList: any[]): Promise<void> {
    const audioContext = await this.getAudioContext()
    if (!audioContext) return

    // Calculate total duration
    let totalDuration = 0
    for (const params of paramsList) {
      totalDuration = Math.max(totalDuration, (params.delay || 0) + (params.duration || 0.5))
    }

    const sampleRate = 44100
    const offlineContext = new OfflineAudioContext(1, sampleRate * totalDuration, sampleRate)

    try {
      // Render each sound in the sequence
      for (const params of paramsList) {
        const startTime = params.delay || 0
        
        switch (params.type) {
          case 'tone':
            this.createToneAtTime(offlineContext, params, startTime)
            break
          case 'chime':
            this.createChimeAtTime(offlineContext, params, startTime)
            break
          case 'click':
            this.createClickAtTime(offlineContext, params, startTime)
            break
          case 'sweep':
            this.createSweepAtTime(offlineContext, params, startTime)
            break
          case 'pulse':
            this.createPulseAtTime(offlineContext, params, startTime)
            break
        }
      }

      const buffer = await offlineContext.startRendering()
      sound.audioBuffer = buffer
      sound.waveformData = this.extractWaveformData(buffer)
    } catch (error) {
      console.error('Error rendering sequence:', error)
    }
  }

  // Helper methods for creating sounds at specific times
  private createToneAtTime(ctx: OfflineAudioContext, params: any, startTime: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = params.waveform || 'sine'
    osc.frequency.value = params.frequency

    const safeAttack = Math.max(0.001, params.attack || 0.01)
    const safeDecay = Math.max(0.001, params.decay || 0.1)
    const safeRelease = Math.max(0.001, params.release || 0.1)

    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.5, startTime + safeAttack)
    gain.gain.linearRampToValueAtTime((params.sustain || 0.5) * 0.5, startTime + safeAttack + safeDecay)
    gain.gain.setValueAtTime((params.sustain || 0.5) * 0.5, startTime + params.duration - safeRelease)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + params.duration)
  }

  private createClickAtTime(ctx: OfflineAudioContext, params: any, startTime: number) {
    const clickDuration = params.clickDuration || 0.05
    const safeClickDuration = Math.max(0.001, clickDuration)

    if (params.clickType === 'noise') {
      const bufferSize = Math.floor(ctx.sampleRate * safeClickDuration)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 10)
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = params.frequency || 1000
      filter.Q.value = params.resonance || 5

      noise.connect(filter)
      filter.connect(ctx.destination)
      noise.start(startTime)
      noise.stop(startTime + safeClickDuration)
    } else {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.value = params.frequency || 1000
      gain.gain.setValueAtTime(0.6, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + safeClickDuration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + safeClickDuration)
    }
  }

  private createChimeAtTime(ctx: OfflineAudioContext, params: any, startTime: number) {
    const fundamentalFreq = params.frequency
    const harmonics = params.harmonics || 3

    for (let i = 0; i < harmonics; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const delay = i * (params.spread || 0.05)

      osc.frequency.value = fundamentalFreq * (i + 1)
      osc.type = 'sine'

      const safeDelay = Math.max(0, delay)
      const safeDecay = Math.max(0.01, params.decay || 0.3)
      
      gain.gain.setValueAtTime(0, startTime + safeDelay)
      gain.gain.linearRampToValueAtTime(0.4 / (i + 1), startTime + safeDelay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + safeDelay + safeDecay)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime + delay)
      osc.stop(startTime + params.duration)
    }
  }

  private createSweepAtTime(ctx: OfflineAudioContext, params: any, startTime: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'

    const frequency = params.frequency || 440
    const sweepRange = params.sweepRange || 2
    const direction = params.direction || 'down'
    const duration = params.duration || 0.5

    const startFreq = direction === 'up' ? frequency : frequency * sweepRange
    const endFreq = direction === 'up' ? frequency * sweepRange : frequency

    osc.frequency.setValueAtTime(startFreq, startTime)

    if (params.sweepType === 'exponential' && endFreq > 0) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration)
    } else {
      osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration)
    }

    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.01)
    gain.gain.setValueAtTime(0.4, startTime + duration - 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + duration)
  }

  private createPulseAtTime(ctx: OfflineAudioContext, params: any, startTime: number) {
    const pulseDuration = 1 / (params.pulseRate || 5)
    const numPulses = Math.floor(params.duration / pulseDuration)

    for (let i = 0; i < numPulses; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const pulseStart = startTime + i * pulseDuration
      const pulseLength = pulseDuration * (params.pulseWidth || 0.5)

      osc.frequency.value = params.frequency
      osc.type = 'square'

      const amplitude = 0.4 * Math.exp(-i * (params.pulseDecay || 0.1))
      gain.gain.setValueAtTime(0, pulseStart)
      gain.gain.linearRampToValueAtTime(amplitude, pulseStart + 0.001)
      gain.gain.setValueAtTime(amplitude, pulseStart + pulseLength - 0.001)
      gain.gain.linearRampToValueAtTime(0, pulseStart + pulseLength)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(pulseStart)
      osc.stop(pulseStart + pulseLength)
    }
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

  const generator = useMemo(() => new SoundGenerator(), [])

  const generateBatch = useCallback(async (count: number = 50, customParams?: any) => {
    setGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus('Initializing sound generation...')
    
    // Play start sound
    await playPresetSound('confirm-pop', 0.2)

    try {
      const sounds: Sound[] = []
      
      // Use custom params if provided, otherwise use default generation params
      const params = customParams || generationParams
      
      for (let i = 0; i < count; i++) {
        setGenerationStatus(`Generating sound ${i + 1} of ${count}...`)
        setGenerationProgress((i + 1) / count * 100)
        
        // Generate sound with slight delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50))
        
        const type = params.enabledTypes[
          Math.floor(Math.random() * params.enabledTypes.length)
        ] as Sound['type']
        
        const sound = await generator.generateSound(type, params)
        sounds.push(sound)
      }
      
      addSounds(sounds)
      setGenerationStatus('Generation complete!')
      
      // Play completion sound
      await playPresetSound('success-chime', 0.25)
      
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