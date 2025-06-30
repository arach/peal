export interface UIMechanicsSound {
  name: string
  file: string
  category: 'loading' | 'processing' | 'click'
  tags: string[]
  description: string
  useCase: string
}

export const uiMechanicsPresets: UIMechanicsSound[] = [
  // Loading sounds
  {
    name: 'Spinner Tick',
    file: '/sounds/ui-mechanics/spinner_tick.wav',
    category: 'loading',
    tags: ['loading', 'spinner', 'tick', 'fast', 'light'],
    description: 'Quick tick for spinning loaders',
    useCase: 'Spinner animations, loading indicators'
  },
  {
    name: 'Progress Tick',
    file: '/sounds/ui-mechanics/progress_tick.wav',
    category: 'loading',
    tags: ['loading', 'progress', 'tick', 'gentle', 'feedback'],
    description: 'Gentle tick for progress bars',
    useCase: 'Progress bar increments, step completion'
  },
  {
    name: 'Loading Pulse',
    file: '/sounds/ui-mechanics/loading_pulse.wav',
    category: 'loading',
    tags: ['loading', 'pulse', 'dots', 'sequence', 'rhythm'],
    description: 'Three-tone pulse for loading dots',
    useCase: 'Loading dots animation, waiting states'
  },
  {
    name: 'Loading Whoosh',
    file: '/sounds/ui-mechanics/loading_whoosh.wav',
    category: 'loading',
    tags: ['loading', 'whoosh', 'buffer', 'sweep', 'smooth'],
    description: 'Smooth whoosh for buffering',
    useCase: 'Buffer loading, data streaming'
  },
  {
    name: 'Circular Sweep',
    file: '/sounds/ui-mechanics/circular_sweep.wav',
    category: 'loading',
    tags: ['loading', 'circular', 'sweep', 'continuous', 'ambient'],
    description: 'Continuous circular loading sound',
    useCase: 'Circular progress indicators, ongoing processes'
  },
  
  // Processing sounds
  {
    name: 'Processing Tick',
    file: '/sounds/ui-mechanics/processing_tick.wav',
    category: 'processing',
    tags: ['processing', 'cpu', 'tick', 'digital', 'compute'],
    description: 'Digital tick for CPU processing',
    useCase: 'Computation feedback, processing steps'
  },
  {
    name: 'Data Chirp',
    file: '/sounds/ui-mechanics/data_chirp.wav',
    category: 'processing',
    tags: ['processing', 'data', 'chirp', 'sweep', 'transfer'],
    description: 'Data transfer chirp sound',
    useCase: 'Data processing, file transfers'
  },
  {
    name: 'Quantum Process',
    file: '/sounds/ui-mechanics/quantum_process.wav',
    category: 'processing',
    tags: ['processing', 'quantum', 'complex', 'sci-fi', 'advanced'],
    description: 'Complex quantum processing sound',
    useCase: 'Advanced computations, AI processing'
  },
  {
    name: 'Packet Sound',
    file: '/sounds/ui-mechanics/packet_sound.wav',
    category: 'processing',
    tags: ['processing', 'network', 'packet', 'data', 'digital'],
    description: 'Network packet transmission',
    useCase: 'Network activity, data packets'
  },
  {
    name: 'AI Thinking',
    file: '/sounds/ui-mechanics/ai_thinking.wav',
    category: 'processing',
    tags: ['processing', 'ai', 'neural', 'thinking', 'intelligent'],
    description: 'Neural network thinking sound',
    useCase: 'AI processing, machine learning feedback'
  },
  
  // Click sounds
  {
    name: 'Mechanical Click',
    file: '/sounds/ui-mechanics/mech_click.wav',
    category: 'click',
    tags: ['click', 'mechanical', 'keyboard', 'tactile', 'sharp'],
    description: 'Mechanical keyboard-style click',
    useCase: 'Button presses, keyboard feedback'
  },
  {
    name: 'Soft Click',
    file: '/sounds/ui-mechanics/soft_click.wav',
    category: 'click',
    tags: ['click', 'soft', 'gentle', 'minimal', 'subtle'],
    description: 'Gentle UI click',
    useCase: 'Soft buttons, minimal interfaces'
  },
  {
    name: 'Glass Click',
    file: '/sounds/ui-mechanics/glass_click.wav',
    category: 'click',
    tags: ['click', 'glass', 'crystal', 'premium', 'elegant'],
    description: 'Elegant glass tap sound',
    useCase: 'Premium interfaces, glass buttons'
  },
  {
    name: 'Haptic Click',
    file: '/sounds/ui-mechanics/haptic_click.wav',
    category: 'click',
    tags: ['click', 'haptic', 'feedback', 'physical', 'touch'],
    description: 'Haptic feedback simulation',
    useCase: 'Touch feedback, mobile interfaces'
  },
  {
    name: 'Switch Click',
    file: '/sounds/ui-mechanics/switch_click.wav',
    category: 'click',
    tags: ['click', 'switch', 'toggle', 'double', 'state'],
    description: 'Toggle switch click',
    useCase: 'Toggle switches, state changes'
  }
]

// Helper function to get auto-tags based on sound parameters
export function getAutoTags(soundType: string, parameters: any): string[] {
  const tags: string[] = []
  
  // Add type tag
  tags.push(soundType)
  
  // Duration-based tags
  if (parameters.duration) {
    if (parameters.duration < 100) tags.push('micro')
    else if (parameters.duration < 300) tags.push('short')
    else if (parameters.duration < 800) tags.push('medium')
    else tags.push('long')
  }
  
  // Frequency-based tags
  if (parameters.frequency) {
    if (parameters.frequency < 200) tags.push('sub-bass')
    else if (parameters.frequency < 500) tags.push('bass')
    else if (parameters.frequency < 2000) tags.push('mid')
    else if (parameters.frequency < 5000) tags.push('high')
    else tags.push('ultra-high')
  }
  
  // Effect-based tags
  if (parameters.reverb && parameters.reverb > 0.3) tags.push('spacious')
  if (parameters.delay && parameters.delay > 0) tags.push('echo')
  if (parameters.distortion && parameters.distortion > 0.2) tags.push('distorted')
  if (parameters.filter && parameters.filter.type) tags.push(parameters.filter.type)
  
  // Envelope-based tags
  if (parameters.envelope) {
    if (parameters.envelope.attack < 0.01) tags.push('punchy')
    if (parameters.envelope.release > 0.5) tags.push('sustained')
    if (parameters.envelope.attack > 0.1) tags.push('soft-attack')
  }
  
  // Special characteristics
  if (parameters.modulation) tags.push('modulated')
  if (parameters.harmonics && parameters.harmonics.length > 3) tags.push('rich')
  if (parameters.noise && parameters.noise > 0.3) tags.push('noisy')
  
  return [...new Set(tags)] // Remove duplicates
}