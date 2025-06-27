// Vibe-based sound design parser
// Converts natural language prompts into sound parameters

export interface VibeIntent {
  action: 'create' | 'modify' | 'combine'
  soundTypes: string[]
  modifiers: Record<string, any>
  quantity?: number
}

export class VibeParser {
  // Common sound descriptors and their parameter mappings
  private static soundMappings: Record<string, any> = {
    // Sound types
    'beep': { type: 'tone', duration: 0.2, frequency: 800 },
    'chime': { type: 'chime', duration: 0.5, frequency: 600 },
    'click': { type: 'click', duration: 0.05, frequency: 1000 },
    'ding': { type: 'tone', duration: 0.3, frequency: 1200 },
    'ping': { type: 'tone', duration: 0.15, frequency: 1500 },
    'swoosh': { type: 'sweep', duration: 0.4, frequency: 400 },
    'whoosh': { type: 'sweep', duration: 0.5, frequency: 300 },
    'buzz': { type: 'pulse', duration: 0.3, frequency: 200 },
    'bell': { type: 'chime', duration: 0.8, frequency: 800 },
    
    // Modifiers
    'short': { durationMultiplier: 0.5 },
    'long': { durationMultiplier: 2 },
    'quick': { durationMultiplier: 0.7 },
    'slow': { durationMultiplier: 1.5 },
    'high': { frequencyMultiplier: 1.5 },
    'low': { frequencyMultiplier: 0.5 },
    'deep': { frequencyMultiplier: 0.3 },
    'bright': { frequencyMultiplier: 1.8 },
    'soft': { volumeMultiplier: 0.5 },
    'loud': { volumeMultiplier: 1.5 },
    'gentle': { attack: 0.05, volumeMultiplier: 0.7 },
    'sharp': { attack: 0.001, decay: 0.01 },
    'smooth': { attack: 0.1, release: 0.2 },
    'punchy': { attack: 0.001, decay: 0.05, sustain: 0.8 },
  }

  // Parse natural language prompt into structured intent
  static parsePrompt(prompt: string): VibeIntent {
    const normalized = prompt.toLowerCase()
    const intent: VibeIntent = {
      action: 'create',
      soundTypes: [],
      modifiers: {}
    }

    // Detect action
    if (normalized.includes('modify') || normalized.includes('change')) {
      intent.action = 'modify'
    } else if (normalized.includes('combine') || normalized.includes('mix')) {
      intent.action = 'combine'
    }

    // Extract quantity
    const quantityMatch = normalized.match(/(\d+)\s+(beep|chime|click|ding|ping|sound)/);
    if (quantityMatch) {
      intent.quantity = parseInt(quantityMatch[1])
    }

    // Extract sound types
    for (const [sound, params] of Object.entries(this.soundMappings)) {
      if (normalized.includes(sound) && params.type) {
        intent.soundTypes.push(sound)
      }
    }

    // Extract modifiers
    const words = normalized.split(/\s+/)
    for (const word of words) {
      const modifier = this.soundMappings[word]
      if (modifier && !modifier.type) {
        Object.assign(intent.modifiers, modifier)
      }
    }

    // Default to beep if no sound type found
    if (intent.soundTypes.length === 0) {
      intent.soundTypes.push('beep')
    }

    return intent
  }

  // Generate sound parameters from intent
  static generateParameters(intent: VibeIntent): any[] {
    const results = []
    const count = intent.quantity || 1

    for (let i = 0; i < count; i++) {
      for (const soundType of intent.soundTypes) {
        const baseParams = { ...this.soundMappings[soundType] }
        
        // Apply modifiers
        if (intent.modifiers.durationMultiplier) {
          baseParams.duration *= intent.modifiers.durationMultiplier
        }
        if (intent.modifiers.frequencyMultiplier) {
          baseParams.frequency *= intent.modifiers.frequencyMultiplier
        }
        if (intent.modifiers.volumeMultiplier) {
          baseParams.volume = intent.modifiers.volumeMultiplier
        }
        
        // Apply envelope modifiers
        if (intent.modifiers.attack) baseParams.attack = intent.modifiers.attack
        if (intent.modifiers.decay) baseParams.decay = intent.modifiers.decay
        if (intent.modifiers.sustain) baseParams.sustain = intent.modifiers.sustain
        if (intent.modifiers.release) baseParams.release = intent.modifiers.release

        // Add variation for multiple sounds
        if (count > 1) {
          baseParams.frequency += (i * 50) // Slight frequency variation
          baseParams.duration += (i * 0.05) // Slight duration variation
        }

        results.push(baseParams)
      }
    }

    return results
  }

  // Get suggestions based on partial input
  static getSuggestions(partial: string): string[] {
    const normalized = partial.toLowerCase()
    const suggestions = []
    
    // Common templates
    const templates = [
      'a short beep',
      'a long chime',
      'two quick clicks',
      'a soft ding',
      'a deep whoosh',
      'three high pings',
      'a gentle bell',
      'a punchy click',
      'a bright chime',
      'a smooth sweep'
    ]

    for (const template of templates) {
      if (template.includes(normalized) || normalized === '') {
        suggestions.push(template)
      }
    }

    return suggestions.slice(0, 5)
  }
}

// Example usage:
// VibeParser.parsePrompt("I want a short high beep")
// => { action: 'create', soundTypes: ['beep'], modifiers: { durationMultiplier: 0.5, frequencyMultiplier: 1.5 } }

// VibeParser.parsePrompt("Create 3 quick clicks")  
// => { action: 'create', soundTypes: ['click'], modifiers: { durationMultiplier: 0.7 }, quantity: 3 }