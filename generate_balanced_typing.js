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

// Different key types with balanced frequencies (not too high)
const keyTypes = {
  // Balanced tactile key - centered around 400-1200 Hz
  tactileKey: () => {
    const duration = 0.06; // Shorter, more responsive
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    const variant = Math.random();
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Initial impact (lower frequency)
      if (t < 0.002) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 200) * 0.5;
        // Lower frequency click
        signal += Math.sin(2 * Math.PI * (1200 + variant * 200) * t) * 
                  Math.exp(-t * 300) * 0.3;
      }
      
      // Tactile bump at 2ms
      if (t >= 0.002 && t < 0.006) {
        const bumpT = (t - 0.002) / 0.004;
        signal += Math.sin(2 * Math.PI * 800 * t) * 
                  Math.sin(Math.PI * bumpT) * 0.25;
      }
      
      // Body resonance - balanced frequencies
      if (t > 0.001) {
        // Main resonance around 400 Hz (like the tactile sound you like)
        signal += Math.sin(2 * Math.PI * (400 + variant * 50) * t) * 
                  Math.exp(-t * 70) * 0.3;
        
        // Secondary at 800 Hz
        signal += Math.sin(2 * Math.PI * (800 + variant * 100) * t) * 
                  Math.exp(-t * 90) * 0.2;
        
        // Subtle high frequency for clarity (not too high)
        signal += Math.sin(2 * Math.PI * (1200 + variant * 150) * t) * 
                  Math.exp(-t * 150) * 0.1;
        
        // Some low end for body
        signal += Math.sin(2 * Math.PI * (180 + variant * 20) * t) * 
                  Math.exp(-t * 50) * 0.2;
      }
      
      samples[i] = signal;
    }
    
    return samples;
  },
  
  // Linear key - smooth, balanced
  linearKey: () => {
    const duration = 0.055;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    const variant = Math.random();
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Soft initial contact
      if (t < 0.0015) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 150) * 0.3;
      }
      
      // Bottom out impact at 6ms
      if (t >= 0.006 && t < 0.009) {
        const impactT = (t - 0.006) / 0.003;
        signal += (Math.random() - 0.5) * (1 - impactT) * 0.25;
        signal += Math.sin(2 * Math.PI * 900 * t) * (1 - impactT) * 0.25;
      }
      
      // Balanced resonance
      if (t > 0.006) {
        // Main around 500 Hz
        signal += Math.sin(2 * Math.PI * (500 + variant * 60) * t) * 
                  Math.exp(-(t - 0.006) * 80) * 0.25;
        
        // Secondary at 1000 Hz
        signal += Math.sin(2 * Math.PI * (1000 + variant * 120) * t) * 
                  Math.exp(-(t - 0.006) * 100) * 0.15;
        
        // Low body
        signal += Math.sin(2 * Math.PI * (200 + variant * 25) * t) * 
                  Math.exp(-(t - 0.006) * 60) * 0.25;
      }
      
      samples[i] = signal;
    }
    
    return samples;
  },
  
  // Clicky key - crisp but not harsh
  clickyKey: () => {
    const duration = 0.07;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    const variant = Math.random();
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Click at 4ms
      if (t >= 0.004 && t < 0.006) {
        const clickT = (t - 0.004) / 0.002;
        // Balanced click frequencies
        signal += (Math.random() - 0.5) * Math.exp(-clickT * 100) * 0.6;
        signal += Math.sin(2 * Math.PI * (1600 + variant * 200) * t) * 
                  Math.exp(-clickT * 200) * 0.4;
        signal += Math.sin(2 * Math.PI * (1200 + variant * 150) * t) * 
                  Math.exp(-clickT * 150) * 0.3;
      }
      
      // Click jacket bounce
      if (t >= 0.006 && t < 0.01) {
        signal += Math.sin(2 * Math.PI * 1400 * t) * 
                  Math.exp(-(t - 0.006) * 300) * 0.15;
      }
      
      // Body resonance
      if (t > 0.004) {
        signal += Math.sin(2 * Math.PI * (600 + variant * 80) * t) * 
                  Math.exp(-(t - 0.004) * 90) * 0.2;
        signal += Math.sin(2 * Math.PI * (250 + variant * 30) * t) * 
                  Math.exp(-(t - 0.004) * 70) * 0.2;
      }
      
      samples[i] = signal;
    }
    
    return samples;
  },
  
  // Spacebar - deep and solid
  spacebarKey: () => {
    const duration = 0.08;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Stabilizer rattle
      if (t < 0.003) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 100) * 0.25;
        signal += Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 150) * 0.15;
      }
      
      // Deep thud at 8ms
      if (t >= 0.008 && t < 0.015) {
        const thudT = (t - 0.008) / 0.007;
        signal += Math.sin(2 * Math.PI * 100 * t) * (1 - thudT * 0.5) * 0.4;
        signal += Math.sin(2 * Math.PI * 200 * t) * (1 - thudT * 0.5) * 0.25;
        signal += (Math.random() - 0.5) * (1 - thudT) * 0.15;
      }
      
      // Subtle mid frequency
      if (t > 0.008) {
        signal += Math.sin(2 * Math.PI * 800 * t) * 
                  Math.exp(-(t - 0.008) * 150) * 0.08;
      }
      
      samples[i] = signal;
    }
    
    return samples;
  }
};

// Generate realistic typing sequence
function generateBalancedTyping() {
  const duration = 2.0;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Typing pattern with different key types
  const typingPattern = [
    { time: 0.05, type: 'tactileKey', volume: 0.9 },
    { time: 0.15, type: 'linearKey', volume: 0.8 },
    { time: 0.23, type: 'tactileKey', volume: 0.85 },
    { time: 0.30, type: 'clickyKey', volume: 0.9 },
    { time: 0.38, type: 'linearKey', volume: 0.8 },
    { time: 0.50, type: 'spacebarKey', volume: 1.0 },
    { time: 0.64, type: 'tactileKey', volume: 0.85 },
    { time: 0.74, type: 'clickyKey', volume: 0.85 },
    { time: 0.81, type: 'linearKey', volume: 0.8 },
    { time: 0.90, type: 'tactileKey', volume: 0.8 },
    { time: 0.98, type: 'linearKey', volume: 0.85 },
    { time: 1.12, type: 'spacebarKey', volume: 1.0 },
    { time: 1.26, type: 'clickyKey', volume: 0.9 },
    { time: 1.33, type: 'tactileKey', volume: 0.85 },
    { time: 1.41, type: 'linearKey', volume: 0.8 },
    { time: 1.49, type: 'tactileKey', volume: 0.9 },
    { time: 1.65, type: 'spacebarKey', volume: 1.0 },
    { time: 1.80, type: 'clickyKey', volume: 0.85 },
    { time: 1.88, type: 'linearKey', volume: 0.8 }
  ];
  
  // Generate each keypress
  for (const key of typingPattern) {
    // Add human timing variation
    const actualTime = key.time + (Math.random() - 0.5) * 0.015;
    const keySound = keyTypes[key.type]();
    const volumeVar = key.volume * (0.9 + Math.random() * 0.2);
    
    // Mix into buffer
    for (let i = 0; i < keySound.length; i++) {
      const idx = Math.floor(actualTime * SAMPLE_RATE + i);
      if (idx < samples.length) {
        samples[idx] += keySound[i] * volumeVar * 0.7;
      }
    }
  }
  
  // Add subtle room tone
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.001;
  }
  
  return samples;
}

// Generate single balanced key
function generateSingleBalancedKey() {
  const keyChoice = Math.random();
  let keyFunc;
  
  if (keyChoice < 0.4) keyFunc = keyTypes.tactileKey;
  else if (keyChoice < 0.7) keyFunc = keyTypes.linearKey;
  else keyFunc = keyTypes.clickyKey;
  
  return keyFunc();
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'balanced-typing');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'balanced_single_key', generator: generateSingleBalancedKey },
  { name: 'balanced_typing_mix', generator: generateBalancedTyping }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Balanced keyboard sounds with frequencies centered around 400-1200 Hz',
  sounds: {}
};

console.log('Generating balanced typing sounds...\n');

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
    category: 'keyboard'
  };
});

// Write metadata
fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);

// Also copy to public directory for web access
const publicDir = path.join(__dirname, 'public', 'sounds', 'balanced-typing');
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

console.log('\n✅ Generated 2 balanced typing sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);