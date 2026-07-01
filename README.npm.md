# Peal

Curated UI sounds for web apps — clicks, success chimes, errors, and the rest — copied into your repo and played through a small generated helper.

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/docs/screenshots/cli.png" alt="Peal CLI copying sound files and listing the built-in catalog" width="720">
</p>

## What you get

1. **CLI** — pick sounds from the built-in set and copy `.wav` files into your project
2. **Generated `peal.js`** — a tiny Howler-based player that knows where those files live
3. **Library** (`Peal` class) — optional lower-level API if you want to wire up your own paths

No sound hosting, no accounts. Files sit in your repo; you call `peal.click()` when something happens in the UI.

## Quick start

```bash
npm install @peal-sounds/peal
peal add click success error
```

That writes something like:

```
your-app/
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

`./peal.js` is created by the CLI in your project root. You are not importing the npm package for playback — only the generated helper (which wraps Howler and points at `./peal/*.wav`).

Prefer a one-off without installing? `npx @peal-sounds/peal add click success error` does the same thing.

Also published as `@arach/peal` (same package, older namespace).

## Install

```bash
npm install @peal-sounds/peal
# pnpm add @peal-sounds/peal
# yarn add @peal-sounds/peal
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

Run `peal list` for the full list in the terminal.

## CLI

```bash
peal add                    # interactive picker
peal add click success      # add specific sounds
peal add --dir ./sounds     # custom output folder
peal add --typescript       # generate peal.ts instead of peal.js

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
audio.play('click')
```

The generated `peal.js` is the usual path for CLI-added sounds. The `Peal` class is for custom loading and paths.

## API (generated helper)

- `peal.play(name, options?)` — play a sound by name
- `peal.click()`, `peal.success()`, … — shortcuts for sounds you added
- `peal.stop(name?)`, `peal.pause(name?)`, `peal.setVolume(0.5)`, `peal.mute(true)`

```javascript
peal.play('success', { volume: 0.5, loop: false })
```

## TypeScript

```bash
peal add --typescript
```

```typescript
import { peal } from './peal'

peal.success()
```

## Web app

The npm package is the CLI + library. Peal also runs in the browser — browse presets, generate sounds, or design in the studio — then copy what you need into a project with `peal add`.

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/peal/master/docs/screenshots/library.png" alt="Peal library welcome screen in the browser" width="900">
</p>

[Open the app](https://arach.github.io/peal/) · [GitHub](https://github.com/arach/peal)

## Links

- [GitHub](https://github.com/arach/peal)
- [Issues](https://github.com/arach/peal/issues)

MIT