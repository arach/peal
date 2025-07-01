# Migration Guide

## Migrating from Howler.js

If you're using Howler.js directly, Peal simplifies your setup:

### Before (Howler.js)
```javascript
import { Howl, Howler } from 'howler';

// Manual setup for each sound
const sounds = {
  click: new Howl({
    src: ['sounds/click.mp3', 'sounds/click.wav'],
    preload: true,
    volume: 0.5
  }),
  success: new Howl({
    src: ['sounds/success.mp3', 'sounds/success.wav'],
    preload: true,
    volume: 0.7
  }),
  error: new Howl({
    src: ['sounds/error.mp3', 'sounds/error.wav'],
    preload: true,
    volume: 0.6
  })
};

// Playing sounds
sounds.click.play();
sounds.success.play();

// Global controls
Howler.volume(0.5);
Howler.mute(true);
```

### After (Peal)
```javascript
import { peal } from './peal';

// All setup handled by generated file
peal.click();
peal.success();
peal.error();

// Same global controls
peal.volume(0.5);
peal.mute(true);
```

### Migration Steps

1. Install Peal:
   ```bash
   npm install @peal-sounds/peal
   ```

2. Add your sounds:
   ```bash
   npx @peal-sounds/peal add click success error
   ```

3. Replace Howler imports with Peal:
   ```javascript
   // Remove
   import { Howl, Howler } from 'howler';
   
   // Add
   import { peal } from './peal';
   ```

4. Update play calls:
   ```javascript
   // Before
   sounds.click.play();
   
   // After
   peal.click();
   ```

## Migrating from HTML Audio

### Before (Audio elements)
```html
<!-- HTML -->
<audio id="click-sound" src="sounds/click.mp3" preload="auto"></audio>
<audio id="success-sound" src="sounds/success.mp3" preload="auto"></audio>
```

```javascript
// JavaScript
function playClick() {
  const audio = document.getElementById('click-sound');
  audio.currentTime = 0;
  audio.play().catch(e => console.error(e));
}

function playSuccess() {
  const audio = document.getElementById('success-sound');
  audio.currentTime = 0;
  audio.play().catch(e => console.error(e));
}

// Volume control
document.getElementById('click-sound').volume = 0.5;
```

### After (Peal)
```javascript
import { peal } from './peal';

// Much cleaner!
peal.click();
peal.success();

// Better volume control
peal.volume(0.5);  // Sets all sounds
```

### Benefits of Migrating
- ✅ No DOM manipulation
- ✅ Automatic preloading
- ✅ Better performance (Web Audio API)
- ✅ Cleaner code
- ✅ TypeScript support

## Migrating from Base64 Embedded Audio

### Before (Embedded audio)
```javascript
// Bloated bundle with base64 audio
const SOUNDS = {
  click: 'data:audio/wav;base64,UklGRiQFAABXQVZFZm10IBAAAAABAAEAQB8AAEC...',
  success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAI...',
  // Each sound adds 50-200KB to your bundle!
};

function playSound(name) {
  const audio = new Audio(SOUNDS[name]);
  audio.play();
}
```

### After (Peal)
```javascript
import { peal } from './peal';

// Sounds loaded from files, not embedded
peal.click();    // Loads from ./peal/click.wav
peal.success();  // Loads from ./peal/success.wav
```

### Benefits
- ✅ 90% smaller JavaScript bundle
- ✅ Better caching (files cached separately)
- ✅ Lazy loading possible
- ✅ Better performance

## Migrating from Custom Solutions

### Common Pattern 1: Sound Manager Class
```javascript
// Before - Custom implementation
class SoundManager {
  constructor() {
    this.sounds = {};
    this.volume = 1;
  }
  
  load(name, path) {
    this.sounds[name] = new Audio(path);
  }
  
  play(name) {
    if (this.sounds[name]) {
      this.sounds[name].currentTime = 0;
      this.sounds[name].volume = this.volume;
      this.sounds[name].play();
    }
  }
}

const sounds = new SoundManager();
sounds.load('click', '/sounds/click.mp3');
sounds.play('click');
```

```javascript
// After - Peal handles this
import { peal } from './peal';
peal.click();
```

### Common Pattern 2: React Hook
```javascript
// Before - Custom hook
function useSound(src) {
  const [audio] = useState(new Audio(src));
  
  const play = useCallback(() => {
    audio.currentTime = 0;
    audio.play();
  }, [audio]);
  
  return play;
}

// Usage
const playClick = useSound('/sounds/click.mp3');
```

```javascript
// After - Simpler with Peal
import { peal } from './peal';

function MyComponent() {
  return <button onClick={() => peal.click()}>Click</button>;
}
```

## Step-by-Step Migration Process

### 1. Inventory Your Sounds
List all sounds currently in your app:
```bash
# Find audio files
find . -name "*.mp3" -o -name "*.wav" -o -name "*.ogg"
```

### 2. Add Equivalent Peal Sounds
```bash
# Add the sounds you need
npx @peal-sounds/peal add click success error notification
```

### 3. Install Peal Library
```bash
npm install @peal-sounds/peal
```

### 4. Update Your Code
Replace sound playing code with Peal calls:

```javascript
// Old way (varies)
playSound('click');
audioManager.play('click');
sounds.click.play();

// New way (consistent)
peal.click();
```

### 5. Remove Old Code
- Delete old audio files
- Remove audio management code
- Remove `<audio>` elements
- Update build config if needed

### 6. Test Everything
```bash
# Test all sounds work
npx @peal-sounds/peal demo

# Test in your app
npm run dev
```

## Keeping Custom Sounds

If you have custom sounds not in Peal's library:

```javascript
import { Peal } from '@peal-sounds/peal';

// Use base class for custom sounds
const custom = new Peal();
custom.load('my-sound', '/sounds/my-custom.mp3');
custom.play('my-sound');

// Use generated peal for standard sounds
import { peal } from './peal';
peal.click();  // Standard Peal sound
```

## Need Help?

- Check the [Troubleshooting Guide](./troubleshooting.md)
- See working [Examples](../examples)
- Ask on [GitHub Issues](https://github.com/arach/peal/issues)