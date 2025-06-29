export interface DotsPatternSound {
  name: string
  file: string
  category: 'dots' | 'multi-click' | 'sequence'
  tags: string[]
  description: string
  useCase: string
}

export const dotsPatternPresets: DotsPatternSound[] = [
  // Three Dots Variations
  {
    name: 'Three Dots Ascending',
    file: '/sounds/dots-patterns/three_dots_ascending.wav',
    category: 'dots',
    tags: ['dots', 'three', 'ascending', 'melodic', 'loading'],
    description: 'Classic three dots pattern with ascending tones',
    useCase: 'Loading animations, progress indicators, typing indicators'
  },
  {
    name: 'Three Dots Descending',
    file: '/sounds/dots-patterns/three_dots_descending.wav',
    category: 'dots',
    tags: ['dots', 'three', 'descending', 'melodic', 'completion'],
    description: 'Three dots pattern with descending tones',
    useCase: 'Completion feedback, saving indicators, process ending'
  },
  {
    name: 'Three Dots Fast',
    file: '/sounds/dots-patterns/three_dots_fast.wav',
    category: 'dots',
    tags: ['dots', 'three', 'fast', 'quick', 'urgent'],
    description: 'Rapid three dots for urgent feedback',
    useCase: 'Fast loading, quick processes, urgent notifications'
  },
  {
    name: 'Three Dots Echo',
    file: '/sounds/dots-patterns/three_dots_echo.wav',
    category: 'dots',
    tags: ['dots', 'three', 'echo', 'spatial', 'ambient'],
    description: 'Three dots with echo effect',
    useCase: 'Spatial interfaces, immersive loading, ambient feedback'
  },
  {
    name: 'Five Dots Melody',
    file: '/sounds/dots-patterns/five_dots_melody.wav',
    category: 'dots',
    tags: ['dots', 'five', 'melody', 'musical', 'extended'],
    description: 'Extended five-dot melodic pattern',
    useCase: 'Multi-step processes, extended loading, progress stages'
  },
  
  // Multi-Click Patterns
  {
    name: 'Double Click',
    file: '/sounds/dots-patterns/double_click.wav',
    category: 'multi-click',
    tags: ['click', 'double', 'tactile', 'confirm', 'mechanical'],
    description: 'Satisfying double-click pattern',
    useCase: 'Double-tap actions, confirmations, selections'
  },
  {
    name: 'Triple Click Cascade',
    file: '/sounds/dots-patterns/triple_click_cascade.wav',
    category: 'multi-click',
    tags: ['click', 'triple', 'cascade', 'sequence', 'premium'],
    description: 'Cascading triple-click with rising pitch',
    useCase: 'Special actions, unlocking features, achievements'
  },
  {
    name: 'Mechanical Sequence',
    file: '/sounds/dots-patterns/mech_sequence.wav',
    category: 'multi-click',
    tags: ['mechanical', 'sequence', 'complex', 'industrial', 'tactile'],
    description: 'Complex mechanical action sequence',
    useCase: 'Industrial interfaces, complex operations, machinery feedback'
  },
  
  // AI/Processing Patterns
  {
    name: 'Neural Pulse',
    file: '/sounds/dots-patterns/neural_pulse.wav',
    category: 'sequence',
    tags: ['ai', 'neural', 'pulse', 'thinking', 'processing'],
    description: 'Neural network firing pattern',
    useCase: 'AI processing, machine learning feedback, thinking states'
  },
  {
    name: 'Quantum Dots',
    file: '/sounds/dots-patterns/quantum_dots.wav',
    category: 'sequence',
    tags: ['quantum', 'dots', 'uncertain', 'complex', 'sci-fi'],
    description: 'Quantum-inspired dot pattern with uncertainty',
    useCase: 'Quantum computing, probabilistic processes, advanced calculations'
  },
  {
    name: 'Processing Steps',
    file: '/sounds/dots-patterns/processing_steps.wav',
    category: 'sequence',
    tags: ['processing', 'steps', 'sequential', 'rising', 'progress'],
    description: 'Sequential processing steps with rising tones',
    useCase: 'Multi-stage processing, build steps, compilation feedback'
  },
  
  // Special Patterns
  {
    name: 'Morse Dots',
    file: '/sounds/dots-patterns/morse_dots.wav',
    category: 'dots',
    tags: ['morse', 'dots', 'communication', 'rhythmic', 'classic'],
    description: 'Three dots in morse code pattern',
    useCase: 'Communication apps, messaging, notifications'
  },
  {
    name: 'Typewriter Sequence',
    file: '/sounds/dots-patterns/typewriter_seq.wav',
    category: 'multi-click',
    tags: ['typewriter', 'mechanical', 'typing', 'nostalgic', 'keys'],
    description: 'Mechanical typewriter key sequence',
    useCase: 'Typing feedback, text input, writing applications'
  },
  {
    name: 'Radar Dots',
    file: '/sounds/dots-patterns/radar_dots.wav',
    category: 'sequence',
    tags: ['radar', 'sweep', 'dots', 'scanning', 'detection'],
    description: 'Radar sweep with detection dots',
    useCase: 'Scanning interfaces, detection systems, search operations'
  },
  {
    name: 'Communication Burst',
    file: '/sounds/dots-patterns/comm_burst.wav',
    category: 'sequence',
    tags: ['communication', 'burst', 'data', 'transmission', 'digital'],
    description: 'Digital communication burst pattern',
    useCase: 'Data transmission, network activity, upload/download feedback'
  }
]