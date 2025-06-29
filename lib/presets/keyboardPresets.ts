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