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

// Generate creamy thock sound
function generateCreamyThock(variant = 0) {
  const duration = 0.04;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Randomize slightly for natural variation
  const freqVariation = 1 + (Math.random() - 0.5) * 0.05;
  const ampVariation = 0.9 + Math.random() * 0.2;
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Initial impact (very short, dampened)
    if (t < 0.0008) {
      const impactT = t / 0.0008;
      // Soft impact, not harsh
      signal += (Math.random() - 0.5) * (1 - impactT) * 0.3;
      
      // Quick mid-frequency content
      signal += Math.sin(2 * Math.PI * 1900 * freqVariation * t) * 
                (1 - impactT) * 0.2;
    }
    
    // Deep thock frequencies (88-110 Hz)
    const deepFreq1 = 88 * freqVariation;
    const deepFreq2 = 110 * freqVariation;
    
    // Deep resonance with quick decay
    signal += Math.sin(2 * Math.PI * deepFreq1 * t) * 
              Math.exp(-t * 120) * 0.4 * ampVariation;
    signal += Math.sin(2 * Math.PI * deepFreq2 * t) * 
              Math.exp(-t * 130) * 0.35 * ampVariation;
    
    // Creamy mid-high frequencies (1800-2200 Hz range)
    const midFreqs = [
      1808, 1896, 1962, 2007, 2095, 2183
    ];
    
    for (let j = 0; j < midFreqs.length; j++) {
      const freq = midFreqs[j] * freqVariation;
      const decay = 200 + j * 20; // Slightly different decay rates
      
      signal += Math.sin(2 * Math.PI * freq * t + Math.random() * 0.1) * 
                Math.exp(-t * decay) * (0.08 / (j + 1)) * ampVariation;
    }
    
    // Add subtle case resonance (dampened)
    signal += Math.sin(2 * Math.PI * 350 * freqVariation * t) * 
              Math.exp(-t * 80) * 0.1;
    
    // Very subtle noise for texture
    signal += (Math.random() - 0.5) * Math.exp(-t * 300) * 0.02;
    
    // Overall dampening envelope (quick decay for that "thock" sound)
    const overallEnv = Math.exp(-t * 100);
    signal *= overallEnv;
    
    samples[i] = signal * 0.6;
  }
  
  return samples;
}

// Generate creamy linear switch
function generateCreamyLinear() {
  const duration = 0.045;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Smooth slide (almost silent)
    if (t < 0.008) {
      signal += (Math.random() - 0.5) * 0.01 * (1 - t / 0.008);
    }
    
    // Bottom out - creamy thock
    if (t >= 0.01) {
      const thockT = t - 0.01;
      const thockSamples = generateCreamyThock();
      
      if (thockT * SAMPLE_RATE < thockSamples.length) {
        signal += thockSamples[Math.floor(thockT * SAMPLE_RATE)] * 0.9;
      }
    }
    
    samples[i] = signal;
  }
  
  return samples;
}

// Generate creamy tactile switch
function generateCreamyTactile() {
  const duration = 0.048;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Subtle tactile bump (very dampened)
    if (t >= 0.006 && t < 0.01) {
      const bumpT = (t - 0.006) / 0.004;
      const bumpEnv = Math.sin(Math.PI * bumpT);
      
      // Soft bump sound
      signal += Math.sin(2 * Math.PI * 1200 * t) * bumpEnv * 0.05;
      signal += (Math.random() - 0.5) * bumpEnv * 0.02;
    }
    
    // Bottom out - creamy thock
    if (t >= 0.013) {
      const thockT = t - 0.013;
      const thockSamples = generateCreamyThock(1);
      
      if (thockT * SAMPLE_RATE < thockSamples.length) {
        signal += thockSamples[Math.floor(thockT * SAMPLE_RATE)];
      }
    }
    
    samples[i] = signal * 0.9;
  }
  
  return samples;
}

// Generate creamy spacebar
function generateCreamySpacebar() {
  const duration = 0.055;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Minimal stabilizer noise (well-tuned)
    if (t < 0.005) {
      signal += (Math.random() - 0.5) * 0.02 * (1 - t / 0.005);
    }
    
    // Deep spacebar thock
    if (t >= 0.008) {
      const thockT = t - 0.008;
      
      // Even deeper frequencies for spacebar
      const deepFreq = 65;
      signal += Math.sin(2 * Math.PI * deepFreq * thockT) * 
                Math.exp(-thockT * 100) * 0.5;
      signal += Math.sin(2 * Math.PI * deepFreq * 1.5 * thockT) * 
                Math.exp(-thockT * 110) * 0.3;
      
      // Creamy mid frequencies
      const midFreqs = [1600, 1850, 2100];
      for (let j = 0; j < midFreqs.length; j++) {
        signal += Math.sin(2 * Math.PI * midFreqs[j] * thockT) * 
                  Math.exp(-thockT * 180) * 0.1;
      }
    }
    
    samples[i] = signal * 0.7;
  }
  
  return samples;
}

// Generate creamy typing sequence
function generateCreamyTyping() {
  const duration = 0.8;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Typing pattern with natural rhythm
  const keyPresses = [
    { time: 0.00, type: 'tactile' },
    { time: 0.08, type: 'linear' },
    { time: 0.15, type: 'tactile' },
    { time: 0.21, type: 'linear' },
    { time: 0.30, type: 'spacebar' },
    { time: 0.42, type: 'tactile' },
    { time: 0.49, type: 'linear' },
    { time: 0.56, type: 'tactile' },
    { time: 0.64, type: 'linear' },
    { time: 0.71, type: 'tactile' },
  ];
  
  // Generate and mix keypresses
  for (const press of keyPresses) {
    const startSample = Math.floor(press.time * SAMPLE_RATE);
    let keySamples;
    
    switch (press.type) {
      case 'linear':
        keySamples = generateCreamyLinear();
        break;
      case 'tactile':
        keySamples = generateCreamyTactile();
        break;
      case 'spacebar':
        keySamples = generateCreamySpacebar();
        break;
    }
    
    // Mix into main buffer
    for (let i = 0; i < keySamples.length && startSample + i < samples.length; i++) {
      samples[startSample + i] += keySamples[i] * (0.8 + Math.random() * 0.2);
    }
  }
  
  // Add subtle room tone
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.002;
  }
  
  return samples;
}

// Generate single creamy keypress
function generateCreamyKeypress() {
  const duration = 0.04;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Generate a single perfect creamy thock
  const thock = generateCreamyThock();
  
  for (let i = 0; i < samples.length && i < thock.length; i++) {
    samples[i] = thock[i];
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'creamy-keys');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'creamy_keypress', generator: generateCreamyKeypress },
  { name: 'creamy_linear', generator: generateCreamyLinear },
  { name: 'creamy_tactile', generator: generateCreamyTactile },
  { name: 'creamy_spacebar', generator: generateCreamySpacebar },
  { name: 'creamy_typing', generator: generateCreamyTyping }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Creamy keyboard sounds - deep thock with smooth mid frequencies',
  sounds: {}
};

console.log('Generating creamy keyboard sounds...\n');

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
const publicDir = path.join(__dirname, 'public', 'sounds', 'creamy-keys');
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

console.log('\n✅ Generated 5 creamy keyboard sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);