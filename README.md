<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/public/images/brand/peal-halftone-logo-banner.png" alt="Peal" width="560">
</p>

<p align="center">
  <strong>Curated UI sounds, a Web Audio studio, and a CLI — shape new effects or drop presets into any project</strong>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/docs/screenshots/landing-hero.png" alt="Peal landing page" width="900">
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#cli-commands">CLI</a> •
  <a href="#library-api">Library API</a> •
  <a href="#web-app">Web App</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@peal-sounds/peal"><img src="https://img.shields.io/npm/v/@peal-sounds/peal?label=npm&color=4a9eff" alt="npm version"></a>
  <a href="https://github.com/arach/peal/actions/workflows/deploy.yml"><img src="https://github.com/arach/peal/actions/workflows/deploy.yml/badge.svg" alt="Deploy status"></a>
  <a href="https://github.com/arach/peal/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-6ee7a0" alt="MIT license"></a>
</p>

---

## Overview

Peal is an npm package ([`@peal-sounds/peal`](https://www.npmjs.com/package/@peal-sounds/peal)) and a web app for designing and shipping UI sound effects.

- **CLI** — Add curated UI sounds to any project and generate a dependency-free Audio helper
- **Library** — Thin `Peal` class for loading and playing your own audio paths
- **Web app** — Browse presets, design custom sounds, Voice TTS, and Music Studio ([open the app](https://arach.github.io/peal/))

The CLI copies high-quality WAV files into your repo and generates a helper that handles paths with the browser's built-in Audio API. The web app lets you explore presets, design custom sounds, and export audio for use anywhere.

## Features

### Library
- **Self-contained** — The published library bundles its playback engine and installs with zero runtime dependencies
- **Cross-platform** — Modern browsers; Node where browser-compatible audio is available
- **TypeScript first** — Named exports and full type definitions
- **Optional TTS** — `generateSpeech` / `speak` via OpenAI or Groq when API keys are set

### CLI
- **Instant setup** — Add professional UI sounds in seconds
- **19 curated sounds** — Designed for web interfaces
- **Auto-generated helper** — Creates `peal.js` or `peal.ts` with shortcuts for the sounds you added
- **Zero config** — Works with `npx` and never installs runtime dependencies in your project

### Web app
- **Library** — Browse, generate, and manage your sound collection
- **Studio** — IDE-style sound designer with live Web Audio code and AI-assisted design
- **Voice** — TTS studio for spoken UI feedback
- **Music** — Strudel live coding, AI copilot, improv loop, version history ([docs](./docs/music-studio.md))
- **Presets** — Curated collections: Premium, Mechanics, Keyboard, Brands, Signature

## Quick Start

Add professional UI sounds to your project in seconds:

```bash
bunx @peal-sounds/peal add success error notification
```

That writes something like:

```
your-project/
├── peal.js              # generated helper — import this
└── peal/
    ├── success.wav
    ├── error.wav
    └── notification.wav
```

```javascript
import { peal } from './peal.js'

// Shortcuts for sounds you added (no options — see play() below)
peal.success()
peal.error()
peal.notification()

// Options go through play()
peal.play('success', { volume: 0.5 })
```

`./peal.js` is generated in your project root. Playback goes through that dependency-free helper and local WAVs, not through an import of `@peal-sounds/peal` itself.

## Installation

### CLI (recommended)

```bash
bunx @peal-sounds/peal add [sounds...]
```

Or install for frequent use:

```bash
bun add -g @peal-sounds/peal
# or project-local:
bun add @peal-sounds/peal
```

Also published as [`@arach/peal`](https://www.npmjs.com/package/@arach/peal) (same package, older namespace).

No Bun? `npx @peal-sounds/peal add [sounds...]` and `npm install -g @peal-sounds/peal` work the same way.

### Library only

```bash
bun add @peal-sounds/peal
# or: npm install @peal-sounds/peal · pnpm add @peal-sounds/peal · yarn add @peal-sounds/peal
```

Requires **Bun 1.1+ or Node.js 20+**.

## CLI Commands

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/docs/screenshots/cli.png" alt="Peal CLI adding sounds and listing the catalog" width="720">
</p>

### List available sounds

```bash
bunx @peal-sounds/peal list
```

### Play sounds

```bash
bunx @peal-sounds/peal play success
bunx @peal-sounds/peal play click

# Demo all sounds
bunx @peal-sounds/peal demo

# Demo with custom delay (ms)
bunx @peal-sounds/peal demo --delay 2000
```

### Add sounds to your project

```bash
# Interactive selection
bunx @peal-sounds/peal add

# Specific sounds
bunx @peal-sounds/peal add click success error

# Custom directory for WAV files (helper still lands in project root)
bunx @peal-sounds/peal add --dir ./assets/sounds

# TypeScript helper (peal.ts)
bunx @peal-sounds/peal add --typescript
```

### Remove sounds

```bash
bunx @peal-sounds/peal remove
bunx @peal-sounds/peal remove click tap
```

## Available Sounds

| Group | Names |
| --- | --- |
| UI feedback | `success`, `error`, `notification`, `click`, `tap` |
| Transitions | `transition`, `swoosh` |
| Loading | `loading`, `complete` |
| Alerts | `alert`, `warning` |
| Messages | `message`, `mention` |
| Interactive | `hover`, `select`, `toggle` |
| System | `startup`, `shutdown`, `unlock` |

19 sounds total. Run `peal list` for the terminal view.

## Library API

There are two surfaces. Most apps use the **generated helper**. Use the **`Peal` class** when you want to load arbitrary paths yourself.

### Generated helper (recommended)

After `bunx @peal-sounds/peal add`:

```javascript
import { peal } from './peal.js'

// Shortcuts for each sound you added (no arguments)
peal.success()
peal.error()
peal.click()

// Play by name with options
peal.play('success', { volume: 0.8, loop: false })

// Playback control
peal.stop('success')  // one sound
peal.stop()           // all
peal.pause('success')
peal.pause()

// Volume and mute (helper API)
peal.setVolume(0.5)
peal.mute(true)
```

| Method | Description |
| --- | --- |
| `play(name, options?)` | Play by name. Options: `volume` (0–1), `loop` |
| `success()`, `click()`, … | Shortcuts for sounds you added — **no options** |
| `stop(name?)`, `pause(name?)`, `resume(name?)` | Control one sound or all |
| `setVolume(level)`, `mute(muted?)` | Global level and mute |

### Core `Peal` class

```javascript
import { Peal } from '@peal-sounds/peal'

const audio = new Peal()
audio.load('mySound', '/path/to/sound.wav')
audio.play('mySound', { volume: 0.5, loop: false })

audio.stop('mySound')
audio.pause('mySound')
audio.volume(0.8)   // global volume (0–1); different name than helper's setVolume
audio.mute(true)
audio.unload('mySound')
```

Optional TTS (needs `OPENAI_API_KEY` or `GROQ_API_KEY`, or pass keys in the constructor):

```javascript
const audio = new Peal({ openaiApiKey: process.env.OPENAI_API_KEY })
await audio.speak('Saved successfully')
```

### TypeScript

```bash
bunx @peal-sounds/peal add --typescript
```

```typescript
import { peal } from './peal'

peal.success()
peal.play('success', { volume: 0.8 })
```

For the library class and its types:

```typescript
import { Peal, type PealOptions } from '@peal-sounds/peal'

const options: PealOptions = { volume: 0.8, preload: true }
const audio = new Peal(options)
```

## Usage Examples

### React

```jsx
import { peal } from './peal'

function SubmitButton({ onClick }) {
  const handleClick = async () => {
    peal.click()
    try {
      await onClick()
      peal.success()
    } catch {
      peal.error()
    }
  }

  return (
    <button onClick={handleClick} onMouseEnter={() => peal.hover()}>
      Submit
    </button>
  )
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
import { peal } from './peal'

export default {
  methods: {
    playHover() {
      peal.hover()
    },
    async handleSubmit() {
      peal.click()
      // Your submit logic
    }
  }
}
</script>
```

## Web App

Use the browser app to preview presets, design custom sounds, and manage a collection — then ship files into projects with the CLI.

| Surface | Path | Description |
| --- | --- | --- |
| **Library** | [/library](https://arach.github.io/peal/library) | Browse, generate, and manage sounds |
| **Studio (SFX)** | [/studio](https://arach.github.io/peal/studio) | Sound designer with live Web Audio code and AI-assisted parameters |
| **Voice** | [/studio/voice](https://arach.github.io/peal/studio/voice) | TTS studio (`/voice` redirects here) |
| **Music** | [/studio/music](https://arach.github.io/peal/studio/music) | Strudel editor, AI copilot, improv loop, versions |
| **Presets** | [/presets](https://arach.github.io/peal/presets) | Curated collections (`/premium`, `/mechanics`, `/keyboard`, `/brands`, `/signature`) |

Live app: [arach.github.io/peal](https://arach.github.io/peal/)

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/public/images/studio/sfx.png" alt="SFX Studio — Web Audio sound designer" width="288">
  <img src="https://raw.githubusercontent.com/arach/peal/master/public/images/studio/voice.png" alt="Voice Studio — TTS deck" width="288">
  <img src="https://raw.githubusercontent.com/arach/peal/master/public/images/studio/music.png" alt="Music Studio — Strudel live coding" width="288">
</p>

The npm CLI and Studio are separate surfaces: installing Peal does not bundle or launch the web app. Use the hosted links above, or run the repository locally.

Studio uses **hudsonkit** for app chrome, with a material/instrument aesthetic for sound design controls.

### Local development

```bash
git clone https://github.com/arach/peal.git
cd peal
bun install
bun dev
```

The Next.js dev server runs on port **3001**. Open the surface you need:

```bash
open http://localhost:3001/studio        # SFX Studio
open http://localhost:3001/studio/voice  # Voice Studio
open http://localhost:3001/studio/music  # Music Studio
```

On Linux, use `xdg-open`; on Windows, use `start`, or paste the URLs into any browser. Local development requires **[Bun](https://bun.sh) 1.1+** and **Node.js 20+**.

Studio AI features need provider credentials; run `bun run credentials` to check what is configured.

### Music Studio + Strudel

Music uses a **managed Strudel checkout** (AGPL, not vendored), driven by Bun scripts:

```bash
bun run strudel:install
bun run strudel:start
```

With `bun dev` running, open [http://localhost:3001/studio/music](http://localhost:3001/studio/music). Transport → **Start engine** → edit pattern → **Route** (⌘↵) or ask the copilot.

See [`docs/music-studio.md`](./docs/music-studio.md) and [`lib/strudel/README.md`](./lib/strudel/README.md).

## Tech Stack

### CLI & library
- **Language**: TypeScript
- **Audio**: [Howler.js](https://howlerjs.com/)
- **Build**: [tsup](https://tsup.egoist.dev/)
- **CLI helper**: Browser Audio API; no generated runtime dependency

### Web app
- **Framework**: Next.js (App Router)
- **Studio shell**: hudsonkit
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API
- **State**: Zustand

## Links

- **npm**: [@peal-sounds/peal](https://www.npmjs.com/package/@peal-sounds/peal)
- **GitHub**: [github.com/arach/peal](https://github.com/arach/peal)
- **Web app**: [arach.github.io/peal](https://arach.github.io/peal/)
- **Issues**: [github.com/arach/peal/issues](https://github.com/arach/peal/issues)

## Contributing

Contributions are welcome. Open a pull request against `master`.

1. Fork and clone the repo
2. `bun install` then `bun dev` (port 3001 — do not kill an existing server if one is already running)
3. Make your change; run `bun run lint` and `bun run test` where relevant
4. Open a PR with a clear description of what changed and why

For package-only work, `bun run build:lib` builds `dist/`. Deeper product notes live in [`CLAUDE.md`](./CLAUDE.md) and [`docs/`](./docs/).

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  <strong>Made for better web experiences</strong>
</p>
