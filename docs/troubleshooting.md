# Troubleshooting Guide

## Common Issues

### Sounds Not Playing

#### Check Browser Console
Look for errors. Common ones:

```
DOMException: play() failed because the user didn't interact with the document first
```

**Solution**: Sounds must be triggered by user interaction (click, tap, key press).

```javascript
// ❌ Won't work - no user interaction
window.onload = () => peal.startup();

// ✅ Works - user clicked
button.onclick = () => peal.startup();
```

#### Verify Files Exist

```bash
# Check if sounds were downloaded
ls -la peal/

# Should see:
# click.wav
# success.wav
# error.wav
```

If missing, run:
```bash
npx @peal-sounds/peal add click success error
```

#### Check Import Path

```javascript
// Default location
import { peal } from './peal';

// If in subdirectory
import { peal } from '../peal';

// If in src folder
import { peal } from '../peal';
```

### Module Import Errors

#### "Cannot find module './peal'"

The generated file might be in a different location:

```javascript
// Check where peal.js actually is
// Then update import path accordingly
import { peal } from './path/to/peal';
```

#### ES Modules vs CommonJS

```javascript
// ES Modules (most modern projects)
import { peal } from './peal';

// CommonJS (older Node.js projects)
const { peal } = require('./peal');

// If unsure, check your package.json for:
// "type": "module"  → use import
// No type field     → use require
```

### TypeScript Issues

#### "Cannot find module './peal' or its corresponding type declarations"

Make sure TypeScript helper was generated:

```bash
# Generate TypeScript helper
npx @peal-sounds/peal add --typescript
```

Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "allowJs": true,  // If using peal.js
    "include": ["src", "peal.ts"]  // Include the helper
  }
}
```

### Build/Bundle Issues

#### Sounds Not Found in Production

Common with Vite, Webpack, etc. The bundler might not include WAV files.

**Vite** - Copy sounds to public:
```javascript
// vite.config.js
export default {
  publicDir: 'public',
  // Sounds in public/peal/ will be served at /peal/
}
```

**Webpack** - Use copy plugin:
```javascript
// webpack.config.js
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'peal', to: 'peal' }
      ]
    })
  ]
};
```

**Next.js** - Put in public folder:
```bash
# Move sounds to public
mv peal public/

# Update peal.js to use public path
peal.load('click', '/peal/click.wav');
```

### Safari/iOS Issues

#### Sounds Not Playing on iOS

iOS requires user interaction AND the audio context might need to be resumed:

```javascript
// For iOS compatibility
document.addEventListener('click', () => {
  // Resume audio context on first interaction
  if (Howler.ctx?.state === 'suspended') {
    Howler.ctx.resume();
  }
}, { once: true });
```

#### Silent Mode

iOS respects silent mode for sounds. Test with ringer on.

### Performance Issues

#### Delay on First Play

First play loads the file. Peal preloads by default, but ensure page is loaded:

```javascript
// Wait for sounds to load
window.addEventListener('load', () => {
  console.log('Sounds ready!');
});
```

#### Too Many Sounds

Loading many sounds can impact performance:

```javascript
// Bad - loads everything
npx @peal-sounds/peal add  # Don't add all

// Good - only what you need
npx @peal-sounds/peal add click success error
```

### Volume Issues

#### Sounds Too Quiet/Loud

```javascript
// Check global volume
console.log('Volume:', peal.volume());  // Should be 0-1

// Set to 70%
peal.volume(0.7);

// Set per-sound
peal.play('click', { volume: 0.5 });
```

#### Muted by Default

```javascript
// Check mute state
console.log('Muted:', peal.mute());

// Unmute
peal.mute(false);
```

### Console Warnings

#### "The AudioContext was not allowed to start"

Normal browser behavior. Will auto-resume on user interaction.

#### "Failed to load resource: 404"

Sound file not found. Check:
1. File exists in `peal/` directory
2. Path in generated `peal.js` is correct
3. Build process includes sound files

## Debug Checklist

1. **Open browser console** - Any errors?
2. **Check network tab** - Are WAV files loading?
3. **Verify file paths** - Do paths in peal.js match file locations?
4. **Test with demo** - Does `npx @peal-sounds/peal demo` work?
5. **Try different browser** - Issue might be browser-specific
6. **Check volume/mute** - System volume, browser tab not muted?
7. **User interaction** - Sounds triggered by user action?

## Still Having Issues?

### Get Help

1. **Check examples** - Working examples in `/examples`
2. **GitHub Issues** - [github.com/arach/peal/issues](https://github.com/arach/peal/issues)
3. **Minimal reproduction** - Create smallest example showing issue

### Debug Code

Add this debug helper:

```javascript
// Debug helper
window.pealDebug = () => {
  console.log('Peal Debug Info:');
  console.log('- Volume:', peal.volume());
  console.log('- Muted:', peal.mute());
  console.log('- Sounds loaded:', peal.sounds);
  console.log('- Howler state:', Howler.ctx?.state);
  
  // Try playing
  console.log('Attempting to play click...');
  peal.click();
};

// Run in console: pealDebug()
```

### Report a Bug

Include:
1. **Environment**: Browser, OS, bundler
2. **Error messages**: Full console output
3. **Code sample**: How you're using Peal
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens