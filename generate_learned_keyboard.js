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

// Based on analysis of keyboard_sounds.opus
// Key characteristics:
// - Very fast attack (< 10ms)
// - Strong low frequencies (11-100Hz)
// - Mid-frequency resonances (500-600Hz)
// - Broadband noise, not pure tones
// - Variable amplitude

function generateLearnedKeypress() {
  const duration = 0.05; // 50ms total
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Randomize characteristics for natural variation
  const variant = Math.random();
  const force = 0.7 + Math.random() * 0.3; // Typing force variation
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Phase 1: Initial click (0-5ms) - broadband transient
    if (t < 0.005) {
      const attackEnv = Math.exp(-t * 400); // Fast attack
      
      // Broadband noise burst
      signal += (Math.random() - 0.5) * attackEnv * force * 0.6;
      
      // Some high-frequency content for the "click"
      signal += Math.sin(2 * Math.PI * (2000 + variant * 500) * t) * 
                attackEnv * 0.2;
      signal += Math.sin(2 * Math.PI * (3500 + variant * 300) * t) * 
                attackEnv * 0.1;
    }
    
    // Phase 2: Body thump (5-50ms) - low frequencies
    if (t >= 0.005) {
      const bodyT = t - 0.005;
      const bodyEnv = Math.exp(-bodyT * 80);
      
      // Very low frequencies (11-100Hz) - the mechanical thump
      signal += Math.sin(2 * Math.PI * (30 + variant * 20) * t) * 
                bodyEnv * force * 0.3;
      signal += Math.sin(2 * Math.PI * (60 + variant * 15) * t) * 
                bodyEnv * force * 0.25;
      signal += Math.sin(2 * Math.PI * (90 + variant * 10) * t) * 
                bodyEnv * force * 0.2;
      
      // Mid frequencies (400-600Hz) - mechanism resonance
      signal += Math.sin(2 * Math.PI * (450 + variant * 50) * t) * 
                bodyEnv * force * 0.15;
      signal += Math.sin(2 * Math.PI * (550 + variant * 50) * t) * 
                bodyEnv * force * 0.1;
      
      // Some noise throughout for realism
      signal += (Math.random() - 0.5) * bodyEnv * 0.05;
    }
    
    // Phase 3: Decay tail - gradual fade
    if (t > 0.02) {
      const decayT = t - 0.02;
      const decayEnv = Math.exp(-decayT * 150);
      
      // Sustained mid frequencies
      signal += Math.sin(2 * Math.PI * 400 * t) * decayEnv * 0.05;
      signal += Math.sin(2 * Math.PI * 200 * t) * decayEnv * 0.08;
    }
    
    samples[i] = signal * 0.8;
  }
  
  return samples;
}

// Generate tactile switch based on learned characteristics
function generateLearnedTactile() {
  const duration = 0.055;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  const variant = Math.random();
  const force = 0.8 + Math.random() * 0.2;
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Initial press - softer than linear
    if (t < 0.003) {
      signal += (Math.random() - 0.5) * Math.exp(-t * 300) * force * 0.3;
    }
    
    // Tactile bump at 5ms
    if (t >= 0.005 && t < 0.008) {
      const bumpT = (t - 0.005) / 0.003;
      const bumpEnv = Math.sin(Math.PI * bumpT);
      
      // Bump click
      signal += (Math.random() - 0.5) * bumpEnv * 0.2;
      signal += Math.sin(2 * Math.PI * 700 * t) * bumpEnv * 0.15;
    }
    
    // Bottom out at 10ms
    if (t >= 0.01) {
      const bottomT = t - 0.01;
      
      // Strong low frequency impact
      signal += Math.sin(2 * Math.PI * (40 + variant * 15) * bottomT) * 
                Math.exp(-bottomT * 70) * force * 0.4;
      signal += Math.sin(2 * Math.PI * (80 + variant * 20) * bottomT) * 
                Math.exp(-bottomT * 80) * force * 0.3;
      
      // Mid resonance
      signal += Math.sin(2 * Math.PI * (500 + variant * 100) * bottomT) * 
                Math.exp(-bottomT * 120) * 0.2;
      
      // Impact noise
      if (bottomT < 0.005) {
        signal += (Math.random() - 0.5) * Math.exp(-bottomT * 200) * 0.3;
      }
    }
    
    samples[i] = signal * 0.75;
  }
  
  return samples;
}

// Generate clicky switch with learned characteristics
function generateLearnedClicky() {
  const duration = 0.06;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  const variant = Math.random();
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Click mechanism at 6ms
    if (t >= 0.006 && t < 0.009) {
      const clickT = (t - 0.006) / 0.003;
      
      // Sharp metallic click
      signal += (Math.random() - 0.5) * Math.exp(-clickT * 100) * 0.6;
      signal += Math.sin(2 * Math.PI * (1800 + variant * 200) * t) * 
                Math.exp(-clickT * 150) * 0.4;
      signal += Math.sin(2 * Math.PI * (2400 + variant * 300) * t) * 
                Math.exp(-clickT * 200) * 0.2;
    }
    
    // Bottom out at 12ms
    if (t >= 0.012) {
      const bottomT = t - 0.012;
      
      // Low impact
      signal += Math.sin(2 * Math.PI * (50 + variant * 10) * bottomT) * 
                Math.exp(-bottomT * 90) * 0.35;
      signal += Math.sin(2 * Math.PI * (100 + variant * 20) * bottomT) * 
                Math.exp(-bottomT * 100) * 0.25;
      
      // Body resonance
      signal += Math.sin(2 * Math.PI * (600 + variant * 100) * bottomT) * 
                Math.exp(-bottomT * 150) * 0.15;
    }
    
    samples[i] = signal * 0.8;
  }
  
  return samples;
}

// Generate spacebar with learned characteristics
function generateLearnedSpacebar() {
  const duration = 0.08;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Stabilizer rattle (multiple contact points)
    if (t < 0.006) {
      // Multiple small impacts
      signal += (Math.random() - 0.5) * Math.exp(-t * 100) * 0.2;
      if (t > 0.002) {
        signal += (Math.random() - 0.5) * Math.exp(-(t - 0.002) * 150) * 0.15;
      }
    }
    
    // Main impact at 10ms - deeper than regular keys
    if (t >= 0.01) {
      const impactT = t - 0.01;
      
      // Very deep frequencies
      signal += Math.sin(2 * Math.PI * 25 * impactT) * 
                Math.exp(-impactT * 60) * 0.5;
      signal += Math.sin(2 * Math.PI * 45 * impactT) * 
                Math.exp(-impactT * 70) * 0.4;
      signal += Math.sin(2 * Math.PI * 70 * impactT) * 
                Math.exp(-impactT * 80) * 0.3;
      
      // Some mid content
      signal += Math.sin(2 * Math.PI * 350 * impactT) * 
                Math.exp(-impactT * 120) * 0.1;
      
      // Impact noise
      if (impactT < 0.008) {
        signal += (Math.random() - 0.5) * Math.exp(-impactT * 100) * 0.25;
      }
    }
    
    samples[i] = signal * 0.7;
  }
  
  return samples;
}

// Generate realistic typing sequence
function generateLearnedTyping() {
  const duration = 2.0;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Natural typing pattern with variation
  const keystrokes = [
    { time: 0.05, type: 'tactile', force: 0.9 },
    { time: 0.16, type: 'tactile', force: 0.8 },
    { time: 0.27, type: 'linear', force: 0.85 },
    { time: 0.36, type: 'tactile', force: 0.75 },
    { time: 0.48, type: 'clicky', force: 0.95 },
    { time: 0.65, type: 'spacebar', force: 1.0 },
    { time: 0.82, type: 'tactile', force: 0.8 },
    { time: 0.93, type: 'linear', force: 0.85 },
    { time: 1.04, type: 'tactile', force: 0.9 },
    { time: 1.15, type: 'tactile', force: 0.75 },
    { time: 1.31, type: 'spacebar', force: 1.0 },
    { time: 1.48, type: 'clicky', force: 0.9 },
    { time: 1.59, type: 'linear', force: 0.8 },
    { time: 1.70, type: 'tactile', force: 0.85 },
    { time: 1.82, type: 'tactile', force: 0.8 }
  ];
  
  // Generate each keystroke
  for (const key of keystrokes) {
    // Add slight timing variation
    const actualTime = key.time + (Math.random() - 0.5) * 0.02;
    
    let keySound;
    switch (key.type) {
      case 'tactile':
        keySound = generateLearnedTactile();
        break;
      case 'clicky':
        keySound = generateLearnedClicky();
        break;
      case 'spacebar':
        keySound = generateLearnedSpacebar();
        break;
      default:
        keySound = generateLearnedKeypress();
    }
    
    // Apply force variation
    for (let i = 0; i < keySound.length; i++) {
      const idx = Math.floor(actualTime * SAMPLE_RATE + i);
      if (idx < samples.length) {
        samples[idx] += keySound[i] * key.force * 0.7;
      }
    }
  }
  
  // Add subtle room tone
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.001;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'learned-keyboard');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'learned_keypress', generator: generateLearnedKeypress },
  { name: 'learned_tactile', generator: generateLearnedTactile },
  { name: 'learned_clicky', generator: generateLearnedClicky },
  { name: 'learned_spacebar', generator: generateLearnedSpacebar },
  { name: 'learned_typing', generator: generateLearnedTyping }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Keyboard sounds based on analysis of real keyboard recordings',
  analysis: 'Based on 54.5 minute keyboard recording with characteristics: fast attack (<10ms), strong low frequencies (11-100Hz), mid resonances (500-600Hz)',
  sounds: {}
};

console.log('Generating keyboard sounds based on learned characteristics...\n');

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
const publicDir = path.join(__dirname, 'public', 'sounds', 'learned-keyboard');
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

console.log('\n✅ Generated 5 keyboard sounds based on learned characteristics!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);