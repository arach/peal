#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Scout Sound Generator - Node.js version
 * Generates tech-forward sounds for Scout using pure math
 */

class WavEncoder {
    constructor(sampleRate = 48000, channels = 1, bitsPerSample = 16) {
        this.sampleRate = sampleRate;
        this.channels = channels;
        this.bitsPerSample = bitsPerSample;
    }

    encode(samples) {
        const length = samples.length * this.channels * (this.bitsPerSample / 8) + 44;
        const buffer = Buffer.alloc(length);
        let offset = 0;

        // RIFF header
        buffer.write('RIFF', offset); offset += 4;
        buffer.writeUInt32LE(length - 8, offset); offset += 4;
        buffer.write('WAVE', offset); offset += 4;

        // fmt chunk
        buffer.write('fmt ', offset); offset += 4;
        buffer.writeUInt32LE(16, offset); offset += 4; // chunk size
        buffer.writeUInt16LE(1, offset); offset += 2; // PCM
        buffer.writeUInt16LE(this.channels, offset); offset += 2;
        buffer.writeUInt32LE(this.sampleRate, offset); offset += 4;
        buffer.writeUInt32LE(this.sampleRate * this.channels * (this.bitsPerSample / 8), offset); offset += 4;
        buffer.writeUInt16LE(this.channels * (this.bitsPerSample / 8), offset); offset += 2;
        buffer.writeUInt16LE(this.bitsPerSample, offset); offset += 2;

        // data chunk
        buffer.write('data', offset); offset += 4;
        buffer.writeUInt32LE(samples.length * this.channels * (this.bitsPerSample / 8), offset); offset += 4;

        // Convert float samples to 16-bit PCM
        const max = (1 << (this.bitsPerSample - 1)) - 1;
        for (let i = 0; i < samples.length; i++) {
            const sample = Math.max(-1, Math.min(1, samples[i]));
            const value = Math.floor(sample * max);
            buffer.writeInt16LE(value, offset);
            offset += 2;
        }

        return buffer;
    }
}

class SoundGenerator {
    constructor(sampleRate = 48000) {
        this.sampleRate = sampleRate;
        this.encoder = new WavEncoder(sampleRate);
    }

    // Generate a sine wave
    sine(frequency, duration, amplitude = 1.0) {
        const samples = Math.floor(this.sampleRate * duration);
        const data = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        
        for (let i = 0; i < samples; i++) {
            data[i] = amplitude * Math.sin(omega * i);
        }
        
        return data;
    }

    // Generate a square wave
    square(frequency, duration, amplitude = 1.0) {
        const samples = Math.floor(this.sampleRate * duration);
        const data = new Float32Array(samples);
        const period = this.sampleRate / frequency;
        
        for (let i = 0; i < samples; i++) {
            data[i] = amplitude * (Math.floor(i / period * 2) % 2 === 0 ? 1 : -1);
        }
        
        return data;
    }

    // Generate white noise
    noise(duration, amplitude = 1.0) {
        const samples = Math.floor(this.sampleRate * duration);
        const data = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            data[i] = amplitude * (Math.random() * 2 - 1);
        }
        
        return data;
    }

    // Apply ADSR envelope
    envelope(samples, attack, decay, sustain, release, peakLevel = 1.0) {
        const attackSamples = Math.floor(attack * this.sampleRate);
        const decaySamples = Math.floor(decay * this.sampleRate);
        const releaseSamples = Math.floor(release * this.sampleRate);
        const sustainSamples = samples.length - attackSamples - decaySamples - releaseSamples;
        
        const result = new Float32Array(samples.length);
        
        for (let i = 0; i < samples.length; i++) {
            let envelope = 0;
            
            if (i < attackSamples) {
                // Attack phase
                envelope = (i / attackSamples) * peakLevel;
            } else if (i < attackSamples + decaySamples) {
                // Decay phase
                const decayProgress = (i - attackSamples) / decaySamples;
                envelope = peakLevel - (peakLevel - sustain * peakLevel) * decayProgress;
            } else if (i < attackSamples + decaySamples + sustainSamples) {
                // Sustain phase
                envelope = sustain * peakLevel;
            } else {
                // Release phase
                const releaseProgress = (i - attackSamples - decaySamples - sustainSamples) / releaseSamples;
                envelope = sustain * peakLevel * (1 - releaseProgress);
            }
            
            result[i] = samples[i] * envelope;
        }
        
        return result;
    }

    // Frequency sweep
    sweep(startFreq, endFreq, duration, type = 'exponential') {
        const samples = Math.floor(this.sampleRate * duration);
        const data = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / samples;
            let frequency;
            
            if (type === 'exponential') {
                frequency = startFreq * Math.pow(endFreq / startFreq, t);
            } else {
                frequency = startFreq + (endFreq - startFreq) * t;
            }
            
            const phase = 2 * Math.PI * frequency / this.sampleRate;
            data[i] = Math.sin(phase * i);
        }
        
        return data;
    }

    // Low-pass filter (simple one-pole)
    lowpass(samples, cutoff) {
        const result = new Float32Array(samples.length);
        const rc = 1.0 / (cutoff * 2 * Math.PI);
        const dt = 1.0 / this.sampleRate;
        const alpha = dt / (rc + dt);
        
        result[0] = samples[0];
        for (let i = 1; i < samples.length; i++) {
            result[i] = result[i - 1] + alpha * (samples[i] - result[i - 1]);
        }
        
        return result;
    }

    // Mix multiple audio signals
    mix(...signals) {
        const maxLength = Math.max(...signals.map(s => s.length));
        const result = new Float32Array(maxLength);
        
        for (let i = 0; i < maxLength; i++) {
            let sum = 0;
            let count = 0;
            
            for (const signal of signals) {
                if (i < signal.length) {
                    sum += signal[i];
                    count++;
                }
            }
            
            result[i] = count > 0 ? sum / count : 0;
        }
        
        return result;
    }

    // Apply soft clipping distortion
    softClip(samples, amount = 0.7) {
        const result = new Float32Array(samples.length);
        
        for (let i = 0; i < samples.length; i++) {
            const x = samples[i] * amount;
            result[i] = Math.tanh(x) / amount;
        }
        
        return result;
    }

    // Generate start sound - "Neural Activate"
    generateStartSound() {
        console.log('Generating Start Sound: Neural Activate...');
        
        // Main sweep: 440Hz to 880Hz
        const sweep = this.sweep(440, 880, 0.15, 'exponential');
        const sweepEnv = this.envelope(sweep, 0.005, 0.05, 0.7, 0.05, 0.6);
        
        // Overtone at 1760Hz
        const overtone = this.sine(1760, 0.2, 0.2);
        const overtoneEnv = this.envelope(overtone, 0.1, 0.0, 1.0, 0.1, 0.2);
        
        // Mix and add subtle distortion
        const mixed = this.mix(sweepEnv, overtoneEnv);
        const final = this.softClip(mixed, 0.8);
        
        return this.encoder.encode(final);
    }

    // Generate stop sound - "Data Seal"
    generateStopSound() {
        console.log('Generating Stop Sound: Data Seal...');
        
        // Descending square wave: 880Hz to 220Hz
        const duration = 0.25;
        const samples = Math.floor(this.sampleRate * duration);
        const pulse = new Float32Array(samples);
        
        // Generate frequency-swept square wave
        for (let i = 0; i < samples; i++) {
            const t = i / samples;
            const frequency = 880 * Math.pow(0.25, t); // 880 to 220
            const period = this.sampleRate / frequency;
            pulse[i] = Math.floor(i / period * 2) % 2 === 0 ? 0.5 : -0.5;
        }
        
        // Apply filter sweep
        const filtered = this.lowpass(pulse, 2000);
        const pulseEnv = this.envelope(filtered, 0.01, 0.08, 0.5, 0.15, 0.5);
        
        // Sub bass pulse at 55Hz
        const sub = this.sine(55, 0.025, 0.8);
        const subEnv = this.envelope(sub, 0.001, 0.024, 0, 0.001, 0.8);
        
        // Mix
        const mixed = this.mix(pulseEnv, subEnv);
        
        return this.encoder.encode(mixed);
    }

    // Generate error sound - "Quantum Glitch"
    generateErrorSound() {
        console.log('Generating Error Sound: Quantum Glitch...');
        
        const duration = 0.3;
        const samples = Math.floor(this.sampleRate * duration);
        const result = new Float32Array(samples);
        
        // FM synthesis parameters
        const carrier = 400;
        const modulator = 150;
        const modIndex = 200;
        
        // Create three stutters
        const stutterTimes = [0, 0.1, 0.2];
        const stutterDuration = 0.05;
        
        for (let i = 0; i < samples; i++) {
            const t = i / this.sampleRate;
            
            // Check if we're in a stutter
            let inStutter = false;
            let stutterEnv = 0;
            
            for (const stutterTime of stutterTimes) {
                if (t >= stutterTime && t < stutterTime + stutterDuration) {
                    inStutter = true;
                    const stutterProgress = (t - stutterTime) / stutterDuration;
                    stutterEnv = Math.exp(-stutterProgress * 5);
                    break;
                }
            }
            
            if (inStutter) {
                // FM synthesis
                const modSignal = Math.sin(2 * Math.PI * modulator * t);
                const carrierFreq = carrier + modIndex * modSignal;
                result[i] = Math.sin(2 * Math.PI * carrierFreq * t) * stutterEnv * 0.4;
            }
        }
        
        // Add filtered noise
        const noiseSignal = this.noise(duration, 0.1);
        const filteredNoise = this.lowpass(noiseSignal, 2000);
        const noiseEnv = this.envelope(filteredNoise, 0.001, 0.05, 0.2, 0.2, 0.1);
        
        // Mix FM and noise
        const mixed = this.mix(result, noiseEnv);
        
        return this.encoder.encode(mixed);
    }

    // Generate success sound - "Crystal Form"
    generateSuccessSound() {
        console.log('Generating Success Sound: Crystal Form...');
        
        const duration = 0.4;
        const fundamental = 523.25; // C5
        
        // Create harmonics
        const harmonics = [
            { freq: fundamental, amp: 0.6 },
            { freq: fundamental * 1.5, amp: 0.3 },      // Perfect 5th
            { freq: fundamental * 2, amp: 0.2 },        // Octave
            { freq: fundamental * 3, amp: 0.1 }         // 12th
        ];
        
        const signals = harmonics.map((h, i) => {
            // Add slight detuning for richness (except fundamental)
            const detune = i > 0 ? (Math.random() - 0.5) * 5 : 0;
            const freq = h.freq + detune;
            
            const signal = this.sine(freq, duration, h.amp);
            // Bell-like envelope
            return this.envelope(signal, 0.01, 0.0, 1.0, 0.39, 1.0);
        });
        
        // Mix all harmonics
        const mixed = this.mix(...signals);
        
        // Add subtle ring modulation for crystalline texture
        const ringMod = new Float32Array(mixed.length);
        for (let i = 0; i < mixed.length; i++) {
            const t = i / this.sampleRate;
            const modulator = Math.sin(2 * Math.PI * 50 * t); // 50Hz modulation
            ringMod[i] = mixed[i] * (1 + 0.3 * modulator);
        }
        
        return this.encoder.encode(ringMod);
    }

    // Save all sounds
    saveAllSounds(outputDir = './custom') {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const sounds = [
            { name: 'scout-start', generator: () => this.generateStartSound() },
            { name: 'scout-stop', generator: () => this.generateStopSound() },
            { name: 'scout-error', generator: () => this.generateErrorSound() },
            { name: 'scout-success', generator: () => this.generateSuccessSound() }
        ];

        sounds.forEach(({ name, generator }) => {
            const buffer = generator();
            const filePath = path.join(outputDir, `${name}.wav`);
            fs.writeFileSync(filePath, buffer);
            console.log(`✓ Saved ${filePath}`);
        });

        console.log('\nAll sounds generated successfully!');
        console.log('\nTo use these sounds:');
        console.log('1. Move the WAV files to your app bundle');
        console.log('2. Update the Rust sound player to use custom paths');
        console.log('3. Add sound selection to Settings UI');
    }
}

// Run if called directly
if (require.main === module) {
    const generator = new SoundGenerator();
    generator.saveAllSounds();
}

module.exports = { SoundGenerator, WavEncoder };