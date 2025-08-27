import { Howl, Howler } from 'howler'

export interface PealOptions {
  volume?: number
  mute?: boolean
  preload?: boolean
  openaiApiKey?: string
  groqApiKey?: string
}

export interface TTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | 'Fritz-PlayAI' | 'Arista-PlayAI' | 'Atlas-PlayAI' | 'Basil-PlayAI' | 'Briggs-PlayAI' | 'Calum-PlayAI' | 'Celeste-PlayAI' | 'Cheyenne-PlayAI' | 'Chip-PlayAI' | 'Cillian-PlayAI' | 'Deedee-PlayAI' | 'Gail-PlayAI' | 'Indigo-PlayAI' | 'Mamaw-PlayAI' | 'Mason-PlayAI' | 'Mikail-PlayAI' | 'Mitch-PlayAI' | 'Quinn-PlayAI' | 'Thunder-PlayAI' | 'Ahmad-PlayAI' | 'Amira-PlayAI' | 'Hani-PlayAI' | 'Layla-PlayAI'
  model?: 'tts-1' | 'tts-1-hd' | 'playai-tts' | 'playai-tts-arabic'
  speed?: number
}

export interface TTSResult {
  id: string
  audio: ArrayBuffer
  mimeType: string
}

export interface Sound {
  id: string
  howl: Howl
  loaded: boolean
}

export class Peal {
  private sounds: Map<string, Sound> = new Map()
  private options: PealOptions
  private openaiApiKey?: string
  private groqApiKey?: string
  
  constructor(options: PealOptions = {}) {
    this.options = {
      volume: 1,
      mute: false,
      preload: true,
      ...options
    }
    
    this.openaiApiKey = options.openaiApiKey || process.env.OPENAI_API_KEY
    this.groqApiKey = options.groqApiKey || process.env.GROQ_API_KEY
    
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
  
  /**
   * Generate speech using OpenAI or Groq TTS and load it as a sound
   */
  async generateSpeech(
    text: string, 
    id: string = `tts-${Date.now()}`, 
    options: TTSOptions = {}
  ): Promise<TTSResult> {
    const {
      voice = 'alloy',
      model = 'tts-1',
      speed = 1.0
    } = options

    const isGroqModel = model.startsWith('playai-')
    
    // Check for appropriate API key
    if (isGroqModel && !this.groqApiKey) {
      throw new Error('Groq API key is required for Groq TTS functionality. Provide it in constructor options or GROQ_API_KEY environment variable.')
    }
    if (!isGroqModel && !this.openaiApiKey) {
      throw new Error('OpenAI API key is required for OpenAI TTS functionality. Provide it in constructor options or OPENAI_API_KEY environment variable.')
    }

    try {
      let response: Response

      if (isGroqModel) {
        // Use Groq TTS API
        response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,  // Use the actual Groq model name
            input: text,
            voice: voice || 'Fritz-PlayAI',
            response_format: 'wav'
          })
        })
      } else {
        // Use OpenAI TTS API
        response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            input: text,
            voice,
            speed,
            response_format: 'mp3'
          })
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const provider = isGroqModel ? 'Groq' : 'OpenAI'
        throw new Error(`${provider} TTS API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const mimeType = isGroqModel ? 'audio/wav' : 'audio/mpeg'
      const blob = new Blob([audioBuffer], { type: mimeType })
      const audioUrl = URL.createObjectURL(blob)

      // Load the generated audio as a sound
      this.load(id, audioUrl, {
        format: isGroqModel ? ['wav'] : ['mp3'],
        onload: () => {
          // Clean up the object URL after loading
          URL.revokeObjectURL(audioUrl)
        }
      })

      return {
        id,
        audio: audioBuffer,
        mimeType
      }
    } catch (error) {
      console.error('TTS generation failed:', error)
      throw error
    }
  }
  
  /**
   * Generate speech and immediately play it
   */
  async speak(
    text: string, 
    playOptions?: { volume?: number; loop?: boolean },
    ttsOptions?: TTSOptions
  ): Promise<number | undefined> {
    const id = `speak-${Date.now()}`
    await this.generateSpeech(text, id, ttsOptions)
    
    // Wait a bit for the sound to be loaded
    return new Promise((resolve) => {
      const checkLoaded = () => {
        if (this.isLoaded(id)) {
          resolve(this.play(id, playOptions))
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
    })
  }
}

// Export for convenience
export default Peal