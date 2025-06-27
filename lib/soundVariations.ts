import { Sound } from '@/store/soundStore'

export interface VariationParameters {
  // Time variations
  durationVariance: number      // 0-50%: How much to vary duration
  durationBias: 'shorter' | 'longer' | 'balanced' // Tendency for variations
  
  // Frequency variations
  frequencyVariance: number     // 0-50%: How much to vary frequency
  frequencyBias: 'higher' | 'lower' | 'balanced'
  
  // Envelope variations (for tones)
  envelopeVariance: number      // 0-50%: How much to vary ADSR
  
  // Effect variations
  effectProbability: number     // 0-100%: Chance of toggling effects
  
  // Type-specific variations
  harmonicVariance?: number     // For chimes: vary harmonic count
  pulseRateVariance?: number    // For pulses: vary pulse rate
  sweepRangeVariance?: number   // For sweeps: vary sweep range
  
  // General
  preserveCharacter: boolean    // Keep variations subtle
}

export class SoundVariationGenerator {
  private baseSound: Sound
  private params: VariationParameters
  
  constructor(sound: Sound, params: VariationParameters) {
    this.baseSound = sound
    this.params = params
  }
  
  // Generate a single variation
  generateVariation(): Partial<Sound['parameters']> {
    const base = this.baseSound.parameters
    const variation: any = { ...base }
    
    // Apply duration variations
    if (this.params.durationVariance > 0) {
      const variance = this.params.durationVariance / 100
      const factor = this.getVariationFactor(variance, this.params.durationBias)
      variation.duration = base.duration * factor
      
      // Ensure reasonable bounds
      variation.duration = Math.max(0.05, Math.min(2, variation.duration))
    }
    
    // Apply frequency variations
    if (this.params.frequencyVariance > 0) {
      const variance = this.params.frequencyVariance / 100
      const factor = this.getVariationFactor(variance, this.params.frequencyBias)
      variation.frequency = base.frequency * factor
      
      // Ensure reasonable bounds
      variation.frequency = Math.max(100, Math.min(4000, variation.frequency))
    }
    
    // Apply envelope variations (for tones)
    if (this.baseSound.type === 'tone' && this.params.envelopeVariance > 0) {
      const variance = this.params.envelopeVariance / 100
      
      if (base.attack !== undefined) {
        variation.attack = this.varyValue(base.attack, variance, 0.001, 0.1)
      }
      if (base.decay !== undefined) {
        variation.decay = this.varyValue(base.decay, variance, 0.001, 0.2)
      }
      if (base.sustain !== undefined) {
        variation.sustain = this.varyValue(base.sustain, variance, 0, 1)
      }
      if (base.release !== undefined) {
        variation.release = this.varyValue(base.release, variance, 0.001, 0.5)
      }
    }
    
    // Apply type-specific variations
    switch (this.baseSound.type) {
      case 'chime':
        if (this.params.harmonicVariance && base.harmonics) {
          const variance = this.params.harmonicVariance / 100
          variation.harmonics = Math.round(
            this.varyValue(base.harmonics, variance, 2, 5)
          )
        }
        break
        
      case 'pulse':
        if (this.params.pulseRateVariance && base.pulseRate) {
          const variance = this.params.pulseRateVariance / 100
          variation.pulseRate = this.varyValue(base.pulseRate, variance, 2, 20)
        }
        break
        
      case 'sweep':
        if (this.params.sweepRangeVariance && base.sweepRange) {
          const variance = this.params.sweepRangeVariance / 100
          variation.sweepRange = this.varyValue(base.sweepRange, variance, 0.5, 4)
        }
        break
    }
    
    // Apply effect variations
    if (this.params.effectProbability > 0 && base.effects) {
      variation.effects = { ...base.effects }
      
      Object.keys(variation.effects).forEach(effect => {
        if (Math.random() * 100 < this.params.effectProbability) {
          variation.effects[effect] = !variation.effects[effect]
        }
      })
    }
    
    // If preserveCharacter is true, reduce all variations by 50%
    if (this.params.preserveCharacter) {
      this.moderateVariation(variation, base)
    }
    
    return variation
  }
  
  // Generate multiple variations
  generateBatch(count: number): Partial<Sound['parameters']>[] {
    const variations: Partial<Sound['parameters']>[] = []
    
    for (let i = 0; i < count; i++) {
      variations.push(this.generateVariation())
    }
    
    return variations
  }
  
  // Helper: Get variation factor based on bias
  private getVariationFactor(variance: number, bias: 'higher' | 'lower' | 'shorter' | 'longer' | 'balanced'): number {
    const random = Math.random()
    
    switch (bias) {
      case 'higher':
      case 'longer':
        // Bias towards increase
        return 1 + (random * variance)
        
      case 'lower':
      case 'shorter':
        // Bias towards decrease
        return 1 - (random * variance)
        
      case 'balanced':
      default:
        // Equal chance of increase or decrease
        return 1 + ((Math.random() - 0.5) * 2 * variance)
    }
  }
  
  // Helper: Vary a value within bounds
  private varyValue(base: number, variance: number, min: number, max: number): number {
    const factor = 1 + ((Math.random() - 0.5) * 2 * variance)
    const varied = base * factor
    return Math.max(min, Math.min(max, varied))
  }
  
  // Helper: Moderate variations to preserve character
  private moderateVariation(variation: any, base: any) {
    // Reduce differences by 50%
    if (variation.duration && base.duration) {
      variation.duration = base.duration + (variation.duration - base.duration) * 0.5
    }
    if (variation.frequency && base.frequency) {
      variation.frequency = base.frequency + (variation.frequency - base.frequency) * 0.5
    }
  }
}

// Preset variation profiles
export const variationPresets = {
  subtle: {
    durationVariance: 10,
    durationBias: 'balanced' as const,
    frequencyVariance: 5,
    frequencyBias: 'balanced' as const,
    envelopeVariance: 10,
    effectProbability: 0,
    preserveCharacter: true
  },
  
  moderate: {
    durationVariance: 25,
    durationBias: 'balanced' as const,
    frequencyVariance: 15,
    frequencyBias: 'balanced' as const,
    envelopeVariance: 20,
    effectProbability: 20,
    preserveCharacter: true
  },
  
  wild: {
    durationVariance: 50,
    durationBias: 'balanced' as const,
    frequencyVariance: 40,
    frequencyBias: 'balanced' as const,
    envelopeVariance: 40,
    effectProbability: 50,
    preserveCharacter: false
  },
  
  shorterVariants: {
    durationVariance: 30,
    durationBias: 'shorter' as const,
    frequencyVariance: 10,
    frequencyBias: 'higher' as const,
    envelopeVariance: 15,
    effectProbability: 10,
    preserveCharacter: true
  },
  
  longerVariants: {
    durationVariance: 30,
    durationBias: 'longer' as const,
    frequencyVariance: 10,
    frequencyBias: 'lower' as const,
    envelopeVariance: 15,
    effectProbability: 10,
    preserveCharacter: true
  }
}