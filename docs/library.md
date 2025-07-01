# Peal Library Documentation

Peal is a lightweight sound effect library for web applications. It's a thin wrapper around [Howler.js](https://howlerjs.com/) that works seamlessly with sounds managed by the Peal CLI.

## Installation

```bash
npm install @peal-sounds/peal
# or
yarn add @peal-sounds/peal
# or
pnpm add @peal-sounds/peal
```

## Quick Start

### 1. Add sounds using the CLI

```bash
npx @peal-sounds/peal add click success error notification
```

This downloads high-quality WAV files to `./peal/` and generates a helper file.

### 2. Import and use

```javascript
import { peal } from './peal';

// Play sounds with zero configuration
peal.click();
peal.success();
peal.error();
peal.notification();
```

## Core Concepts

### The Generated Helper

When you run `peal add`, the CLI generates a `peal.js` (or `peal.ts`) file that:
- Pre-configures all sound paths
- Provides convenience methods for each sound
- Handles loading and initialization

### Sound Management

Peal follows a simple philosophy:
- **CLI manages sounds** - Add, remove, and organize sounds
- **Library plays sounds** - Simple API for playback control
- **Zero configuration** - The generated helper handles all paths

## API Reference

### Convenience Methods

Each sound you add gets its own method:

```javascript
// If you added: click, success, error
peal.click()      // Plays the click sound
peal.success()    // Plays the success sound
peal.error()      // Plays the error sound
```

### Core Methods

#### `play(soundName, options?)`
Play a specific sound with optional configuration.

```javascript
peal.play('success', {
  volume: 0.5,    // 0-1
  loop: false,    // Boolean
  rate: 1.0       // Playback rate (0.5-2.0 recommended)
});
```

#### `stop(soundName?)`
Stop a specific sound or all sounds.

```javascript
peal.stop('success');  // Stop specific sound
peal.stop();          // Stop all sounds
```

#### `pause(soundName?)`
Pause a specific sound or all sounds.

```javascript
peal.pause('success');  // Pause specific sound
peal.pause();          // Pause all sounds
```

#### `volume(level?)`
Get or set the global volume.

```javascript
peal.volume(0.5);      // Set volume to 50%
const vol = peal.volume();  // Get current volume
```

#### `mute(muted?)`
Get or set the global mute state.

```javascript
peal.mute(true);       // Mute all sounds
peal.mute(false);      // Unmute all sounds
const isMuted = peal.mute();  // Get mute state
```

## Framework Examples

### React

```jsx
import { peal } from './peal';
import { useState } from 'react';

function SubmitButton({ onSubmit }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    peal.click();
    setIsLoading(true);
    
    try {
      await onSubmit();
      peal.success();
    } catch (error) {
      peal.error();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      onMouseEnter={() => peal.hover()}
      disabled={isLoading}
    >
      {isLoading ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

### Vue 3

```vue
<template>
  <button 
    @click="handleSubmit" 
    @mouseenter="peal.hover()"
    :disabled="isLoading"
  >
    {{ isLoading ? 'Submitting...' : 'Submit' }}
  </button>
</template>

<script setup>
import { ref } from 'vue';
import { peal } from './peal';

const isLoading = ref(false);

const handleSubmit = async () => {
  peal.click();
  isLoading.value = true;
  
  try {
    await submitForm();
    peal.success();
  } catch (error) {
    peal.error();
  } finally {
    isLoading.value = false;
  }
};
</script>
```

### Svelte

```svelte
<script>
  import { peal } from './peal';
  
  let isLoading = false;
  
  async function handleSubmit() {
    peal.click();
    isLoading = true;
    
    try {
      await submitForm();
      peal.success();
    } catch (error) {
      peal.error();
    } finally {
      isLoading = false;
    }
  }
</script>

<button 
  on:click={handleSubmit}
  on:mouseenter={() => peal.hover()}
  disabled={isLoading}
>
  {isLoading ? 'Submitting...' : 'Submit'}
</button>
```

### Vanilla JavaScript

```javascript
import { peal } from './peal';

const button = document.querySelector('#submit-button');

button.addEventListener('mouseenter', () => {
  peal.hover();
});

button.addEventListener('click', async () => {
  peal.click();
  button.disabled = true;
  button.textContent = 'Submitting...';
  
  try {
    await submitForm();
    peal.success();
  } catch (error) {
    peal.error();
  } finally {
    button.disabled = false;
    button.textContent = 'Submit';
  }
});
```

## Advanced Usage

### Using the Base Peal Class

For custom sound management, use the base `Peal` class:

```javascript
import { Peal } from '@peal-sounds/peal';

const soundManager = new Peal({
  volume: 0.7,
  mute: false,
  preload: true
});

// Load custom sounds
soundManager.load('intro', '/sounds/intro.mp3');
soundManager.load('outro', '/sounds/outro.mp3');

// Play them
soundManager.play('intro');
```

### Sound Sprites (Coming Soon)

For performance optimization with many short sounds:

```javascript
// Future API
peal.loadSprite('ui-sounds', {
  src: ['ui-sprite.mp3'],
  sprite: {
    click: [0, 250],
    hover: [300, 150],
    success: [500, 800]
  }
});
```

## Best Practices

### 1. Preload Critical Sounds
The generated helper automatically preloads all sounds. For custom sounds:

```javascript
soundManager.load('critical-sound', '/path/to/sound.mp3', {
  preload: true
});
```

### 2. Handle User Interaction
Browsers require user interaction before playing audio:

```javascript
// Bad - might be blocked
window.addEventListener('load', () => {
  peal.startup(); // ❌ Might not play
});

// Good - triggered by user action
button.addEventListener('click', () => {
  peal.startup(); // ✅ Will play
});
```

### 3. Volume Management
Consider user preferences:

```javascript
// Save user preference
localStorage.setItem('soundVolume', '0.5');

// Restore on load
const savedVolume = localStorage.getItem('soundVolume');
if (savedVolume) {
  peal.volume(parseFloat(savedVolume));
}
```

### 4. Accessibility
Provide options to disable sounds:

```javascript
// Sound toggle component
function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    peal.mute(!newState);
    localStorage.setItem('soundEnabled', newState);
  };
  
  return (
    <button onClick={toggleSound}>
      {soundEnabled ? '🔊' : '🔇'} Sounds
    </button>
  );
}
```

## TypeScript Support

Peal includes TypeScript definitions. The generated `peal.ts` file provides full type safety:

```typescript
import { peal } from './peal';

// TypeScript knows all your sound methods
peal.click();      // ✅ Type-safe
peal.unknown();    // ❌ TypeScript error

// Options are typed
peal.play('success', {
  volume: 0.5,     // ✅ number between 0-1
  loop: true,      // ✅ boolean
  rate: 1.5        // ✅ number
});
```

## Troubleshooting

### Sounds not playing?

1. **Check browser console** - Look for errors
2. **Verify paths** - Ensure `peal/` directory exists
3. **User interaction** - Ensure playback is triggered by user action
4. **Browser support** - Test in different browsers
5. **File format** - Peal sounds are high-quality WAV files

### Import errors?

```javascript
// If using ES modules
import { peal } from './peal';

// If using CommonJS
const { peal } = require('./peal');

// If paths are different
import { peal } from '../sounds/peal';
```

### Volume issues?

```javascript
// Check global volume
console.log('Volume:', peal.volume());

// Check mute state
console.log('Muted:', peal.mute());

// Reset to defaults
peal.volume(1);
peal.mute(false);
```

## Performance Tips

1. **Sounds are cached** - First play might have slight delay
2. **Preloading is automatic** - Generated helper preloads all sounds
3. **Reuse instances** - Don't create multiple Peal instances
4. **Consider file size** - Use CLI to manage only needed sounds

## Browser Support

Peal works in all modern browsers that support the Web Audio API:
- Chrome 10+
- Firefox 25+
- Safari 6+
- Edge 12+
- iOS Safari 6+
- Chrome for Android

## License

MIT