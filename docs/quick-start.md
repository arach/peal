# Quick Start Guide

Get Peal sounds working in your app in under 2 minutes.

## 1. Add Sounds (30 seconds)

Run this command in your project:

```bash
npx @peal-sounds/peal add click success error notification
```

This:
- Downloads professional UI sounds to `./peal/`
- Generates a `peal.js` helper file
- Takes care of all the setup

## 2. Install the Library (30 seconds)

```bash
npm install @peal-sounds/peal
```

## 3. Use It (1 minute)

```javascript
import { peal } from './peal';

// In your click handler
button.addEventListener('click', async () => {
  peal.click();  // Play click sound
  
  try {
    await saveData();
    peal.success();  // Play success sound
  } catch (err) {
    peal.error();    // Play error sound
  }
});
```

That's it! You now have professional UI sounds in your app.

## What's Next?

### Add More Sounds

See all available sounds:
```bash
npx @peal-sounds/peal list
```

Add specific sounds:
```bash
npx @peal-sounds/peal add hover transition loading
```

### Try the Demo

Hear all sounds:
```bash
npx @peal-sounds/peal demo
```

### Framework Examples

<details>
<summary>React</summary>

```jsx
import { peal } from './peal';

function SaveButton({ onSave }) {
  const handleClick = async () => {
    peal.click();
    
    try {
      await onSave();
      peal.success();
    } catch {
      peal.error();
    }
  };
  
  return (
    <button onClick={handleClick}>
      Save
    </button>
  );
}
```
</details>

<details>
<summary>Vue 3</summary>

```vue
<template>
  <button @click="save">Save</button>
</template>

<script setup>
import { peal } from './peal';

async function save() {
  peal.click();
  
  try {
    await api.save();
    peal.success();
  } catch {
    peal.error();
  }
}
</script>
```
</details>

<details>
<summary>Svelte</summary>

```svelte
<script>
  import { peal } from './peal';
  
  async function save() {
    peal.click();
    
    try {
      await api.save();
      peal.success();
    } catch {
      peal.error();
    }
  }
</script>

<button on:click={save}>Save</button>
```
</details>

## Common Patterns

### Loading States

```javascript
async function fetchData() {
  peal.play('loading', { loop: true });
  
  try {
    const data = await api.getData();
    peal.stop('loading');
    peal.complete();
    return data;
  } catch (err) {
    peal.stop('loading');
    peal.error();
    throw err;
  }
}
```

### Hover Effects

```javascript
document.querySelectorAll('.interactive').forEach(el => {
  el.addEventListener('mouseenter', () => peal.hover());
});
```

### Notifications

```javascript
function notify(message, type = 'info') {
  if (type === 'success') peal.success();
  else if (type === 'error') peal.error();
  else peal.notification();
  
  showToast(message);
}
```

## Pro Tips

✅ **DO**: Use sounds for important user actions
✅ **DO**: Keep volume reasonable (50-70%)
✅ **DO**: Provide a mute option
❌ **DON'T**: Play sounds on page load
❌ **DON'T**: Overuse sounds
❌ **DON'T**: Use sounds for every interaction

## Need Help?

- [Full API Reference →](./api-reference.md)
- [Examples →](./examples)
- [GitHub Issues →](https://github.com/arach/peal/issues)