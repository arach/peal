/**
 * Built-in Peal sounds
 * These are the same sounds available in the CLI
 */

// For web usage, we'll provide URLs to the sounds
// In a real implementation, these could be:
// 1. CDN URLs
// 2. Base64 encoded sounds
// 3. Bundled with the library

export const PEAL_SOUNDS = {
  // UI Feedback
  success: '/sounds/success.wav',
  error: '/sounds/error.wav', 
  notification: '/sounds/notification.wav',
  click: '/sounds/click.wav',
  tap: '/sounds/tap.wav',
  
  // Transitions
  transition: '/sounds/transition.wav',
  swoosh: '/sounds/swoosh.wav',
  
  // Loading/Processing
  loading: '/sounds/loading.wav',
  complete: '/sounds/complete.wav',
  
  // Alerts
  alert: '/sounds/alert.wav',
  warning: '/sounds/warning.wav',
  
  // Messages
  message: '/sounds/message.wav',
  mention: '/sounds/mention.wav',
  
  // Interactive
  hover: '/sounds/hover.wav',
  select: '/sounds/select.wav',
  toggle: '/sounds/toggle.wav',
  
  // System
  startup: '/sounds/startup.wav',
  shutdown: '/sounds/shutdown.wav',
  unlock: '/sounds/unlock.wav'
} as const;

export type PealSoundName = keyof typeof PEAL_SOUNDS;

/**
 * Helper to get the CDN URL for a sound
 * @param soundName The name of the sound
 * @param version Optional version for cache busting
 */
export function getPealSoundUrl(soundName: PealSoundName, version = '0.1.6'): string {
  // In production, this could point to a CDN
  // For now, returning relative paths that users can host
  return PEAL_SOUNDS[soundName];
}

/**
 * Sound categories for organization
 */
export const SOUND_CATEGORIES = {
  'UI Feedback': ['success', 'error', 'notification', 'click', 'tap'],
  'Transitions': ['transition', 'swoosh'],
  'Loading': ['loading', 'complete'],
  'Alerts': ['alert', 'warning'],
  'Messages': ['message', 'mention'],
  'Interactive': ['hover', 'select', 'toggle'],
  'System': ['startup', 'shutdown', 'unlock']
} as const;