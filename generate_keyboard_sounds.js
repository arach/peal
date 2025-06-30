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

// MECHANICAL KEYBOARD SWITCHES

// 1. Linear Switch (Red) - Smooth, no tactile bump
function generateLinearSwitch() {
  const duration = 0.06;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Key down phase (0-0.02s)
    if (t < 0.02) {
      // Smooth press with plastic-on-plastic contact
      const pressT = t / 0.02;
      
      // Low frequency thud
      signal += Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 80) * 0.3;
      
      // Mid frequency plastic sound
      signal += Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 100) * 0.2;
      
      // Subtle high frequency
      signal += Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 200) * 0.1;
      
      // Initial contact noise
      if (t < 0.001) {
        signal += (Math.random() - 0.5) * 0.2 * (1 - t / 0.001);
      }
    }
    
    // Bottom out (0.02-0.03s)
    if (t >= 0.02 && t < 0.03) {
      const bottomT = t - 0.02;
      
      // Softer bottom-out sound
      signal += Math.sin(2 * Math.PI * 150 * bottomT) * Math.exp(-bottomT * 150) * 0.15;
      signal += Math.sin(2 * Math.PI * 600 * bottomT) * Math.exp(-bottomT * 200) * 0.1;
    }
    
    // Key release (0.04-0.06s) - optional, quieter
    if (t >= 0.04) {
      const releaseT = t - 0.04;
      
      // Quieter release
      signal += Math.sin(2 * Math.PI * 1000 * releaseT) * Math.exp(-releaseT * 300) * 0.05;
    }
    
    samples[i] = signal * 0.6;
  }
  
  return samples;
}

// 2. Clicky Switch (Blue) - Tactile bump with click
function generateClickySwitch() {
  const duration = 0.08;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Initial press (0-0.01s)
    if (t < 0.01) {
      // Soft start before click
      signal += Math.sin(2 * Math.PI * 500 * t) * Math.exp(-t * 50) * 0.1;
    }
    
    // Tactile click (0.01-0.025s)
    if (t >= 0.01 && t < 0.025) {
      const clickT = t - 0.01;
      
      // Sharp click sound
      if (clickT < 0.002) {
        // Click transient
        signal += (Math.random() - 0.5) * Math.exp(-clickT * 500) * 0.8;
        
        // High frequency click
        signal += Math.sin(2 * Math.PI * 4000 * clickT) * Math.exp(-clickT * 300) * 0.6;
      }
      
      // Click jacket sound (plastic hitting plastic)
      signal += Math.sin(2 * Math.PI * 3000 * clickT) * Math.exp(-clickT * 150) * 0.4;
      signal += Math.sin(2 * Math.PI * 1500 * clickT) * Math.exp(-clickT * 100) * 0.3;
      
      // Low frequency component
      signal += Math.sin(2 * Math.PI * 200 * clickT) * Math.exp(-clickT * 80) * 0.2;
    }
    
    // Bottom out (0.03-0.04s)
    if (t >= 0.03 && t < 0.04) {
      const bottomT = t - 0.03;
      
      // Duller bottom-out after click
      signal += Math.sin(2 * Math.PI * 100 * bottomT) * Math.exp(-bottomT * 200) * 0.2;
      signal += Math.sin(2 * Math.PI * 400 * bottomT) * Math.exp(-bottomT * 250) * 0.15;
    }
    
    // Release click (0.06-0.08s)
    if (t >= 0.06) {
      const releaseT = t - 0.06;
      
      // Quieter release click
      signal += Math.sin(2 * Math.PI * 2500 * releaseT) * Math.exp(-releaseT * 400) * 0.2;
      if (releaseT < 0.001) {
        signal += (Math.random() - 0.5) * 0.15;
      }
    }
    
    samples[i] = signal * 0.5;
  }
  
  return samples;
}

// 3. Tactile Switch (Brown) - Tactile bump, no click
function generateTactileSwitch() {
  const duration = 0.07;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Initial press with tactile bump (0-0.02s)
    if (t < 0.02) {
      const pressT = t / 0.02;
      
      // Tactile bump simulation (softer than clicky)
      if (t >= 0.008 && t < 0.012) {
        const bumpT = (t - 0.008) / 0.004;
        
        // Subtle bump sound
        signal += Math.sin(2 * Math.PI * 1200 * t) * (1 - Math.abs(bumpT - 0.5) * 2) * 0.2;
        signal += Math.sin(2 * Math.PI * 600 * t) * (1 - Math.abs(bumpT - 0.5) * 2) * 0.15;
      }
      
      // Overall press sound
      signal += Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 60) * 0.25;
      signal += Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t * 120) * 0.15;
      
      // Light contact noise
      if (t < 0.0008) {
        signal += (Math.random() - 0.5) * 0.15 * (1 - t / 0.0008);
      }
    }
    
    // Bottom out (0.025-0.035s)
    if (t >= 0.025 && t < 0.035) {
      const bottomT = t - 0.025;
      
      // Medium bottom-out
      signal += Math.sin(2 * Math.PI * 180 * bottomT) * Math.exp(-bottomT * 180) * 0.2;
      signal += Math.sin(2 * Math.PI * 700 * bottomT) * Math.exp(-bottomT * 220) * 0.12;
    }
    
    // Release (0.05-0.07s)
    if (t >= 0.05) {
      const releaseT = t - 0.05;
      
      // Soft release
      signal += Math.sin(2 * Math.PI * 1100 * releaseT) * Math.exp(-releaseT * 350) * 0.08;
    }
    
    samples[i] = signal * 0.55;
  }
  
  return samples;
}

// 4. Spacebar (Linear) - Deeper, longer sound
function generateSpacebar() {
  const duration = 0.08;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Spacebar press (deeper and more resonant)
    if (t < 0.03) {
      // Deep thud
      signal += Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 50) * 0.4;
      signal += Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 60) * 0.3;
      
      // Stabilizer rattle (spacebar specific)
      if (t < 0.005) {
        signal += Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 200) * 0.2;
        signal += (Math.random() - 0.5) * 0.1 * (1 - t / 0.005);
      }
      
      // Mid frequencies
      signal += Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 100) * 0.15;
    }
    
    // Bottom out (heavier)
    if (t >= 0.025 && t < 0.04) {
      const bottomT = t - 0.025;
      
      signal += Math.sin(2 * Math.PI * 100 * bottomT) * Math.exp(-bottomT * 120) * 0.25;
      signal += Math.sin(2 * Math.PI * 500 * bottomT) * Math.exp(-bottomT * 180) * 0.1;
    }
    
    samples[i] = signal * 0.6;
  }
  
  return samples;
}

// 5. Enter Key (Clicky) - Authoritative click
function generateEnterKey() {
  const duration = 0.09;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Firm press with pronounced click
    if (t < 0.02) {
      // Pre-click tension
      signal += Math.sin(2 * Math.PI * 400 * t) * (t / 0.02) * 0.1;
    }
    
    // Authoritative click (0.015-0.03s)
    if (t >= 0.015 && t < 0.03) {
      const clickT = t - 0.015;
      
      // Strong click
      if (clickT < 0.0025) {
        signal += (Math.random() - 0.5) * Math.exp(-clickT * 400) * 0.9;
        signal += Math.sin(2 * Math.PI * 3500 * clickT) * Math.exp(-clickT * 250) * 0.7;
      }
      
      // Resonant body
      signal += Math.sin(2 * Math.PI * 2200 * clickT) * Math.exp(-clickT * 120) * 0.5;
      signal += Math.sin(2 * Math.PI * 1000 * clickT) * Math.exp(-clickT * 80) * 0.4;
      signal += Math.sin(2 * Math.PI * 250 * clickT) * Math.exp(-clickT * 60) * 0.3;
    }
    
    // Firm bottom out
    if (t >= 0.035 && t < 0.05) {
      const bottomT = t - 0.035;
      
      signal += Math.sin(2 * Math.PI * 120 * bottomT) * Math.exp(-bottomT * 150) * 0.3;
      signal += Math.sin(2 * Math.PI * 550 * bottomT) * Math.exp(-bottomT * 200) * 0.2;
    }
    
    samples[i] = signal * 0.55;
  }
  
  return samples;
}

// 6. Backspace (Heavy Linear) - Deliberate press
function generateBackspace() {
  const duration = 0.07;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Deliberate, slightly aggressive press
    if (t < 0.025) {
      // Heavy initial impact
      signal += Math.sin(2 * Math.PI * 100 * t) * Math.exp(-t * 60) * 0.35;
      signal += Math.sin(2 * Math.PI * 250 * t) * Math.exp(-t * 80) * 0.25;
      
      // Sharp attack
      if (t < 0.0015) {
        signal += (Math.random() - 0.5) * 0.3 * (1 - t / 0.0015);
        signal += Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 300) * 0.3;
      }
      
      // Mid punch
      signal += Math.sin(2 * Math.PI * 700 * t) * Math.exp(-t * 100) * 0.2;
    }
    
    // Heavy bottom out
    if (t >= 0.02 && t < 0.035) {
      const bottomT = t - 0.02;
      
      signal += Math.sin(2 * Math.PI * 90 * bottomT) * Math.exp(-bottomT * 100) * 0.3;
      signal += Math.sin(2 * Math.PI * 450 * bottomT) * Math.exp(-bottomT * 150) * 0.15;
    }
    
    samples[i] = signal * 0.6;
  }
  
  return samples;
}

// 7. Letter Key (Quick Tactile) - Fast typing
function generateLetterKey() {
  const duration = 0.05;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Quick, light press
    if (t < 0.015) {
      // Light tactile feedback
      if (t >= 0.005 && t < 0.008) {
        const bumpT = (t - 0.005) / 0.003;
        signal += Math.sin(2 * Math.PI * 1500 * t) * (1 - Math.abs(bumpT - 0.5) * 2) * 0.15;
      }
      
      // Quick press
      signal += Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 100) * 0.2;
      signal += Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 150) * 0.12;
      
      // Minimal contact noise
      if (t < 0.0005) {
        signal += (Math.random() - 0.5) * 0.1;
      }
    }
    
    // Light bottom out
    if (t >= 0.015 && t < 0.025) {
      const bottomT = t - 0.015;
      
      signal += Math.sin(2 * Math.PI * 200 * bottomT) * Math.exp(-bottomT * 250) * 0.15;
    }
    
    samples[i] = signal * 0.5;
  }
  
  return samples;
}

// 8. Modifier Key (Clicky) - Shift/Ctrl/Alt
function generateModifierKey() {
  const duration = 0.075;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    
    let signal = 0;
    
    // Distinct modifier click
    if (t < 0.02) {
      // Build up
      signal += Math.sin(2 * Math.PI * 300 * t) * (t / 0.02) * 0.15;
    }
    
    // Sharp click (0.012-0.025s)
    if (t >= 0.012 && t < 0.025) {
      const clickT = t - 0.012;
      
      // Crisp click
      if (clickT < 0.002) {
        signal += (Math.random() - 0.5) * Math.exp(-clickT * 450) * 0.7;
        signal += Math.sin(2 * Math.PI * 3800 * clickT) * Math.exp(-clickT * 280) * 0.5;
      }
      
      // Click body
      signal += Math.sin(2 * Math.PI * 2500 * clickT) * Math.exp(-clickT * 130) * 0.4;
      signal += Math.sin(2 * Math.PI * 800 * clickT) * Math.exp(-clickT * 90) * 0.3;
    }
    
    // Hold sustain (modifiers are often held)
    if (t >= 0.03 && t < 0.05) {
      signal += Math.sin(2 * Math.PI * 150 * t) * 0.05;
    }
    
    samples[i] = signal * 0.5;
  }
  
  return samples;
}

// 9. Mechanical Typing Loop - Multiple keys in sequence
function generateTypingLoop() {
  const duration = 0.8;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  // Key press times and types
  const keyPresses = [
    { time: 0.0, type: 'letter' },
    { time: 0.08, type: 'letter' },
    { time: 0.14, type: 'letter' },
    { time: 0.22, type: 'space' },
    { time: 0.32, type: 'letter' },
    { time: 0.38, type: 'letter' },
    { time: 0.45, type: 'letter' },
    { time: 0.52, type: 'letter' },
    { time: 0.60, type: 'enter' },
  ];
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    for (const key of keyPresses) {
      if (t >= key.time && t < key.time + 0.06) {
        const localT = t - key.time;
        
        if (key.type === 'letter') {
          // Quick letter key
          if (localT < 0.012) {
            signal += Math.sin(2 * Math.PI * (1000 + Math.random() * 200) * localT) * 
                      Math.exp(-localT * 150) * 0.15;
            signal += Math.sin(2 * Math.PI * 200 * localT) * 
                      Math.exp(-localT * 100) * 0.1;
          }
        } else if (key.type === 'space') {
          // Deeper spacebar
          if (localT < 0.02) {
            signal += Math.sin(2 * Math.PI * 80 * localT) * 
                      Math.exp(-localT * 60) * 0.2;
            signal += Math.sin(2 * Math.PI * 600 * localT) * 
                      Math.exp(-localT * 100) * 0.1;
          }
        } else if (key.type === 'enter') {
          // Authoritative enter
          if (localT >= 0.01 && localT < 0.025) {
            const clickT = localT - 0.01;
            if (clickT < 0.002) {
              signal += (Math.random() - 0.5) * Math.exp(-clickT * 400) * 0.4;
            }
            signal += Math.sin(2 * Math.PI * 2200 * clickT) * 
                      Math.exp(-clickT * 120) * 0.25;
          }
        }
      }
    }
    
    samples[i] = signal * 0.6;
  }
  
  return samples;
}

// 10. Mechanical Keyboard Ambience
function generateKeyboardAmbience() {
  const duration = 1.0;
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * duration));
  
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    let signal = 0;
    
    // Background typing rhythm
    const typingRate = 5; // keys per second
    const keyPhase = (t * typingRate) % 1;
    
    // Random key types
    const keyType = Math.floor(t * typingRate) % 4;
    
    if (keyPhase < 0.05) {
      const keyT = keyPhase;
      
      if (keyType === 0) {
        // Clicky
        if (keyT < 0.002) {
          signal += (Math.random() - 0.5) * 0.2;
          signal += Math.sin(2 * Math.PI * 3000 * keyT) * Math.exp(-keyT * 300) * 0.15;
        }
      } else if (keyType === 1) {
        // Linear
        signal += Math.sin(2 * Math.PI * 800 * keyT) * Math.exp(-keyT * 100) * 0.1;
      } else if (keyType === 2) {
        // Tactile
        signal += Math.sin(2 * Math.PI * 1200 * keyT) * Math.exp(-keyT * 120) * 0.12;
      } else {
        // Space
        signal += Math.sin(2 * Math.PI * 100 * keyT) * Math.exp(-keyT * 80) * 0.15;
      }
    }
    
    // Ambient room tone
    signal += (Math.random() - 0.5) * 0.01;
    
    // Fade in and out
    const fadeIn = Math.min(t * 2, 1);
    const fadeOut = Math.min((duration - t) * 2, 1);
    signal *= fadeIn * fadeOut;
    
    samples[i] = signal * 0.5;
  }
  
  return samples;
}

// Create output directory
const outputDir = path.join(__dirname, 'assets', 'sounds', 'keyboard-sounds');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate all sounds
const sounds = [
  { name: 'key_linear_red', generator: generateLinearSwitch },
  { name: 'key_clicky_blue', generator: generateClickySwitch },
  { name: 'key_tactile_brown', generator: generateTactileSwitch },
  { name: 'key_spacebar', generator: generateSpacebar },
  { name: 'key_enter', generator: generateEnterKey },
  { name: 'key_backspace', generator: generateBackspace },
  { name: 'key_letter', generator: generateLetterKey },
  { name: 'key_modifier', generator: generateModifierKey },
  { name: 'typing_loop', generator: generateTypingLoop },
  { name: 'keyboard_ambience', generator: generateKeyboardAmbience }
];

// Generate metadata
const metadata = {
  generated: new Date().toISOString(),
  description: 'Synthetic mechanical keyboard sounds - various switch types',
  sounds: {}
};

console.log('Generating keyboard sounds...\n');

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
    category: name.includes('loop') || name.includes('ambience') ? 'sequence' : 'keypress'
  };
});

// Write metadata
fs.writeFileSync(
  path.join(outputDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);

// Also copy to public directory for web access
const publicDir = path.join(__dirname, 'public', 'sounds', 'keyboard-sounds');
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

console.log('\n✅ Generated 10 keyboard sounds!');
console.log('📁 Output directory:', outputDir);
console.log('🌐 Public directory:', publicDir);