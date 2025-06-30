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

// Different key types with distinct sounds
const keyTypes = {
  // Sharp, bright tactile key
  tactileKey: () => {
    const duration = 0.08;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    const variant = Math.random();
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Sharp initial click
      if (t < 0.003) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 200) * 0.6;
        // High frequency click
        signal += Math.sin(2 * Math.PI * (3000 + variant * 500) * t) * 
                  Math.exp(-t * 300) * 0.4;
      }
      
      // Tactile bump at 3ms
      if (t >= 0.003 && t < 0.008) {
        const bumpT = (t - 0.003) / 0.005;
        signal += Math.sin(2 * Math.PI * 2200 * t) * 
                  Math.sin(Math.PI * bumpT) * 0.3;
      }
      
      // Body resonance - brighter
      if (t > 0.002) {
        // Mid frequencies
        signal += Math.sin(2 * Math.PI * (800 + variant * 100) * t) * 
                  Math.exp(-t * 60) * 0.2;
        signal += Math.sin(2 * Math.PI * (1200 + variant * 150) * t) * 
                  Math.exp(-t * 80) * 0.15;
        
        // High frequencies for brightness
        signal += Math.sin(2 * Math.PI * (2500 + variant * 300) * t) * 
                  Math.exp(-t * 120) * 0.1;
        
        // Some low end
        signal += Math.sin(2 * Math.PI * (150 + variant * 30) * t) * 
                  Math.exp(-t * 40) * 0.25;
      }
      
      // Spring ping (subtle)
      if (t > 0.01 && t < 0.04) {
        signal += Math.sin(2 * Math.PI * 4500 * t) * 
                  Math.exp(-(t - 0.01) * 200) * 0.05;
      }
      
      samples[i] = signal;
    }
    
    return samples;
  },
  
  // Linear key - smoother but still bright
  linearKey: () => {
    const duration = 0.07;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    const variant = Math.random();
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Softer initial contact
      if (t < 0.002) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 150) * 0.4;
      }
      
      // Bottom out impact at 8ms
      if (t >= 0.008 && t < 0.012) {
        const impactT = (t - 0.008) / 0.004;
        signal += (Math.random() - 0.5) * (1 - impactT) * 0.3;
        signal += Math.sin(2 * Math.PI * 1800 * t) * (1 - impactT) * 0.3;
      }
      
      // Resonance
      if (t > 0.008) {
        signal += Math.sin(2 * Math.PI * (900 + variant * 100) * t) * 
                  Math.exp(-(t - 0.008) * 70) * 0.25;
        signal += Math.sin(2 * Math.PI * (2000 + variant * 200) * t) * 
                  Math.exp(-(t - 0.008) * 100) * 0.15;
        signal += Math.sin(2 * Math.PI * (180 + variant * 20) * t) * 
                  Math.exp(-(t - 0.008) * 50) * 0.3;
      }
      
      samples[i] = signal;
    }
    
    return samples;
  },
  
  // Clicky key - very bright and sharp
  clickyKey: () => {
    const duration = 0.09;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    const variant = Math.random();
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Sharp click at 5ms
      if (t >= 0.005 && t < 0.008) {
        const clickT = (t - 0.005) / 0.003;
        // Very bright click
        signal += (Math.random() - 0.5) * Math.exp(-clickT * 100) * 0.8;
        signal += Math.sin(2 * Math.PI * (4000 + variant * 500) * t) * 
                  Math.exp(-clickT * 200) * 0.6;
        signal += Math.sin(2 * Math.PI * (2800 + variant * 300) * t) * 
                  Math.exp(-clickT * 150) * 0.4;
      }
      
      // Click jacket bounce
      if (t >= 0.008 && t < 0.015) {
        signal += Math.sin(2 * Math.PI * 3500 * t) * 
                  Math.exp(-(t - 0.008) * 300) * 0.2;
      }
      
      // Body resonance
      if (t > 0.005) {
        signal += Math.sin(2 * Math.PI * (1000 + variant * 100) * t) * 
                  Math.exp(-(t - 0.005) * 80) * 0.2;
        signal += Math.sin(2 * Math.PI * (200 + variant * 30) * t) * 
                  Math.exp(-(t - 0.005) * 60) * 0.25;
      }
      
      samples[i] = signal;
    }
    
    return samples;
  },
  
  // Spacebar - deeper but still present
  spacebarKey: () => {
    const duration = 0.1;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Stabilizer rattle
      if (t < 0.004) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 100) * 0.3;
        signal += Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 150) * 0.2;
      }
      
      // Deep thud at 10ms
      if (t >= 0.01 && t < 0.02) {
        const thudT = (t - 0.01) / 0.01;
        signal += Math.sin(2 * Math.PI * 80 * t) * (1 - thudT * 0.5) * 0.5;
        signal += Math.sin(2 * Math.PI * 150 * t) * (1 - thudT * 0.5) * 0.3;
        signal += (Math.random() - 0.5) * (1 - thudT) * 0.2;
      }
      
      // Some brightness
      if (t > 0.01) {
        signal += Math.sin(2 * Math.PI * 1500 * t) * 
                  Math.exp(-(t - 0.01) * 150) * 0.1;
      }
      
      samples[i] = signal;
    }
    
    return samples;
  }
};

// Generate realistic typing sequence
function generateBrightTyping() {
  const duration = 2.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Typing pattern with different key types
  const typingPattern = [
    { time: 0.1, type: 'tactileKey', volume: 0.9 },
    { time: 0.22, type: 'linearKey', volume: 0.8 },
    { time: 0.31, type: 'tactileKey', volume: 0.85 },
    { time: 0.39, type: 'clickyKey', volume: 0.95 },
    { time: 0.48, type: 'linearKey', volume: 0.8 },
    { time: 0.62, type: 'spacebarKey', volume: 1.0 },
    { time: 0.78, type: 'tactileKey', volume: 0.9 },
    { time: 0.89, type: 'clickyKey', volume: 0.9 },
    { time: 0.97, type: 'linearKey', volume: 0.85 },
    { time: 1.08, type: 'tactileKey', volume: 0.8 },
    { time: 1.16, type: 'linearKey', volume: 0.85 },
    { time: 1.32, type: 'spacebarKey', volume: 1.0 },
    { time: 1.48, type: 'clickyKey', volume: 0.95 },
    { time: 1.56, type: 'tactileKey', volume: 0.85 },
    { time: 1.65, type: 'linearKey', volume: 0.8 },
    { time: 1.74, type: 'tactileKey', volume: 0.9 },
    { time: 1.91, type: 'spacebarKey', volume: 1.0 },
    { time: 2.08, type: 'clickyKey', volume: 0.9 },
    { time: 2.18, type: 'linearKey', volume: 0.85 },
    { time: 2.28, type: 'tactileKey', volume: 0.9 }
  ];
  
  // Generate each keypress
  for (const key of typingPattern) {
    // Add human timing variation
    const actualTime = key.time + (Math.random() - 0.5) * 0.02;
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
  
  // Add some room tone and keyboard case resonance
  for (let i = 0; i < samples.length; i++) {
    // Room tone
    samples[i] += (Math.random() - 0.5) * 0.002;
    
    // Subtle case resonance (continuous)
    const t = i / SAMPLE_RATE;
    samples[i] += Math.sin(2 * Math.PI * 120 * t) * 0.005;
  }
  
  return samples;
}

// Generate single bright key
function generateSingleBrightKey() {
  const keyChoice = Math.random();
  let keyFunc;
  
  if (keyChoice < 0.4) keyFunc = keyTypes.tactileKey;
  else if (keyChoice < 0.7) keyFunc = keyTypes.linearKey;
  else keyFunc = keyTypes.clickyKey;
  
  // Add silence padding
  const keySound = keyFunc();
  const duration = 0.3;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Place key sound after 50ms silence
  const startIdx = Math.floor(0.05 * SAMPLE_RATE);
  for (let i = 0; i < keySound.length && startIdx + i < samples.length; i++) {
    samples[startIdx + i] = keySound[i] * 0.7;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'bright-typing');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'bright_single_key', generator: generateSingleBrightKey },
  { name: 'bright_typing_mix', generator: generateBrightTyping }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Brighter keyboard sounds with more character and variety',
  sounds: {}
};

console.log('Generating bright typing sounds...\n');

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
const publicDir = path.join(__dirname, 'public', 'sounds', 'bright-typing');
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

console.log('\n✅ Generated 2 bright typing sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);