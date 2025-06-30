# Keyboard Sound Analysis Results

## Overview
Analyzed a 54-minute recording of real keyboard sounds (keyboard_sounds.opus) to understand the characteristics of authentic mechanical keyboard sounds.

## Key Findings

### 1. Temporal Characteristics
- **Duration**: Individual keypresses range from 0.04s to 0.56s
- **Attack Time**: Very fast attack (< 10ms) - the initial transient is crucial
- **Decay**: Gradual decay over 100-500ms depending on key type
- **Amplitude**: Varies significantly (0.004 to 0.36) based on typing force

### 2. Frequency Content
- **Low Frequency Dominance**: Strong content below 100Hz (mechanical thump)
  - Peak around 11-12Hz (mechanical resonance)
  - Secondary peak around 93-94Hz
- **Mid Frequencies**: 500-600Hz range shows consistent activity
  - Multiple peaks between 527-609Hz (key mechanism noise)
- **High Frequencies**: Present but lower amplitude
  - Contributes to the "click" characteristic
  - Important for realism but not dominant

### 3. Spectral Characteristics
- **Multiple Resonant Peaks**: Real keyboard sounds have several frequency peaks
- **Broadband Noise**: Not pure tones - contains noise across spectrum
- **Stereo Field**: Original recording in stereo captures spatial information

### 4. Sound Components
Based on the analysis, realistic keyboard sounds consist of:

1. **Initial Click** (0-10ms)
   - Sharp transient
   - Broadband frequency content
   - High amplitude

2. **Body Thump** (10-50ms)
   - Low frequency content (< 100Hz)
   - Gives the "weight" to the sound
   - Mechanical resonance

3. **Decay Tail** (50-500ms)
   - Gradual amplitude decrease
   - Mid-frequency resonances
   - Key mechanism settling

## Recommendations for Synthesis

To create more realistic keyboard sounds:

1. **Layer Multiple Components**:
   - High-frequency click (2-5kHz)
   - Low-frequency thump (20-100Hz)
   - Mid-frequency body (200-800Hz)

2. **Add Randomization**:
   - Vary amplitude (±30%)
   - Slight pitch variations (±5%)
   - Timing jitter (±5ms)

3. **Use Noise Sources**:
   - White noise for click
   - Filtered noise for body
   - Exponential decay envelopes

4. **Consider Key Types**:
   - Space bar: Longer, lower frequency
   - Letters: Shorter, higher pitch
   - Modifiers: Medium duration

## Sample Characteristics Summary

| Aspect | Range | Typical |
|--------|-------|---------|
| Duration | 40-560ms | 200-300ms |
| Attack | < 10ms | 2-5ms |
| Peak Freq | 11-600Hz | 50-100Hz |
| Max Amplitude | 0.004-0.36 | 0.15-0.25 |

This analysis provides a foundation for improving the synthetic keyboard sound generation in the generate-sounds.cjs script.