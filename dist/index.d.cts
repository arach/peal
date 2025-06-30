import { Howl } from 'howler';

interface PealOptions {
    volume?: number;
    mute?: boolean;
    preload?: boolean;
}
interface Sound {
    id: string;
    howl: Howl;
    loaded: boolean;
}
declare class Peal {
    private sounds;
    private options;
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
}

export { Peal, type PealOptions, type Sound, Peal as default };
