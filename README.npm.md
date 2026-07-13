# Peal

Curated UI sounds for web apps — clicks, success chimes, errors, and the rest — copied into your repo and played through a small generated helper.

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/docs/screenshots/cli.png" alt="Peal CLI copying sound files and listing the built-in catalog" width="720">
</p>

## What you get

1. **CLI** — pick sounds from the built-in set and copy `.wav` files into your project
2. **Generated `peal.js`** — a tiny dependency-free player that knows where those files live
3. **Library** (`Peal` class) — optional lower-level API if you want to wire up your own paths

No sound hosting, no accounts. Files sit in your repo; you call `peal.click()` when something happens in the UI.

## Quick start

```bash
npm install @peal-sounds/peal

peal add \
  click \
  success \
  error
```

That writes something like:

```
your-project/
├── peal.js          # generated — import this in your app
└── peal/
    ├── click.wav
    ├── success.wav
    └── error.wav
```

Then in your app:

```javascript
import { peal } from './peal.js'

button.addEventListener('click', () => {
  peal.click()
})

async function save() {
  try {
    await api.save()
    peal.success()
  } catch {
    peal.error()
  }
}
```

`./peal.js` is created by the CLI in your project root. You are not importing the npm package for playback — only the generated helper, which uses the browser's built-in Audio API and points at `./peal/*.wav`.

The CLI does not install or modify any runtime dependencies in your project.

Prefer a one-off without installing?

```bash
npx @peal-sounds/peal add click
```

Also published as `@arach/peal` (same package, older namespace).

Requires **Node.js 20+**.

## Install

```bash
npm install @peal-sounds/peal
# pnpm add @peal-sounds/peal
# yarn add @peal-sounds/peal
# bun add @peal-sounds/peal
```

The `peal` binary is on your PATH after install.

## Available sounds

| Group | Names |
| --- | --- |
| UI feedback | `success`, `error`, `notification`, `click`, `tap` |
| Transitions | `transition`, `swoosh` |
| Loading | `loading`, `complete` |
| Alerts | `alert`, `warning` |
| Messages | `message`, `mention` |
| Interactive | `hover`, `select`, `toggle` |
| System | `startup`, `shutdown`, `unlock` |

19 sounds total. Run `peal list` for the full list in the terminal.

## CLI

```bash
peal add                         # interactive picker
peal add click                   # one sound
peal add \                       # several sounds
  click \
  success \
  error
peal add --dir ./sounds          # custom folder for WAV files
peal add --typescript            # generate peal.ts instead of peal.js

peal list                   # show available sounds
peal play click             # preview a sound
peal demo                   # play through the set
peal remove click           # remove from your project
```

## Using the library directly

If you already have audio files and do not need the generated helper:

```javascript
import { Peal } from '@peal-sounds/peal'

const audio = new Peal()
audio.load('click', '/sounds/click.wav')
audio.play('click', { volume: 0.5, loop: false })
audio.volume(0.8)  // global volume (0–1)
audio.mute(true)
```

The generated `peal.js` is the usual path for CLI-added sounds. The `Peal` class is for custom loading and paths.

Optional TTS (`OPENAI_API_KEY` or `GROQ_API_KEY`):

```javascript
const audio = new Peal({ openaiApiKey: process.env.OPENAI_API_KEY })
await audio.speak('Saved successfully')
```

## API (generated helper)

- `peal.play(name, options?)` — play by name; options: `volume` (0–1), `loop`
- `peal.click(options?)`, `peal.success(options?)`, … — shortcuts for sounds you added
- `peal.stop(name?)`, `peal.pause(name?)`, `peal.resume(name?)`
- `peal.setVolume(0.5)`, `peal.mute(true)`

```javascript
peal.play('success', { volume: 0.5, loop: false })
peal.success({ volume: 0.5 })
```

## TypeScript

```bash
peal add --typescript
```

```typescript
import { peal } from './peal'

peal.success()
peal.play('success', { volume: 0.8 })
```

Library types:

```typescript
import { Peal, type PealOptions } from '@peal-sounds/peal'
```

## Web app

The npm package is the CLI + library. Peal also runs in the browser — browse presets, generate sounds, or design in the studio — then copy what you need into a project with `peal add`.

The CLI does not launch or bundle Studio. Open the hosted app directly:

- [SFX Studio](https://arach.github.io/peal/studio)
- [Voice Studio](https://arach.github.io/peal/studio/voice)
- [Music Studio](https://arach.github.io/peal/studio/music)
- [Sound Library](https://arach.github.io/peal/library)

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/docs/screenshots/landing-hero.png" alt="Peal landing page with header navigation and hero" width="900">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/docs/screenshots/sounds.png" alt="Signature sounds grid — click to preview UI sounds" width="900">
</p>

[Open the app](https://arach.github.io/peal/) · [Product site](https://peal.app) · [GitHub](https://github.com/arach/peal)

## Links

- [Web app](https://arach.github.io/peal/)
- [peal.app](https://peal.app)
- [GitHub](https://github.com/arach/peal)
- [Issues](https://github.com/arach/peal/issues)

MIT — see [LICENSE](https://github.com/arach/peal/blob/master/LICENSE)
