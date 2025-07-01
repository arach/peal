# Peal Documentation

Welcome to the Peal documentation! Peal is a lightweight sound effect library for web applications.

## Getting Started

- **[Quick Start Guide](./quick-start.md)** - Get up and running in 2 minutes
- **[Overview](./overview.md)** - Understand what Peal is and how it works
- **[API Reference](./api-reference.md)** - Complete API documentation

## Guides

- **[Library Documentation](./library.md)** - Comprehensive guide with examples
- **[Migration Guide](./migration-guide.md)** - Moving from other audio solutions
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## Key Concepts

### 1. CLI + Library Design

Peal has two parts that work together:

- **CLI** (`npx @peal-sounds/peal`) - Manages sound files
- **Library** (`@peal-sounds/peal`) - Plays sounds in your app

### 2. The Generated Helper

When you run `peal add`, it creates a helper file that:
- Knows where all your sounds are located
- Provides convenient methods like `peal.click()`
- Handles all the setup automatically

### 3. Zero Configuration

```javascript
// This just works - no paths, no setup
import { peal } from './peal';
peal.success();
```

## Quick Example

```bash
# 1. Add sounds to your project
npx @peal-sounds/peal add click success error

# 2. Install the library
npm install @peal-sounds/peal
```

```javascript
// 3. Use in your code
import { peal } from './peal';

button.addEventListener('click', async () => {
  peal.click();
  
  try {
    await saveData();
    peal.success();
  } catch (err) {
    peal.error();
  }
});
```

## Documentation Structure

```
docs/
├── README.md           # This file
├── quick-start.md      # 2-minute setup guide
├── overview.md         # Architecture and concepts
├── api-reference.md    # Concise API docs
├── library.md          # Full library documentation
├── migration-guide.md  # Moving from other solutions
└── troubleshooting.md  # Common issues and fixes
```

## Need Help?

- 📖 Read the [full documentation](./library.md)
- 🐛 Check [troubleshooting](./troubleshooting.md)
- 💬 Open an [issue on GitHub](https://github.com/arach/peal/issues)
- 🌟 Star us on [GitHub](https://github.com/arach/peal)

## Philosophy

Peal believes that:
- Sound effects should be easy to add to any web app
- Developers shouldn't manage audio file paths
- The best API is one that just works
- Professional UI sounds improve user experience

Happy coding with sounds! 🎵