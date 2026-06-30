import { Howl } from 'howler';

interface PealOptions {
    volume?: number;
    mute?: boolean;
    preload?: boolean;
    openaiApiKey?: string;
    groqApiKey?: string;
}
interface TTSOptions {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | 'Fritz-PlayAI' | 'Arista-PlayAI' | 'Atlas-PlayAI' | 'Basil-PlayAI' | 'Briggs-PlayAI' | 'Calum-PlayAI' | 'Celeste-PlayAI' | 'Cheyenne-PlayAI' | 'Chip-PlayAI' | 'Cillian-PlayAI' | 'Deedee-PlayAI' | 'Gail-PlayAI' | 'Indigo-PlayAI' | 'Mamaw-PlayAI' | 'Mason-PlayAI' | 'Mikail-PlayAI' | 'Mitch-PlayAI' | 'Quinn-PlayAI' | 'Thunder-PlayAI' | 'Ahmad-PlayAI' | 'Amira-PlayAI' | 'Hani-PlayAI' | 'Layla-PlayAI';
    model?: 'tts-1' | 'tts-1-hd' | 'playai-tts' | 'playai-tts-arabic';
    speed?: number;
}
interface TTSResult {
    id: string;
    audio: ArrayBuffer;
    mimeType: string;
}
interface Sound {
    id: string;
    howl: Howl;
    loaded: boolean;
}
declare class Peal {
    private sounds;
    private options;
    private openaiApiKey?;
    private groqApiKey?;
    constructor(options?: PealOptions);
    /**
     * Load a sound file
     */
    load(id: string, src: string | string[], options?: any): void;
    /**
     * Play a loaded sound
     */
    play(id: string, options?: {
        volume?: number;
        loop?: boolean;
    }): number | undefined;
    /**
     * Stop a playing sound
     */
    stop(id?: string): void;
    /**
     * Pause a playing sound
     */
    pause(id?: string): void;
    /**
     * Set global volume
     */
    volume(level?: number): number;
    /**
     * Mute/unmute all sounds
     */
    mute(muted?: boolean): boolean;
    /**
     * Unload a sound and free up memory
     */
    unload(id: string): void;
    /**
     * Unload all sounds
     */
    unloadAll(): void;
    /**
     * Check if a sound is loaded
     */
    isLoaded(id: string): boolean;
    /**
     * Get all loaded sound IDs
     */
    getSounds(): string[];
    /**
     * Generate speech using OpenAI or Groq TTS and load it as a sound
     */
    generateSpeech(text: string, id?: string, options?: TTSOptions): Promise<TTSResult>;
    /**
     * Generate speech and immediately play it
     */
    speak(text: string, playOptions?: {
        volume?: number;
        loop?: boolean;
    }, ttsOptions?: TTSOptions): Promise<number | undefined>;
}

export { Peal, type PealOptions, type Sound, type TTSOptions, type TTSResult, Peal as default };
