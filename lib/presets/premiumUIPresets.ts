// Premium UI Sound Presets
// Modern, elegant sounds inspired by Apple, Palantir, Airbnb

export interface PremiumSoundPreset {
  id: string
  name: string
  category: string
  description: string
  audioFile: string // Path to WAV file
  tags: string[]
  duration: number // in milliseconds
  characteristics: {
    style: 'minimal' | 'elegant' | 'warm' | 'crisp'
    intensity: 'subtle' | 'moderate' | 'prominent'
    emotion: 'neutral' | 'positive' | 'negative' | 'playful'
  }
}

export const premiumUIPresets: PremiumSoundPreset[] = [
  // INTERACTION SOUNDS
  {
    id: 'modern-tap',
    name: 'Modern Tap',
    category: 'interaction',
    description: 'Ultra-short, refined tap like Apple trackpad',
    audioFile: '/sounds/modern/tap.wav',
    duration: 25,
    tags: ['tap', 'click', 'minimal', 'subtle'],
    characteristics: {
      style: 'minimal',
      intensity: 'subtle',
      emotion: 'neutral'
    }
  },
  {
    id: 'modern-click',
    name: 'Elegant Click',
    category: 'interaction',
    description: 'Warm bell-like click inspired by Airbnb',
    audioFile: '/sounds/modern/click.wav',
    duration: 60,
    tags: ['click', 'button', 'warm', 'bell'],
    characteristics: {
      style: 'elegant',
      intensity: 'moderate',
      emotion: 'positive'
    }
  },

  // FEEDBACK SOUNDS
  {
    id: 'modern-success',
    name: 'Success Chime',
    category: 'feedback',
    description: 'Ascending notes for positive feedback',
    audioFile: '/sounds/modern/success.wav',
    duration: 300,
    tags: ['success', 'complete', 'positive', 'chime'],
    characteristics: {
      style: 'elegant',
      intensity: 'moderate',
      emotion: 'positive'
    }
  },
  {
    id: 'modern-error',
    name: 'Subtle Error',
    category: 'feedback',
    description: 'Filtered noise burst for gentle error indication',
    audioFile: '/sounds/modern/error.wav',
    duration: 80,
    tags: ['error', 'warning', 'subtle', 'filtered'],
    characteristics: {
      style: 'minimal',
      intensity: 'subtle',
      emotion: 'negative'
    }
  },

  // NOTIFICATION SOUNDS
  {
    id: 'modern-notification',
    name: 'Warm Notification',
    category: 'notification',
    description: 'Friendly notification with subtle vibrato',
    audioFile: '/sounds/modern/notification.wav',
    duration: 120,
    tags: ['notification', 'alert', 'warm', 'friendly'],
    characteristics: {
      style: 'warm',
      intensity: 'moderate',
      emotion: 'neutral'
    }
  },
  {
    id: 'modern-message',
    name: 'Glass Message',
    category: 'notification',
    description: 'Crystalline chime for incoming messages',
    audioFile: '/sounds/modern/message.wav',
    duration: 350,
    tags: ['message', 'chime', 'glass', 'crystal'],
    characteristics: {
      style: 'elegant',
      intensity: 'subtle',
      emotion: 'positive'
    }
  },

  // NAVIGATION SOUNDS
  {
    id: 'modern-transition',
    name: 'Smooth Transition',
    category: 'navigation',
    description: 'Filtered sweep for page transitions',
    audioFile: '/sounds/modern/transition.wav',
    duration: 120,
    tags: ['transition', 'sweep', 'navigation', 'smooth'],
    characteristics: {
      style: 'minimal',
      intensity: 'subtle',
      emotion: 'neutral'
    }
  },

  // LEGACY FUTURISTIC SOUNDS (for comparison)
  {
    id: 'futuristic-tap',
    name: 'Futuristic Tap',
    category: 'interaction',
    description: 'High-frequency FM synthesis tap',
    audioFile: '/sounds/futuristic/tap.wav',
    duration: 40,
    tags: ['tap', 'futuristic', 'fm', 'synthetic'],
    characteristics: {
      style: 'crisp',
      intensity: 'prominent',
      emotion: 'neutral'
    }
  },
  {
    id: 'futuristic-click',
    name: 'Futuristic Click',
    category: 'interaction',
    description: 'Mid-range FM click with modulation',
    audioFile: '/sounds/futuristic/click.wav',
    duration: 80,
    tags: ['click', 'futuristic', 'fm', 'modulated'],
    characteristics: {
      style: 'crisp',
      intensity: 'prominent',
      emotion: 'neutral'
    }
  },
  {
    id: 'futuristic-beep',
    name: 'Futuristic Beep',
    category: 'notification',
    description: 'Low harmonic beep with additive synthesis',
    audioFile: '/sounds/futuristic/beep.wav',
    duration: 150,
    tags: ['beep', 'futuristic', 'harmonic', 'additive'],
    characteristics: {
      style: 'crisp',
      intensity: 'moderate',
      emotion: 'neutral'
    }
  },
  {
    id: 'futuristic-success',
    name: 'Futuristic Success',
    category: 'feedback',
    description: 'Three-tone ascending FM sequence',
    audioFile: '/sounds/futuristic/success.wav',
    duration: 200,
    tags: ['success', 'futuristic', 'sequence', 'ascending'],
    characteristics: {
      style: 'crisp',
      intensity: 'prominent',
      emotion: 'positive'
    }
  },
  {
    id: 'futuristic-error',
    name: 'Futuristic Error',
    category: 'feedback',
    description: 'Dissonant dual-tone with high modulation',
    audioFile: '/sounds/futuristic/error.wav',
    duration: 150,
    tags: ['error', 'futuristic', 'dissonant', 'fm'],
    characteristics: {
      style: 'crisp',
      intensity: 'prominent',
      emotion: 'negative'
    }
  },
  {
    id: 'futuristic-alert',
    name: 'Futuristic Alert',
    category: 'notification',
    description: 'Dual-pulse FM notification',
    audioFile: '/sounds/futuristic/alert.wav',
    duration: 250,
    tags: ['alert', 'futuristic', 'pulse', 'fm'],
    characteristics: {
      style: 'crisp',
      intensity: 'prominent',
      emotion: 'neutral'
    }
  },
  {
    id: 'futuristic-transition',
    name: 'Futuristic Transition',
    category: 'navigation',
    description: 'Frequency sweep with exponential curve',
    audioFile: '/sounds/futuristic/transition.wav',
    duration: 150,
    tags: ['transition', 'futuristic', 'sweep', 'exponential'],
    characteristics: {
      style: 'crisp',
      intensity: 'moderate',
      emotion: 'neutral'
    }
  }
]

// Helper function to get premium presets by category
export function getPremiumPresetsByCategory(category: string): PremiumSoundPreset[] {
  return premiumUIPresets.filter(preset => preset.category === category)
}

// Helper function to get premium presets by style
export function getPremiumPresetsByStyle(style: string): PremiumSoundPreset[] {
  return premiumUIPresets.filter(preset => preset.characteristics.style === style)
}

// Helper function to get modern sounds only (exclude futuristic)
export function getModernPresetsOnly(): PremiumSoundPreset[] {
  return premiumUIPresets.filter(preset => !preset.id.startsWith('futuristic-'))
}

// Helper function to compare modern vs futuristic
export function getComparisonPairs(): Array<{modern: PremiumSoundPreset, futuristic: PremiumSoundPreset}> {
  const pairs = []
  const modernTap = premiumUIPresets.find(p => p.id === 'modern-tap')
  const futuristicTap = premiumUIPresets.find(p => p.id === 'futuristic-tap')
  if (modernTap && futuristicTap) pairs.push({modern: modernTap, futuristic: futuristicTap})
  
  const modernClick = premiumUIPresets.find(p => p.id === 'modern-click')
  const futuristicClick = premiumUIPresets.find(p => p.id === 'futuristic-click')
  if (modernClick && futuristicClick) pairs.push({modern: modernClick, futuristic: futuristicClick})
  
  return pairs
}