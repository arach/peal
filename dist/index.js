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
    this.openaiApiKey = options.openaiApiKey || process.env.OPENAI_API_KEY;
    this.groqApiKey = options.groqApiKey || process.env.GROQ_API_KEY;
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
  /**
   * Generate speech using OpenAI or Groq TTS and load it as a sound
   */
  async generateSpeech(text, id = `tts-${Date.now()}`, options = {}) {
    const {
      voice = "alloy",
      model = "tts-1",
      speed = 1
    } = options;
    const isGroqModel = model.startsWith("playai-");
    if (isGroqModel && !this.groqApiKey) {
      throw new Error("Groq API key is required for Groq TTS functionality. Provide it in constructor options or GROQ_API_KEY environment variable.");
    }
    if (!isGroqModel && !this.openaiApiKey) {
      throw new Error("OpenAI API key is required for OpenAI TTS functionality. Provide it in constructor options or OPENAI_API_KEY environment variable.");
    }
    try {
      let response;
      if (isGroqModel) {
        response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            // Use the actual Groq model name
            input: text,
            voice: voice || "Fritz-PlayAI",
            response_format: "wav"
          })
        });
      } else {
        response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            input: text,
            voice,
            speed,
            response_format: "mp3"
          })
        });
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const provider = isGroqModel ? "Groq" : "OpenAI";
        throw new Error(`${provider} TTS API error: ${response.status} ${response.statusText} - ${errorData.error?.message || "Unknown error"}`);
      }
      const audioBuffer = await response.arrayBuffer();
      const mimeType = isGroqModel ? "audio/wav" : "audio/mpeg";
      const blob = new Blob([audioBuffer], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);
      this.load(id, audioUrl, {
        format: isGroqModel ? ["wav"] : ["mp3"],
        onload: () => {
          URL.revokeObjectURL(audioUrl);
        }
      });
      return {
        id,
        audio: audioBuffer,
        mimeType
      };
    } catch (error) {
      console.error("TTS generation failed:", error);
      throw error;
    }
  }
  /**
   * Generate speech and immediately play it
   */
  async speak(text, playOptions, ttsOptions) {
    const id = `speak-${Date.now()}`;
    await this.generateSpeech(text, id, ttsOptions);
    return new Promise((resolve) => {
      const checkLoaded = () => {
        if (this.isLoaded(id)) {
          resolve(this.play(id, playOptions));
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
  }
};
var index_default = Peal;
export {
  Peal,
  index_default as default
};
