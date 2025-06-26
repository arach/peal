# Performance Optimization Guide

## Current Performance Considerations

### 1. Audio Buffer Management
- **Issue**: AudioBuffers are kept in memory for all sounds
- **Impact**: ~1MB per second of audio at 44.1kHz
- **Solution**: Implement buffer recycling or lazy loading

### 2. React Re-renders
- **Issue**: Large dependency arrays cause frequent effect re-runs
- **Impact**: Event listeners re-attached on every render
- **Solution**: Use refs for stable callbacks

### 3. State Persistence
- **Issue**: AudioBuffers are serialized to localStorage
- **Impact**: Slow saves and potential quota exceeded errors
- **Solution**: Exclude binary data from persistence

### 4. Sound Generation
- **Issue**: All sounds generated synchronously in loop
- **Impact**: UI freezes during batch generation
- **Solution**: Use Web Workers or chunked generation

## Optimization Strategies

### Immediate Optimizations
```typescript
// Use selector pattern to prevent unnecessary re-renders
const sounds = useSoundStore((state) => state.sounds)
const setFocusedIndex = useSoundStore((state) => state.setFocusedIndex)

// Instead of subscribing to entire store
const { sounds, setFocusedIndex, ...everything } = useSoundStore()
```

### Memory Management
```typescript
// Add cleanup method to SoundGenerator
cleanupBuffers(soundIds: string[]) {
  // Release AudioBuffer references
}

// Call when removing sounds
removeSelectedSounds: () => {
  const idsToRemove = Array.from(get().selectedSounds)
  generator.cleanupBuffers(idsToRemove)
  // ... rest of removal logic
}
```

### Persistence Optimization
```typescript
// Exclude audioBuffer from persistence
persist(
  (set, get) => ({ ... }),
  {
    name: 'peal-storage',
    partialize: (state) => ({
      ...state,
      sounds: state.sounds.map(s => ({
        ...s,
        audioBuffer: null // Don't persist buffers
      }))
    })
  }
)
```

## Performance Monitoring

Add these metrics to track performance:

1. **Memory Usage**: Monitor AudioContext memory
2. **Render Count**: Track component re-renders
3. **Generation Time**: Measure batch generation duration
4. **Storage Size**: Monitor localStorage usage

## Scaling Considerations

For 1000+ sounds:
- Implement virtual scrolling for the grid
- Use IndexedDB instead of localStorage
- Add sound pagination or lazy loading
- Consider server-side sound generation