# @peal-sounds/peal

Professional UI sound effects for your web applications.

- **CLI**: Add and manage sounds from our curated collection
- **Library**: Easy audio playback with volume control for web apps

## Quick Start

Step 1: Add sounds from our collection:

```bash
npx @peal-sounds/peal add success error notification
```

Step 2: Use the generated helper that knows where your sounds are:

```javascript
import { peal } from './peal';

// The generated peal.js handles all the paths for you
peal.success();   // Plays ./peal/success.wav
peal.error();     // Plays ./peal/error.wav
```

## Installation

### As a CLI tool

You can use Peal without installing it globally:

```bash
npx @peal-sounds/peal add [sounds...]
```

Or install globally for frequent use:

```bash
npm install -g @peal-sounds/peal
```

### As a library

The Peal library is a thin wrapper around Howler.js that works with the sounds added via CLI:

```bash
npm install @peal-sounds/peal
# or
yarn add @peal-sounds/peal
# or
pnpm add @peal-sounds/peal
```

The CLI generates a `peal.js` file that handles all the paths for you:

```javascript
// After running: npx @peal-sounds/peal add click success
import { peal } from './peal';

// Just use it - paths are handled automatically
peal.click();
peal.success();
```

## Available Sounds

- **UI Feedback**: `success`, `error`, `notification`, `click`, `tap`
- **Transitions**: `transition`, `swoosh`
- **Loading**: `loading`, `complete`
- **Alerts**: `alert`, `warning`
- **Messages**: `message`, `mention`
- **Interactive**: `hover`, `select`, `toggle`
- **System**: `startup`, `shutdown`, `unlock`

## CLI Commands

### List all sounds
```bash
npx @peal-sounds/peal list
```

### Play sounds
```bash
# Play a specific sound
npx @peal-sounds/peal play click
npx @peal-sounds/peal play success

# Play a demo of all sounds
npx @peal-sounds/peal demo

# Demo with custom delay (ms) between sounds
npx @peal-sounds/peal demo --delay 2000
```

### Add sounds to your project
```bash
# Interactive selection
npx @peal-sounds/peal add

# Add specific sounds
npx @peal-sounds/peal add click success error

# Add to custom directory
npx @peal-sounds/peal add --dir ./sounds

# Generate TypeScript helper
npx @peal-sounds/peal add --typescript
```

### Remove sounds from your project
```bash
# Interactive removal
npx @peal-sounds/peal remove

# Remove specific sounds
npx @peal-sounds/peal remove click tap

# Remove from custom directory
npx @peal-sounds/peal remove --dir ./sounds
```

## Usage Examples

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

### Vanilla JavaScript

```javascript
import { peal } from './peal';

document.querySelector('#submit').addEventListener('click', () => {
  peal.click();
  // Your logic here
});
```

## Library API Reference

The Peal library is designed to work seamlessly with sounds added via the CLI. The generated `peal.js` or `peal.ts` file automatically knows where your sounds are located.

### Core Methods

- `peal.play(soundName, options?)` - Play a sound
- `peal.stop(soundName?)` - Stop a specific sound or all sounds
- `peal.pause(soundName?)` - Pause a specific sound or all sounds
- `peal.volume(level?)` - Get/set global volume (0-1)
- `peal.mute(muted?)` - Get/set mute state

### Convenience Methods

The generated helper file includes convenience methods for each sound you've added:

```javascript
// If you added: peal add click success error
peal.click()      // Same as peal.play('click')
peal.success()    // Same as peal.play('success')
peal.error()      // Same as peal.play('error')
```

### Play Options

```javascript
peal.play('success', {
  volume: 0.5,    // Volume (0-1)
  loop: false,    // Loop the sound
  rate: 1.0      // Playback rate
});
```

### Advanced Usage with Base Library

If you need more control, you can use the base Peal class directly:

```javascript
import { Peal } from '@peal-sounds/peal'

const peal = new Peal()
peal.load('custom', '/path/to/sound.mp3')
peal.play('custom')
```

## TypeScript Support

Peal includes TypeScript definitions out of the box:

```typescript
import { peal, PealOptions } from './peal';

const options: PealOptions = {
  volume: 0.8,
  loop: false
};

peal.play('success', options);
```

## License

MIT

## Links

- [GitHub Repository](https://github.com/arach/peal)
- [Web App](https://peal.app)
- [Report Issues](https://github.com/arach/peal/issues)

---

Made with ❤️ by the Peal team