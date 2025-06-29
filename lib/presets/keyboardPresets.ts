export interface KeyboardSound {
  name: string
  file: string
  switchType: 'linear' | 'clicky' | 'tactile' | 'special'
  keyType: string
  displayName: string
  description: string
  colorCode: string
}

export const keyboardPresets: KeyboardSound[] = [
  // Switch Types
  {
    name: 'key_linear_red',
    file: '/sounds/keyboard-sounds/key_linear_red.wav',
    switchType: 'linear',
    keyType: 'switch',
    displayName: 'Linear (Red)',
    description: 'Smooth, consistent press with no tactile bump',
    colorCode: 'red'
  },
  {
    name: 'key_clicky_blue',
    file: '/sounds/keyboard-sounds/key_clicky_blue.wav',
    switchType: 'clicky',
    keyType: 'switch',
    displayName: 'Clicky (Blue)',
    description: 'Tactile bump with audible click on press',
    colorCode: 'blue'
  },
  {
    name: 'key_tactile_brown',
    file: '/sounds/keyboard-sounds/key_tactile_brown.wav',
    switchType: 'tactile',
    keyType: 'switch',
    displayName: 'Tactile (Brown)',
    description: 'Tactile bump without the click sound',
    colorCode: 'amber'
  },
  
  // Special Keys
  {
    name: 'key_spacebar',
    file: '/sounds/keyboard-sounds/key_spacebar.wav',
    switchType: 'special',
    keyType: 'spacebar',
    displayName: 'Spacebar',
    description: 'Deep, resonant sound with stabilizer rattle',
    colorCode: 'gray'
  },
  {
    name: 'key_enter',
    file: '/sounds/keyboard-sounds/key_enter.wav',
    switchType: 'special',
    keyType: 'enter',
    displayName: 'Enter Key',
    description: 'Authoritative click for confirmations',
    colorCode: 'green'
  },
  {
    name: 'key_backspace',
    file: '/sounds/keyboard-sounds/key_backspace.wav',
    switchType: 'special',
    keyType: 'backspace',
    displayName: 'Backspace',
    description: 'Deliberate press for deletions',
    colorCode: 'orange'
  },
  {
    name: 'key_letter',
    file: '/sounds/keyboard-sounds/key_letter.wav',
    switchType: 'special',
    keyType: 'letter',
    displayName: 'Letter Key',
    description: 'Quick, light press for fast typing',
    colorCode: 'slate'
  },
  {
    name: 'key_modifier',
    file: '/sounds/keyboard-sounds/key_modifier.wav',
    switchType: 'special',
    keyType: 'modifier',
    displayName: 'Modifier Key',
    description: 'Distinct click for Shift/Ctrl/Alt',
    colorCode: 'purple'
  },
  
  // Sequences
  {
    name: 'typing_loop',
    file: '/sounds/keyboard-sounds/typing_loop.wav',
    switchType: 'special',
    keyType: 'sequence',
    displayName: 'Typing Loop',
    description: 'Multiple keys in realistic typing sequence',
    colorCode: 'indigo'
  },
  {
    name: 'keyboard_ambience',
    file: '/sounds/keyboard-sounds/keyboard_ambience.wav',
    switchType: 'special',
    keyType: 'ambience',
    displayName: 'Keyboard Ambience',
    description: 'Background typing atmosphere',
    colorCode: 'teal'
  }
]