// Vibe-based sound design parser
// Converts natural language prompts into sound parameters

export interface ParsedSound {
  type: string
  baseParams: any
  quantity: number
  modifiers: string[]
}

export interface VibeIntent {
  sounds: ParsedSound[]
  isSequence: boolean
}

export class VibeParser {
  // Sound type mappings
  private static soundTypes: Record<string, any> = {
    'beep': { type: 'tone', duration: 0.2, frequency: 800, waveform: 'sine' },
    'beeps': { type: 'tone', duration: 0.2, frequency: 800, waveform: 'sine' },
    'chime': { type: 'chime', duration: 0.5, frequency: 600 },
    'chimes': { type: 'chime', duration: 0.5, frequency: 600 },
    'click': { type: 'click', duration: 0.05, frequency: 1000, clickDuration: 0.05 },
    'clicks': { type: 'click', duration: 0.05, frequency: 1000, clickDuration: 0.05 },
    'ding': { type: 'tone', duration: 0.3, frequency: 1200, waveform: 'triangle' },
    'dings': { type: 'tone', duration: 0.3, frequency: 1200, waveform: 'triangle' },
    'ping': { type: 'tone', duration: 0.15, frequency: 1500, waveform: 'sine' },
    'pings': { type: 'tone', duration: 0.15, frequency: 1500, waveform: 'sine' },
    'swoosh': { type: 'sweep', duration: 0.4, frequency: 400, direction: 'down', sweepRange: 2, sweepType: 'linear' },
    'whoosh': { type: 'sweep', duration: 0.5, frequency: 300, direction: 'down', sweepRange: 2, sweepType: 'linear' },
    'buzz': { type: 'pulse', duration: 0.3, frequency: 200 },
    'bell': { type: 'chime', duration: 0.8, frequency: 800 },
    'bells': { type: 'chime', duration: 0.8, frequency: 800 },
  }

  // Modifier mappings
  private static modifiers: Record<string, any> = {
    // Duration
    'short': { durationMultiplier: 0.5 },
    'long': { durationMultiplier: 2 },
    'quick': { durationMultiplier: 0.7 },
    'slow': { durationMultiplier: 1.5 },
    // Pitch
    'high': { frequencyMultiplier: 1.5 },
    'low': { frequencyMultiplier: 0.5 },
    'deep': { frequencyMultiplier: 0.3 },
    'bright': { frequencyMultiplier: 1.8 },
    // Character
    'soft': { volume: 0.5, attack: 0.05 },
    'loud': { volume: 1.5 },
    'gentle': { attack: 0.05, volume: 0.7 },
    'harsh': { attack: 0.001, volume: 1.2 },
    'sharp': { attack: 0.001, decay: 0.01 },
    'smooth': { attack: 0.1, release: 0.2 },
    'punchy': { attack: 0.001, decay: 0.05, sustain: 0.8 },
    'metallic': { waveform: 'square', effects: { filter: true } },
    'warm': { waveform: 'triangle', effects: { reverb: true } },
    'digital': { waveform: 'square' },
    'organic': { waveform: 'sine', effects: { reverb: true } },
  }

  // Number words to digits
  private static numberWords: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'a': 1, 'an': 1, 'twice': 2, 'thrice': 3,
  }

  // Parse natural language prompt into structured intent
  static parsePrompt(prompt: string): VibeIntent {
    const normalized = prompt.toLowerCase()
    const intent: VibeIntent = {
      sounds: [],
      isSequence: false
    }

    // Check if this is a sequence
    const sequenceWords = ['followed by', 'then', 'after', 'and then', 'next']
    intent.isSequence = sequenceWords.some(word => normalized.includes(word))

    // Split by sequence words if it's a sequence
    let segments = [normalized]
    if (intent.isSequence) {
      // Split by any sequence word
      const pattern = new RegExp(`(${sequenceWords.join('|')})`, 'g')
      segments = normalized.split(pattern).filter(s => !sequenceWords.includes(s.trim()))
    }

    // Parse each segment
    for (const segment of segments) {
      const parsed = this.parseSegment(segment.trim())
      if (parsed) {
        intent.sounds.push(parsed)
      }
    }

    // If no sounds found, default to a beep
    if (intent.sounds.length === 0) {
      intent.sounds.push({
        type: 'beep',
        baseParams: this.soundTypes['beep'],
        quantity: 1,
        modifiers: []
      })
    }

    return intent
  }

  // Parse a single segment (e.g., "two short beeps")
  private static parseSegment(segment: string): ParsedSound | null {
    const words = segment.split(/\s+/)
    
    // Find quantity
    let quantity = 1
    for (const word of words) {
      const num = parseInt(word)
      if (!isNaN(num)) {
        quantity = num
      } else if (this.numberWords[word]) {
        quantity = this.numberWords[word]
      }
    }

    // Find sound type
    let soundType = null
    let baseParams = null
    for (const word of words) {
      if (this.soundTypes[word]) {
        soundType = word
        baseParams = { ...this.soundTypes[word] }
        break
      }
    }

    if (!soundType) {
      // Try to find partial matches
      for (const [type, params] of Object.entries(this.soundTypes)) {
        if (segment.includes(type.slice(0, -1))) { // Remove 's' for singular
          soundType = type
          baseParams = { ...params }
          break
        }
      }
    }

    if (!soundType) return null

    // Find modifiers
    const modifiers: string[] = []
    for (const word of words) {
      if (this.modifiers[word]) {
        modifiers.push(word)
      }
    }

    return {
      type: soundType,
      baseParams,
      quantity,
      modifiers
    }
  }

  // Generate sound parameters from intent
  static generateParameters(intent: VibeIntent): any[] {
    const results = []
    let delay = 0

    for (const sound of intent.sounds) {
      for (let i = 0; i < sound.quantity; i++) {
        const params = { ...sound.baseParams }
        
        // Apply modifiers
        for (const modifier of sound.modifiers) {
          const mod = this.modifiers[modifier]
          
          if (mod.durationMultiplier) {
            params.duration = (params.duration || 0.5) * mod.durationMultiplier
          }
          if (mod.frequencyMultiplier) {
            params.frequency = (params.frequency || 440) * mod.frequencyMultiplier
          }
          if (mod.volume !== undefined) {
            params.volume = mod.volume
          }
          if (mod.attack !== undefined) params.attack = mod.attack
          if (mod.decay !== undefined) params.decay = mod.decay
          if (mod.sustain !== undefined) params.sustain = mod.sustain
          if (mod.release !== undefined) params.release = mod.release
          if (mod.waveform) params.waveform = mod.waveform
          if (mod.effects) {
            params.effects = { ...params.effects, ...mod.effects }
          }
        }

        // Add variation for multiple sounds of same type
        if (sound.quantity > 1) {
          params.frequency = (params.frequency || 440) * (1 + i * 0.1) // Slight pitch increase
          if (intent.isSequence) {
            params.delay = delay
            delay += params.duration + 0.1 // Add gap between sounds
          } else {
            params.delay = i * 0.15 // Quick succession for multiple sounds
          }
        } else if (intent.isSequence) {
          params.delay = delay
          delay += params.duration + 0.1
        }

        // Ensure click sounds have clickDuration
        if (params.type === 'click' && !params.clickDuration) {
          params.clickDuration = params.duration || 0.05
        }

        results.push(params)
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
      'two short beeps',
      'a metallic ping',
      'three quick clicks',
      'a soft ding',
      'a deep whoosh',
      'metallic ping followed by two beeps',
      'a gentle bell',
      'four punchy clicks',
      'a bright chime',
      'low buzz then high ping'
    ]

    for (const template of templates) {
      if (normalized === '' || template.includes(normalized)) {
        suggestions.push(template)
      }
    }

    return suggestions.slice(0, 5)
  }
}

// Example usage:
// VibeParser.parsePrompt("two short beeps")
// => { sounds: [{ type: 'beep', quantity: 2, modifiers: ['short'] }], isSequence: false }

// VibeParser.parsePrompt("metallic ping followed by two beeps")  
// => { sounds: [{ type: 'ping', quantity: 1, modifiers: ['metallic'] }, { type: 'beep', quantity: 2, modifiers: [] }], isSequence: true }