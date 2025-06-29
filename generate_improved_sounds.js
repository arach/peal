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

// 1. DATA SYNC CASCADE V2 - More impactful and clear
function generateDataSyncV2() {
  const duration = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Three clear sync pulses with rising pitch
    const syncTimes = [0, 0.15, 0.3];
    const syncFreqs = [600, 900, 1200];
    
    for (let sync = 0; sync < 3; sync++) {
      const syncTime = syncTimes[sync];
      
      if (t >= syncTime && t < syncTime + 0.1) {
        const localT = t - syncTime;
        
        // Sharp digital pulse
        if (localT < 0.02) {
          const pulseT = localT / 0.02;
          
          // Clean sine burst
          signal += Math.sin(2 * Math.PI * syncFreqs[sync] * localT) * 
                    (1 - pulseT) * 0.4;
          
          // Add second harmonic for richness
          signal += Math.sin(2 * Math.PI * syncFreqs[sync] * 2 * localT) * 
                    (1 - pulseT) * 0.15;
          
          // Initial click
          if (localT < 0.001) {
            signal += Math.sin(2 * Math.PI * 2000 * localT) * 0.3;
          }
        }
        
        // Data stream effect (subtle)
        if (localT > 0.02 && localT < 0.08) {
          const streamT = (localT - 0.02) / 0.06;
          signal += Math.sin(2 * Math.PI * (1500 + streamT * 500) * localT) * 
                    (1 - streamT) * 0.1;
        }
      }
    }
    
    // Success confirmation (clean dual tone)
    if (t > 0.42) {
      const successT = t - 0.42;
      const env = envelope(successT, 0.01, 0.02, 0.3, 0.05, 0.08);
      
      // Perfect fifth interval
      signal += Math.sin(2 * Math.PI * 800 * t) * env * 0.3;
      signal += Math.sin(2 * Math.PI * 1200 * t) * env * 0.3;
    }
    
    samples[i] = signal * 0.5;
  }
  
  return samples;
}

// 2. SECURE AUTH SIMPLIFIED - Cleaner, more minimal
function generateSecureAuthSimple() {
  const duration = 0.35;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Single clean beep for scan
    if (t < 0.08) {
      const env = envelope(t, 0.01, 0.02, 0.5, 0.04, 0.08);
      signal += Math.sin(2 * Math.PI * 1000 * t) * env * 0.3;
    }
    
    // Brief processing sound (minimal)
    if (t > 0.12 && t < 0.22) {
      const procT = t - 0.12;
      // Subtle warble
      const mod = 1 + 0.1 * Math.sin(2 * Math.PI * 8 * procT);
      signal += Math.sin(2 * Math.PI * 600 * mod * t) * 0.15;
    }
    
    // Success: Two clean tones (major third)
    if (t > 0.26) {
      const successT = t - 0.26;
      const env = envelope(successT, 0.005, 0.02, 0.4, 0.06, 0.09);
      
      // C and E notes
      signal += Math.sin(2 * Math.PI * 523.25 * t) * env * 0.35;
      signal += Math.sin(2 * Math.PI * 659.25 * t) * env * 0.35;
    }
    
    samples[i] = signal * 0.5;
  }
  
  return samples;
}

// 3. ACHIEVEMENT UNLOCK CLEAN - Less busy, more focused
function generateAchievementClean() {
  const duration = 0.45;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Quick rising sweep (shorter, cleaner)
    if (t < 0.12) {
      const sweepFreq = 400 + t * 3000;
      signal = Math.sin(2 * Math.PI * sweepFreq * t) * (t / 0.12) * 0.2;
    }
    
    // Impact (cleaner, single hit)
    if (t >= 0.12 && t < 0.15) {
      const impactT = t - 0.12;
      
      // Deep thud
      signal += Math.sin(2 * Math.PI * 80 * t) * Math.exp(-impactT * 50) * 0.4;
      
      // Bright accent (no noise)
      signal += Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-impactT * 100) * 0.2;
    }
    
    // Celebration: Simple major chord arpeggio
    if (t > 0.18) {
      const celebT = t - 0.18;
      
      // Just three notes: C, E, G
      const notes = [523.25, 659.25, 783.99];
      const noteDuration = 0.08;
      const noteIndex = Math.floor(celebT / noteDuration);
      
      if (noteIndex < notes.length) {
        const noteT = celebT - noteIndex * noteDuration;
        const env = envelope(noteT, 0.01, 0.02, 0.3, 0.05, noteDuration);
        
        // Clean sine tone
        signal += Math.sin(2 * Math.PI * notes[noteIndex] * t) * env * 0.4;
        
        // Subtle second harmonic only
        signal += Math.sin(2 * Math.PI * notes[noteIndex] * 2 * t) * env * 0.1;
      }
    }
    
    samples[i] = signal * 0.45;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'improved-sounds');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'data_sync_v2', generator: generateDataSyncV2 },
  { name: 'secure_auth_simple', generator: generateSecureAuthSimple },
  { name: 'achievement_clean', generator: generateAchievementClean }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Improved versions based on user feedback',
  sounds: {}
};

console.log('Generating improved sounds...\n');

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
const publicDir = path.join(__dirname, 'public', 'sounds', 'improved-sounds');
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

console.log('\n✅ Generated 3 improved sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);