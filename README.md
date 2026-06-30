# Peal — Design your own SFX library

<p align="center">
  <strong>Curated UI sounds, a Web Audio studio, and a CLI — shape new effects or drop presets into any project</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#cli-commands">CLI Commands</a> •
  <a href="#library-api">Library API</a> •
  <a href="#web-app">Web App</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

Peal is an npm package (`@peal-sounds/peal`) and a web app for designing and shipping UI sound effects.

- **📦 Library** — Howler.js wrapper for playing sounds in web apps
- **🎯 CLI** — Add curated UI sounds to any project and generate a typed helper
- **🌐 Web App** — Browse, design, and manage sounds in the browser

The CLI copies high-quality WAV files into your repo and generates a helper that handles paths for you. The web app lets you explore presets, design custom sounds, and export audio for use anywhere.

## ✨ Features

### 📦 Library
- **Lightweight**: Thin wrapper around Howler.js (~2KB gzipped)
- **Cross-Platform**: Works in modern browsers and Node.js
- **TypeScript First**: Full TypeScript support with generated types
- **Performance**: Efficient sound loading and playback management

### 🎯 CLI Tool
- **Instant Setup**: Add professional UI sounds to any project in seconds
- **Curated Collection**: 15+ high-quality sounds designed for web interfaces
- **Auto-Generated Helper**: Creates a typed helper file with all your sounds
- **Zero Configuration**: Works out of the box, no setup required

### 🌐 Web App
- **Library** ([`/library`](http://localhost:3001/library)): Browse, generate, and manage your sound collection
- **Studio** ([`/studio`](http://localhost:3001/studio)): IDE-style sound designer with live Web Audio API code, AI-assisted design, and parameter panels
- **Voice** ([`/studio?tool=voice`](http://localhost:3001/studio?tool=voice)): TTS studio for spoken UI feedback (`/voice` redirects here)
- **Presets**: Curated collections at [`/presets`](http://localhost:3001/presets), `/premium`, `/mechanics`, `/keyboard`, `/brands`, and `/signature`

## 🚀 Quick Start

Add professional UI sounds to your project in seconds:

```bash
npx @peal-sounds/peal add success error notification
```

This will:
- Copy high-quality UI sounds to your project
- Generate a helper file for easy playback
- Automatically handle all file paths

```javascript
import { peal } from './peal';

// Use the generated methods - paths handled automatically
peal.success();
peal.error();
peal.notification();

// Or use the generic play method with options
peal.play('success', { volume: 0.5 });
```

## 📦 Installation

### As a CLI tool (Recommended)

Use Peal without installing it globally:

```bash
npx @peal-sounds/peal add [sounds...]
```

Or install globally for frequent use:

```bash
npm install -g @peal-sounds/peal
```

### As a library

```bash
npm install @peal-sounds/peal
# or
pnpm add @peal-sounds/peal
```

## 🎯 CLI Commands

### List available sounds
```bash
npx @peal-sounds/peal list
```

### Play sounds
```bash
# Play a specific sound
npx @peal-sounds/peal play success
npx @peal-sounds/peal play click

# Demo all sounds
npx @peal-sounds/peal demo

# Demo with custom delay (ms)
npx @peal-sounds/peal demo --delay 2000
```

### Add sounds to your project
```bash
# Interactive selection
npx @peal-sounds/peal add

# Add specific sounds
npx @peal-sounds/peal add click success error

# Add to custom directory
npx @peal-sounds/peal add --dir ./assets/sounds

# Generate TypeScript helper
npx @peal-sounds/peal add --typescript
```

### Remove sounds
```bash
# Interactive removal
npx @peal-sounds/peal remove

# Remove specific sounds
npx @peal-sounds/peal remove click tap
```

## 🔊 Available Sounds

- **UI Feedback**: `success`, `error`, `notification`, `click`, `tap`
- **Transitions**: `transition`, `swoosh`
- **Loading**: `loading`, `complete`
- **Alerts**: `alert`, `warning`
- **Messages**: `message`, `mention`
- **Interactive**: `hover`, `select`, `toggle`
- **System**: `startup`, `shutdown`, `unlock`

## 📚 Library API

### Generated Helper (Recommended)

After running `npx @peal-sounds/peal add`, use the generated helper:

```javascript
import { peal } from './peal';

// Direct methods for each sound you added
peal.success();
peal.error();
peal.click();

// With options
peal.success({ volume: 0.8 });
```

### Core API

```javascript
import { peal } from './peal';

// Play sounds
peal.play('success', { volume: 0.5, loop: false, rate: 1.0 });

// Control playback
peal.stop('success');  // Stop specific sound
peal.stop();           // Stop all sounds
peal.pause('success'); // Pause specific sound
peal.pause();          // Pause all sounds

// Global controls
peal.volume(0.8);      // Set global volume (0-1)
peal.mute(true);       // Mute all sounds
```

### Advanced Usage

```javascript
import { Peal } from '@peal-sounds/peal';

const customPeal = new Peal();
customPeal.load('mySound', '/path/to/sound.wav');
customPeal.play('mySound');
```

## 💻 Usage Examples

### React

```jsx
import { peal } from './peal';

function SubmitButton({ onClick }) {
  const handleClick = async () => {
    peal.click();
    try {
      await onClick();
      peal.success();
    } catch (error) {
      peal.error();
    }
  };

  return (
    <button onClick={handleClick} onMouseEnter={() => peal.hover()}>
      Submit
    </button>
  );
}
```

### Vue

```vue
<template>
  <button @click="handleSubmit" @mouseenter="playHover">
    Submit
  </button>
</template>

<script>
import { peal } from './peal';

export default {
  methods: {
    playHover() {
      peal.hover();
    },
    async handleSubmit() {
      peal.click();
      // Your submit logic
    }
  }
}
</script>
```

### TypeScript

```typescript
import { peal, PealOptions } from './peal';

const options: PealOptions = {
  volume: 0.8,
  loop: false
};

peal.play('success', options);
```

## 🌐 Web App

Peal ships as a Next.js web app alongside the npm package. Use it to preview presets, design custom sounds, and manage your collection.

| Surface | Path | Description |
| --- | --- | --- |
| **Library** | [`/library`](http://localhost:3001/library) | Browse, generate, and manage sounds |
| **Studio** | [`/studio`](http://localhost:3001/studio) | Sound designer with live Web Audio code and AI-assisted parameters |
| **Voice** | [`/studio?tool=voice`](http://localhost:3001/studio?tool=voice) | TTS studio for spoken UI feedback |
| **Presets** | [`/presets`](http://localhost:3001/presets) | Curated sound collections (`/premium`, `/mechanics`, `/keyboard`, `/brands`, `/signature`) |

Studio uses **hudsonkit** for app chrome, with a material/instrument aesthetic for sound design controls.

### Local development

```bash
git clone https://github.com/arach/peal.git
cd peal
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) — the dev server runs on port **3001**.

## 🛠️ Tech Stack

### CLI & Library
- **Language**: TypeScript
- **Audio Engine**: [Howler.js](https://howlerjs.com/)
- **Build Tool**: [tsup](https://tsup.egoist.dev/)
- **CLI Framework**: [Commander.js](https://github.com/tj/commander.js/)

### Web App
- **Framework**: Next.js with App Router
- **Studio Shell**: hudsonkit
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API
- **State**: Zustand

## 🔗 Links

- **npm Package**: [@peal-sounds/peal](https://www.npmjs.com/package/@peal-sounds/peal)
- **GitHub**: [github.com/arach/peal](https://github.com/arach/peal)
- **Web App**: [peal.app](https://peal.app)
- **Issues**: [Report bugs](https://github.com/arach/peal/issues)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m '✨ Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Made with 🎵 for better web experiences</strong>
</p>