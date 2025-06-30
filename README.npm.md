# @peal-sounds/peal

Professional UI sound effects for your web applications - ready to use in seconds.

## Quick Start

Add beautiful sounds to your project:

```bash
npx @peal-sounds/peal add success error notification
```

Then use them:

```javascript
import { peal } from './peal';

// Play sounds
peal.play('success');
peal.error();
peal.notification();
```

## Installation

You can use Peal without installing it globally:

```bash
npx @peal-sounds/peal add [sounds...]
```

Or install globally for frequent use:

```bash
npm install -g @peal-sounds/peal
```

## Available Sounds

- **UI Feedback**: `success`, `error`, `notification`, `click`, `tap`
- **Transitions**: `transition`, `swoosh`
- **Loading**: `loading`, `complete`
- **Alerts**: `alert`, `warning`
- **Messages**: `message`, `mention`
- **Interactive**: `hover`, `select`, `toggle`
- **System**: `startup`, `shutdown`, `unlock`

List all available sounds:

```bash
npx @peal-sounds/peal list
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

## API Reference

### Methods

- `peal.play(soundName, options)` - Play a sound with options
- `peal.stop(soundName)` - Stop a playing sound
- `peal.stopAll()` - Stop all playing sounds
- `peal.setVolume(0-1)` - Set global volume
- `peal.mute(boolean)` - Mute/unmute all sounds

### Convenience Methods

Each sound has a convenience method:

- `peal.success(options)`
- `peal.error(options)`
- `peal.notification(options)`
- etc.

### Options

```javascript
peal.play('success', {
  volume: 0.5,    // 0-1
  loop: false,    // boolean
  rate: 1.0      // playback rate
});
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