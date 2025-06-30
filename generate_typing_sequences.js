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

// Learned keypress generators (from previous analysis)
function generateLearnedKeypress(force = 0.8, variant = Math.random()) {
  const duration = 0.05;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Initial click (0-5ms)
    if (t < 0.005) {
      const attackEnv = Math.exp(-t * 400);
      signal += (Math.random() - 0.5) * attackEnv * force * 0.6;
      signal += Math.sin(2 * Math.PI * (2000 + variant * 500) * t) * 
                attackEnv * 0.2;
      signal += Math.sin(2 * Math.PI * (3500 + variant * 300) * t) * 
                attackEnv * 0.1;
    }
    
    // Body thump (5-50ms)
    if (t >= 0.005) {
      const bodyT = t - 0.005;
      const bodyEnv = Math.exp(-bodyT * 80);
      
      signal += Math.sin(2 * Math.PI * (30 + variant * 20) * t) * 
                bodyEnv * force * 0.3;
      signal += Math.sin(2 * Math.PI * (60 + variant * 15) * t) * 
                bodyEnv * force * 0.25;
      signal += Math.sin(2 * Math.PI * (90 + variant * 10) * t) * 
                bodyEnv * force * 0.2;
      signal += Math.sin(2 * Math.PI * (450 + variant * 50) * t) * 
                bodyEnv * force * 0.15;
      signal += Math.sin(2 * Math.PI * (550 + variant * 50) * t) * 
                bodyEnv * force * 0.1;
      signal += (Math.random() - 0.5) * bodyEnv * 0.05;
    }
    
    // Decay tail
    if (t > 0.02) {
      const decayT = t - 0.02;
      const decayEnv = Math.exp(-decayT * 150);
      signal += Math.sin(2 * Math.PI * 400 * t) * decayEnv * 0.05;
      signal += Math.sin(2 * Math.PI * 200 * t) * decayEnv * 0.08;
    }
    
    samples[i] = signal * 0.8;
  }
  
  return samples;
}

function generateLearnedTactile(force = 0.85, variant = Math.random()) {
  const duration = 0.055;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    if (t < 0.003) {
      signal += (Math.random() - 0.5) * Math.exp(-t * 300) * force * 0.3;
    }
    
    if (t >= 0.005 && t < 0.008) {
      const bumpT = (t - 0.005) / 0.003;
      const bumpEnv = Math.sin(Math.PI * bumpT);
      signal += (Math.random() - 0.5) * bumpEnv * 0.2;
      signal += Math.sin(2 * Math.PI * 700 * t) * bumpEnv * 0.15;
    }
    
    if (t >= 0.01) {
      const bottomT = t - 0.01;
      signal += Math.sin(2 * Math.PI * (40 + variant * 15) * bottomT) * 
                Math.exp(-bottomT * 70) * force * 0.4;
      signal += Math.sin(2 * Math.PI * (80 + variant * 20) * bottomT) * 
                Math.exp(-bottomT * 80) * force * 0.3;
      signal += Math.sin(2 * Math.PI * (500 + variant * 100) * bottomT) * 
                Math.exp(-bottomT * 120) * 0.2;
      
      if (bottomT < 0.005) {
        signal += (Math.random() - 0.5) * Math.exp(-bottomT * 200) * 0.3;
      }
    }
    
    samples[i] = signal * 0.75;
  }
  
  return samples;
}

function generateLearnedClicky(force = 0.9, variant = Math.random()) {
  const duration = 0.06;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    if (t >= 0.006 && t < 0.009) {
      const clickT = (t - 0.006) / 0.003;
      signal += (Math.random() - 0.5) * Math.exp(-clickT * 100) * 0.6;
      signal += Math.sin(2 * Math.PI * (1800 + variant * 200) * t) * 
                Math.exp(-clickT * 150) * 0.4;
      signal += Math.sin(2 * Math.PI * (2400 + variant * 300) * t) * 
                Math.exp(-clickT * 200) * 0.2;
    }
    
    if (t >= 0.012) {
      const bottomT = t - 0.012;
      signal += Math.sin(2 * Math.PI * (50 + variant * 10) * bottomT) * 
                Math.exp(-bottomT * 90) * 0.35;
      signal += Math.sin(2 * Math.PI * (100 + variant * 20) * bottomT) * 
                Math.exp(-bottomT * 100) * 0.25;
      signal += Math.sin(2 * Math.PI * (600 + variant * 100) * bottomT) * 
                Math.exp(-bottomT * 150) * 0.15;
    }
    
    samples[i] = signal * force * 0.8;
  }
  
  return samples;
}

function generateLearnedSpacebar(force = 1.0) {
  const duration = 0.08;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    if (t < 0.006) {
      signal += (Math.random() - 0.5) * Math.exp(-t * 100) * 0.2;
      if (t > 0.002) {
        signal += (Math.random() - 0.5) * Math.exp(-(t - 0.002) * 150) * 0.15;
      }
    }
    
    if (t >= 0.01) {
      const impactT = t - 0.01;
      signal += Math.sin(2 * Math.PI * 25 * impactT) * 
                Math.exp(-impactT * 60) * 0.5;
      signal += Math.sin(2 * Math.PI * 45 * impactT) * 
                Math.exp(-impactT * 70) * 0.4;
      signal += Math.sin(2 * Math.PI * 70 * impactT) * 
                Math.exp(-impactT * 80) * 0.3;
      signal += Math.sin(2 * Math.PI * 350 * impactT) * 
                Math.exp(-impactT * 120) * 0.1;
      
      if (impactT < 0.008) {
        signal += (Math.random() - 0.5) * Math.exp(-impactT * 100) * 0.25;
      }
    }
    
    samples[i] = signal * force * 0.7;
  }
  
  return samples;
}

// Generate realistic typing patterns
function generateTypingPattern(duration) {
  const patterns = [];
  let currentTime = 0.1; // Start after 100ms
  
  while (currentTime < duration - 0.5) {
    // Simulate natural typing rhythm
    const wordLength = 3 + Math.floor(Math.random() * 5); // 3-7 characters
    
    for (let i = 0; i < wordLength; i++) {
      // Choose key type based on realistic distribution
      const keyChoice = Math.random();
      let keyType;
      if (keyChoice < 0.7) keyType = 'tactile'; // 70% regular keys
      else if (keyChoice < 0.85) keyType = 'linear'; // 15% linear
      else keyType = 'clicky'; // 15% clicky
      
      // Typing speed variation
      const baseInterval = 0.08 + Math.random() * 0.12; // 80-200ms between keys
      const speedVar = 1 + (Math.random() - 0.5) * 0.3; // ±15% speed variation
      
      patterns.push({
        time: currentTime,
        type: keyType,
        force: 0.7 + Math.random() * 0.3 // Variable typing force
      });
      
      currentTime += baseInterval * speedVar;
    }
    
    // Add space between words
    patterns.push({
      time: currentTime,
      type: 'spacebar',
      force: 0.95 + Math.random() * 0.05
    });
    
    // Pause between words (thinking time)
    currentTime += 0.15 + Math.random() * 0.25; // 150-400ms
  }
  
  return patterns;
}

// Generate 30-second learned typing sequence
function generate30SecondLearnedTyping() {
  const duration = 30;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Generate natural typing pattern
  const typingPattern = generateTypingPattern(duration);
  
  console.log(`Generated ${typingPattern.length} keystrokes for 30-second sequence`);
  
  // Render each keystroke
  for (const keystroke of typingPattern) {
    let keySound;
    
    switch (keystroke.type) {
      case 'tactile':
        keySound = generateLearnedTactile(keystroke.force);
        break;
      case 'linear':
        keySound = generateLearnedKeypress(keystroke.force);
        break;
      case 'clicky':
        keySound = generateLearnedClicky(keystroke.force);
        break;
      case 'spacebar':
        keySound = generateLearnedSpacebar(keystroke.force);
        break;
    }
    
    // Mix into main buffer
    for (let i = 0; i < keySound.length; i++) {
      const idx = Math.floor(keystroke.time * SAMPLE_RATE + i);
      if (idx < samples.length) {
        samples[idx] += keySound[i];
      }
    }
  }
  
  // Add subtle room ambience
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.0008;
    
    // Gentle limiting to prevent clipping
    samples[i] = Math.tanh(samples[i] * 0.9) * 0.8;
  }
  
  return samples;
}

// Load and vary sample sounds
function loadSampleSound(filepath) {
  const wavData = fs.readFileSync(filepath);
  
  // Skip WAV header (44 bytes) and convert to float32
  const pcmData = wavData.slice(44);
  const samples = new Float32Array(pcmData.length / 2);
  
  for (let i = 0; i < samples.length; i++) {
    const int16 = pcmData.readInt16LE(i * 2);
    samples[i] = int16 / 32768.0;
  }
  
  return samples;
}

// Apply variations to samples
function varySample(samples, pitchShift = 1.0, volumeVar = 1.0) {
  const outputLength = Math.floor(samples.length / pitchShift);
  const output = new Float32Array(outputLength);
  
  for (let i = 0; i < outputLength; i++) {
    // Simple linear interpolation for pitch shifting
    const sourceIndex = i * pitchShift;
    const index0 = Math.floor(sourceIndex);
    const index1 = Math.min(index0 + 1, samples.length - 1);
    const fraction = sourceIndex - index0;
    
    if (index0 < samples.length) {
      output[i] = samples[index0] * (1 - fraction) + samples[index1] * fraction;
      output[i] *= volumeVar;
    }
  }
  
  return output;
}

// Generate 30-second sample-based sequence
function generate30SecondSampleSequence() {
  const duration = 30;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Load reference samples
  const sampleFiles = [
    '/Users/arach/dev/peal/assets/sounds/typing-samples/single_key_1.wav',
    '/Users/arach/dev/peal/assets/sounds/typing-samples/single_key_2.wav',
    '/Users/arach/dev/peal/assets/sounds/typing-samples/single_key_3.wav'
  ];
  
  const loadedSamples = [];
  for (const file of sampleFiles) {
    try {
      const sampleData = loadSampleSound(file);
      loadedSamples.push(sampleData);
      console.log(`Loaded sample: ${path.basename(file)}`);
    } catch (e) {
      console.log(`Could not load ${file}, using synthetic fallback`);
    }
  }
  
  if (loadedSamples.length === 0) {
    console.log('No samples loaded, falling back to synthetic sounds');
    return generate30SecondLearnedTyping();
  }
  
  // Generate typing pattern
  const typingPattern = generateTypingPattern(duration);
  
  console.log(`Rendering ${typingPattern.length} sample-based keystrokes`);
  
  // Render each keystroke with variations
  for (const keystroke of typingPattern) {
    // Pick a random sample
    const sampleIndex = Math.floor(Math.random() * loadedSamples.length);
    const baseSample = loadedSamples[sampleIndex];
    
    // Apply variations
    const pitchShift = 0.95 + Math.random() * 0.1; // ±5% pitch variation
    const volumeVar = keystroke.force;
    
    const variedSample = varySample(baseSample, pitchShift, volumeVar);
    
    // Mix into main buffer
    for (let i = 0; i < variedSample.length; i++) {
      const idx = Math.floor(keystroke.time * SAMPLE_RATE + i);
      if (idx < samples.length) {
        samples[idx] += variedSample[i] * 0.7;
      }
    }
  }
  
  // Add room tone
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.001;
    samples[i] = Math.tanh(samples[i] * 0.9) * 0.8;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'typing-sequences');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate both sequences
const sequences = [
  { 
    name: 'learned_typing_30s', 
    generator: generate30SecondLearnedTyping,
    description: 'Pure code-generated typing based on learned characteristics'
  },
  { 
    name: 'sample_typing_30s', 
    generator: generate30SecondSampleSequence,
    description: 'Sample-based typing with pitch and volume variations'
  }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: '30-second typing sequences comparing learned synthesis vs sample manipulation',
  sequences: {}
};

console.log('Generating 30-second typing sequences...\n');

sequences.forEach(({ name, generator, description }) => {
  console.log(`\nGenerating ${name}...`);
  console.log(`Description: ${description}`);
  
  const startTime = Date.now();
  const samples = generator();
  const generationTime = Date.now() - startTime;
  
  const pcmData = floatTo16BitPCM(samples);
  const wavHeader = createWavHeader(pcmData.length);
  const wavData = Buffer.concat([wavHeader, pcmData]);
  
  const outputPath = path.join(outputDir, `${name}.wav`);
  fs.writeFileSync(outputPath, wavData);
  
  metadata.sequences[name] = {
    duration: samples.length / SAMPLE_RATE,
    description: description,
    generationTime: `${generationTime}ms`,
    fileSize: `${(wavData.length / 1024 / 1024).toFixed(2)}MB`
  };
  
  console.log(`✓ Generated in ${generationTime}ms`);
  console.log(`✓ Duration: ${(samples.length / SAMPLE_RATE).toFixed(1)}s`);
  console.log(`✓ File size: ${(wavData.length / 1024 / 1024).toFixed(2)}MB`);
});

// Write metadata
fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);

// Copy to public directory
const publicDir = path.join(__dirname, 'public', 'sounds', 'typing-sequences');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

sequences.forEach(({ name }) => {
  const sourcePath = path.join(outputDir, `${name}.wav`);
  const destPath = path.join(publicDir, `${name}.wav`);
  fs.copyFileSync(sourcePath, destPath);
});

fs.copyFileSync(
  path.join(outputDir, 'metadata.json'),
  path.join(publicDir, 'metadata.json')
);

console.log('\n✅ Generated 2 30-second typing sequences!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);
console.log('\nCompare:');
console.log('1. learned_typing_30s.wav - Pure code synthesis');
console.log('2. sample_typing_30s.wav - Sample manipulation');