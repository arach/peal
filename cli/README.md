# Peal CLI

The official CLI for adding Peal sound effects to your project.

## Installation

You can use Peal without installing it globally using npx:

```bash
npx @peal-sounds/peal add success error notification
```

Or install it globally:

```bash
npm install -g @peal-sounds/peal
```

## Usage

### Add sounds to your project

Add specific sounds:
```bash
peal add success error notification
```

Interactive mode (select from categories):
```bash
peal add
```

### Options

Generate TypeScript files:
```bash
peal add --typescript
```

Custom output directory:
```bash
peal add --dir sounds
```

### List available sounds

```bash
peal list
```

## Available Sounds

- **UI Feedback**: success, error, notification, click, tap
- **Transitions**: transition, swoosh
- **Loading**: loading, complete
- **Alerts**: alert, warning
- **Messages**: message, mention
- **Interactive**: hover, select, toggle
- **System**: startup, shutdown, unlock

## API Usage

After adding sounds to your project:

```javascript
import { peal } from './peal';

// Play sounds
peal.play('success');
peal.play('error', { volume: 0.5 });

// Convenience methods
peal.success();
peal.error();
peal.notification();

// Control playback
peal.stop('loading');
peal.stop();
peal.setVolume(0.8);
peal.mute(true);
```

### React Example

```jsx
import { peal } from './peal';

function Button({ onClick, children }) {
  return (
    <button
      onClick={() => {
        peal.click();
        onClick();
      }}
      onMouseEnter={() => peal.hover()}
    >
      {children}
    </button>
  );
}
```

## Requirements

- Node.js 20 or higher

The CLI and generated helper have no runtime dependencies. `peal add` never runs a package-manager install in your project.

## Studio

The CLI does not bundle or launch Peal Studio. Use the hosted web app:

- [SFX Studio](https://arach.github.io/peal/studio)
- [Voice Studio](https://arach.github.io/peal/studio/voice)
- [Music Studio](https://arach.github.io/peal/studio/music)

When developing this repository locally, run `pnpm dev`, then open the same routes on `http://localhost:3001`.

## License

MIT
