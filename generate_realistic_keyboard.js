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

// Generate realistic impact noise
function generateImpact(duration, intensity, freq) {
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Multiple layers of noise for realism
    let noise = 0;
    
    // Initial impact (very short)
    if (t < 0.0005) {
      noise += (Math.random() - 0.5) * intensity;
    }
    
    // Decaying white noise
    noise += (Math.random() - 0.5) * intensity * Math.exp(-t * 500);
    
    // Band-limited noise around impact frequency
    for (let j = 0; j < 3; j++) {
      const f = freq * (0.8 + j * 0.2 + Math.random() * 0.1);
      noise += Math.sin(2 * Math.PI * f * t + Math.random() * Math.PI) * 
               Math.exp(-t * (200 + j * 100)) * intensity * 0.3;
    }
    
    samples[i] = noise;
  }
  
  return samples;
}

// Generate plastic resonance
function generatePlasticResonance(duration, freq) {
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Multiple resonant frequencies (plastic has complex modes)
    const resonances = [freq, freq * 1.5, freq * 2.3, freq * 3.1];
    const decays = [30, 50, 80, 120];
    
    for (let j = 0; j < resonances.length; j++) {
      // Add slight detuning for realism
      const f = resonances[j] * (1 + (Math.random() - 0.5) * 0.02);
      signal += Math.sin(2 * Math.PI * f * t) * 
                Math.exp(-t * decays[j]) * (0.3 / (j + 1));
    }
    
    // Add some noise to the resonance
    signal += (Math.random() - 0.5) * 0.05 * Math.exp(-t * 100);
    
    return signal;
  }
  
  return samples;
}

// REALISTIC KEYBOARD SWITCHES

// 1. Linear Switch (Red) - More realistic
function generateRealisticLinear() {
  const duration = 0.045;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Key press components
  const pressImpact = generateImpact(0.015, 0.4, 1200);
  const plasticResonance = generatePlasticResonance(0.03, 800);
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Initial press (stem sliding)
    if (t < 0.008) {
      // Sliding friction noise
      signal += (Math.random() - 0.5) * 0.05 * (1 - t / 0.008);
    }
    
    // Impact at bottom (0.012s)
    if (t >= 0.012 && i - Math.floor(0.012 * SAMPLE_RATE) < pressImpact.length) {
      signal += pressImpact[i - Math.floor(0.012 * SAMPLE_RATE)] * 0.8;
    }
    
    // Plastic housing resonance
    if (t >= 0.012 && i - Math.floor(0.012 * SAMPLE_RATE) < plasticResonance.length) {
      signal += plasticResonance[i - Math.floor(0.012 * SAMPLE_RATE)] * 0.3;
    }
    
    // Spring vibration (subtle)
    if (t > 0.015 && t < 0.04) {
      signal += Math.sin(2 * Math.PI * 120 * t) * Math.exp(-(t - 0.015) * 40) * 0.05;
    }
    
    // Stabilizer rattle (random)
    if (Math.random() < 0.001 && t > 0.01 && t < 0.03) {
      signal += (Math.random() - 0.5) * 0.1;
    }
    
    samples[i] = signal * 0.7;
  }
  
  return samples;
}

// 2. Clicky Switch (Blue) - More realistic click jacket
function generateRealisticClicky() {
  const duration = 0.055;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  const clickImpact = generateImpact(0.01, 0.8, 3000);
  const plasticResonance = generatePlasticResonance(0.04, 1500);
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Pre-click tension (stem moving)
    if (t < 0.008) {
      signal += (Math.random() - 0.5) * 0.03 * (t / 0.008);
    }
    
    // Click event (0.008s) - plastic jacket hitting housing
    if (t >= 0.008 && i - Math.floor(0.008 * SAMPLE_RATE) < clickImpact.length) {
      signal += clickImpact[i - Math.floor(0.008 * SAMPLE_RATE)];
    }
    
    // Click jacket resonance
    if (t >= 0.008 && t < 0.02) {
      const clickT = t - 0.008;
      // Multiple plastic pieces vibrating
      signal += Math.sin(2 * Math.PI * 4500 * clickT) * Math.exp(-clickT * 200) * 0.3;
      signal += Math.sin(2 * Math.PI * 2800 * clickT) * Math.exp(-clickT * 150) * 0.2;
    }
    
    // Bottom out (0.025s)
    if (t >= 0.025 && t < 0.035) {
      const bottomT = t - 0.025;
      signal += (Math.random() - 0.5) * Math.exp(-bottomT * 300) * 0.3;
      signal += Math.sin(2 * Math.PI * 500 * bottomT) * Math.exp(-bottomT * 100) * 0.2;
    }
    
    // Housing resonance
    if (t >= 0.008 && i - Math.floor(0.008 * SAMPLE_RATE) < plasticResonance.length) {
      signal += plasticResonance[i - Math.floor(0.008 * SAMPLE_RATE)] * 0.2;
    }
    
    samples[i] = signal * 0.6;
  }
  
  return samples;
}

// 3. Tactile Switch (Brown) - More realistic bump
function generateRealisticTactile() {
  const duration = 0.05;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  const bumpImpact = generateImpact(0.008, 0.3, 1800);
  const bottomImpact = generateImpact(0.01, 0.5, 1000);
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Initial movement
    if (t < 0.006) {
      signal += (Math.random() - 0.5) * 0.02;
    }
    
    // Tactile bump (0.006s) - leaf spring
    if (t >= 0.006 && i - Math.floor(0.006 * SAMPLE_RATE) < bumpImpact.length) {
      signal += bumpImpact[i - Math.floor(0.006 * SAMPLE_RATE)] * 0.5;
    }
    
    // Leaf spring vibration after bump
    if (t >= 0.006 && t < 0.015) {
      const bumpT = t - 0.006;
      signal += Math.sin(2 * Math.PI * 1200 * bumpT) * Math.exp(-bumpT * 100) * 0.1;
    }
    
    // Bottom out (0.02s)
    if (t >= 0.02 && i - Math.floor(0.02 * SAMPLE_RATE) < bottomImpact.length) {
      signal += bottomImpact[i - Math.floor(0.02 * SAMPLE_RATE)] * 0.6;
    }
    
    // Case resonance (lower frequency)
    if (t > 0.02 && t < 0.045) {
      signal += Math.sin(2 * Math.PI * 400 * t) * Math.exp(-(t - 0.02) * 60) * 0.1;
    }
    
    samples[i] = signal * 0.65;
  }
  
  return samples;
}

// 4. Spacebar - Realistic with stabilizers
function generateRealisticSpacebar() {
  const duration = 0.065;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  const impact = generateImpact(0.02, 0.6, 600);
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Multiple stabilizer rattles
    if (t < 0.015) {
      // Left stabilizer
      if (t < 0.003) {
        signal += (Math.random() - 0.5) * 0.2 * (1 - t / 0.003);
      }
      // Right stabilizer (slightly delayed)
      if (t >= 0.002 && t < 0.005) {
        signal += (Math.random() - 0.5) * 0.2 * (1 - (t - 0.002) / 0.003);
      }
      
      // Wire rattle
      signal += Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 80) * 0.1;
    }
    
    // Main bottom out (deeper)
    if (t >= 0.018 && i - Math.floor(0.018 * SAMPLE_RATE) < impact.length) {
      signal += impact[i - Math.floor(0.018 * SAMPLE_RATE)];
    }
    
    // PCB flex resonance (spacebar specific)
    if (t > 0.018 && t < 0.05) {
      signal += Math.sin(2 * Math.PI * 80 * t) * Math.exp(-(t - 0.018) * 30) * 0.15;
      signal += Math.sin(2 * Math.PI * 150 * t) * Math.exp(-(t - 0.018) * 40) * 0.1;
    }
    
    samples[i] = signal * 0.7;
  }
  
  return samples;
}

// 5. Typing sequence - Mix of realistic keys
function generateRealisticTyping() {
  const duration = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Generate individual key sounds
  const linearKey = generateRealisticLinear();
  const clickyKey = generateRealisticClicky();
  const tactileKey = generateRealisticTactile();
  const spaceKey = generateRealisticSpacebar();
  
  // Typing pattern
  const keyPresses = [
    { time: 0.0, sound: tactileKey, volume: 0.8 },
    { time: 0.08, sound: linearKey, volume: 0.7 },
    { time: 0.14, sound: tactileKey, volume: 0.75 },
    { time: 0.22, sound: spaceKey, volume: 0.9 },
    { time: 0.32, sound: clickyKey, volume: 0.85 },
    { time: 0.39, sound: linearKey, volume: 0.7 },
    { time: 0.46, sound: tactileKey, volume: 0.8 },
  ];
  
  // Mix the key sounds
  for (const keyPress of keyPresses) {
    const startSample = Math.floor(keyPress.time * SAMPLE_RATE);
    
    for (let i = 0; i < keyPress.sound.length && startSample + i < samples.length; i++) {
      samples[startSample + i] += keyPress.sound[i] * keyPress.volume;
    }
  }
  
  // Add room ambience
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.005;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'realistic-keyboard');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'key_linear_realistic', generator: generateRealisticLinear },
  { name: 'key_clicky_realistic', generator: generateRealisticClicky },
  { name: 'key_tactile_realistic', generator: generateRealisticTactile },
  { name: 'key_spacebar_realistic', generator: generateRealisticSpacebar },
  { name: 'typing_realistic', generator: generateRealisticTyping }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Realistic mechanical keyboard sounds with proper impact noise',
  sounds: {}
};

console.log('Generating realistic keyboard sounds...\n');

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
const publicDir = path.join(__dirname, 'public', 'sounds', 'realistic-keyboard');
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

console.log('\n✅ Generated 5 realistic keyboard sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);