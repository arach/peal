export interface KeyboardSound {
  name: string
  file: string
  switchType: 'linear' | 'clicky' | 'tactile' | 'special' | 'reference'
  keyType: string
  displayName: string
  description: string
  colorCode: string
  useCase: string
  tags?: string[]
}

export const keyboardPresetsV2: KeyboardSound[] = [
  // === REFERENCE SAMPLES (from real recording) ===
  {
    name: 'reference_single_1',
    file: '/sounds/typing-samples/single_key_1.wav',
    switchType: 'reference',
    keyType: 'reference',
    displayName: 'Reference Key 1',
    description: 'Real creamy keyboard single keystroke',
    colorCode: 'slate',
    useCase: 'Reference for synthetic sound comparison',
    tags: ['reference', 'real', 'creamy', 'single']
  },
  {
    name: 'reference_sequence_1',
    file: '/sounds/typing-samples/typing_sequence_1.wav',
    switchType: 'reference',
    keyType: 'reference',
    displayName: 'Reference Sequence',
    description: 'Real creamy keyboard typing sequence (1.5s)',
    colorCode: 'slate',
    useCase: 'Reference for typing rhythm and sound',
    tags: ['reference', 'real', 'creamy', 'sequence']
  },
  {
    name: 'reference_long_1',
    file: '/sounds/typing-samples/typing_long_1.wav',
    switchType: 'reference',
    keyType: 'reference',
    displayName: 'Reference Long',
    description: 'Real creamy keyboard extended typing (3s)',
    colorCode: 'slate',
    useCase: 'Reference for longer typing patterns',
    tags: ['reference', 'real', 'creamy', 'long']
  },

  // === BEST REALISTIC SOUNDS ===
  {
    name: 'key_tactile_realistic',
    file: '/sounds/realistic-keyboard/key_tactile_realistic.wav',
    switchType: 'tactile',
    keyType: 'switch',
    displayName: 'Tactile Brown',
    description: 'Realistic tactile switch with proper frequency balance',
    colorCode: 'amber',
    useCase: 'General typing with tactile feedback',
    tags: ['keyboard', 'tactile', 'realistic', 'balanced']
  },
  {
    name: 'creamy_tactile',
    file: '/sounds/creamy-keys/creamy_tactile.wav',
    switchType: 'tactile',
    keyType: 'switch',
    displayName: 'Creamy Tactile',
    description: 'Subtle bump with creamy thock',
    colorCode: 'purple',
    useCase: 'Premium typing experience',
    tags: ['keyboard', 'creamy', 'tactile', 'premium']
  },
  {
    name: 'key_spacebar_realistic',
    file: '/sounds/realistic-keyboard/key_spacebar_realistic.wav',
    switchType: 'special',
    keyType: 'spacebar',
    displayName: 'Spacebar',
    description: 'Realistic spacebar with stabilizer sound',
    colorCode: 'gray',
    useCase: 'Space key feedback',
    tags: ['keyboard', 'spacebar', 'realistic']
  },
  {
    name: 'creamy_typing',
    file: '/sounds/creamy-keys/creamy_typing.wav',
    switchType: 'special',
    keyType: 'sequence',
    displayName: 'Creamy Typing',
    description: 'Natural typing rhythm with creamy sounds',
    colorCode: 'purple',
    useCase: 'Typing sequences and demos',
    tags: ['keyboard', 'creamy', 'typing', 'sequence']
  },

  // === EXPERIMENTAL SOUNDS (3-5 variations) ===
  {
    name: 'experimental_thock',
    file: '/sounds/experimental/deep_thock.wav',
    switchType: 'tactile',
    keyType: 'experimental',
    displayName: 'Deep Thock (Exp)',
    description: 'Experimental deep thocky sound',
    colorCode: 'green',
    useCase: 'Testing deeper frequency profiles',
    tags: ['keyboard', 'experimental', 'thock', 'deep']
  },
  {
    name: 'experimental_clack',
    file: '/sounds/experimental/sharp_clack.wav',
    switchType: 'clicky',
    keyType: 'experimental',
    displayName: 'Sharp Clack (Exp)',
    description: 'Experimental clicky sound with sharp attack',
    colorCode: 'green',
    useCase: 'Testing clicky switch synthesis',
    tags: ['keyboard', 'experimental', 'clicky', 'sharp']
  },
  {
    name: 'experimental_hybrid',
    file: '/sounds/experimental/hybrid_switch.wav',
    switchType: 'tactile',
    keyType: 'experimental',
    displayName: 'Hybrid Switch (Exp)',
    description: 'Experimental tactile-linear hybrid',
    colorCode: 'green',
    useCase: 'Testing new switch sound profiles',
    tags: ['keyboard', 'experimental', 'hybrid', 'tactile']
  }
]

// Export a simplified view with just the essentials
export const keyboardCategories = {
  reference: keyboardPresetsV2.filter(s => s.switchType === 'reference'),
  realistic: keyboardPresetsV2.filter(s => 
    ['key_tactile_realistic', 'creamy_tactile', 'key_spacebar_realistic', 'creamy_typing']
    .includes(s.name)
  ),
  experimental: keyboardPresetsV2.filter(s => s.keyType === 'experimental')
}