#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Peal CLI Sound Generator
 * Generates a comprehensive set of UI sounds for the CLI package
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
        buffer.writeUInt32LE(16, offset); offset += 4;
        buffer.writeUInt16LE(1, offset); offset += 2;
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

    sine(frequency, duration, amplitude = 1.0) {
        const samples = Math.floor(this.sampleRate * duration);
        const data = new Float32Array(samples);
        const omega = 2 * Math.PI * frequency / this.sampleRate;
        
        for (let i = 0; i < samples; i++) {
            data[i] = amplitude * Math.sin(omega * i);
        }
        
        return data;
    }

    envelope(samples, attack, decay, sustain, release, peakLevel = 1.0) {
        const attackSamples = Math.floor(attack * this.sampleRate);
        const decaySamples = Math.floor(decay * this.sampleRate);
        const releaseSamples = Math.floor(release * this.sampleRate);
        const sustainSamples = samples.length - attackSamples - decaySamples - releaseSamples;
        
        const result = new Float32Array(samples.length);
        
        for (let i = 0; i < samples.length; i++) {
            let envelope = 0;
            
            if (i < attackSamples) {
                envelope = (i / attackSamples) * peakLevel;
            } else if (i < attackSamples + decaySamples) {
                const decayProgress = (i - attackSamples) / decaySamples;
                envelope = peakLevel - (peakLevel - sustain * peakLevel) * decayProgress;
            } else if (i < attackSamples + decaySamples + sustainSamples) {
                envelope = sustain * peakLevel;
            } else {
                const releaseProgress = (i - attackSamples - decaySamples - sustainSamples) / releaseSamples;
                envelope = sustain * peakLevel * (1 - releaseProgress);
            }
            
            result[i] = samples[i] * envelope;
        }
        
        return result;
    }

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

    noise(duration, amplitude = 1.0) {
        const samples = Math.floor(this.sampleRate * duration);
        const data = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            data[i] = amplitude * (Math.random() * 2 - 1);
        }
        
        return data;
    }

    // UI Feedback Sounds
    generateSuccess() {
        // Pleasant ascending chime
        const fundamental = 523.25; // C5
        const harmonics = [
            this.sine(fundamental, 0.3, 0.6),
            this.sine(fundamental * 1.5, 0.3, 0.3),
            this.sine(fundamental * 2, 0.3, 0.2)
        ];
        
        const mixed = this.mix(...harmonics);
        return this.envelope(mixed, 0.01, 0.05, 0.7, 0.24, 0.8);
    }

    generateError() {
        // Dissonant buzz
        const tone1 = this.sine(200, 0.25, 0.5);
        const tone2 = this.sine(210, 0.25, 0.5);
        const mixed = this.mix(tone1, tone2);
        return this.envelope(mixed, 0.005, 0.02, 0.6, 0.15, 0.6);
    }

    generateNotification() {
        // Two-tone alert
        const tone1 = this.sine(800, 0.1, 0.5);
        const tone2 = this.sine(1000, 0.1, 0.5);
        const gap = new Float32Array(0.05 * this.sampleRate);
        const combined = new Float32Array(tone1.length + gap.length + tone2.length);
        
        combined.set(this.envelope(tone1, 0.01, 0.02, 0.7, 0.05), 0);
        combined.set(this.envelope(tone2, 0.01, 0.02, 0.7, 0.05), tone1.length + gap.length);
        
        return combined;
    }

    generateClick() {
        // Short, crisp click
        const click = this.sine(1000, 0.05, 0.3);
        const noise = this.noise(0.05, 0.1);
        const filtered = this.lowpass(noise, 5000);
        const mixed = this.mix(click, filtered);
        return this.envelope(mixed, 0.001, 0.005, 0.3, 0.04, 0.5);
    }

    generateTap() {
        // Softer tap sound
        const tap = this.sine(600, 0.08, 0.4);
        return this.envelope(tap, 0.002, 0.01, 0.5, 0.06, 0.6);
    }

    // Transitions
    generateTransition() {
        // Swoosh effect
        const sweep = this.sweep(200, 800, 0.2);
        const filtered = this.lowpass(sweep, 2000);
        return this.envelope(filtered, 0.01, 0.05, 0.5, 0.14, 0.5);
    }

    generateSwoosh() {
        // Fast sweep
        const sweep = this.sweep(100, 2000, 0.15, 'exponential');
        const noise = this.noise(0.15, 0.1);
        const filteredNoise = this.lowpass(noise, 3000);
        const mixed = this.mix(sweep, filteredNoise);
        return this.envelope(mixed, 0.01, 0.02, 0.4, 0.12, 0.4);
    }

    // Loading/Processing
    generateLoading() {
        // Pulsing tone
        const samples = Math.floor(this.sampleRate * 0.5);
        const result = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const t = i / this.sampleRate;
            const modulation = Math.sin(2 * Math.PI * 4 * t) * 0.3 + 0.7;
            result[i] = Math.sin(2 * Math.PI * 440 * t) * modulation * 0.3;
        }
        
        return result;
    }

    generateComplete() {
        // Completion fanfare
        const tones = [
            this.sine(523.25, 0.1, 0.5),  // C
            this.sine(659.25, 0.1, 0.5),  // E
            this.sine(783.99, 0.15, 0.6)  // G
        ];
        
        const combined = new Float32Array(0.35 * this.sampleRate);
        combined.set(this.envelope(tones[0], 0.01, 0.02, 0.5, 0.07), 0);
        combined.set(this.envelope(tones[1], 0.01, 0.02, 0.5, 0.07), 0.1 * this.sampleRate);
        combined.set(this.envelope(tones[2], 0.01, 0.03, 0.6, 0.11), 0.2 * this.sampleRate);
        
        return combined;
    }

    // Alerts
    generateAlert() {
        // Urgent beeping
        const beepDuration = 0.08;
        const beep = this.sine(1000, beepDuration, 0.6);
        const beepEnv = this.envelope(beep, 0.005, 0.01, 0.8, 0.05);
        
        const totalDuration = 0.5;
        const combined = new Float32Array(totalDuration * this.sampleRate);
        
        // Three beeps
        for (let i = 0; i < 3; i++) {
            const offset = i * 0.15 * this.sampleRate;
            combined.set(beepEnv, offset);
        }
        
        return combined;
    }

    generateWarning() {
        // Lower, more serious tone
        const tone = this.sine(440, 0.3, 0.5);
        const modulation = this.sine(10, 0.3, 0.3);
        
        const result = new Float32Array(tone.length);
        for (let i = 0; i < tone.length; i++) {
            result[i] = tone[i] * (1 + modulation[i]);
        }
        
        return this.envelope(result, 0.02, 0.05, 0.6, 0.2, 0.5);
    }

    // Messages
    generateMessage() {
        // Soft chime
        const chime = this.sine(880, 0.2, 0.4);
        const overtone = this.sine(1760, 0.2, 0.2);
        const mixed = this.mix(chime, overtone);
        return this.envelope(mixed, 0.02, 0.04, 0.5, 0.14, 0.6);
    }

    generateMention() {
        // Attention-getting sound
        const tone1 = this.sine(700, 0.1, 0.5);
        const tone2 = this.sine(1000, 0.1, 0.5);
        const combined = new Float32Array(0.25 * this.sampleRate);
        
        combined.set(this.envelope(tone1, 0.01, 0.01, 0.7, 0.07), 0);
        combined.set(this.envelope(tone2, 0.01, 0.01, 0.7, 0.07), 0.12 * this.sampleRate);
        
        return combined;
    }

    // Interactive
    generateHover() {
        // Subtle hover feedback
        const hover = this.sine(2000, 0.05, 0.2);
        return this.envelope(hover, 0.005, 0.01, 0.5, 0.03, 0.3);
    }

    generateSelect() {
        // Selection confirmation
        const select = this.sine(600, 0.1, 0.4);
        const click = this.sine(1200, 0.05, 0.2);
        const mixed = this.mix(select, click);
        return this.envelope(mixed, 0.002, 0.02, 0.6, 0.07, 0.5);
    }

    generateToggle() {
        // Toggle switch sound
        const freq = 800;
        const toggle = this.sine(freq, 0.08, 0.3);
        const click = this.noise(0.02, 0.2);
        const filtered = this.lowpass(click, 4000);
        const mixed = this.mix(toggle, filtered);
        return this.envelope(mixed, 0.001, 0.01, 0.5, 0.06, 0.4);
    }

    // System
    generateStartup() {
        // System boot sound
        const sweep = this.sweep(100, 1000, 0.5, 'exponential');
        const tone = this.sine(440, 0.5, 0.3);
        const mixed = this.mix(sweep, tone);
        return this.envelope(mixed, 0.1, 0.1, 0.6, 0.3, 0.7);
    }

    generateShutdown() {
        // System shutdown
        const sweep = this.sweep(1000, 100, 0.4, 'exponential');
        return this.envelope(sweep, 0.01, 0.05, 0.5, 0.34, 0.6);
    }

    generateUnlock() {
        // Unlock/access granted
        const tone1 = this.sine(523.25, 0.1, 0.5);  // C
        const tone2 = this.sine(783.99, 0.15, 0.6); // G
        
        const combined = new Float32Array(0.3 * this.sampleRate);
        combined.set(this.envelope(tone1, 0.01, 0.02, 0.6, 0.07), 0);
        combined.set(this.envelope(tone2, 0.01, 0.03, 0.7, 0.11), 0.1 * this.sampleRate);
        
        return combined;
    }

    // Save all CLI sounds
    saveAllSounds(outputDir = './sounds') {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const sounds = [
            // UI Feedback
            { name: 'success', generator: () => this.generateSuccess() },
            { name: 'error', generator: () => this.generateError() },
            { name: 'notification', generator: () => this.generateNotification() },
            { name: 'click', generator: () => this.generateClick() },
            { name: 'tap', generator: () => this.generateTap() },
            
            // Transitions
            { name: 'transition', generator: () => this.generateTransition() },
            { name: 'swoosh', generator: () => this.generateSwoosh() },
            
            // Loading/Processing
            { name: 'loading', generator: () => this.generateLoading() },
            { name: 'complete', generator: () => this.generateComplete() },
            
            // Alerts
            { name: 'alert', generator: () => this.generateAlert() },
            { name: 'warning', generator: () => this.generateWarning() },
            
            // Messages
            { name: 'message', generator: () => this.generateMessage() },
            { name: 'mention', generator: () => this.generateMention() },
            
            // Interactive
            { name: 'hover', generator: () => this.generateHover() },
            { name: 'select', generator: () => this.generateSelect() },
            { name: 'toggle', generator: () => this.generateToggle() },
            
            // System
            { name: 'startup', generator: () => this.generateStartup() },
            { name: 'shutdown', generator: () => this.generateShutdown() },
            { name: 'unlock', generator: () => this.generateUnlock() }
        ];

        console.log('🎵 Generating Peal CLI sounds...\n');

        sounds.forEach(({ name, generator }) => {
            const buffer = generator();
            const filePath = path.join(outputDir, `${name}.wav`);
            fs.writeFileSync(filePath, buffer);
            console.log(`✓ Generated ${name}.wav`);
        });

        console.log('\n✨ All sounds generated successfully!');
        console.log(`📁 Sounds saved to: ${path.resolve(outputDir)}`);
    }
}

// Run if called directly
if (require.main === module) {
    const generator = new SoundGenerator();
    const outputDir = path.join(__dirname, 'sounds');
    generator.saveAllSounds(outputDir);
}

module.exports = { SoundGenerator, WavEncoder };