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

// 1. IMPROVED BIOMETRIC SCAN - More serious and professional
function generateBiometricScanPro() {
  const duration = 0.8;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Professional scanning sweep (slower, more deliberate)
    const sweepStart = 600;
    const sweepEnd = 1200;
    const sweepProgress = Math.min(t / 0.5, 1);
    const sweepFreq = sweepStart + (sweepEnd - sweepStart) * sweepProgress;
    
    signal = Math.sin(2 * Math.PI * sweepFreq * t) * 0.15;
    
    // Add subtle harmonics for depth
    signal += Math.sin(2 * Math.PI * sweepFreq * 2 * t) * 0.05;
    
    // Scanning pulses (more regular, professional)
    const pulseRate = 8; // Hz
    const pulseWidth = 0.02;
    const pulsePhase = (t * pulseRate) % 1;
    
    if (pulsePhase < pulseWidth * pulseRate) {
      const pulseT = pulsePhase / (pulseWidth * pulseRate);
      signal += Math.sin(2 * Math.PI * 2400 * t) * 
                Math.exp(-pulseT * 10) * 0.3;
    }
    
    // Authentication beeps (3 quick beeps at end)
    if (t > 0.65) {
      const beepT = (t - 0.65) * 30;
      const beepIndex = Math.floor(beepT);
      if (beepIndex < 3 && beepT % 1 < 0.3) {
        signal += Math.sin(2 * Math.PI * (1000 + beepIndex * 200) * t) * 0.4;
      }
    }
    
    // Success confirmation tone
    if (t > 0.75) {
      signal += Math.sin(2 * Math.PI * 800 * t) * 
                Math.sin(2 * Math.PI * 1200 * t) * 0.2;
    }
    
    const env = envelope(t, 0.02, 0.05, 0.8, 0.1, duration);
    samples[i] = signal * env * 0.4;
  }
  
  return samples;
}

// 2. SECURE AUTHENTICATION - Replace Molecular Bond
function generateSecureAuth() {
  const duration = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Three-stage authentication sequence
    
    // Stage 1: Key insert (0-0.15s)
    if (t < 0.15) {
      // Mechanical click
      if (t < 0.02) {
        signal += (Math.random() - 0.5) * Math.exp(-t * 100) * 0.5;
        signal += Math.sin(2 * Math.PI * 3000 * t) * Math.exp(-t * 150) * 0.4;
      }
      // Low hum
      signal += Math.sin(2 * Math.PI * 100 * t) * 0.1;
    }
    
    // Stage 2: Processing (0.15-0.35s)
    else if (t < 0.35) {
      const procT = t - 0.15;
      // Rapid processing ticks
      const tickRate = 20;
      if (Math.floor(procT * tickRate) % 2 === 0) {
        signal += Math.sin(2 * Math.PI * 1500 * t) * 0.2;
      }
      // Rising tone
      const riseFreq = 400 + procT * 2000;
      signal += Math.sin(2 * Math.PI * riseFreq * t) * 0.15;
    }
    
    // Stage 3: Success (0.35-0.5s)
    else {
      const successT = t - 0.35;
      // Major chord arpeggio
      const notes = [523.25, 659.25, 783.99]; // C, E, G
      const noteIndex = Math.floor(successT * 30) % 3;
      if (noteIndex < 3) {
        signal += Math.sin(2 * Math.PI * notes[noteIndex] * t) * 
                  Math.exp(-successT * 5) * 0.5;
      }
    }
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// 3. DATA SYNC CASCADE - Replace Crystal Shatter
function generateDataSync() {
  const duration = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Multiple data streams syncing
    const streams = 5;
    
    for (let stream = 0; stream < streams; stream++) {
      const streamDelay = stream * 0.08;
      
      if (t >= streamDelay) {
        const localT = t - streamDelay;
        
        // Initial connection ping
        if (localT < 0.02) {
          const pingFreq = 1000 + stream * 200;
          signal += Math.sin(2 * Math.PI * pingFreq * localT) * 
                    Math.exp(-localT * 100) * 0.3;
        }
        
        // Data transfer whoosh
        if (localT > 0.02 && localT < 0.1) {
          const transferT = (localT - 0.02) / 0.08;
          const whooshFreq = 200 + transferT * 800;
          signal += Math.sin(2 * Math.PI * whooshFreq * localT) * 
                    (1 - transferT) * 0.2;
          
          // Add digital noise
          if (Math.random() < 0.3) {
            signal += (Math.random() - 0.5) * 0.05;
          }
        }
      }
    }
    
    // Sync complete tone
    if (t > 0.5) {
      const completeT = t - 0.5;
      signal += Math.sin(2 * Math.PI * 800 * t) * 
                Math.sin(2 * Math.PI * 1600 * t) * 
                Math.exp(-completeT * 10) * 0.4;
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// 4. MACHINE STARTUP - Replace Plasma Discharge
function generateMachineStartup() {
  const duration = 0.7;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Power button press
    if (t < 0.05) {
      // Deep click
      signal += Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 50) * 0.5;
      if (t < 0.002) {
        signal += (Math.random() - 0.5) * 0.4;
      }
    }
    
    // System initialization (0.05-0.4s)
    if (t > 0.05 && t < 0.4) {
      const initT = t - 0.05;
      
      // Rising turbine-like sound
      const turbineFreq = 100 + initT * 1000;
      signal += Math.sin(2 * Math.PI * turbineFreq * t) * (initT / 0.35) * 0.2;
      
      // Add harmonics
      signal += Math.sin(2 * Math.PI * turbineFreq * 2 * t) * (initT / 0.35) * 0.1;
      signal += Math.sin(2 * Math.PI * turbineFreq * 3 * t) * (initT / 0.35) * 0.05;
      
      // Mechanical rattles
      if (Math.random() < 0.1) {
        signal += (Math.random() - 0.5) * 0.1 * (1 - initT / 0.35);
      }
    }
    
    // Ready beep sequence (0.4-0.7s)
    if (t > 0.4) {
      const beepT = t - 0.4;
      
      // Three ascending beeps
      const beepTimes = [0, 0.1, 0.2];
      const beepFreqs = [600, 800, 1000];
      
      for (let b = 0; b < 3; b++) {
        if (beepT >= beepTimes[b] && beepT < beepTimes[b] + 0.05) {
          const localBeepT = beepT - beepTimes[b];
          signal += Math.sin(2 * Math.PI * beepFreqs[b] * t) * 
                    envelope(localBeepT, 0.005, 0.01, 0.5, 0.02, 0.05) * 0.4;
        }
      }
    }
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// 5. ACHIEVEMENT UNLOCK - Replace Gravity Wave
function generateAchievementUnlock() {
  const duration = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Build-up whoosh
    if (t < 0.2) {
      const buildFreq = 100 + t * 2000;
      signal = Math.sin(2 * Math.PI * buildFreq * t) * (t / 0.2) * 0.2;
      
      // Add shimmer
      signal += Math.sin(2 * Math.PI * buildFreq * 4 * t) * (t / 0.2) * 0.05;
    }
    
    // Impact moment (0.2s)
    if (t >= 0.2 && t < 0.25) {
      const impactT = t - 0.2;
      // Deep impact
      signal += Math.sin(2 * Math.PI * 60 * t) * Math.exp(-impactT * 30) * 0.5;
      // Bright flash
      signal += Math.sin(2 * Math.PI * 3000 * t) * Math.exp(-impactT * 50) * 0.3;
      // Transient
      if (impactT < 0.005) {
        signal += (Math.random() - 0.5) * 0.5;
      }
    }
    
    // Celebration notes (0.25-0.6s)
    if (t > 0.25) {
      const celebT = t - 0.25;
      
      // Major pentatonic arpeggio
      const notes = [523.25, 587.33, 659.25, 783.99, 1046.5]; // C D E G C
      const noteDuration = 0.07;
      const noteIndex = Math.floor(celebT / noteDuration);
      
      if (noteIndex < notes.length) {
        const noteT = celebT - noteIndex * noteDuration;
        const freq = notes[noteIndex];
        
        signal += Math.sin(2 * Math.PI * freq * t) * 
                  envelope(noteT, 0.005, 0.02, 0.4, 0.04, noteDuration) * 0.4;
        
        // Add sparkle harmonics
        signal += Math.sin(2 * Math.PI * freq * 2 * t) * 
                  envelope(noteT, 0.005, 0.02, 0.2, 0.04, noteDuration) * 0.1;
      }
      
      // Background shimmer
      signal += Math.sin(2 * Math.PI * 4000 * t) * 
                Math.sin(2 * Math.PI * 20 * t) * 
                Math.exp(-celebT * 2) * 0.1;
    }
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'refined-sounds');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'biometric_scan_pro', generator: generateBiometricScanPro },
  { name: 'secure_auth', generator: generateSecureAuth },
  { name: 'data_sync', generator: generateDataSync },
  { name: 'machine_startup', generator: generateMachineStartup },
  { name: 'achievement_unlock', generator: generateAchievementUnlock }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Refined experimental sounds - more practical and grounded',
  sounds: {}
};

console.log('Generating refined sounds...\n');

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
const publicDir = path.join(__dirname, 'public', 'sounds', 'refined-sounds');
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

console.log('\n✅ Generated 5 refined sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);