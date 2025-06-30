# Peal CLI Package Structure

## Overview
The Peal CLI is a standalone npm package that allows users to easily add sound effects to their projects.

## Directory Structure

```
cli/
├── index.js              # Main CLI script (executable)
├── package.json          # CLI package configuration
├── README.md            # CLI documentation
├── .gitignore           # Git ignore file
├── generate-cli-sounds.cjs  # Sound generation script
├── sounds/              # Pre-generated sound files (19 sounds)
│   ├── success.wav
│   ├── error.wav
│   ├── notification.wav
│   ├── click.wav
│   ├── tap.wav
│   ├── transition.wav
│   ├── swoosh.wav
│   ├── loading.wav
│   ├── complete.wav
│   ├── alert.wav
│   ├── warning.wav
│   ├── message.wav
│   ├── mention.wav
│   ├── hover.wav
│   ├── select.wav
│   ├── toggle.wav
│   ├── startup.wav
│   ├── shutdown.wav
│   └── unlock.wav
├── templates/           # Helper file templates
│   ├── peal.ts.template
│   └── peal.js.template
└── examples/            # Usage examples
    ├── demo.js
    ├── react-example.tsx
    └── vanilla-example.html
```

## Features

### CLI Commands

1. **Add sounds to project**
   ```bash
   npx peal add success error notification
   npx peal add --typescript  # Interactive mode with TypeScript
   npx peal add --dir ./sounds  # Custom directory
   ```

2. **List available sounds**
   ```bash
   npx peal list
   ```

### Generated Files

When users run the CLI, it creates:
- A `peal/` directory with selected sound files (.wav format)
- A helper file (`peal.js` or `peal.ts`) with:
  - Sound preloading
  - Play/stop/pause methods
  - Volume control
  - Mute functionality
  - Convenience methods for each sound

### Sound Categories

- **UI Feedback**: success, error, notification, click, tap
- **Transitions**: transition, swoosh
- **Loading**: loading, complete
- **Alerts**: alert, warning
- **Messages**: message, mention
- **Interactive**: hover, select, toggle
- **System**: startup, shutdown, unlock

## Usage Flow

1. User runs `npx peal add [sounds]`
2. CLI checks for Howler.js, offers to install if missing
3. User selects sounds (or uses interactive mode)
4. CLI copies sound files to project
5. CLI generates helper file with selected sounds
6. User imports and uses the helper in their app

## Publishing

To publish the CLI package:
```bash
cd cli
npm publish
```

Users can then use it with:
```bash
npx peal-cli add success error
# or install globally
npm install -g peal-cli
peal add success error
```