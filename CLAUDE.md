# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peal is a lightweight sound effect library for web and desktop applications, providing a simple cross-platform API for playing sound effects. The library uses Howler.js for audio playback and is built with TypeScript.

## Common Development Commands

```bash
# Install dependencies (prefer pnpm)
pnpm install

# Development with watch mode
pnpm dev

# Build library (outputs to dist/)
pnpm build

# Run tests
pnpm test

# Run a single test
pnpm test path/to/test.spec.ts

# Lint code
pnpm lint

# Generate custom sounds
node assets/sounds/generate-sounds.cjs
```


*** IMPORTANT ***

1. You must never add Claude as co-author, messes up our contributor pages on Github
2. You must never kill our next server, we run the server on port 3001 and it always autocompiles. If there's an issue, ask for assistance


## Architecture & Structure

### Build Configuration
- **Build Tool**: tsup - bundles TypeScript into multiple formats (CJS, ESM, and type definitions)
- **Output**: `dist/` directory with `index.js` (CJS), `index.mjs` (ESM), and `index.d.ts` (types)
- **Published Files**: Both `dist/` and `assets/` directories are included in npm package

### Sound System
- **Built-in Sounds**: Located in `assets/sounds/custom/` (start, stop, error, success)
- **Sound Generation**: `assets/sounds/generate-sounds.cjs` creates tech-forward UI sounds using Node.js audio synthesis
- **Sound Design**: Detailed specifications in `assets/sounds/SOUND_DESIGN.md`

### Expected API Structure
The library should expose a `Peal` class with these core methods:
- `play(soundName: string, options?: { volume?: number })`: Play a sound effect
- `addSound(name: string, path: string)`: Register custom sounds
- Sound preloading capabilities for better performance

### Development Guidelines
1. The `src/` directory should contain the main implementation
2. Use Howler.js for cross-platform audio playback (already installed)
3. Maintain TypeScript strict mode compliance
4. Follow the existing ESLint configuration
5. Write tests using Vitest for new functionality

## Key Technical Details
- **TypeScript Target**: ES2020 with ESNext modules
- **Environment**: Supports both browser (DOM) and Node.js environments
- **Audio Library**: Howler.js v2.2.4 for audio playback
- **Sound Format**: WAV files for high-quality audio

## Website & Product

Peal is both an npm library (`@peal-sounds/peal`) and a web app for designing UI sounds.

### What Peal does
- **Library** (`/library`) — browse, generate, and manage a personal sound collection
- **Studio** (`/studio`) — dark IDE-style sound designer with live Web Audio API code, AI design, and parameter panels
- **Presets** (`/presets`, `/premium`, `/mechanics`, `/keyboard`, `/brands`, `/signature`) — curated sound collections
- **Voice** (`/voice`) — TTS studio for spoken UI feedback
- **CLI** (`peal add`, `peal play`, `peal list`) — drop sounds into any project via Howler.js

### Landing page (`/`)
The homepage is the marketing entry point. It should match the product surfaces (Studio, Library), not feel like a separate marketing site.

**Style reference:** `../lattices/apps/site` — dark shell, sticky nav, compact type, subtle borders, monospace install blocks, feature buckets. Peal uses **blue** (`#4a9eff`) as the accent instead of Lattices green.

**Design tokens:** `styles/landing.css` (scoped under `.landing`)
- Background: `#111113`, surface: `#1c1c1e`
- Fonts: Space Grotesk (UI), JetBrains Mono (code/CLI)
- Terminal-chic details also live in `lib/terminal-styles.ts` and `/terminal-styleguide`

### Dev server
- Runs on **port 3001** (`pnpm dev` → `next dev --port 3001`)
- Do not kill the running Next server; ask the user if restart is needed

### Hudson Studio (in progress)
- Spec: `docs/hudson-studio-spec.md` — migrate `/studio` to a `HudsonApp` in `hudsonkit` `AppShell`
- Reference: Atelier `AppShellView`, Hudson `stage-design` app, `../hudson/docs/building-apps.md`
- Dispatched to Codex via Scout (`project-quill` / session `session-mqznurdp-csnl32`)