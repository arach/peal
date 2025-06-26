export interface Sound {
  id: string
  type: 'tone' | 'chime' | 'click' | 'sweep' | 'pulse'
  duration: number
  frequency: number
  brightness: number
  created: Date
  favorite: boolean
  tags: string[]
  parameters: SoundParameters
  waveformData: number[] | null
  audioBuffer: AudioBuffer | null
}

export interface SoundParameters {
  type: string
  frequency: number
  duration: number
  effects: {
    reverb: boolean
    delay: boolean
    filter: boolean
    distortion: boolean
    modulation: boolean
  }
  // Type-specific parameters
  waveform?: string
  attack?: number
  decay?: number
  sustain?: number
  release?: number
  harmonics?: number
  spread?: number
  clickType?: string
  clickDuration?: number
  resonance?: number
  direction?: string
  sweepRange?: number
  sweepType?: string
  pulseRate?: number
  pulseWidth?: number
  pulseDecay?: number
}

export interface SoundFilters {
  type: string[]
  favoriteOnly: boolean
  tags: string[]
  durationMin: number
  durationMax: number
  frequencyMin: number
  frequencyMax: number
}

export interface GenerationParams {
  durationMin: number
  durationMax: number
  frequencyMin: number
  frequencyMax: number
  enabledTypes: string[]
  enabledEffects: string[]
}

export type SortBy = 'creation' | 'duration' | 'frequency' | 'brightness' | 'type'