// Modern App Sound Presets
// Designed for futuristic, polished UI interactions

export interface SoundPreset {
  id: string
  name: string
  category: string
  description: string
  parameters: any
  tags: string[]
  duration: 'micro' | 'short' | 'medium' // micro: <100ms, short: 100-300ms, medium: 300-500ms
}

export const soundCategories = {
  interaction: {
    name: 'Interaction',
    description: 'User interface interactions',
    icon: '👆',
  },
  feedback: {
    name: 'Feedback',
    description: 'System feedback and confirmations',
    icon: '✓',
  },
  navigation: {
    name: 'Navigation',
    description: 'Navigation and transitions',
    icon: '→',
  },
  notification: {
    name: 'Notification',
    description: 'Alerts and notifications',
    icon: '🔔',
  },
  system: {
    name: 'System',
    description: 'System operations',
    icon: '⚙️',
  },
  ambient: {
    name: 'Ambient',
    description: 'Background and ambient sounds',
    icon: '〰️',
  },
}

export const modernAppPresets: SoundPreset[] = [
  // INTERACTION SOUNDS
  {
    id: 'click-soft',
    name: 'Soft Click',
    category: 'interaction',
    description: 'Gentle, refined click for primary actions',
    duration: 'micro',
    tags: ['click', 'tap', 'button', 'soft'],
    parameters: {
      type: 'sine',
      frequency: 2000,
      duration: 0.04,
      attack: 0.001,
      decay: 0.02,
      volume: 0.3,
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 2, amplitude: 0.3 },
        { ratio: 3, amplitude: 0.1 },
      ],
      filter: {
        type: 'lowpass',
        frequency: 3000,
        Q: 1,
      },
    },
  },
  {
    id: 'click-crisp',
    name: 'Crisp Click',
    category: 'interaction',
    description: 'Sharp, precise click for focused interactions',
    duration: 'micro',
    tags: ['click', 'tap', 'button', 'crisp'],
    parameters: {
      type: 'triangle',
      frequency: 3000,
      duration: 0.02,
      attack: 0.0005,
      decay: 0.015,
      volume: 0.25,
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 4, amplitude: 0.5 },
      ],
      modulation: {
        type: 'pitch',
        amount: 0.1,
        speed: 100,
      },
    },
  },
  {
    id: 'tap-glass',
    name: 'Glass Tap',
    category: 'interaction',
    description: 'Crystalline tap for premium feel',
    duration: 'short',
    tags: ['tap', 'glass', 'premium', 'delicate'],
    parameters: {
      type: 'sine',
      frequency: 4000,
      duration: 0.15,
      attack: 0.001,
      decay: 0.05,
      sustain: 0.1,
      release: 0.09,
      volume: 0.2,
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 2.1, amplitude: 0.7 },
        { ratio: 3.4, amplitude: 0.4 },
        { ratio: 5.2, amplitude: 0.2 },
      ],
      reverb: {
        amount: 0.15,
        size: 0.2,
      },
    },
  },
  {
    id: 'hover-subtle',
    name: 'Subtle Hover',
    category: 'interaction',
    description: 'Barely audible hover feedback',
    duration: 'micro',
    tags: ['hover', 'subtle', 'feedback'],
    parameters: {
      type: 'sine',
      frequency: 800,
      duration: 0.05,
      attack: 0.02,
      decay: 0.03,
      volume: 0.1,
      filter: {
        type: 'bandpass',
        frequency: 1000,
        Q: 2,
      },
    },
  },

  // FEEDBACK SOUNDS
  {
    id: 'success-chime',
    name: 'Success Chime',
    category: 'feedback',
    description: 'Positive completion feedback',
    duration: 'short',
    tags: ['success', 'complete', 'positive'],
    parameters: {
      type: 'sine',
      frequency: 800,
      duration: 0.25,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.15,
      release: 0.04,
      volume: 0.3,
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 2, amplitude: 0.4 },
        { ratio: 3, amplitude: 0.2 },
      ],
      pitch: {
        envelope: [
          { time: 0, value: 1 },
          { time: 0.1, value: 1.5 },
          { time: 0.25, value: 1.5 },
        ],
      },
    },
  },
  {
    id: 'error-soft',
    name: 'Soft Error',
    category: 'feedback',
    description: 'Gentle error indication',
    duration: 'short',
    tags: ['error', 'warning', 'soft'],
    parameters: {
      type: 'triangle',
      frequency: 300,
      duration: 0.2,
      attack: 0.01,
      decay: 0.19,
      volume: 0.25,
      modulation: {
        type: 'amplitude',
        amount: 0.3,
        speed: 15,
      },
      filter: {
        type: 'lowpass',
        frequency: 600,
        Q: 2,
      },
    },
  },
  {
    id: 'confirm-pop',
    name: 'Confirm Pop',
    category: 'feedback',
    description: 'Quick confirmation sound',
    duration: 'micro',
    tags: ['confirm', 'accept', 'pop'],
    parameters: {
      type: 'sine',
      frequency: 1200,
      duration: 0.08,
      attack: 0.005,
      decay: 0.02,
      sustain: 0.03,
      release: 0.025,
      volume: 0.35,
      pitch: {
        envelope: [
          { time: 0, value: 0.8 },
          { time: 0.02, value: 1.2 },
          { time: 0.08, value: 1 },
        ],
      },
    },
  },

  // NAVIGATION SOUNDS
  {
    id: 'swipe-whoosh',
    name: 'Swipe Whoosh',
    category: 'navigation',
    description: 'Smooth transition sound',
    duration: 'short',
    tags: ['swipe', 'transition', 'whoosh'],
    parameters: {
      type: 'noise',
      frequency: 2000,
      duration: 0.15,
      attack: 0.02,
      decay: 0.13,
      volume: 0.2,
      filter: {
        type: 'bandpass',
        frequency: 1500,
        Q: 0.5,
        envelope: [
          { time: 0, value: 500 },
          { time: 0.05, value: 2000 },
          { time: 0.15, value: 800 },
        ],
      },
    },
  },
  {
    id: 'page-turn',
    name: 'Page Turn',
    category: 'navigation',
    description: 'Digital page transition',
    duration: 'short',
    tags: ['page', 'transition', 'flip'],
    parameters: {
      type: 'noise',
      frequency: 1000,
      duration: 0.12,
      attack: 0.01,
      decay: 0.11,
      volume: 0.15,
      filter: {
        type: 'highpass',
        frequency: 800,
        Q: 1,
      },
      modulation: {
        type: 'amplitude',
        amount: 0.5,
        speed: 30,
      },
    },
  },

  // NOTIFICATION SOUNDS
  {
    id: 'notif-gentle',
    name: 'Gentle Notification',
    category: 'notification',
    description: 'Soft, non-intrusive alert',
    duration: 'short',
    tags: ['notification', 'alert', 'gentle'],
    parameters: {
      type: 'sine',
      frequency: 600,
      duration: 0.3,
      attack: 0.05,
      decay: 0.1,
      sustain: 0.1,
      release: 0.05,
      volume: 0.25,
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 2, amplitude: 0.3 },
      ],
      pitch: {
        envelope: [
          { time: 0, value: 1 },
          { time: 0.1, value: 1.2 },
          { time: 0.2, value: 1 },
          { time: 0.3, value: 1.1 },
        ],
      },
    },
  },
  {
    id: 'notif-urgent',
    name: 'Urgent Alert',
    category: 'notification',
    description: 'Attention-grabbing notification',
    duration: 'medium',
    tags: ['notification', 'alert', 'urgent', 'important'],
    parameters: {
      type: 'sawtooth',
      frequency: 880,
      duration: 0.4,
      attack: 0.005,
      decay: 0.05,
      sustain: 0.3,
      release: 0.045,
      volume: 0.35,
      modulation: {
        type: 'frequency',
        amount: 100,
        speed: 8,
      },
      filter: {
        type: 'lowpass',
        frequency: 2000,
        Q: 1,
      },
    },
  },

  // SYSTEM SOUNDS
  {
    id: 'download-start',
    name: 'Download Start',
    category: 'system',
    description: 'Initiating download process',
    duration: 'short',
    tags: ['download', 'start', 'process'],
    parameters: {
      type: 'sine',
      frequency: 400,
      duration: 0.2,
      attack: 0.05,
      decay: 0.05,
      sustain: 0.05,
      release: 0.05,
      volume: 0.3,
      pitch: {
        envelope: [
          { time: 0, value: 0.5 },
          { time: 0.1, value: 1 },
          { time: 0.2, value: 1.2 },
        ],
      },
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 3, amplitude: 0.3 },
        { ratio: 5, amplitude: 0.1 },
      ],
    },
  },
  {
    id: 'download-complete',
    name: 'Download Complete',
    category: 'system',
    description: 'Download finished successfully',
    duration: 'short',
    tags: ['download', 'complete', 'success'],
    parameters: {
      type: 'sine',
      frequency: 600,
      duration: 0.3,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.2,
      release: 0.04,
      volume: 0.35,
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 2, amplitude: 0.5 },
        { ratio: 3, amplitude: 0.3 },
      ],
      pitch: {
        envelope: [
          { time: 0, value: 1 },
          { time: 0.05, value: 1.5 },
          { time: 0.15, value: 1.5 },
          { time: 0.2, value: 2 },
          { time: 0.3, value: 2 },
        ],
      },
    },
  },
  {
    id: 'connect-sync',
    name: 'Connect Sync',
    category: 'system',
    description: 'Device connection established',
    duration: 'medium',
    tags: ['connect', 'sync', 'pair', 'link'],
    parameters: {
      type: 'sine',
      frequency: 440,
      duration: 0.4,
      attack: 0.1,
      decay: 0.05,
      sustain: 0.2,
      release: 0.05,
      volume: 0.3,
      modulation: {
        type: 'frequency',
        amount: 50,
        speed: 10,
      },
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 1.5, amplitude: 0.5 },
        { ratio: 2, amplitude: 0.3 },
      ],
      effects: {
        delay: {
          time: 0.05,
          feedback: 0.3,
          amount: 0.2,
        },
      },
    },
  },
  {
    id: 'process-loop',
    name: 'Process Loop',
    category: 'system',
    description: 'Background process indicator',
    duration: 'medium',
    tags: ['process', 'loading', 'working', 'loop'],
    parameters: {
      type: 'sine',
      frequency: 200,
      duration: 0.5,
      attack: 0.2,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1,
      volume: 0.15,
      modulation: {
        type: 'amplitude',
        amount: 0.3,
        speed: 3,
      },
      filter: {
        type: 'lowpass',
        frequency: 400,
        Q: 2,
        envelope: [
          { time: 0, value: 200 },
          { time: 0.25, value: 600 },
          { time: 0.5, value: 200 },
        ],
      },
    },
  },

  // AMBIENT SOUNDS
  {
    id: 'ambient-pulse',
    name: 'Ambient Pulse',
    category: 'ambient',
    description: 'Subtle background presence',
    duration: 'medium',
    tags: ['ambient', 'background', 'pulse', 'atmosphere'],
    parameters: {
      type: 'sine',
      frequency: 80,
      duration: 0.5,
      attack: 0.2,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1,
      volume: 0.1,
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 2, amplitude: 0.2 },
        { ratio: 3, amplitude: 0.1 },
      ],
      filter: {
        type: 'lowpass',
        frequency: 200,
        Q: 0.5,
      },
      reverb: {
        amount: 0.4,
        size: 0.8,
      },
    },
  },
  {
    id: 'ambient-sparkle',
    name: 'Digital Sparkle',
    category: 'ambient',
    description: 'Ethereal digital atmosphere',
    duration: 'medium',
    tags: ['ambient', 'sparkle', 'ethereal', 'digital'],
    parameters: {
      type: 'sine',
      frequency: 2000,
      duration: 0.3,
      attack: 0.1,
      decay: 0.05,
      sustain: 0.1,
      release: 0.05,
      volume: 0.08,
      harmonics: [
        { ratio: 1, amplitude: 1 },
        { ratio: 1.5, amplitude: 0.5 },
        { ratio: 2.1, amplitude: 0.3 },
        { ratio: 3.7, amplitude: 0.2 },
      ],
      modulation: {
        type: 'frequency',
        amount: 200,
        speed: 0.5,
      },
      reverb: {
        amount: 0.6,
        size: 0.9,
      },
    },
  },
]

// Helper function to get presets by category
export function getPresetsByCategory(category: string): SoundPreset[] {
  return modernAppPresets.filter(preset => preset.category === category)
}

// Helper function to get presets by tags
export function getPresetsByTags(tags: string[]): SoundPreset[] {
  return modernAppPresets.filter(preset => 
    tags.some(tag => preset.tags.includes(tag))
  )
}

// Helper function to get a specific preset
export function getPreset(id: string): SoundPreset | undefined {
  return modernAppPresets.find(preset => preset.id === id)
}