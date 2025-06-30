/**
 * Intelligent Sound System for Peal
 * Based on advanced analysis of futuristic UI sounds
 */

export interface SoundFingerprint {
  pitch: number;
  pitchVariance: number;
  spectralCentroid: number;
  onsetStrength: number;
  harmonicRichness: number;
  attackTime: number;
  decayTime: number;
  emotionalProfile: EmotionalProfile;
}

export interface EmotionalProfile {
  energy: number;      // 0-1: calm to energetic
  valence: number;     // -1 to 1: negative to positive
  urgency: number;     // 0-1: relaxed to urgent
  complexity: number;  // 0-1: simple to complex
}

export interface SmartSoundConfig {
  baseFrequency: number;
  duration: number;
  synthesisMethod: 'fm' | 'additive' | 'subtractive' | 'granular';
  envelope: EnvelopeConfig;
  modulation?: ModulationConfig;
  effects?: EffectsChain;
  contextualVariations?: ContextualVariation[];
}

export interface EnvelopeConfig {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  curve: 'linear' | 'exponential' | 'logarithmic';
}

export interface ModulationConfig {
  frequency: number;
  depth: number;
  shape: 'sine' | 'triangle' | 'square' | 'saw';
  envelope?: EnvelopeConfig;
}

export interface EffectsChain {
  filter?: FilterConfig;
  reverb?: ReverbConfig;
  delay?: DelayConfig;
  distortion?: DistortionConfig;
}

export interface FilterConfig {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  frequency: number;
  q: number;
  envelope?: EnvelopeConfig;
}

export interface ReverbConfig {
  roomSize: number;
  damping: number;
  wetLevel: number;
}

export interface DelayConfig {
  time: number;
  feedback: number;
  wetLevel: number;
}

export interface DistortionConfig {
  amount: number;
  type: 'soft' | 'hard' | 'bitcrush';
}

export interface ContextualVariation {
  condition: string;
  modifications: Partial<SmartSoundConfig>;
}

/**
 * Sound Categories based on our analysis
 */
export const SoundCategories = {
  INTERACTION: {
    tap: {
      baseFrequency: 3000,
      duration: 40,
      pitchRange: [2500, 4000],
      characteristics: 'Very short, high frequency, instant feedback'
    },
    click: {
      baseFrequency: 1500,
      duration: 80,
      pitchRange: [1000, 2000],
      characteristics: 'Short, mid-high frequency, crisp attack'
    },
    press: {
      baseFrequency: 800,
      duration: 120,
      pitchRange: [600, 1200],
      characteristics: 'Medium duration, deeper tone, tactile feel'
    }
  },
  
  FEEDBACK: {
    success: {
      baseFrequency: [1000, 1500, 2000],
      duration: 200,
      characteristics: 'Ascending sequence, harmonic progression, positive valence'
    },
    error: {
      baseFrequency: [800, 600],
      duration: 150,
      characteristics: 'Descending or dissonant, attention-grabbing'
    },
    warning: {
      baseFrequency: 1200,
      duration: 100,
      pulses: 2,
      characteristics: 'Repeated pulse, moderate urgency'
    }
  },
  
  TRANSITION: {
    slideIn: {
      startFreq: 500,
      endFreq: 2500,
      duration: 150,
      characteristics: 'Ascending sweep, smooth curve'
    },
    slideOut: {
      startFreq: 2500,
      endFreq: 500,
      duration: 150,
      characteristics: 'Descending sweep, fading energy'
    },
    morph: {
      startFreq: 1000,
      endFreq: 1500,
      duration: 200,
      characteristics: 'Subtle frequency shift, transformation feel'
    }
  },
  
  NOTIFICATION: {
    alert: {
      baseFrequency: 1500,
      duration: 100,
      pulses: 2,
      characteristics: 'Dual pulse, clear and bright'
    },
    message: {
      baseFrequency: 2000,
      duration: 80,
      characteristics: 'Single chirp, friendly tone'
    },
    reminder: {
      baseFrequency: [1200, 1800],
      duration: 150,
      characteristics: 'Two-tone chime, gentle but noticeable'
    }
  }
} as const;

/**
 * Intelligent Sound Factory
 */
export class IntelligentSoundFactory {
  private analysisData: Map<string, SoundFingerprint>;
  
  constructor() {
    this.analysisData = new Map();
    this.loadAnalysisData();
  }
  
  private loadAnalysisData(): void {
    // Based on our analysis results
    const analysisResults = {
      'click': {
        pitch: 1015.7,
        pitchVariance: 200,
        spectralCentroid: 3500,
        onsetStrength: 0.8,
        harmonicRichness: 0.6,
        attackTime: 0.002,
        decayTime: 0.038,
        emotionalProfile: {
          energy: 0.7,
          valence: 0.5,
          urgency: 0.6,
          complexity: 0.3
        }
      },
      'beep': {
        pitch: 191.6,
        pitchVariance: 50,
        spectralCentroid: 2000,
        onsetStrength: 0.9,
        harmonicRichness: 0.8,
        attackTime: 0.001,
        decayTime: 0.05,
        emotionalProfile: {
          energy: 0.8,
          valence: 0.7,
          urgency: 0.5,
          complexity: 0.4
        }
      },
      'notification': {
        pitch: 6767.8,
        pitchVariance: 500,
        spectralCentroid: 5000,
        onsetStrength: 0.9,
        harmonicRichness: 0.7,
        attackTime: 0.001,
        decayTime: 0.03,
        emotionalProfile: {
          energy: 0.9,
          valence: 0.6,
          urgency: 0.8,
          complexity: 0.5
        }
      }
    };
    
    Object.entries(analysisResults).forEach(([name, data]) => {
      this.analysisData.set(name, data);
    });
  }
  
  /**
   * Generate smart sound configuration based on context
   */
  generateSound(
    type: string,
    context?: {
      userPreference?: 'subtle' | 'normal' | 'prominent';
      ambientNoise?: 'quiet' | 'moderate' | 'loud';
      deviceType?: 'phone' | 'tablet' | 'desktop' | 'wearable';
      timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    }
  ): SmartSoundConfig {
    const baseConfig = this.getBaseConfig(type);
    
    // Apply contextual modifications
    if (context) {
      this.applyContextualModifications(baseConfig, context);
    }
    
    return baseConfig;
  }
  
  private getBaseConfig(type: string): SmartSoundConfig {
    // Map analysis to synthesis parameters
    const fingerprint = this.analysisData.get(type) || this.analysisData.get('click')!;
    
    return {
      baseFrequency: fingerprint.pitch,
      duration: 100, // Base duration, will be modified
      synthesisMethod: this.chooseSynthesisMethod(fingerprint),
      envelope: {
        attack: fingerprint.attackTime,
        decay: fingerprint.decayTime,
        sustain: 0.3,
        release: 0.05,
        curve: 'exponential'
      },
      modulation: fingerprint.harmonicRichness > 0.5 ? {
        frequency: fingerprint.pitch * 1.5,
        depth: fingerprint.harmonicRichness,
        shape: 'sine',
        envelope: {
          attack: 0.001,
          decay: 0.02,
          sustain: 0.5,
          release: 0.03,
          curve: 'linear'
        }
      } : undefined,
      effects: this.generateEffectsChain(fingerprint)
    };
  }
  
  private chooseSynthesisMethod(fingerprint: SoundFingerprint): SmartSoundConfig['synthesisMethod'] {
    if (fingerprint.harmonicRichness > 0.7 && fingerprint.pitchVariance > 200) {
      return 'fm';
    } else if (fingerprint.harmonicRichness > 0.5) {
      return 'additive';
    } else if (fingerprint.onsetStrength > 0.8) {
      return 'granular';
    }
    return 'subtractive';
  }
  
  private generateEffectsChain(fingerprint: SoundFingerprint): EffectsChain {
    const effects: EffectsChain = {};
    
    // Add filter for spectral shaping
    if (fingerprint.spectralCentroid > 3000) {
      effects.filter = {
        type: 'highpass',
        frequency: 200,
        q: 0.7
      };
    }
    
    // Add subtle reverb for space
    if (fingerprint.emotionalProfile.complexity > 0.3) {
      effects.reverb = {
        roomSize: 0.1,
        damping: 0.8,
        wetLevel: 0.1
      };
    }
    
    return effects;
  }
  
  private applyContextualModifications(
    config: SmartSoundConfig,
    context: NonNullable<Parameters<typeof this.generateSound>[1]>
  ): void {
    // Adjust for user preference
    if (context.userPreference === 'subtle') {
      config.duration *= 0.8;
      if (config.modulation) {
        config.modulation.depth *= 0.7;
      }
    } else if (context.userPreference === 'prominent') {
      config.duration *= 1.2;
      config.baseFrequency *= 1.1;
    }
    
    // Adjust for ambient noise
    if (context.ambientNoise === 'loud') {
      config.baseFrequency *= 1.2; // Higher frequencies cut through noise better
      if (config.effects?.filter) {
        config.effects.filter.frequency *= 1.5;
      }
    }
    
    // Adjust for device type
    if (context.deviceType === 'phone') {
      // Optimize for small speakers
      if (config.baseFrequency < 300) {
        config.baseFrequency *= 2; // Avoid frequencies that phone speakers can't reproduce
      }
    } else if (context.deviceType === 'wearable') {
      // Haptic-friendly parameters
      config.duration *= 0.7;
      config.envelope.attack = Math.min(config.envelope.attack, 0.001);
    }
    
    // Adjust for time of day
    if (context.timeOfDay === 'night') {
      // Gentler sounds for nighttime
      config.baseFrequency *= 0.8;
      if (config.effects?.reverb) {
        config.effects.reverb.wetLevel *= 1.5;
      }
    }
  }
  
  /**
   * Generate sound relationships for coherent sound design
   */
  generateSoundFamily(baseName: string): Map<string, SmartSoundConfig> {
    const family = new Map<string, SmartSoundConfig>();
    const baseConfig = this.generateSound(baseName);
    
    // Create variations
    family.set('primary', baseConfig);
    
    // Secondary: slightly lower pitch, longer duration
    family.set('secondary', {
      ...baseConfig,
      baseFrequency: baseConfig.baseFrequency * 0.75,
      duration: baseConfig.duration * 1.2
    });
    
    // Success: ascending sequence
    family.set('success', {
      ...baseConfig,
      baseFrequency: baseConfig.baseFrequency,
      duration: baseConfig.duration * 2,
      contextualVariations: [{
        condition: 'sequence',
        modifications: {
          baseFrequency: baseConfig.baseFrequency * 1.5
        }
      }]
    });
    
    // Error: dissonant variation
    family.set('error', {
      ...baseConfig,
      baseFrequency: baseConfig.baseFrequency * 0.7,
      modulation: {
        frequency: baseConfig.baseFrequency * 0.7 * 1.4,
        depth: 0.8,
        shape: 'square',
        envelope: baseConfig.modulation?.envelope
      }
    });
    
    return family;
  }
}

/**
 * Preset Manager for Intelligent Sound System
 */
export class SmartPresetManager {
  private presets: Map<string, Map<string, SmartSoundConfig>>;
  private factory: IntelligentSoundFactory;
  
  constructor() {
    this.factory = new IntelligentSoundFactory();
    this.presets = new Map();
    this.initializePresets();
  }
  
  private initializePresets(): void {
    // Futuristic UI Preset (based on our analysis)
    const futuristicUI = new Map<string, SmartSoundConfig>();
    
    // High-energy clicks (Sound 3: 6767.8 Hz)
    futuristicUI.set('tap', this.factory.generateSound('notification', {
      userPreference: 'subtle',
      deviceType: 'desktop'
    }));
    
    // Mid-range interactions (Sound 1: 1015.7 Hz)
    futuristicUI.set('select', this.factory.generateSound('click', {
      userPreference: 'normal',
      deviceType: 'desktop'
    }));
    
    // Low-frequency confirmations (Sound 2: 191.6 Hz)
    futuristicUI.set('confirm', this.factory.generateSound('beep', {
      userPreference: 'prominent',
      deviceType: 'desktop'
    }));
    
    this.presets.set('futuristic-ui', futuristicUI);
    
    // Generate additional smart presets
    this.generateAdaptivePresets();
  }
  
  private generateAdaptivePresets(): void {
    // Minimal preset for subtle feedback
    const minimal = this.factory.generateSoundFamily('click');
    minimal.forEach((config, key) => {
      config.duration *= 0.6;
      if (config.modulation) {
        config.modulation.depth *= 0.5;
      }
    });
    this.presets.set('minimal', minimal);
    
    // Playful preset with more variation
    const playful = this.factory.generateSoundFamily('beep');
    playful.forEach((config, key) => {
      config.baseFrequency *= 1.2;
      if (config.modulation) {
        config.modulation.shape = 'triangle';
        config.modulation.depth *= 1.3;
      }
    });
    this.presets.set('playful', playful);
  }
  
  getPreset(name: string): Map<string, SmartSoundConfig> | undefined {
    return this.presets.get(name);
  }
  
  /**
   * Adaptive preset selection based on user behavior
   */
  selectAdaptivePreset(userProfile: {
    interactionSpeed: 'slow' | 'normal' | 'fast';
    errorRate: number;
    preferredVolume: number;
  }): string {
    if (userProfile.interactionSpeed === 'fast' && userProfile.errorRate < 0.1) {
      return 'minimal'; // Experienced users prefer subtle feedback
    } else if (userProfile.errorRate > 0.3) {
      return 'playful'; // More prominent feedback for users who need it
    }
    return 'futuristic-ui'; // Default balanced preset
  }
}

// Export singleton instances
export const intelligentSoundFactory = new IntelligentSoundFactory();
export const smartPresetManager = new SmartPresetManager();