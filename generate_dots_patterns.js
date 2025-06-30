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

// THREE DOTS VARIATIONS

// 1. Classic Three Dots (ascending)
function generateThreeDotsAscending() {
  const duration = 0.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    // Three ascending tones
    let signal = 0;
    const spacing = 0.12;
    
    if (t < spacing) {
      // First dot - C5
      signal = Math.sin(2 * Math.PI * 523.25 * t);
    } else if (t >= spacing && t < spacing * 2) {
      // Second dot - E5
      signal = Math.sin(2 * Math.PI * 659.25 * (t - spacing));
    } else if (t >= spacing * 2 && t < spacing * 3) {
      // Third dot - G5
      signal = Math.sin(2 * Math.PI * 783.99 * (t - spacing * 2));
    }
    
    // Envelope for each dot
    let env = 0;
    if (t < spacing) {
      env = envelope(t, 0.005, 0.02, 0.3, 0.08, spacing);
    } else if (t >= spacing && t < spacing * 2) {
      env = envelope(t - spacing, 0.005, 0.02, 0.3, 0.08, spacing);
    } else if (t >= spacing * 2 && t < spacing * 3) {
      env = envelope(t - spacing * 2, 0.005, 0.02, 0.3, 0.08, spacing);
    }
    
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 2. Three Dots Descending
function generateThreeDotsDescending() {
  const duration = 0.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    const spacing = 0.12;
    
    if (t < spacing) {
      // First dot - G5
      signal = Math.sin(2 * Math.PI * 783.99 * t);
    } else if (t >= spacing && t < spacing * 2) {
      // Second dot - E5
      signal = Math.sin(2 * Math.PI * 659.25 * (t - spacing));
    } else if (t >= spacing * 2 && t < spacing * 3) {
      // Third dot - C5
      signal = Math.sin(2 * Math.PI * 523.25 * (t - spacing * 2));
    }
    
    let env = 0;
    if (t < spacing) {
      env = envelope(t, 0.005, 0.02, 0.3, 0.08, spacing);
    } else if (t >= spacing && t < spacing * 2) {
      env = envelope(t - spacing, 0.005, 0.02, 0.3, 0.08, spacing);
    } else if (t >= spacing * 2 && t < spacing * 3) {
      env = envelope(t - spacing * 2, 0.005, 0.02, 0.3, 0.08, spacing);
    }
    
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 3. Fast Three Dots
function generateFastThreeDots() {
  const duration = 0.2;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    const spacing = 0.06;
    
    if (t < spacing) {
      signal = Math.sin(2 * Math.PI * 800 * t);
    } else if (t >= spacing && t < spacing * 2) {
      signal = Math.sin(2 * Math.PI * 1000 * (t - spacing));
    } else if (t >= spacing * 2 && t < spacing * 3) {
      signal = Math.sin(2 * Math.PI * 1200 * (t - spacing * 2));
    }
    
    let env = 0;
    if (t < spacing) {
      env = envelope(t, 0.002, 0.01, 0.2, 0.04, spacing);
    } else if (t >= spacing && t < spacing * 2) {
      env = envelope(t - spacing, 0.002, 0.01, 0.2, 0.04, spacing);
    } else if (t >= spacing * 2 && t < spacing * 3) {
      env = envelope(t - spacing * 2, 0.002, 0.01, 0.2, 0.04, spacing);
    }
    
    samples[i] = signal * env * 0.35;
  }
  
  return samples;
}

// 4. Three Dots with Echo
function generateThreeDotsEcho() {
  const duration = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    const spacing = 0.12;
    const echoDelay = 0.06;
    const echoDecay = 0.4;
    
    // Main dots
    if (t < spacing) {
      signal = Math.sin(2 * Math.PI * 600 * t);
    } else if (t >= spacing && t < spacing * 2) {
      signal = Math.sin(2 * Math.PI * 800 * (t - spacing));
    } else if (t >= spacing * 2 && t < spacing * 3) {
      signal = Math.sin(2 * Math.PI * 1000 * (t - spacing * 2));
    }
    
    // Echo dots
    if (t >= echoDelay && t < spacing + echoDelay) {
      signal += Math.sin(2 * Math.PI * 600 * (t - echoDelay)) * echoDecay;
    } else if (t >= spacing + echoDelay && t < spacing * 2 + echoDelay) {
      signal += Math.sin(2 * Math.PI * 800 * (t - spacing - echoDelay)) * echoDecay;
    } else if (t >= spacing * 2 + echoDelay && t < spacing * 3 + echoDelay) {
      signal += Math.sin(2 * Math.PI * 1000 * (t - spacing * 2 - echoDelay)) * echoDecay;
    }
    
    // Envelopes
    let env = 0;
    if (t < spacing) {
      env = envelope(t, 0.005, 0.02, 0.3, 0.08, spacing);
    } else if (t >= spacing && t < spacing * 2) {
      env = envelope(t - spacing, 0.005, 0.02, 0.3, 0.08, spacing);
    } else if (t >= spacing * 2 && t < spacing * 3) {
      env = envelope(t - spacing * 2, 0.005, 0.02, 0.3, 0.08, spacing);
    }
    
    // Echo envelopes
    if (t >= echoDelay && t < spacing + echoDelay) {
      env += envelope(t - echoDelay, 0.005, 0.02, 0.3, 0.08, spacing) * echoDecay;
    } else if (t >= spacing + echoDelay && t < spacing * 2 + echoDelay) {
      env += envelope(t - spacing - echoDelay, 0.005, 0.02, 0.3, 0.08, spacing) * echoDecay;
    } else if (t >= spacing * 2 + echoDelay && t < spacing * 3 + echoDelay) {
      env += envelope(t - spacing * 2 - echoDelay, 0.005, 0.02, 0.3, 0.08, spacing) * echoDecay;
    }
    
    samples[i] = signal * env * 0.25;
  }
  
  return samples;
}

// 5. Five Dots Pattern
function generateFiveDots() {
  const duration = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    const spacing = 0.1;
    const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99]; // C, D, E, F, G
    
    for (let dot = 0; dot < 5; dot++) {
      const startTime = dot * spacing;
      if (t >= startTime && t < startTime + spacing) {
        signal = Math.sin(2 * Math.PI * frequencies[dot] * (t - startTime));
        const env = envelope(t - startTime, 0.005, 0.02, 0.2, 0.06, spacing);
        signal *= env;
        break;
      }
    }
    
    samples[i] = signal * 0.25;
  }
  
  return samples;
}

// MULTI-PART SEQUENCES

// 6. Double Click Pattern
function generateDoubleClick() {
  const duration = 0.12;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // First click
    if (t < 0.04) {
      signal = Math.sin(2 * Math.PI * 1500 * t) * Math.exp(-t * 100);
      if (t < 0.002) signal += (Math.random() - 0.5) * 0.8;
    }
    
    // Second click (slightly different pitch)
    if (t >= 0.06 && t < 0.1) {
      const t2 = t - 0.06;
      signal = Math.sin(2 * Math.PI * 1800 * t2) * Math.exp(-t2 * 120);
      if (t2 < 0.002) signal += (Math.random() - 0.5) * 0.6;
    }
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// 7. Triple Click Cascade
function generateTripleClick() {
  const duration = 0.18;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    const clickSpacing = 0.05;
    const frequencies = [2000, 2400, 2800];
    
    for (let click = 0; click < 3; click++) {
      const startTime = click * clickSpacing;
      if (t >= startTime && t < startTime + 0.03) {
        const localT = t - startTime;
        signal += Math.sin(2 * Math.PI * frequencies[click] * localT) * 
                  Math.exp(-localT * 150) * (1 - click * 0.2);
        if (localT < 0.001) signal += (Math.random() - 0.5) * (0.7 - click * 0.1);
      }
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// 8. Mechanical Sequence
function generateMechSequence() {
  const duration = 0.3;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Mechanical press
    if (t < 0.05) {
      signal = Math.sin(2 * Math.PI * 3000 * t) * Math.exp(-t * 80);
      signal += Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 40) * 0.3;
      if (t < 0.002) signal += (Math.random() - 0.5);
    }
    
    // Spring release
    if (t >= 0.08 && t < 0.15) {
      const t2 = t - 0.08;
      for (let f = 0; f < 5; f++) {
        signal += Math.sin(2 * Math.PI * (2000 + f * 300) * t2) * 
                  Math.exp(-t2 * 50) * 0.1;
      }
    }
    
    // Final click
    if (t >= 0.2 && t < 0.24) {
      const t3 = t - 0.2;
      signal += Math.sin(2 * Math.PI * 4000 * t3) * Math.exp(-t3 * 200) * 0.5;
    }
    
    samples[i] = signal * 0.3;
  }
  
  return samples;
}

// AI/PROCESSING PATTERNS

// 9. Neural Network Pulse
function generateNeuralPulse() {
  const duration = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Simulating neural firing patterns
    const neurons = 7;
    for (let n = 0; n < neurons; n++) {
      const fireTime = n * 0.06 + Math.sin(n * 2) * 0.01;
      if (t >= fireTime && t < fireTime + 0.04) {
        const localT = t - fireTime;
        const freq = 400 + n * 150 + Math.sin(n * 3) * 50;
        signal += Math.sin(2 * Math.PI * freq * localT) * 
                  Math.exp(-localT * 30) * 0.3;
      }
    }
    
    // Background hum
    signal += Math.sin(2 * Math.PI * 100 * t) * 0.05;
    signal += Math.sin(2 * Math.PI * 150 * t) * 0.03;
    
    const env = envelope(t, 0.02, 0.1, 0.4, 0.2, duration);
    samples[i] = signal * env * 0.35;
  }
  
  return samples;
}

// 10. Quantum Dots
function generateQuantumDots() {
  const duration = 0.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    const dotSpacing = 0.08;
    
    // Three quantum dots with uncertainty
    for (let dot = 0; dot < 3; dot++) {
      const baseTime = dot * dotSpacing;
      const uncertainty = (Math.random() - 0.5) * 0.01;
      const startTime = baseTime + uncertainty;
      
      if (t >= startTime && t < startTime + dotSpacing) {
        const localT = t - startTime;
        
        // Multiple detuned oscillators
        const baseFreq = 600 + dot * 200;
        for (let osc = 0; osc < 3; osc++) {
          const detune = 1 + (osc - 1) * 0.02;
          signal += Math.sin(2 * Math.PI * baseFreq * detune * localT) * 0.1;
        }
        
        // Ring modulation
        signal *= Math.sin(2 * Math.PI * 50 * localT);
        
        const env = envelope(localT, 0.01, 0.02, 0.3, 0.05, dotSpacing);
        signal *= env;
      }
    }
    
    samples[i] = signal * 0.3;
  }
  
  return samples;
}

// 11. Processing Steps
function generateProcessingSteps() {
  const duration = 0.6;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    const steps = 4;
    const stepDuration = 0.12;
    
    for (let step = 0; step < steps; step++) {
      const startTime = step * stepDuration;
      if (t >= startTime && t < startTime + stepDuration * 0.8) {
        const localT = t - startTime;
        
        // Rising frequency for each step
        const freq = 500 + step * 300 + localT * 500;
        signal = Math.sin(2 * Math.PI * freq * localT);
        
        // Add harmonics
        signal += Math.sin(2 * Math.PI * freq * 2 * localT) * 0.3;
        signal += Math.sin(2 * Math.PI * freq * 3 * localT) * 0.1;
        
        // Add digital artifacts
        if (Math.floor(localT * 1000) % 3 === 0) {
          signal *= 0.7;
        }
        
        const env = envelope(localT, 0.01, 0.02, 0.6, 0.04, stepDuration * 0.8);
        signal *= env * (0.5 + step * 0.1);
      }
    }
    
    samples[i] = signal * 0.25;
  }
  
  return samples;
}

// SPECIAL PATTERNS

// 12. Morse Code Dots
function generateMorseDots() {
  const duration = 0.5;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // S in morse code (3 dots)
    const dotDuration = 0.08;
    const dotSpacing = 0.12;
    
    for (let dot = 0; dot < 3; dot++) {
      const startTime = dot * dotSpacing;
      if (t >= startTime && t < startTime + dotDuration) {
        const localT = t - startTime;
        signal = Math.sin(2 * Math.PI * 700 * localT);
        const env = envelope(localT, 0.005, 0.01, 0.8, 0.02, dotDuration);
        signal *= env;
      }
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// 13. Typewriter Sequence
function generateTypewriterSeq() {
  const duration = 0.4;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Three typewriter keys
    const keyTimes = [0, 0.12, 0.24];
    const keyFreqs = [3500, 3000, 3800];
    
    for (let key = 0; key < 3; key++) {
      const startTime = keyTimes[key];
      if (t >= startTime && t < startTime + 0.04) {
        const localT = t - startTime;
        
        // Key strike
        if (localT < 0.005) {
          signal += (Math.random() - 0.5) * Math.exp(-localT * 200);
        }
        
        // Mechanical resonance
        signal += Math.sin(2 * Math.PI * keyFreqs[key] * localT) * 
                  Math.exp(-localT * 100) * 0.5;
        signal += Math.sin(2 * Math.PI * 800 * localT) * 
                  Math.exp(-localT * 80) * 0.2;
      }
    }
    
    samples[i] = signal * 0.4;
  }
  
  return samples;
}

// 14. Radar Sweep Dots
function generateRadarDots() {
  const duration = 0.8;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Sweep with dots
    const sweepRate = 2;
    const sweepPhase = (t * sweepRate) % 1;
    
    // Place dots at specific sweep positions
    const dotPositions = [0.1, 0.4, 0.7];
    
    for (let dot = 0; dot < dotPositions.length; dot++) {
      const distance = Math.abs(sweepPhase - dotPositions[dot]);
      if (distance < 0.05) {
        const intensity = 1 - distance / 0.05;
        const freq = 1000 + dot * 200;
        signal += Math.sin(2 * Math.PI * freq * t) * intensity;
      }
    }
    
    // Sweep carrier
    signal += Math.sin(2 * Math.PI * 200 * t) * 0.1 * sweepPhase;
    
    const env = envelope(t, 0.05, 0.1, 0.3, 0.2, duration);
    samples[i] = signal * env * 0.3;
  }
  
  return samples;
}

// 15. Communication Burst
function generateCommBurst() {
  const duration = 0.35;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Three burst pattern
    const burstTimes = [0, 0.1, 0.2];
    const burstLengths = [0.06, 0.04, 0.08];
    
    for (let burst = 0; burst < 3; burst++) {
      const startTime = burstTimes[burst];
      const length = burstLengths[burst];
      
      if (t >= startTime && t < startTime + length) {
        const localT = t - startTime;
        
        // Carrier with data modulation
        const carrier = 2000 + burst * 500;
        signal = Math.sin(2 * Math.PI * carrier * localT);
        
        // Digital modulation
        const dataRate = 100;
        const data = Math.sin(2 * Math.PI * dataRate * localT);
        signal *= 0.5 + 0.5 * Math.sign(data);
        
        // Burst envelope
        const env = envelope(localT, 0.001, 0.005, 0.8, 0.01, length);
        signal *= env;
      }
    }
    
    samples[i] = signal * 0.35;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'dots-patterns');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'three_dots_ascending', generator: generateThreeDotsAscending },
  { name: 'three_dots_descending', generator: generateThreeDotsDescending },
  { name: 'three_dots_fast', generator: generateFastThreeDots },
  { name: 'three_dots_echo', generator: generateThreeDotsEcho },
  { name: 'five_dots_melody', generator: generateFiveDots },
  { name: 'double_click', generator: generateDoubleClick },
  { name: 'triple_click_cascade', generator: generateTripleClick },
  { name: 'mech_sequence', generator: generateMechSequence },
  { name: 'neural_pulse', generator: generateNeuralPulse },
  { name: 'quantum_dots', generator: generateQuantumDots },
  { name: 'processing_steps', generator: generateProcessingSteps },
  { name: 'morse_dots', generator: generateMorseDots },
  { name: 'typewriter_seq', generator: generateTypewriterSeq },
  { name: 'radar_dots', generator: generateRadarDots },
  { name: 'comm_burst', generator: generateCommBurst }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Three dots patterns and multi-part sequential sounds',
  sounds: {}
};

console.log('Generating dots pattern sounds...\n');

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
    category: name.includes('dots') || name.includes('pulse') ? 'dots' : 
              name.includes('click') || name.includes('mech') || name.includes('type') ? 'multi-click' : 
              'sequence'
  };
});

// Write metadata
fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);

// Also copy to public directory for web access
const publicDir = path.join(__dirname, 'public', 'sounds', 'dots-patterns');
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

console.log('\n✅ Generated 15 dots pattern sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);