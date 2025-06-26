# Scout Sound Design Specification

## Design Philosophy
- **Tech-forward**: Modern, digital-first sounds that feel precise and responsive
- **Unique**: Not derivative of common system sounds or well-known apps
- **Minimal**: Short, non-intrusive sounds that provide clear feedback
- **Cohesive**: All sounds share similar tonal qualities and design language

## Sound Profiles

### 1. Start Recording - "Neural Activate"
- **Duration**: 150-200ms
- **Character**: Ascending synth sweep with subtle digital artifacts
- **Elements**:
  - Base frequency: 440Hz → 880Hz exponential sweep
  - Overtone: Sine wave at 1760Hz (fading in)
  - Digital texture: Subtle bit-crushing at tail
  - Envelope: Fast attack (5ms), short sustain, medium release
- **Feel**: Activation, engagement, readiness

### 2. Stop Recording - "Data Seal"
- **Duration**: 200-250ms  
- **Character**: Descending filtered pulse with resonant tail
- **Elements**:
  - Base: Square wave 880Hz → 220Hz
  - Filter: Low-pass sweep 8kHz → 800Hz
  - Sub-bass pulse: 55Hz (25ms)
  - Envelope: Medium attack, quick decay
- **Feel**: Completion, sealing, finality

### 3. Error - "Quantum Glitch"
- **Duration**: 300ms
- **Character**: Dissonant FM synthesis with stutter
- **Elements**:
  - Carrier: 400Hz
  - Modulator: 150Hz (high index)
  - Rhythm: 3 quick stutters (50ms each)
  - Noise burst: Pink noise at 20% mix
- **Feel**: Disruption, attention, but not alarming

### 4. Success/Transcription Complete - "Crystal Form"
- **Duration**: 400ms
- **Character**: Harmonic chime with crystalline texture
- **Elements**:
  - Fundamental: 523Hz (C5)
  - Harmonics: Perfect 5th and octave
  - Bell-like decay with subtle ring modulation
  - Reverb: Small room, 10% wet
- **Feel**: Achievement, clarity, satisfaction

### 5. Processing/Thinking - "Neural Pulse"
- **Duration**: Loopable
- **Character**: Subtle rhythmic pulse
- **Elements**:
  - Base: 110Hz sine with slight detune
  - Rhythm: 120 BPM eighth notes
  - Filter: Subtle LFO on resonance
  - Volume: -20dB (background level)
- **Feel**: Activity, processing, patience

## Implementation Approach

### Web Audio API Generation
```javascript
// Example: Start Recording Sound
const audioContext = new AudioContext();

function playStartSound() {
  const now = audioContext.currentTime;
  
  // Main sweep
  const sweep = audioContext.createOscillator();
  const sweepGain = audioContext.createGain();
  sweep.type = 'sine';
  sweep.frequency.setValueAtTime(440, now);
  sweep.frequency.exponentialRampToValueAtTime(880, now + 0.15);
  
  // Overtone
  const overtone = audioContext.createOscillator();
  const overtoneGain = audioContext.createGain();
  overtone.type = 'sine';
  overtone.frequency.value = 1760;
  overtoneGain.gain.setValueAtTime(0, now);
  overtoneGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
  
  // Envelope
  sweepGain.gain.setValueAtTime(0, now);
  sweepGain.gain.linearRampToValueAtTime(0.7, now + 0.005);
  sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  // Connect
  sweep.connect(sweepGain).connect(audioContext.destination);
  overtone.connect(overtoneGain).connect(audioContext.destination);
  
  // Play
  sweep.start(now);
  overtone.start(now);
  sweep.stop(now + 0.2);
  overtone.stop(now + 0.2);
}
```

## Alternative: Pre-rendered Files
If generating sounds in real-time isn't preferred, these can be created using:
- **Ableton Live** or **Logic Pro** for professional sound design
- **Sonic Pi** for code-based sound generation
- **Max/MSP** or **Pure Data** for visual programming
- **Web Audio API** + export to WAV/MP3

## File Specifications
- Format: WAV or high-quality MP3 (256kbps+)
- Sample Rate: 48kHz
- Bit Depth: 24-bit (WAV)
- Normalization: -6dB peak to prevent clipping
- No silence padding (trim precisely)