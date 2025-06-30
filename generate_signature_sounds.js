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

// NEURAL/BRAIN-INSPIRED SOUNDS

// 1. Synaptic Fire
function generateSynapticFire() {
  const duration = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Rapid neural firing pattern
    const firingRate = 15; // Hz
    const burstDuration = 0.03;
    
    // Multiple neural pathways
    for (let pathway = 0; pathway < 5; pathway++) {
      const pathwayDelay = pathway * 0.08;
      const pathwayFreq = 300 + pathway * 120 + Math.sin(pathway * 2) * 50;
      
      // Firing bursts
      for (let burst = 0; burst < 5; burst++) {
        const burstTime = pathwayDelay + burst / firingRate;
        if (t >= burstTime && t < burstTime + burstDuration) {
          const localT = t - burstTime;
          signal += Math.sin(2 * Math.PI * pathwayFreq * localT) * 
                    Math.exp(-localT * 50) * 0.2;
        }
      }
    }
    
    // Neural background activity
    signal += Math.sin(2 * Math.PI * 80 * t) * 0.03;
    signal += Math.sin(2 * Math.PI * 120 * t) * 0.02;
    
    const env = envelope(t, 0.01, 0.1, 0.3, 0.3, duration);
    samples[i] = signal * env * 0.35;
  }
  
  return samples;
}

// 2. Cortex Wave
function generateCortexWave() {
  const duration = 0.8;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Alpha wave base (8-12 Hz)
    signal += Math.sin(2 * Math.PI * 10 * t) * 0.2;
    
    // Beta wave overlay (12-30 Hz)
    signal += Math.sin(2 * Math.PI * 20 * t) * 0.1;
    
    // Gamma bursts (30-100 Hz)
    const gammaEnv = Math.sin(Math.PI * t / duration);
    signal += Math.sin(2 * Math.PI * 60 * t) * gammaEnv * 0.15;
    
    // Neural spike train
    const spikeRate = 40;
    if (Math.floor(t * spikeRate) !== Math.floor((t - 1/SAMPLE_RATE) * spikeRate)) {
      signal += (Math.random() - 0.5) * 0.5;
    }
    
    // Binaural-like beating
    signal *= 1 + 0.3 * Math.sin(2 * Math.PI * 4 * t);
    
    const env = envelope(t, 0.1, 0.2, 0.5, 0.3, duration);
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 3. Dendrite Cascade
function generateDendriteCascade() {
  const duration = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Cascading activation through dendrites
    const branches = 8;
    for (let branch = 0; branch < branches; branch++) {
      const delay = branch * 0.04;
      const freq = 600 + branch * 100;
      
      if (t >= delay) {
        const localT = t - delay;
        const branchSignal = Math.sin(2 * Math.PI * freq * localT) * 
                            Math.exp(-localT * 20);
        
        // Add synaptic noise
        const noise = (Math.random() - 0.5) * 0.1 * Math.exp(-localT * 30);
        
        signal += (branchSignal + noise) * (1 - branch * 0.1);
      }
    }
    
    // Membrane potential oscillation
    signal += Math.sin(2 * Math.PI * 150 * t) * 0.05;
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// HAPTIC/PHYSICAL FEEDBACK SOUNDS

// 4. Deep Haptic Pulse
function generateDeepHapticPulse() {
  const duration = 0.05;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Very low frequency for physical sensation
    const baseFreq = 50; // Sub-bass
    let signal = Math.sin(2 * Math.PI * baseFreq * t);
    
    // Add second harmonic for richness
    signal += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.3;
    
    // Quick attack, medium decay
    const env = t < 0.003 ? t / 0.003 : Math.exp(-(t - 0.003) * 100);
    
    // Add initial transient click
    if (t < 0.001) {
      signal += (Math.random() - 0.5) * 0.3 * (1 - t / 0.001);
    }
    
    samples[i] = signal * env * 0.5;
  }
  
  return samples;
}

// 5. Haptic Rumble
function generateHapticRumble() {
  const duration = 0.15;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Multiple low frequencies for complex rumble
    let signal = 0;
    signal += Math.sin(2 * Math.PI * 40 * t) * 0.3;
    signal += Math.sin(2 * Math.PI * 60 * t) * 0.2;
    signal += Math.sin(2 * Math.PI * 80 * t) * 0.15;
    
    // Amplitude modulation for texture
    signal *= 1 + 0.5 * Math.sin(2 * Math.PI * 15 * t);
    
    // Add some noise for realism
    signal += (Math.random() - 0.5) * 0.05;
    
    // Envelope with soft attack and decay
    const env = envelope(t, 0.01, 0.03, 0.6, 0.1, duration);
    
    samples[i] = signal * env * 0.4;
  }
  
  return samples;
}

// 6. Tactile Tap
function generateTactileTap() {
  const duration = 0.04;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Sharp low-frequency impact
    const impactFreq = 65;
    let signal = Math.sin(2 * Math.PI * impactFreq * t);
    
    // Add overtones for tactile quality
    signal += Math.sin(2 * Math.PI * impactFreq * 3 * t) * 0.2;
    signal += Math.sin(2 * Math.PI * impactFreq * 5 * t) * 0.1;
    
    // Sharp transient
    if (t < 0.002) {
      const transient = 1 - t / 0.002;
      signal += (Math.random() - 0.5) * transient * 0.8;
      signal += Math.sin(2 * Math.PI * 200 * t) * transient * 0.3;
    }
    
    // Quick decay
    const env = Math.exp(-t * 120);
    
    samples[i] = signal * env * 0.45;
  }
  
  return samples;
}

// 7. Vibration Pattern
function generateVibrationPattern() {
  const duration = 0.3;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Three vibration pulses
    const pulses = [0, 0.08, 0.16];
    const intensities = [1, 0.7, 0.5];
    
    for (let p = 0; p < pulses.length; p++) {
      const pulseStart = pulses[p];
      const pulseDuration = 0.06;
      
      if (t >= pulseStart && t < pulseStart + pulseDuration) {
        const localT = t - pulseStart;
        
        // Low frequency vibration
        signal += Math.sin(2 * Math.PI * 55 * localT) * intensities[p];
        signal += Math.sin(2 * Math.PI * 110 * localT) * intensities[p] * 0.3;
        
        // Pulse envelope
        const pulseEnv = envelope(localT, 0.005, 0.01, 0.7, 0.02, pulseDuration);
        signal *= pulseEnv;
      }
    }
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// CASCADE/SEQUENCE SOUNDS

// 8. Quantum Cascade
function generateQuantumCascade() {
  const duration = 0.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Cascading quantum states
    const states = 5;
    for (let state = 0; state < states; state++) {
      const stateTime = state * 0.06;
      const stateFreq = 800 + state * 300;
      
      if (t >= stateTime && t < stateTime + 0.08) {
        const localT = t - stateTime;
        
        // Multiple detuned oscillators for quantum uncertainty
        for (let osc = 0; osc < 3; osc++) {
          const detune = 1 + (Math.random() - 0.5) * 0.02;
          signal += Math.sin(2 * Math.PI * stateFreq * detune * localT) * 0.1;
        }
        
        // Collapse envelope
        const collapseEnv = Math.exp(-localT * 30) * (1 - state * 0.15);
        signal *= collapseEnv;
      }
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// 9. Domino Click Chain
function generateDominoChain() {
  const duration = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Accelerating domino falls
    const dominos = 7;
    let currentTime = 0;
    
    for (let d = 0; d < dominos; d++) {
      const spacing = 0.08 * Math.pow(0.85, d); // Accelerating
      currentTime += spacing;
      
      if (t >= currentTime && t < currentTime + 0.03) {
        const localT = t - currentTime;
        
        // Impact sound
        const freq = 2000 + d * 200;
        signal += Math.sin(2 * Math.PI * freq * localT) * Math.exp(-localT * 150);
        
        // Click transient
        if (localT < 0.001) {
          signal += (Math.random() - 0.5) * (1 - d * 0.1);
        }
        
        // Low thud
        signal += Math.sin(2 * Math.PI * 150 * localT) * Math.exp(-localT * 80) * 0.3;
      }
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// 10. Ripple Cascade
function generateRippleCascade() {
  const duration = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Water drop ripples
    const drops = 4;
    for (let drop = 0; drop < drops; drop++) {
      const dropTime = drop * 0.12;
      
      if (t >= dropTime) {
        const localT = t - dropTime;
        
        // Initial splash (higher frequency)
        const splashFreq = 2000 - drop * 300;
        if (localT < 0.02) {
          signal += Math.sin(2 * Math.PI * splashFreq * localT) * 
                    Math.exp(-localT * 100) * (1 - drop * 0.2);
        }
        
        // Ripple waves (lower frequency)
        const rippleFreq = 600 + drop * 100;
        const rippleDecay = Math.exp(-localT * 5);
        signal += Math.sin(2 * Math.PI * rippleFreq * localT) * 
                  rippleDecay * 0.2 * (1 - drop * 0.15);
      }
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// UNIQUE/EXPERIMENTAL SOUNDS

// 11. Biometric Scan
function generateBiometricScan() {
  const duration = 0.7;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Scanning sweep
    const sweepFreq = 500 + t * 2000;
    signal = Math.sin(2 * Math.PI * sweepFreq * t) * 0.2;
    
    // Data points (heartbeat-like pulses)
    const pulseRate = 1.2; // Hz (like heartbeat)
    const pulsePhase = (t * pulseRate) % 1;
    
    if (pulsePhase < 0.1) {
      const pulseT = pulsePhase / 0.1;
      signal += Math.sin(2 * Math.PI * 60 * pulseT) * 
                Math.exp(-pulseT * 5) * 0.5;
    }
    
    // Recognition beeps
    if (t > 0.5 && t < 0.6) {
      const beepT = (t - 0.5) * 10;
      if (Math.floor(beepT) % 2 === 0) {
        signal += Math.sin(2 * Math.PI * 1200 * t) * 0.3;
      }
    }
    
    // Success tone at end
    if (t > 0.6) {
      signal += Math.sin(2 * Math.PI * 800 * t) * 
                Math.sin(2 * Math.PI * 1200 * t) * 0.2;
    }
    
    const env = envelope(t, 0.02, 0.1, 0.7, 0.1, duration);
    samples[i] = signal * env * 0.35;
  }
  
  return samples;
}

// 12. Molecular Bond
function generateMolecularBond() {
  const duration = 0.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Two atoms coming together
    const atom1Freq = 600;
    const atom2Freq = 900;
    
    // Approaching phase (0-0.2s)
    if (t < 0.2) {
      const approach = t / 0.2;
      const freq1 = atom1Freq + (atom2Freq - atom1Freq) * approach * 0.3;
      const freq2 = atom2Freq - (atom2Freq - atom1Freq) * approach * 0.3;
      
      signal += Math.sin(2 * Math.PI * freq1 * t) * 0.3;
      signal += Math.sin(2 * Math.PI * freq2 * t) * 0.3;
    }
    
    // Bonding phase (0.2-0.4s)
    else {
      const bondT = t - 0.2;
      
      // Merged frequency with harmonics
      const bondFreq = (atom1Freq + atom2Freq) / 2;
      signal += Math.sin(2 * Math.PI * bondFreq * t) * 0.4;
      signal += Math.sin(2 * Math.PI * bondFreq * 2 * t) * 0.2;
      signal += Math.sin(2 * Math.PI * bondFreq * 3 * t) * 0.1;
      
      // Bonding energy release
      signal *= 1 + Math.exp(-bondT * 10) * 0.5;
    }
    
    const env = envelope(t, 0.01, 0.05, 0.7, 0.15, duration);
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 13. Gravity Wave
function generateGravityWave() {
  const duration = 0.8;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Warping spacetime - frequency modulation
    const carrierFreq = 200;
    const modFreq = 3;
    const modDepth = 0.5;
    
    const modulation = Math.sin(2 * Math.PI * modFreq * t) * modDepth;
    signal = Math.sin(2 * Math.PI * carrierFreq * (1 + modulation) * t);
    
    // Gravitational chirp (frequency increases)
    const chirpRate = 1.5;
    const chirpFreq = 100 * Math.pow(chirpRate, t);
    signal += Math.sin(2 * Math.PI * chirpFreq * t) * 0.3;
    
    // Deep space ambience
    signal += Math.sin(2 * Math.PI * 50 * t) * 0.1;
    signal += (Math.random() - 0.5) * 0.02;
    
    // Doppler effect
    const doppler = 1 + 0.2 * Math.sin(2 * Math.PI * 0.5 * t);
    signal *= doppler;
    
    const env = envelope(t, 0.1, 0.2, 0.5, 0.3, duration);
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 14. Crystal Shatter Cascade
function generateCrystalShatter() {
  const duration = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Initial crack
    if (t < 0.02) {
      signal += (Math.random() - 0.5) * Math.exp(-t * 50);
      signal += Math.sin(2 * Math.PI * 4000 * t) * Math.exp(-t * 100) * 0.5;
    }
    
    // Cascading shards
    const shards = 12;
    for (let shard = 0; shard < shards; shard++) {
      const shardTime = 0.02 + shard * 0.025 + Math.random() * 0.01;
      
      if (t >= shardTime && t < shardTime + 0.05) {
        const localT = t - shardTime;
        const shardFreq = 2000 + Math.random() * 3000;
        
        signal += Math.sin(2 * Math.PI * shardFreq * localT) * 
                  Math.exp(-localT * 80) * 0.2 * (1 - shard / shards);
      }
    }
    
    // Resonance
    signal += Math.sin(2 * Math.PI * 6000 * t) * Math.exp(-t * 10) * 0.1;
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// 15. Plasma Discharge
function generatePlasmaDischarge() {
  const duration = 0.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Building charge
    if (t < 0.15) {
      const chargeFreq = 100 + t * 3000;
      signal = Math.sin(2 * Math.PI * chargeFreq * t) * (t / 0.15) * 0.3;
      
      // Electrical crackle
      if (Math.random() < 0.1) {
        signal += (Math.random() - 0.5) * 0.2;
      }
    }
    
    // Discharge
    else {
      const dischargeT = t - 0.15;
      
      // Multiple frequency bands
      for (let band = 0; band < 5; band++) {
        const bandFreq = 500 + band * 600;
        signal += Math.sin(2 * Math.PI * bandFreq * dischargeT) * 
                  Math.exp(-dischargeT * (20 + band * 10)) * 0.2;
      }
      
      // White noise burst
      signal += (Math.random() - 0.5) * Math.exp(-dischargeT * 50) * 0.5;
    }
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'signature-sounds');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  // Neural sounds
  { name: 'synaptic_fire', generator: generateSynapticFire },
  { name: 'cortex_wave', generator: generateCortexWave },
  { name: 'dendrite_cascade', generator: generateDendriteCascade },
  
  // Haptic sounds
  { name: 'deep_haptic_pulse', generator: generateDeepHapticPulse },
  { name: 'haptic_rumble', generator: generateHapticRumble },
  { name: 'tactile_tap', generator: generateTactileTap },
  { name: 'vibration_pattern', generator: generateVibrationPattern },
  
  // Cascade sounds
  { name: 'quantum_cascade', generator: generateQuantumCascade },
  { name: 'domino_chain', generator: generateDominoChain },
  { name: 'ripple_cascade', generator: generateRippleCascade },
  
  // Unique sounds
  { name: 'biometric_scan', generator: generateBiometricScan },
  { name: 'molecular_bond', generator: generateMolecularBond },
  { name: 'gravity_wave', generator: generateGravityWave },
  { name: 'crystal_shatter', generator: generateCrystalShatter },
  { name: 'plasma_discharge', generator: generatePlasmaDischarge }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Signature sounds inspired by Neural Pulse, Triple Click Cascade, and Haptic Click',
  sounds: {}
};

console.log('Generating signature sounds...\n');

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
    category: name.includes('haptic') || name.includes('tactile') || name.includes('vibration') ? 'haptic' :
              name.includes('neural') || name.includes('synaptic') || name.includes('cortex') || name.includes('dendrite') ? 'neural' :
              name.includes('cascade') || name.includes('chain') || name.includes('ripple') ? 'cascade' :
              'experimental'
  };
});

// Write metadata
fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);

// Also copy to public directory for web access
const publicDir = path.join(__dirname, 'public', 'sounds', 'signature-sounds');
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

console.log('\n✅ Generated 15 signature sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);