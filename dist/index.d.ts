import { Howl } from 'howler';

/**
 * Built-in Peal sounds
 * These are the same sounds available in the CLI
 */
declare const PEAL_SOUNDS: {
    readonly success: "/sounds/success.wav";
    readonly error: "/sounds/error.wav";
    readonly notification: "/sounds/notification.wav";
    readonly click: "/sounds/click.wav";
    readonly tap: "/sounds/tap.wav";
    readonly transition: "/sounds/transition.wav";
    readonly swoosh: "/sounds/swoosh.wav";
    readonly loading: "/sounds/loading.wav";
    readonly complete: "/sounds/complete.wav";
    readonly alert: "/sounds/alert.wav";
    readonly warning: "/sounds/warning.wav";
    readonly message: "/sounds/message.wav";
    readonly mention: "/sounds/mention.wav";
    readonly hover: "/sounds/hover.wav";
    readonly select: "/sounds/select.wav";
    readonly toggle: "/sounds/toggle.wav";
    readonly startup: "/sounds/startup.wav";
    readonly shutdown: "/sounds/shutdown.wav";
    readonly unlock: "/sounds/unlock.wav";
};
type PealSoundName = keyof typeof PEAL_SOUNDS;
/**
 * Sound categories for organization
 */
declare const SOUND_CATEGORIES: {
    readonly 'UI Feedback': readonly ["success", "error", "notification", "click", "tap"];
    readonly Transitions: readonly ["transition", "swoosh"];
    readonly Loading: readonly ["loading", "complete"];
    readonly Alerts: readonly ["alert", "warning"];
    readonly Messages: readonly ["message", "mention"];
    readonly Interactive: readonly ["hover", "select", "toggle"];
    readonly System: readonly ["startup", "shutdown", "unlock"];
};

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

/**
 * Pre-configured Peal instance with built-in sounds
 * For quick prototyping and demos
 */
declare class PealWithSounds extends Peal {
    constructor(options?: PealOptions & {
        soundsPath?: string;
    });
    success(): number | undefined;
    error(): number | undefined;
    notification(): number | undefined;
    click(): number | undefined;
    tap(): number | undefined;
}

export { PEAL_SOUNDS, Peal, type PealOptions, type PealSoundName, PealWithSounds, SOUND_CATEGORIES, type Sound, Peal as default };
