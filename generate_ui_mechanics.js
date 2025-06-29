const fs = require('fs');
const path = require('path');

// Sample rate (Hz)
const SAMPLE_RATE = 44100;

// Helper to convert float32 samples to 16-bit PCM
function floatTo16BitPCM(samples) {
  const buffer = Buffer.allocUnsafe(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s < 0 ? s * 0x8000 : s * 0x7FFF), i * 2);
  }
  return buffer;
}

// Create WAV file header
function createWavHeader(dataLength) {
  const header = Buffer.allocUnsafe(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

// Envelope generator
function envelope(t, attack, decay, sustain, release, duration) {
  if (t < attack) {
    return t / attack;
  } else if (t < attack + decay) {
    return 1 - (1 - sustain) * ((t - attack) / decay);
  } else if (t < duration - release) {
    return sustain;
  } else {
    return sustain * (1 - (t - (duration - release)) / release);
  }
}

// LOADING SOUNDS

// 1. Spinning loader tick
function generateSpinnerTick() {
  const duration = 0.08;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Quick filtered click
    let signal = (Math.random() - 0.5) * 0.3;
    
    // High-pass filter simulation
    if (i > 0) {
      signal = signal - samples[i - 1] * 0.95;
    }
    
    // Pitch bend up
    const pitch = 800 + t * 1200;
    signal += Math.sin(2 * Math.PI * pitch * t) * 0.15;
    
    // Quick envelope
    const env = envelope(t, 0.001, 0.01, 0, 0.05, duration);
    samples[i] = signal * env * 0.4;
  }
  
  return samples;
}

// 2. Progress bar increment
function generateProgressTick() {
  const duration = 0.12;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Gentle sine wave
    const freq = 1200;
    let signal = Math.sin(2 * Math.PI * freq * t) * 0.3;
    
    // Add harmonic
    signal += Math.sin(2 * Math.PI * freq * 2 * t) * 0.1;
    
    // Soft envelope
    const env = envelope(t, 0.005, 0.02, 0.3, 0.08, duration);
    samples[i] = signal * env * 0.25;
  }
  
  return samples;
}

// 3. Loading dots pulse
function generateLoadingPulse() {
  const duration = 0.3;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Three tone sequence
    let freq;
    if (t < 0.1) freq = 600;
    else if (t < 0.2) freq = 800;
    else freq = 1000;
    
    let signal = Math.sin(2 * Math.PI * freq * t) * 0.2;
    
    // Pulse envelope for each dot
    let env = 0;
    if (t < 0.1) env = envelope(t, 0.01, 0.02, 0, 0.07, 0.1);
    else if (t >= 0.1 && t < 0.2) env = envelope(t - 0.1, 0.01, 0.02, 0, 0.07, 0.1);
    else if (t >= 0.2) env = envelope(t - 0.2, 0.01, 0.02, 0, 0.07, 0.1);
    
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 4. Buffer/loading whoosh
function generateLoadingWhoosh() {
  const duration = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Filtered noise
    let signal = (Math.random() - 0.5) * 0.3;
    
    // Resonant filter sweep
    const cutoff = 200 + t * 3000;
    const resonance = 3;
    
    // Simple resonant filter simulation
    if (i > 1) {
      const freq = cutoff / SAMPLE_RATE;
      const q = resonance;
      signal = signal + (samples[i - 1] - signal) * freq * 2 * Math.PI;
      signal = signal - samples[i - 2] * (1 - freq * q);
    }
    
    // Add tonal component
    signal += Math.sin(2 * Math.PI * cutoff * 0.5 * t) * 0.1;
    
    // Envelope
    const env = envelope(t, 0.05, 0.1, 0.2, 0.3, duration);
    samples[i] = signal * env * 0.25;
  }
  
  return samples;
}

// PROCESSING SOUNDS

// 5. CPU processing tick
function generateProcessingTick() {
  const duration = 0.15;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Digital beep with slight detune
    const freq = 880;
    let signal = Math.sin(2 * Math.PI * freq * t);
    signal += Math.sin(2 * Math.PI * (freq * 1.01) * t) * 0.5;
    
    // Square wave component
    signal += Math.sign(Math.sin(2 * Math.PI * freq * 0.5 * t)) * 0.1;
    
    // Gate effect
    if (t > 0.05 && t < 0.08) signal *= 0;
    
    // Envelope
    const env = envelope(t, 0.001, 0.01, 0.3, 0.1, duration);
    samples[i] = signal * env * 0.2;
  }
  
  return samples;
}

// 6. Data processing chirp
function generateDataChirp() {
  const duration = 0.2;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Exponential frequency sweep
    const startFreq = 400;
    const endFreq = 2000;
    const freq = startFreq * Math.pow(endFreq / startFreq, t / duration);
    
    let signal = Math.sin(2 * Math.PI * freq * t) * 0.3;
    
    // Add data-like pulses
    const pulseRate = 50;
    signal += Math.sin(2 * Math.PI * pulseRate * t) * 0.1 * Math.sin(2 * Math.PI * freq * t);
    
    // Envelope
    const env = envelope(t, 0.01, 0.03, 0.5, 0.15, duration);
    samples[i] = signal * env * 0.25;
  }
  
  return samples;
}

// 7. Quantum processing sound
function generateQuantumProcess() {
  const duration = 0.3;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Multiple detuned oscillators
    let signal = 0;
    const baseFreq = 523.25; // C5
    
    for (let j = 0; j < 5; j++) {
      const detune = 1 + (j - 2) * 0.01;
      signal += Math.sin(2 * Math.PI * baseFreq * detune * t) * 0.1;
    }
    
    // Ring modulation
    signal *= Math.sin(2 * Math.PI * 73 * t);
    
    // Granular effect
    const grainSize = 0.02;
    const grainEnv = Math.sin(Math.PI * ((t % grainSize) / grainSize));
    signal *= grainEnv;
    
    // Overall envelope
    const env = envelope(t, 0.02, 0.05, 0.3, 0.2, duration);
    samples[i] = signal * env * 0.2;
  }
  
  return samples;
}

// CLICK SOUNDS

// 8. Mechanical keyboard click
function generateMechClick() {
  const duration = 0.04;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Impact transient
    let signal = 0;
    if (t < 0.002) {
      signal = (Math.random() - 0.5) * Math.pow(1 - t / 0.002, 2);
    }
    
    // Resonant body
    signal += Math.sin(2 * Math.PI * 2500 * t) * Math.exp(-t * 50) * 0.3;
    signal += Math.sin(2 * Math.PI * 4000 * t) * Math.exp(-t * 80) * 0.2;
    
    // Click characteristic
    if (t < 0.001) {
      signal += Math.sign(Math.sin(2 * Math.PI * 1000 * t)) * 0.5;
    }
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// 9. Soft UI click
function generateSoftClick() {
  const duration = 0.06;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Filtered impulse
    let signal = 0;
    if (i === 0) signal = 0.5;
    
    // Low-pass filter
    if (i > 0) {
      const cutoff = 3000 / SAMPLE_RATE;
      signal = samples[i - 1] + (signal - samples[i - 1]) * cutoff * 2 * Math.PI;
    }
    
    // Tonal component
    signal += Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 100) * 0.2;
    
    // Envelope
    const env = Math.exp(-t * 120);
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 10. Glass tap click
function generateGlassClick() {
  const duration = 0.08;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // High frequency resonance
    let signal = Math.sin(2 * Math.PI * 3500 * t) * Math.exp(-t * 30);
    signal += Math.sin(2 * Math.PI * 5200 * t) * Math.exp(-t * 40) * 0.5;
    signal += Math.sin(2 * Math.PI * 7800 * t) * Math.exp(-t * 60) * 0.3;
    
    // Initial transient
    if (t < 0.001) {
      signal += (Math.random() - 0.5) * 0.3 * (1 - t / 0.001);
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// 11. Haptic feedback click
function generateHapticClick() {
  const duration = 0.03;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Low frequency pulse
    const freq = 80;
    let signal = Math.sin(2 * Math.PI * freq * t);
    
    // Quick attack, quick decay
    const env = t < 0.01 ? t / 0.01 : Math.exp(-(t - 0.01) * 200);
    
    // Add some texture
    signal += (Math.random() - 0.5) * 0.1 * env;
    
    samples[i] = signal * env * 0.4;
  }
  
  return samples;
}

// 12. Switch toggle click
function generateSwitchClick() {
  const duration = 0.05;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Two-part click (press and release)
    let signal = 0;
    
    // First click
    if (t < 0.02) {
      signal = Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 100);
      if (t < 0.001) signal += (Math.random() - 0.5) * 0.5;
    }
    
    // Second click (softer)
    if (t >= 0.025 && t < 0.045) {
      const t2 = t - 0.025;
      signal = Math.sin(2 * Math.PI * 1500 * t2) * Math.exp(-t2 * 150) * 0.5;
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// MORE LOADING VARIATIONS

// 13. Circular loading sweep
function generateCircularSweep() {
  const duration = 1.0;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Doppler-like effect
    const baseFreq = 440;
    const modDepth = 0.2;
    const modRate = 2;
    const freq = baseFreq * (1 + modDepth * Math.sin(2 * Math.PI * modRate * t));
    
    let signal = Math.sin(2 * Math.PI * freq * t) * 0.2;
    
    // Panning simulation with phase
    const pan = Math.sin(2 * Math.PI * modRate * t);
    signal *= 0.5 + 0.5 * pan;
    
    // Fade in and out
    const env = Math.sin(Math.PI * t / duration);
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 14. Network packet sound
function generatePacketSound() {
  const duration = 0.1;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Data burst
    const carrier = 2000;
    let signal = Math.sin(2 * Math.PI * carrier * t);
    
    // Digital modulation
    const dataRate = 100;
    const data = Math.sign(Math.sin(2 * Math.PI * dataRate * t));
    signal *= 0.5 + 0.5 * data;
    
    // Envelope with sharp attack
    const env = envelope(t, 0.001, 0.01, 0.5, 0.08, duration);
    samples[i] = signal * env * 0.25;
  }
  
  return samples;
}

// 15. AI thinking sound
function generateAIThinking() {
  const duration = 0.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Neural network-inspired sound
    let signal = 0;
    
    // Multiple neural "pulses"
    for (let n = 0; n < 5; n++) {
      const pulseTime = n * 0.08;
      if (t >= pulseTime && t < pulseTime + 0.06) {
        const localT = t - pulseTime;
        const freq = 600 + n * 200;
        signal += Math.sin(2 * Math.PI * freq * localT) * 
                  Math.exp(-localT * 20) * 0.2;
      }
    }
    
    // Background processing hum
    signal += Math.sin(2 * Math.PI * 150 * t) * 0.05;
    signal += Math.sin(2 * Math.PI * 225 * t) * 0.03;
    
    // Overall envelope
    const env = envelope(t, 0.05, 0.1, 0.3, 0.2, duration);
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'ui-mechanics');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'spinner_tick', generator: generateSpinnerTick },
  { name: 'progress_tick', generator: generateProgressTick },
  { name: 'loading_pulse', generator: generateLoadingPulse },
  { name: 'loading_whoosh', generator: generateLoadingWhoosh },
  { name: 'processing_tick', generator: generateProcessingTick },
  { name: 'data_chirp', generator: generateDataChirp },
  { name: 'quantum_process', generator: generateQuantumProcess },
  { name: 'mech_click', generator: generateMechClick },
  { name: 'soft_click', generator: generateSoftClick },
  { name: 'glass_click', generator: generateGlassClick },
  { name: 'haptic_click', generator: generateHapticClick },
  { name: 'switch_click', generator: generateSwitchClick },
  { name: 'circular_sweep', generator: generateCircularSweep },
  { name: 'packet_sound', generator: generatePacketSound },
  { name: 'ai_thinking', generator: generateAIThinking }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'UI mechanics sounds - loading, processing, and clicks',
  sounds: {}
};

console.log('Generating UI mechanics sounds...\n');

sounds.forEach(({ name, generator }) => {
  console.log(`Generating ${name}...`);
  
  const samples = generator();
  const pcmData = floatTo16BitPCM(samples);
  const wavHeader = createWavHeader(pcmData.length);
  const wavData = Buffer.concat([wavHeader, pcmData]);
  
  const outputPath = path.join(outputDir, `${name}.wav`);
  fs.writeFileSync(outputPath, wavData);
  
  metadata.sounds[name] = {
    duration: samples.length / SAMPLE_RATE,
    category: name.includes('click') ? 'click' : 
              name.includes('load') || name.includes('spinner') || name.includes('circular') ? 'loading' : 
              'processing'
  };
});

// Write metadata
fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);

// Also copy to public directory for web access
const publicDir = path.join(__dirname, 'public', 'sounds', 'ui-mechanics');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy all files to public
sounds.forEach(({ name }) => {
  const sourcePath = path.join(outputDir, `${name}.wav`);
  const destPath = path.join(publicDir, `${name}.wav`);
  fs.copyFileSync(sourcePath, destPath);
});

fs.copyFileSync(
  path.join(outputDir, 'metadata.json'),
  path.join(publicDir, 'metadata.json')
);

console.log('\n✅ Generated 15 UI mechanics sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);