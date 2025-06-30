// src/index.ts
import { Howl, Howler } from "howler";
var Peal = class {
  constructor(options = {}) {
    this.sounds = /* @__PURE__ */ new Map();
    this.options = {
      volume: 1,
      mute: false,
      preload: true,
      ...options
    };
    if (this.options.volume !== void 0) {
      Howler.volume(this.options.volume);
    }
    if (this.options.mute) {
      Howler.mute(true);
    }
  }
  /**
   * Load a sound file
   */
  load(id, src, options) {
    if (this.sounds.has(id)) {
      console.warn(`Sound "${id}" already loaded. Replacing...`);
      this.unload(id);
    }
    const sources = Array.isArray(src) ? src : [src];
    const howl = new Howl({
      src: sources,
      preload: this.options.preload,
      ...options,
      onload: () => {
        const sound = this.sounds.get(id);
        if (sound) {
          sound.loaded = true;
        }
      }
    });
    this.sounds.set(id, {
      id,
      howl,
      loaded: false
    });
  }
  /**
   * Play a loaded sound
   */
  play(id, options) {
    const sound = this.sounds.get(id);
    if (!sound) {
      console.error(`Sound "${id}" not found. Load it first with peal.load()`);
      return;
    }
    if (options?.volume !== void 0) {
      sound.howl.volume(options.volume);
    }
    if (options?.loop !== void 0) {
      sound.howl.loop(options.loop);
    }
    return sound.howl.play();
  }
  /**
   * Stop a playing sound
   */
  stop(id) {
    if (id) {
      const sound = this.sounds.get(id);
      if (sound) {
        sound.howl.stop();
      }
    } else {
      this.sounds.forEach((sound) => sound.howl.stop());
    }
  }
  /**
   * Pause a playing sound
   */
  pause(id) {
    if (id) {
      const sound = this.sounds.get(id);
      if (sound) {
        sound.howl.pause();
      }
    } else {
      this.sounds.forEach((sound) => sound.howl.pause());
    }
  }
  /**
   * Set global volume
   */
  volume(level) {
    if (level !== void 0) {
      Howler.volume(level);
    }
    return Howler.volume();
  }
  /**
   * Mute/unmute all sounds
   */
  mute(muted) {
    if (muted !== void 0) {
      Howler.mute(muted);
    }
    return Howler._muted || false;
  }
  /**
   * Unload a sound and free up memory
   */
  unload(id) {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.howl.unload();
      this.sounds.delete(id);
    }
  }
  /**
   * Unload all sounds
   */
  unloadAll() {
    this.sounds.forEach((sound) => sound.howl.unload());
    this.sounds.clear();
  }
  /**
   * Check if a sound is loaded
   */
  isLoaded(id) {
    const sound = this.sounds.get(id);
    return sound ? sound.loaded : false;
  }
  /**
   * Get all loaded sound IDs
   */
  getSounds() {
    return Array.from(this.sounds.keys());
  }
};
var index_default = Peal;
export {
  Peal,
  index_default as default
};
