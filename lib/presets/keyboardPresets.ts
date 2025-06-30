export interface KeyboardSound {
  name: string
  file: string
  switchType: 'linear' | 'clicky' | 'tactile' | 'special'
  keyType: string
  displayName: string
  description: string
  colorCode: string
  useCase: string
  tags?: string[]
}

export const keyboardPresets: KeyboardSound[] = [
  // Properly Spaced Sounds
  {
    name: 'single_key',
    file: '/sounds/proper-keyboard/single_key.wav',
    switchType: 'linear',
    keyType: 'switch',
    displayName: 'Single Key (Spaced)',
    description: 'Single keypress with proper silence before and after',
    colorCode: 'emerald',
    useCase: 'UI feedback, single key actions',
    tags: ['keyboard', 'single', 'spaced', 'breathable', 'proper']
  },
  {
    name: 'two_keys',
    file: '/sounds/proper-keyboard/two_keys.wav',
    switchType: 'special',
    keyType: 'sequence',
    displayName: 'Two Keys',
    description: 'Two keypresses with natural spacing',
    colorCode: 'emerald',
    useCase: 'Double key actions, shortcuts',
    tags: ['keyboard', 'double', 'sequence', 'spaced', 'natural']
  },
  {
    name: 'word_typing',
    file: '/sounds/proper-keyboard/word_typing.wav',
    switchType: 'special',
    keyType: 'sequence',
    displayName: 'Word Typing',
    description: '5-6 keys typed as a word with natural rhythm',
    colorCode: 'emerald',
    useCase: 'Word completion, typing feedback',
    tags: ['keyboard', 'word', 'typing', 'rhythm', 'natural']
  },
  {
    name: 'sentence_typing',
    file: '/sounds/proper-keyboard/sentence_typing.wav',
    switchType: 'special',
    keyType: 'sequence',
    displayName: 'Sentence Typing',
    description: 'Full sentence with spaces and punctuation',
    colorCode: 'emerald',
    useCase: 'Typing demonstrations, ambient feedback',
    tags: ['keyboard', 'sentence', 'typing', 'complete', 'varied']
  },
  {
    name: 'typing_ambience',
    file: '/sounds/proper-keyboard/typing_ambience.wav',
    switchType: 'special',
    keyType: 'ambience',
    displayName: 'Typing Ambience (Loopable)',
    description: 'Multiple layers of typing, perfect for backgrounds',
    colorCode: 'emerald',
    useCase: 'Background ambience, office sounds, productivity apps',
    tags: ['keyboard', 'ambience', 'loop', 'background', 'office']
  },
  
  // Creamy Sounds
  {
    name: 'creamy_keypress',
    file: '/sounds/creamy-keys/creamy_keypress.wav',
    switchType: 'linear',
    keyType: 'switch',
    displayName: 'Creamy Thock',
    description: 'Deep, satisfying thock with smooth mid frequencies',
    colorCode: 'purple',
    useCase: 'Premium typing experience, ASMR content',
    tags: ['keyboard', 'creamy', 'thock', 'deep', 'satisfying']
  },
  {
    name: 'creamy_linear',
    file: '/sounds/creamy-keys/creamy_linear.wav',
    switchType: 'linear',
    keyType: 'switch',
    displayName: 'Creamy Linear',
    description: 'Smooth linear with creamy bottom-out',
    colorCode: 'purple',
    useCase: 'Smooth typing with satisfying feedback',
    tags: ['keyboard', 'creamy', 'linear', 'smooth', 'thock']
  },
  {
    name: 'creamy_tactile',
    file: '/sounds/creamy-keys/creamy_tactile.wav',
    switchType: 'tactile',
    keyType: 'switch',
    displayName: 'Creamy Tactile',
    description: 'Subtle bump with creamy thock',
    colorCode: 'purple',
    useCase: 'Tactile typing with premium sound',
    tags: ['keyboard', 'creamy', 'tactile', 'bump', 'premium']
  },
  {
    name: 'creamy_spacebar',
    file: '/sounds/creamy-keys/creamy_spacebar.wav',
    switchType: 'special',
    keyType: 'spacebar',
    displayName: 'Creamy Spacebar',
    description: 'Deep spacebar with minimal rattle',
    colorCode: 'purple',
    useCase: 'Well-tuned spacebar sound',
    tags: ['keyboard', 'creamy', 'spacebar', 'deep', 'tuned']
  },
  {
    name: 'creamy_typing',
    file: '/sounds/creamy-keys/creamy_typing.wav',
    switchType: 'special',
    keyType: 'sequence',
    displayName: 'Creamy Typing',
    description: 'Natural typing rhythm with creamy sounds',
    colorCode: 'purple',
    useCase: 'Background typing, ASMR content',
    tags: ['keyboard', 'creamy', 'typing', 'sequence', 'asmr']
  },
  
  // Switch Types
  {
    name: 'key_linear_realistic',
    file: '/sounds/realistic-keyboard/key_linear_realistic.wav',
    switchType: 'linear',
    keyType: 'switch',
    displayName: 'Linear (Red) - Realistic',
    description: 'Plastic impact with spring vibration, no tactile bump',
    colorCode: 'red',
    useCase: 'Gaming, fast typing without feedback',
    tags: ['keyboard', 'linear', 'red', 'realistic', 'mechanical']
  },
  {
    name: 'key_clicky_realistic',
    file: '/sounds/realistic-keyboard/key_clicky_realistic.wav',
    switchType: 'clicky',
    keyType: 'switch',
    displayName: 'Clicky (Blue) - Realistic',
    description: 'Click jacket hitting housing with plastic resonance',
    colorCode: 'blue',
    useCase: 'Typing with audible feedback, not for quiet environments',
    tags: ['keyboard', 'clicky', 'blue', 'realistic', 'loud']
  },
  {
    name: 'key_tactile_realistic',
    file: '/sounds/realistic-keyboard/key_tactile_realistic.wav',
    switchType: 'tactile',
    keyType: 'switch',
    displayName: 'Tactile (Brown) - Realistic',
    description: 'Leaf spring bump with case resonance',
    colorCode: 'amber',
    useCase: 'Office typing, balanced feedback without noise',
    tags: ['keyboard', 'tactile', 'brown', 'realistic', 'office']
  },
  
  // Balanced Typing Sounds (Not Too High)
  {
    name: 'balanced_single_key',
    file: '/sounds/balanced-typing/balanced_single_key.wav',
    switchType: 'tactile',
    keyType: 'switch',
    displayName: 'Balanced Key',
    description: 'Natural keypress centered around 400-1200 Hz',
    colorCode: 'orange',
    useCase: 'UI feedback with pleasant, balanced tone',
    tags: ['keyboard', 'balanced', 'natural', 'tactile', 'pleasant']
  },
  {
    name: 'balanced_typing_mix',
    file: '/sounds/balanced-typing/balanced_typing_mix.wav',
    switchType: 'special',
    keyType: 'sequence',
    displayName: 'Balanced Typing Mix',
    description: 'Natural typing with balanced frequency profile',
    colorCode: 'orange',
    useCase: 'Typing demonstrations with realistic sound',
    tags: ['keyboard', 'typing', 'balanced', 'natural', 'sequence']
  },
  
  // Special Keys
  {
    name: 'key_spacebar_realistic',
    file: '/sounds/realistic-keyboard/key_spacebar_realistic.wav',
    switchType: 'special',
    keyType: 'spacebar',
    displayName: 'Spacebar - Realistic',
    description: 'Multiple stabilizer rattles with PCB flex',
    colorCode: 'gray',
    useCase: 'Space key feedback in typing applications',
    tags: ['keyboard', 'spacebar', 'stabilizer', 'realistic']
  },
  {
    name: 'key_enter',
    file: '/sounds/keyboard-sounds/key_enter.wav',
    switchType: 'special',
    keyType: 'enter',
    displayName: 'Enter Key',
    description: 'Authoritative click for confirmations',
    colorCode: 'green',
    useCase: 'Confirmation actions, form submissions',
    tags: ['keyboard', 'enter', 'confirm', 'authoritative']
  },
  {
    name: 'key_backspace',
    file: '/sounds/keyboard-sounds/key_backspace.wav',
    switchType: 'special',
    keyType: 'backspace',
    displayName: 'Backspace',
    description: 'Deliberate press for deletions',
    colorCode: 'orange',
    useCase: 'Delete actions, error corrections',
    tags: ['keyboard', 'backspace', 'delete', 'heavy']
  },
  {
    name: 'key_letter',
    file: '/sounds/keyboard-sounds/key_letter.wav',
    switchType: 'special',
    keyType: 'letter',
    displayName: 'Letter Key',
    description: 'Quick, light press for fast typing',
    colorCode: 'slate',
    useCase: 'Regular typing feedback, chat applications',
    tags: ['keyboard', 'letter', 'typing', 'light', 'fast']
  },
  {
    name: 'key_modifier',
    file: '/sounds/keyboard-sounds/key_modifier.wav',
    switchType: 'special',
    keyType: 'modifier',
    displayName: 'Modifier Key',
    description: 'Distinct click for Shift/Ctrl/Alt',
    colorCode: 'purple',
    useCase: 'Modifier key feedback, keyboard shortcuts',
    tags: ['keyboard', 'modifier', 'shift', 'control', 'alt']
  },
  
  // Sequences
  {
    name: 'typing_realistic',
    file: '/sounds/realistic-keyboard/typing_realistic.wav',
    switchType: 'special',
    keyType: 'sequence',
    displayName: 'Realistic Typing',
    description: 'Mix of different switches in natural typing pattern',
    colorCode: 'indigo',
    useCase: 'Background typing sounds, demo sequences',
    tags: ['keyboard', 'typing', 'sequence', 'realistic', 'mechanical']
  },
  {
    name: 'keyboard_ambience',
    file: '/sounds/keyboard-sounds/keyboard_ambience.wav',
    switchType: 'special',
    keyType: 'ambience',
    displayName: 'Keyboard Ambience',
    description: 'Background typing atmosphere',
    colorCode: 'teal',
    useCase: 'Ambient office sounds, productivity apps',
    tags: ['keyboard', 'ambience', 'background', 'atmosphere', 'office']
  }
]