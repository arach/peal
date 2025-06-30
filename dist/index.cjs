"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  PEAL_SOUNDS: () => PEAL_SOUNDS,
  Peal: () => Peal,
  PealWithSounds: () => PealWithSounds,
  SOUND_CATEGORIES: () => SOUND_CATEGORIES,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_howler = require("howler");

// src/sounds.ts
var PEAL_SOUNDS = {
  // UI Feedback
  success: "/sounds/success.wav",
  error: "/sounds/error.wav",
  notification: "/sounds/notification.wav",
  click: "/sounds/click.wav",
  tap: "/sounds/tap.wav",
  // Transitions
  transition: "/sounds/transition.wav",
  swoosh: "/sounds/swoosh.wav",
  // Loading/Processing
  loading: "/sounds/loading.wav",
  complete: "/sounds/complete.wav",
  // Alerts
  alert: "/sounds/alert.wav",
  warning: "/sounds/warning.wav",
  // Messages
  message: "/sounds/message.wav",
  mention: "/sounds/mention.wav",
  // Interactive
  hover: "/sounds/hover.wav",
  select: "/sounds/select.wav",
  toggle: "/sounds/toggle.wav",
  // System
  startup: "/sounds/startup.wav",
  shutdown: "/sounds/shutdown.wav",
  unlock: "/sounds/unlock.wav"
};
var SOUND_CATEGORIES = {
  "UI Feedback": ["success", "error", "notification", "click", "tap"],
  "Transitions": ["transition", "swoosh"],
  "Loading": ["loading", "complete"],
  "Alerts": ["alert", "warning"],
  "Messages": ["message", "mention"],
  "Interactive": ["hover", "select", "toggle"],
  "System": ["startup", "shutdown", "unlock"]
};

// src/index.ts
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
      import_howler.Howler.volume(this.options.volume);
    }
    if (this.options.mute) {
      import_howler.Howler.mute(true);
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
    const howl = new import_howler.Howl({
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
      import_howler.Howler.volume(level);
    }
    return import_howler.Howler.volume();
  }
  /**
   * Mute/unmute all sounds
   */
  mute(muted) {
    if (muted !== void 0) {
      import_howler.Howler.mute(muted);
    }
    return import_howler.Howler._muted || false;
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
var PealWithSounds = class extends Peal {
  constructor(options = {}) {
    super(options);
    const basePath = options.soundsPath || "https://unpkg.com/@peal-sounds/peal@latest/cli/sounds/";
    this.load("success", `${basePath}success.wav`);
    this.load("error", `${basePath}error.wav`);
    this.load("notification", `${basePath}notification.wav`);
    this.load("click", `${basePath}click.wav`);
    this.load("tap", `${basePath}tap.wav`);
    this.load("transition", `${basePath}transition.wav`);
    this.load("swoosh", `${basePath}swoosh.wav`);
    this.load("loading", `${basePath}loading.wav`);
    this.load("complete", `${basePath}complete.wav`);
    this.load("alert", `${basePath}alert.wav`);
    this.load("warning", `${basePath}warning.wav`);
    this.load("message", `${basePath}message.wav`);
    this.load("mention", `${basePath}mention.wav`);
    this.load("hover", `${basePath}hover.wav`);
    this.load("select", `${basePath}select.wav`);
    this.load("toggle", `${basePath}toggle.wav`);
    this.load("startup", `${basePath}startup.wav`);
    this.load("shutdown", `${basePath}shutdown.wav`);
    this.load("unlock", `${basePath}unlock.wav`);
  }
  // Convenience methods for common sounds
  success() {
    return this.play("success");
  }
  error() {
    return this.play("error");
  }
  notification() {
    return this.play("notification");
  }
  click() {
    return this.play("click");
  }
  tap() {
    return this.play("tap");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PEAL_SOUNDS,
  Peal,
  PealWithSounds,
  SOUND_CATEGORIES
});
