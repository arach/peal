// Brand-Inspired Sound Presets
// Sounds inspired by popular digital brands and their design philosophies

export interface BrandPreset {
  id: string
  name: string
  brand: string
  description: string
  philosophy: string
  sounds: BrandSound[]
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export interface BrandSound {
  id: string
  name: string
  category: 'interaction' | 'feedback' | 'notification' | 'navigation' | 'process'
  audioFile: string
  duration: number
  description: string
  useCase: string
}

export const brandPresets: BrandPreset[] = [
  // PALANTIR/ANDURIL - Tactical, precise, powerful
  {
    id: 'palantir',
    name: 'Palantir/Anduril',
    brand: 'palantir',
    description: 'Tactical, precise, and powerful sounds for serious interfaces',
    philosophy: 'Every sound should convey authority, precision, and operational readiness. Zero tolerance for ambiguity.',
    colors: {
      primary: '#000000',
      secondary: '#1C1C1C',
      accent: '#00D4FF'
    },
    sounds: [
      {
        id: 'palantir-boot',
        name: 'System Boot',
        category: 'process',
        audioFile: '/sounds/brands/palantir/system_boot.wav',
        duration: 800,
        description: 'Matrix-like initialization sequence',
        useCase: 'System startup, major mode changes'
      },
      {
        id: 'palantir-sync',
        name: 'Data Sync',
        category: 'process',
        audioFile: '/sounds/brands/palantir/data_sync.wav',
        duration: 450,
        description: 'Precise pulse train for data operations',
        useCase: 'Data synchronization, real-time updates'
      },
      {
        id: 'palantir-lock',
        name: 'Target Lock',
        category: 'interaction',
        audioFile: '/sounds/brands/palantir/target_lock.wav',
        duration: 150,
        description: 'Sharp focus acquisition sound',
        useCase: 'Selection, targeting, focus states'
      },
      {
        id: 'palantir-alert',
        name: 'Critical Alert',
        category: 'notification',
        audioFile: '/sounds/brands/palantir/alert_critical.wav',
        duration: 200,
        description: 'Urgent but controlled warning',
        useCase: 'Critical system alerts, security warnings'
      },
      {
        id: 'palantir-complete',
        name: 'Mission Complete',
        category: 'feedback',
        audioFile: '/sounds/brands/palantir/mission_complete.wav',
        duration: 300,
        description: 'Authority confirmation sequence',
        useCase: 'Major operation completion'
      },
      {
        id: 'palantir-scan',
        name: 'Scan Sweep',
        category: 'process',
        audioFile: '/sounds/brands/palantir/scan_sweep.wav',
        duration: 500,
        description: 'Radar-like scanning pattern',
        useCase: 'Search operations, scanning states'
      },
      {
        id: 'palantir-init',
        name: 'Initialize',
        category: 'process',
        audioFile: '/sounds/brands/palantir/initialize.wav',
        duration: 600,
        description: 'Cascading system initialization',
        useCase: 'Module loading, system preparation'
      }
    ]
  },
  
  // APPLE - Soft, rounded, elegant
  {
    id: 'apple',
    name: 'Apple',
    brand: 'apple',
    description: 'Soft, rounded, and satisfying sounds that feel magical',
    philosophy: 'Sounds should feel like they\'re part of the physical world - glass, metal, air. Natural but perfected.',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF', 
      accent: '#0071E3'
    },
    sounds: [
      {
        id: 'apple-tap',
        name: 'Glass Tap',
        category: 'interaction',
        audioFile: '/sounds/brands/apple/glass_tap.wav',
        duration: 120,
        description: 'Resonant tap on glass surface',
        useCase: 'Primary interactions, selections'
      },
      {
        id: 'apple-mail',
        name: 'Send Mail',
        category: 'feedback',
        audioFile: '/sounds/brands/apple/send_mail.wav',
        duration: 250,
        description: 'Elegant whoosh for sending',
        useCase: 'Send actions, submissions'
      },
      {
        id: 'apple-trash',
        name: 'Empty Trash',
        category: 'feedback',
        audioFile: '/sounds/brands/apple/empty_trash.wav',
        duration: 300,
        description: 'Crumple and pop effect',
        useCase: 'Delete confirmations'
      },
      {
        id: 'apple-airdrop',
        name: 'AirDrop',
        category: 'navigation',
        audioFile: '/sounds/brands/apple/airdrop.wav',
        duration: 400,
        description: 'Spatial bloom effect',
        useCase: 'Sharing, broadcasting actions'
      },
      {
        id: 'apple-ready',
        name: 'System Ready',
        category: 'feedback',
        audioFile: '/sounds/brands/apple/system_ready.wav',
        duration: 500,
        description: 'Gentle three-note chime',
        useCase: 'System ready states'
      },
      {
        id: 'apple-breathing',
        name: 'Breathing Load',
        category: 'process',
        audioFile: '/sounds/brands/apple/breathing_load.wav',
        duration: 1200,
        description: 'Organic breathing rhythm',
        useCase: 'Background processing'
      },
      {
        id: 'apple-connect',
        name: 'Magnetic Connect',
        category: 'interaction',
        audioFile: '/sounds/brands/apple/magnetic_connect.wav',
        duration: 80,
        description: 'Satisfying snap connection',
        useCase: 'Connection events, docking'
      }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    brand: 'slack',
    description: 'Warm, friendly, and approachable sounds that foster collaboration',
    philosophy: 'Sounds should feel human, inviting, and never jarring. Like a friendly colleague tapping you on the shoulder.',
    colors: {
      primary: '#4A154B',
      secondary: '#36C5F0',
      accent: '#ECB22E'
    },
    sounds: [
      {
        id: 'slack-knock',
        name: 'Knock Knock',
        category: 'notification',
        audioFile: '/sounds/brands/slack/knock.wav',
        duration: 300,
        description: 'Iconic double knock pattern',
        useCase: 'Direct messages and mentions'
      },
      {
        id: 'slack-huddle',
        name: 'Huddle Join',
        category: 'navigation',
        audioFile: '/sounds/brands/slack/huddle_join.wav',
        duration: 250,
        description: 'Warm bell sound for joining conversations',
        useCase: 'Joining voice/video calls'
      },
      {
        id: 'slack-typing',
        name: 'Typing Dots',
        category: 'process',
        audioFile: '/sounds/brands/slack/typing_dots.wav',
        duration: 330,
        description: 'Three gentle ticks indicating someone is typing',
        useCase: 'Real-time typing indicators'
      },
      {
        id: 'slack-sent',
        name: 'Message Sent',
        category: 'feedback',
        audioFile: '/sounds/brands/slack/message_sent.wav',
        duration: 150,
        description: 'Subtle whoosh for sent messages',
        useCase: 'Message send confirmation'
      },
      {
        id: 'slack-workspace',
        name: 'Workspace Load',
        category: 'process',
        audioFile: '/sounds/brands/slack/workspace_load.wav',
        duration: 600,
        description: 'Warm cascading tones',
        useCase: 'Workspace initialization'
      },
      {
        id: 'slack-upload',
        name: 'Upload Progress',
        category: 'process',
        audioFile: '/sounds/brands/slack/upload_progress.wav',
        duration: 800,
        description: 'Rising dots for file uploads',
        useCase: 'File upload progress indicator'
      },
      {
        id: 'slack-search',
        name: 'Search Complete',
        category: 'feedback',
        audioFile: '/sounds/brands/slack/search_done.wav',
        duration: 200,
        description: 'Warm confirmation tones',
        useCase: 'Search results ready'
      }
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    brand: 'discord',
    description: 'Playful, energetic sounds for gaming and community',
    philosophy: 'Sounds should be fun, clear, and gaming-inspired without being overwhelming.',
    colors: {
      primary: '#5865F2',
      secondary: '#23272A',
      accent: '#57F287'
    },
    sounds: [
      {
        id: 'discord-join',
        name: 'Voice Join',
        category: 'navigation',
        audioFile: '/sounds/brands/discord/voice_join.wav',
        duration: 350,
        description: 'Ascending double beep for joining voice',
        useCase: 'User joins voice channel'
      },
      {
        id: 'discord-leave',
        name: 'Voice Leave',
        category: 'navigation',
        audioFile: '/sounds/brands/discord/voice_leave.wav',
        duration: 350,
        description: 'Descending double beep for leaving voice',
        useCase: 'User leaves voice channel'
      },
      {
        id: 'discord-mention',
        name: 'Mention',
        category: 'notification',
        audioFile: '/sounds/brands/discord/mention.wav',
        duration: 200,
        description: 'Synth pluck for mentions',
        useCase: 'Someone mentions you'
      },
      {
        id: 'discord-stream',
        name: 'Stream Start',
        category: 'feedback',
        audioFile: '/sounds/brands/discord/stream_start.wav',
        duration: 250,
        description: 'Power-up sound for streaming',
        useCase: 'Start screen sharing or streaming'
      },
      {
        id: 'discord-invite',
        name: 'Game Invite',
        category: 'notification',
        audioFile: '/sounds/brands/discord/game_invite.wav',
        duration: 250,
        description: 'Coin collect sequence',
        useCase: 'Game invitation received'
      },
      {
        id: 'discord-achievement',
        name: 'Achievement',
        category: 'feedback',
        audioFile: '/sounds/brands/discord/achievement.wav',
        duration: 400,
        description: 'Victory fanfare in A major',
        useCase: 'Achievement unlocked'
      },
      {
        id: 'discord-boost',
        name: 'Server Boost',
        category: 'feedback',
        audioFile: '/sounds/brands/discord/server_boost.wav',
        duration: 300,
        description: 'Power surge effect',
        useCase: 'Server boost activation'
      }
    ]
  },
  {
    id: 'fluent',
    name: 'Microsoft Fluent',
    brand: 'fluent',
    description: 'Professional, clear, and accessible system sounds',
    philosophy: 'Sounds should be crisp, professional, and universally understood. Accessibility is paramount.',
    colors: {
      primary: '#0078D4',
      secondary: '#106EBE',
      accent: '#00BCF2'
    },
    sounds: [
      {
        id: 'fluent-notify',
        name: 'System Notify',
        category: 'notification',
        audioFile: '/sounds/brands/fluent/system_notify.wav',
        duration: 300,
        description: 'Three-tone chime sequence',
        useCase: 'System notifications'
      },
      {
        id: 'fluent-complete',
        name: 'Task Complete',
        category: 'feedback',
        audioFile: '/sounds/brands/fluent/task_complete.wav',
        duration: 300,
        description: 'Gentle ding for completion',
        useCase: 'Task or download completion'
      },
      {
        id: 'fluent-processing',
        name: 'Processing',
        category: 'process',
        audioFile: '/sounds/brands/fluent/processing.wav',
        duration: 800,
        description: 'Rotating tick pattern for processing',
        useCase: 'Background processing indicator'
      },
      {
        id: 'fluent-focus',
        name: 'Focus On',
        category: 'interaction',
        audioFile: '/sounds/brands/fluent/focus_on.wav',
        duration: 200,
        description: 'Subtle sweep for focus mode',
        useCase: 'Entering focus or do-not-disturb mode'
      },
      {
        id: 'fluent-update',
        name: 'Update Ready',
        category: 'notification',
        audioFile: '/sounds/brands/fluent/update_ready.wav',
        duration: 350,
        description: 'F-A-C system chime',
        useCase: 'Update available notification'
      },
      {
        id: 'fluent-security',
        name: 'Security Scan',
        category: 'process',
        audioFile: '/sounds/brands/fluent/security_scan.wav',
        duration: 1000,
        description: 'Scanning pulse pattern',
        useCase: 'Security scan in progress'
      },
      {
        id: 'fluent-sync',
        name: 'Sync Success',
        category: 'feedback',
        audioFile: '/sounds/brands/fluent/sync_success.wav',
        duration: 300,
        description: 'Phase-aligned dual tones',
        useCase: 'Synchronization complete'
      }
    ]
  },
  {
    id: 'spotify',
    name: 'Spotify',
    brand: 'spotify',
    description: 'Musical, rhythmic sounds that celebrate audio',
    philosophy: 'Every sound should feel musical and intentional, like it belongs in a playlist.',
    colors: {
      primary: '#1DB954',
      secondary: '#191414',
      accent: '#1ED760'
    },
    sounds: [
      {
        id: 'spotify-play',
        name: 'Play Start',
        category: 'interaction',
        audioFile: '/sounds/brands/spotify/play_start.wav',
        duration: 80,
        description: 'Musical tap on A4',
        useCase: 'Play button press'
      },
      {
        id: 'spotify-skip',
        name: 'Track Skip',
        category: 'navigation',
        audioFile: '/sounds/brands/spotify/track_skip.wav',
        duration: 60,
        description: 'Quick pitch bend up',
        useCase: 'Skip to next track'
      },
      {
        id: 'spotify-like',
        name: 'Track Like',
        category: 'feedback',
        audioFile: '/sounds/brands/spotify/track_like.wav',
        duration: 150,
        description: 'C major chord bloom',
        useCase: 'Like/heart a song'
      },
      {
        id: 'spotify-queue',
        name: 'Queue Add',
        category: 'interaction',
        audioFile: '/sounds/brands/spotify/queue_add.wav',
        duration: 240,
        description: 'Rhythmic triple beep',
        useCase: 'Add song to queue'
      },
      {
        id: 'spotify-shuffle',
        name: 'Shuffle On',
        category: 'interaction',
        audioFile: '/sounds/brands/spotify/shuffle_on.wav',
        duration: 300,
        description: 'Card shuffle effect',
        useCase: 'Enable shuffle mode'
      },
      {
        id: 'spotify-download',
        name: 'Download Complete',
        category: 'feedback',
        audioFile: '/sounds/brands/spotify/download_done.wav',
        duration: 400,
        description: 'C major arpeggio celebration',
        useCase: 'Track download complete'
      },
      {
        id: 'spotify-radio',
        name: 'Radio Tune',
        category: 'navigation',
        audioFile: '/sounds/brands/spotify/radio_tune.wav',
        duration: 200,
        description: 'Frequency dial wobble',
        useCase: 'Start radio station'
      }
    ]
  },
  {
    id: 'notion',
    name: 'Notion',
    brand: 'notion',
    description: 'Minimal, focused sounds for deep work',
    philosophy: 'Sounds should be barely there - just enough feedback without breaking flow state.',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#F7F6F3'
    },
    sounds: [
      {
        id: 'notion-page',
        name: 'Page Turn',
        category: 'navigation',
        audioFile: '/sounds/brands/notion/page_turn.wav',
        duration: 100,
        description: 'Paper-like whoosh',
        useCase: 'Navigate between pages'
      },
      {
        id: 'notion-check',
        name: 'Task Check',
        category: 'interaction',
        audioFile: '/sounds/brands/notion/task_check.wav',
        duration: 30,
        description: 'Soft click for checkbox',
        useCase: 'Check off todo items'
      },
      {
        id: 'notion-typing',
        name: 'Typing Indicator',
        category: 'process',
        audioFile: '/sounds/brands/notion/typing_indicator.wav',
        duration: 360,
        description: 'Subtle fading ticks',
        useCase: 'Collaborative typing indicator'
      },
      {
        id: 'notion-block',
        name: 'Block Add',
        category: 'interaction',
        audioFile: '/sounds/brands/notion/block_add.wav',
        duration: 50,
        description: 'Gentle pop for new blocks',
        useCase: 'Add new content block'
      },
      {
        id: 'notion-query',
        name: 'Database Query',
        category: 'process',
        audioFile: '/sounds/brands/notion/query_run.wav',
        duration: 150,
        description: 'Data whisper pulses',
        useCase: 'Database query execution'
      },
      {
        id: 'notion-template',
        name: 'Template Apply',
        category: 'interaction',
        audioFile: '/sounds/brands/notion/template_apply.wav',
        duration: 200,
        description: 'Soft cascading tones',
        useCase: 'Apply page template'
      },
      {
        id: 'notion-sync',
        name: 'Sync Pulse',
        category: 'process',
        audioFile: '/sounds/brands/notion/sync_pulse.wav',
        duration: 800,
        description: 'Minimal heartbeat rhythm',
        useCase: 'Background sync indicator'
      }
    ]
  }
]

// Processing sounds (generic, not brand-specific)
export const processingPreset: BrandPreset = {
  id: 'processing',
  name: 'Processing & Loading',
  brand: 'generic',
  description: 'Universal sounds for loading, processing, and progress states',
  philosophy: 'Clear feedback for system states without causing anxiety during waits.',
  colors: {
    primary: '#6366F1',
    secondary: '#4F46E5',
    accent: '#818CF8'
  },
  sounds: [
    {
      id: 'loading-dots',
      name: 'Loading Dots',
      category: 'process',
      audioFile: '/sounds/brands/processing/loading_dots.wav',
      duration: 760,
      description: 'Four ascending ticks for loading',
      useCase: 'Content loading indicator'
    },
    {
      id: 'spinner',
      name: 'Continuous Spinner',
      category: 'process',
      audioFile: '/sounds/brands/processing/spinner.wav',
      duration: 1000,
      description: 'Modulating tone for continuous processes',
      useCase: 'Long-running operations'
    },
    {
      id: 'progress-tick',
      name: 'Progress Tick',
      category: 'process',
      audioFile: '/sounds/brands/processing/progress_tick.wav',
      duration: 20,
      description: 'Single tick for progress steps',
      useCase: 'Step completion in multi-step process'
    },
    {
      id: 'process-done',
      name: 'Process Complete',
      category: 'feedback',
      audioFile: '/sounds/brands/processing/process_done.wav',
      duration: 300,
      description: 'Success flourish with 4 ascending notes',
      useCase: 'Process completion celebration'
    }
  ]
}

// Helper functions
export function getBrandPreset(brandId: string): BrandPreset | undefined {
  return brandPresets.find(preset => preset.id === brandId)
}

export function getAllBrandSounds(): BrandSound[] {
  return brandPresets.flatMap(preset => preset.sounds)
}

export function getBrandSoundsByCategory(category: string): BrandSound[] {
  return getAllBrandSounds().filter(sound => sound.category === category)
}

// Get processing sounds
export function getProcessingSounds(): BrandSound[] {
  return processingPreset.sounds
}