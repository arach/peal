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

// Generate a single creamy keypress with proper space
function generateSingleCreamyKey() {
  // Much longer duration - let it breathe!
  const duration = 0.3; // 300ms total
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Silence at the beginning (50ms)
  const startSilence = 0.05;
  
  // Random variation for natural sound
  const freqVar = 0.95 + Math.random() * 0.1;
  const ampVar = 0.8 + Math.random() * 0.4;
  const timingVar = Math.random() * 0.01; // Slight timing variation
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Key press happens after initial silence
    if (t > startSilence + timingVar) {
      const localT = t - startSilence - timingVar;
      
      // Initial impact (1-2ms)
      if (localT < 0.002) {
        const impactT = localT / 0.002;
        // Mixed noise and tonal impact
        signal += (Math.random() - 0.5) * (1 - impactT * 0.5) * 0.4 * ampVar;
        signal += Math.sin(2 * Math.PI * 2000 * freqVar * localT) * 
                  (1 - impactT * 0.3) * 0.3 * ampVar;
      }
      
      // Deep thock frequencies with longer decay
      if (localT > 0) {
        // Primary low frequencies (thock)
        const f1 = 88 * freqVar;
        const f2 = 110 * freqVar;
        const f3 = 145 * freqVar;
        
        signal += Math.sin(2 * Math.PI * f1 * localT) * 
                  Math.exp(-localT * 35) * 0.5 * ampVar;
        signal += Math.sin(2 * Math.PI * f2 * localT) * 
                  Math.exp(-localT * 40) * 0.4 * ampVar;
        signal += Math.sin(2 * Math.PI * f3 * localT) * 
                  Math.exp(-localT * 50) * 0.3 * ampVar;
        
        // Mid frequencies (body)
        const midFreqs = [350, 680, 920];
        for (let j = 0; j < midFreqs.length; j++) {
          signal += Math.sin(2 * Math.PI * midFreqs[j] * freqVar * localT) * 
                    Math.exp(-localT * (70 + j * 20)) * 0.15 * ampVar;
        }
        
        // High frequencies (brightness) - more subtle
        const highFreqs = [1800, 2100, 2400];
        for (let j = 0; j < highFreqs.length; j++) {
          signal += Math.sin(2 * Math.PI * highFreqs[j] * freqVar * localT) * 
                    Math.exp(-localT * (150 + j * 30)) * 0.05 * ampVar;
        }
        
        // Case resonance (longer decay)
        if (localT < 0.15) {
          signal += Math.sin(2 * Math.PI * 450 * freqVar * localT) * 
                    Math.exp(-localT * 25) * 0.08;
        }
      }
      
      // Subtle noise decay
      if (localT > 0 && localT < 0.1) {
        signal += (Math.random() - 0.5) * Math.exp(-localT * 100) * 0.02;
      }
    }
    
    samples[i] = signal * 0.5;
  }
  
  return samples;
}

// Generate a two-key sequence with proper spacing
function generateTwoKeySequence() {
  const duration = 0.6; // 600ms total
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // First key at 50ms
  const key1Time = 0.05;
  const key1 = generateSingleCreamyKey();
  
  // Second key at 250ms (200ms gap - natural typing speed)
  const key2Time = 0.25;
  const key2 = generateSingleCreamyKey();
  
  // Mix the keys
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // First key
    if (t >= key1Time && (t - key1Time) * SAMPLE_RATE < key1.length) {
      const idx = Math.floor((t - key1Time) * SAMPLE_RATE);
      samples[i] += key1[idx];
    }
    
    // Second key
    if (t >= key2Time && (t - key2Time) * SAMPLE_RATE < key2.length) {
      const idx = Math.floor((t - key2Time) * SAMPLE_RATE);
      samples[i] += key2[idx];
    }
    
    // Very subtle room tone
    samples[i] += (Math.random() - 0.5) * 0.001;
  }
  
  return samples;
}

// Generate a word being typed (5-6 keys)
function generateWordTyping() {
  const duration = 1.5; // 1.5 seconds
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Natural typing rhythm with variation
  const keyTimes = [
    0.1,   // First key
    0.22,  // +120ms
    0.31,  // +90ms (faster)
    0.45,  // +140ms (slower)
    0.54,  // +90ms
    0.88   // +340ms (space after word)
  ];
  
  // Generate each keypress
  for (let k = 0; k < keyTimes.length; k++) {
    const keyTime = keyTimes[k] + (Math.random() - 0.5) * 0.02; // ±20ms variation
    const key = generateSingleCreamyKey();
    
    // Mix into main buffer
    for (let i = 0; i < key.length; i++) {
      const sampleIdx = Math.floor((keyTime * SAMPLE_RATE) + i);
      if (sampleIdx < samples.length) {
        samples[sampleIdx] += key[i] * (0.9 + Math.random() * 0.2);
      }
    }
  }
  
  // Room tone
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.0015;
  }
  
  return samples;
}

// Generate sentence typing (with spaces and varied rhythm)
function generateSentenceTyping() {
  const duration = 3.0; // 3 seconds
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Typing pattern: "Hello world" feel with natural pauses
  const keyPattern = [
    // "Hello"
    { time: 0.15, intensity: 1.0 },    // H
    { time: 0.26, intensity: 0.9 },    // e
    { time: 0.35, intensity: 0.85 },   // l
    { time: 0.42, intensity: 0.9 },    // l
    { time: 0.53, intensity: 0.95 },   // o
    
    // Space (longer gap)
    { time: 0.75, intensity: 1.1, isSpace: true },
    
    // "world"
    { time: 0.95, intensity: 1.0 },    // w
    { time: 1.08, intensity: 0.9 },    // o
    { time: 1.19, intensity: 0.85 },   // r
    { time: 1.26, intensity: 0.9 },    // l
    { time: 1.38, intensity: 0.95 },   // d
    
    // Period
    { time: 1.55, intensity: 1.05 },
    
    // Space and capital start
    { time: 1.78, intensity: 1.1, isSpace: true },
    { time: 2.05, intensity: 1.0 },    // New sentence
    { time: 2.18, intensity: 0.9 },
    { time: 2.29, intensity: 0.85 },
    
    // Natural pause
    { time: 2.65, intensity: 0.95 }
  ];
  
  // Generate each keypress
  for (const keyInfo of keyPattern) {
    // Add human timing variation
    const actualTime = keyInfo.time + (Math.random() - 0.5) * 0.025;
    
    // Generate appropriate key sound
    let key;
    if (keyInfo.isSpace) {
      // Spacebar - deeper sound
      key = generateSpacebarSound();
    } else {
      key = generateSingleCreamyKey();
    }
    
    // Mix into buffer with intensity variation
    for (let i = 0; i < key.length; i++) {
      const sampleIdx = Math.floor(actualTime * SAMPLE_RATE + i);
      if (sampleIdx < samples.length) {
        samples[sampleIdx] += key[i] * keyInfo.intensity * (0.9 + Math.random() * 0.2);
      }
    }
  }
  
  // Subtle room ambience
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.002;
  }
  
  return samples;
}

// Special spacebar sound (deeper, longer)
function generateSpacebarSound() {
  const duration = 0.35;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  const startSilence = 0.05;
  const freqVar = 0.95 + Math.random() * 0.1;
  const ampVar = 1.1 + Math.random() * 0.2; // Slightly louder
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    if (t > startSilence) {
      const localT = t - startSilence;
      
      // Deeper impact
      if (localT < 0.003) {
        const impactT = localT / 0.003;
        signal += (Math.random() - 0.5) * (1 - impactT * 0.3) * 0.5 * ampVar;
      }
      
      // Very deep frequencies for spacebar
      const deepFreqs = [65, 82, 98, 130];
      for (let j = 0; j < deepFreqs.length; j++) {
        signal += Math.sin(2 * Math.PI * deepFreqs[j] * freqVar * localT) * 
                  Math.exp(-localT * (25 + j * 5)) * (0.4 / (j + 1)) * ampVar;
      }
      
      // Some mid body
      signal += Math.sin(2 * Math.PI * 400 * freqVar * localT) * 
                Math.exp(-localT * 60) * 0.15 * ampVar;
      
      // Minimal high frequencies
      signal += Math.sin(2 * Math.PI * 1500 * freqVar * localT) * 
                Math.exp(-localT * 200) * 0.05 * ampVar;
    }
    
    samples[i] = signal * 0.5;
  }
  
  return samples;
}

// Generate continuous typing ambience (loopable)
function generateTypingAmbience() {
  const duration = 4.0; // 4 seconds for a good loop
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Multiple typing speeds and patterns
  const typingLayers = [
    // Main typer - steady rhythm
    {
      times: [0.1, 0.25, 0.38, 0.52, 0.64, 0.8, 1.05, 1.18, 1.31, 1.45, 
              1.62, 1.88, 2.05, 2.19, 2.32, 2.48, 2.71, 2.85, 2.98, 3.12,
              3.28, 3.45, 3.61, 3.78, 3.92],
      volumeRange: [0.7, 0.9]
    },
    // Secondary typer - different rhythm, quieter
    {
      times: [0.35, 0.48, 0.73, 0.91, 1.15, 1.28, 1.52, 1.74, 1.96,
              2.24, 2.41, 2.63, 2.88, 3.05, 3.31, 3.52, 3.84],
      volumeRange: [0.3, 0.5]
    }
  ];
  
  // Generate each layer
  for (const layer of typingLayers) {
    for (const baseTime of layer.times) {
      // Add human variation
      const time = baseTime + (Math.random() - 0.5) * 0.03;
      const volume = layer.volumeRange[0] + 
                    Math.random() * (layer.volumeRange[1] - layer.volumeRange[0]);
      
      // Occasionally add a space
      const isSpace = Math.random() < 0.15;
      const key = isSpace ? generateSpacebarSound() : generateSingleCreamyKey();
      
      // Mix into buffer
      for (let i = 0; i < key.length; i++) {
        const idx = Math.floor(time * SAMPLE_RATE + i);
        if (idx < samples.length) {
          samples[idx] += key[i] * volume;
        }
      }
    }
  }
  
  // Fade in/out for smooth looping
  const fadeLength = 0.1 * SAMPLE_RATE;
  for (let i = 0; i < fadeLength; i++) {
    const fade = i / fadeLength;
    samples[i] *= fade;
    samples[samples.length - 1 - i] *= fade;
  }
  
  // Room ambience
  for (let i = 0; i < samples.length; i++) {
    samples[i] += (Math.random() - 0.5) * 0.003;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'proper-keyboard');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'single_key', generator: generateSingleCreamyKey },
  { name: 'two_keys', generator: generateTwoKeySequence },
  { name: 'word_typing', generator: generateWordTyping },
  { name: 'sentence_typing', generator: generateSentenceTyping },
  { name: 'typing_ambience', generator: generateTypingAmbience }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Properly spaced keyboard sounds with breathing room',
  sounds: {}
};

console.log('Generating proper keyboard sounds with spacing...\n');

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
const publicDir = path.join(__dirname, 'public', 'sounds', 'proper-keyboard');
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

console.log('\n✅ Generated 5 proper keyboard sounds with breathing room!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);