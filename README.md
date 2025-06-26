# Peal 🔔

A lightweight sound effect library for web and desktop applications.

## Overview

Peal provides a simple, cross-platform API for playing sound effects in your applications. It includes a collection of carefully designed UI sounds and supports custom sound assets.

## Features

- 🎵 Pre-designed UI sound effects
- 🎨 Custom sound support
- 🚀 Lightweight and fast
- 🔧 Simple API
- 🖥️ Cross-platform support

## Installation

```bash
npm install peal
# or
pnpm add peal
```

## Usage

```javascript
import { Peal } from 'peal';

// Initialize with default sounds
const peal = new Peal();

// Play a sound
await peal.play('success');

// Play with options
await peal.play('start', { volume: 0.5 });

// Add custom sounds
peal.addSound('custom-alert', '/path/to/sound.wav');
```

## Available Sounds

- `start` - Operation beginning
- `stop` - Operation ending  
- `success` - Task completion
- `error` - Error or failure

## Sound Design Tools

Peal includes web-based sound design tools for creating custom notification sounds:

### Bulk Sound Designer
Open `assets/sounds/bulk-sound-designer.html` in your browser to access the main sound design tool featuring:
- **Batch Generation**: Create 50 unique sounds at once
- **Visual Feedback**: Waveform previews for each sound
- **Multiple Sound Types**: Tones, chimes, clicks, sweeps, and pulses
- **Advanced Effects**: Reverb, delay, filters, distortion, and modulation
- **Bulk Export**: Download selected sounds as WAV files in a ZIP
- **Keyboard Navigation**: Full keyboard control for efficient workflow

### Additional Tools
- **Interactive Sound Designer** (`assets/sounds/interactive-sound-designer.html`) - Real-time parameter adjustment
- **Sound Generator** (`assets/sounds/sound-generator.html`) - Generate the default Peal sounds
- **Node.js Generator** (`assets/sounds/generate-sounds.cjs`) - Command-line sound generation

## License

MIT
