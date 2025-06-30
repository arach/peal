import { Howl, Howler } from 'howler'

export interface PealOptions {
  volume?: number
  mute?: boolean
  preload?: boolean
}

export interface Sound {
  id: string
  howl: Howl
  loaded: boolean
}

export class Peal {
  private sounds: Map<string, Sound> = new Map()
  private options: PealOptions
  
  constructor(options: PealOptions = {}) {
    this.options = {
      volume: 1,
      mute: false,
      preload: true,
      ...options
    }
    
    if (this.options.volume !== undefined) {
      Howler.volume(this.options.volume)
    }
    
    if (this.options.mute) {
      Howler.mute(true)
    }
  }
  
  /**
   * Load a sound file
   */
  load(id: string, src: string | string[], options?: any): void {
    if (this.sounds.has(id)) {
      console.warn(`Sound "${id}" already loaded. Replacing...`)
      this.unload(id)
    }
    
    const sources = Array.isArray(src) ? src : [src]
    
    const howl = new Howl({
      src: sources,
      preload: this.options.preload,
      ...options,
      onload: () => {
        const sound = this.sounds.get(id)
        if (sound) {
          sound.loaded = true
        }
      }
    })
    
    this.sounds.set(id, {
      id,
      howl,
      loaded: false
    })
  }
  
  /**
   * Play a loaded sound
   */
  play(id: string, options?: { volume?: number; loop?: boolean }): number | undefined {
    const sound = this.sounds.get(id)
    if (!sound) {
      console.error(`Sound "${id}" not found. Load it first with peal.load()`)
      return
    }
    
    if (options?.volume !== undefined) {
      sound.howl.volume(options.volume)
    }
    
    if (options?.loop !== undefined) {
      sound.howl.loop(options.loop)
    }
    
    return sound.howl.play()
  }
  
  /**
   * Stop a playing sound
   */
  stop(id?: string): void {
    if (id) {
      const sound = this.sounds.get(id)
      if (sound) {
        sound.howl.stop()
      }
    } else {
      // Stop all sounds
      this.sounds.forEach(sound => sound.howl.stop())
    }
  }
  
  /**
   * Pause a playing sound
   */
  pause(id?: string): void {
    if (id) {
      const sound = this.sounds.get(id)
      if (sound) {
        sound.howl.pause()
      }
    } else {
      // Pause all sounds
      this.sounds.forEach(sound => sound.howl.pause())
    }
  }
  
  /**
   * Set global volume
   */
  volume(level?: number): number {
    if (level !== undefined) {
      Howler.volume(level)
    }
    return Howler.volume()
  }
  
  /**
   * Mute/unmute all sounds
   */
  mute(muted?: boolean): boolean {
    if (muted !== undefined) {
      Howler.mute(muted)
    }
    return (Howler as any)._muted || false
  }
  
  /**
   * Unload a sound and free up memory
   */
  unload(id: string): void {
    const sound = this.sounds.get(id)
    if (sound) {
      sound.howl.unload()
      this.sounds.delete(id)
    }
  }
  
  /**
   * Unload all sounds
   */
  unloadAll(): void {
    this.sounds.forEach(sound => sound.howl.unload())
    this.sounds.clear()
  }
  
  /**
   * Check if a sound is loaded
   */
  isLoaded(id: string): boolean {
    const sound = this.sounds.get(id)
    return sound ? sound.loaded : false
  }
  
  /**
   * Get all loaded sound IDs
   */
  getSounds(): string[] {
    return Array.from(this.sounds.keys())
  }
}

// Export for convenience
export default Peal

// Export built-in sounds
export { PEAL_SOUNDS, SOUND_CATEGORIES, type PealSoundName } from './sounds'

/**
 * Pre-configured Peal instance with built-in sounds
 * For quick prototyping and demos
 */
export class PealWithSounds extends Peal {
  constructor(options: PealOptions & { soundsPath?: string } = {}) {
    super(options)
    
    // Base path for sounds (can be customized)
    const basePath = options.soundsPath || 'https://unpkg.com/@peal-sounds/peal@latest/cli/sounds/'
    
    // Load all built-in sounds
    this.load('success', `${basePath}success.wav`)
    this.load('error', `${basePath}error.wav`)
    this.load('notification', `${basePath}notification.wav`)
    this.load('click', `${basePath}click.wav`)
    this.load('tap', `${basePath}tap.wav`)
    this.load('transition', `${basePath}transition.wav`)
    this.load('swoosh', `${basePath}swoosh.wav`)
    this.load('loading', `${basePath}loading.wav`)
    this.load('complete', `${basePath}complete.wav`)
    this.load('alert', `${basePath}alert.wav`)
    this.load('warning', `${basePath}warning.wav`)
    this.load('message', `${basePath}message.wav`)
    this.load('mention', `${basePath}mention.wav`)
    this.load('hover', `${basePath}hover.wav`)
    this.load('select', `${basePath}select.wav`)
    this.load('toggle', `${basePath}toggle.wav`)
    this.load('startup', `${basePath}startup.wav`)
    this.load('shutdown', `${basePath}shutdown.wav`)
    this.load('unlock', `${basePath}unlock.wav`)
  }
  
  // Convenience methods for common sounds
  success() { return this.play('success') }
  error() { return this.play('error') }
  notification() { return this.play('notification') }
  click() { return this.play('click') }
  tap() { return this.play('tap') }
}