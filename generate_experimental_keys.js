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

// Experimental sound generators
const experimentalSounds = {
  // Deep thock - inspired by reference but synthetic
  deepThock: () => {
    const duration = 0.05;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Very short initial transient
      if (t < 0.001) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 500) * 0.4;
      }
      
      // Deep fundamental around 100-150 Hz
      signal += Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 60) * 0.5;
      signal += Math.sin(2 * Math.PI * 95 * t) * Math.exp(-t * 50) * 0.3;
      
      // Body resonance around 400 Hz (like the tactile you liked)
      signal += Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 100) * 0.25;
      signal += Math.sin(2 * Math.PI * 420 * t) * Math.exp(-t * 110) * 0.2;
      
      // Subtle higher harmonics
      signal += Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 200) * 0.1;
      signal += Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 300) * 0.05;
      
      samples[i] = signal * 0.7;
    }
    
    return samples;
  },
  
  // Sharp clack - clean clicky sound
  sharpClack: () => {
    const duration = 0.045;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Sharp click at 3ms
      if (t >= 0.003 && t < 0.0045) {
        const clickT = (t - 0.003) / 0.0015;
        signal += (Math.random() - 0.5) * (1 - clickT) * 0.7;
        // Clean click around 1600 Hz
        signal += Math.sin(2 * Math.PI * 1600 * t) * (1 - clickT) * 0.5;
        signal += Math.sin(2 * Math.PI * 1400 * t) * (1 - clickT) * 0.3;
      }
      
      // Quick decay body
      if (t > 0.003) {
        signal += Math.sin(2 * Math.PI * 500 * t) * 
                  Math.exp(-(t - 0.003) * 150) * 0.2;
        signal += Math.sin(2 * Math.PI * 250 * t) * 
                  Math.exp(-(t - 0.003) * 100) * 0.15;
      }
      
      samples[i] = signal * 0.8;
    }
    
    return samples;
  },
  
  // Hybrid switch - between tactile and linear
  hybridSwitch: () => {
    const duration = 0.055;
    const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      let signal = 0;
      
      // Soft initial contact
      if (t < 0.001) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 200) * 0.2;
      }
      
      // Very subtle bump at 4ms
      if (t >= 0.004 && t < 0.006) {
        const bumpT = (t - 0.004) / 0.002;
        signal += Math.sin(2 * Math.PI * 600 * t) * 
                  Math.sin(Math.PI * bumpT) * 0.15;
      }
      
      // Main bottom-out at 8ms
      if (t >= 0.008) {
        const impactT = t - 0.008;
        
        // Impact transient
        if (impactT < 0.002) {
          signal += (Math.random() - 0.5) * Math.exp(-impactT * 300) * 0.3;
        }
        
        // Resonances
        signal += Math.sin(2 * Math.PI * 380 * impactT) * 
                  Math.exp(-impactT * 80) * 0.3;
        signal += Math.sin(2 * Math.PI * 180 * impactT) * 
                  Math.exp(-impactT * 60) * 0.25;
        signal += Math.sin(2 * Math.PI * 900 * impactT) * 
                  Math.exp(-impactT * 150) * 0.1;
      }
      
      samples[i] = signal * 0.7;
    }
    
    return samples;
  }
};

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'experimental');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'deep_thock', generator: experimentalSounds.deepThock },
  { name: 'sharp_clack', generator: experimentalSounds.sharpClack },
  { name: 'hybrid_switch', generator: experimentalSounds.hybridSwitch }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Experimental keyboard sounds for testing',
  sounds: {}
};

console.log('Generating experimental keyboard sounds...\n');

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
    category: 'experimental'
  };
});

// Write metadata
fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);

// Also copy to public directory for web access
const publicDir = path.join(__dirname, 'public', 'sounds', 'experimental');
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

console.log('\n✅ Generated 3 experimental keyboard sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);