/**
 * Interfaces for the wave generation function.
 */

// Interface for the input parameters of the wave generator
interface WaveGeneratorOptions {
    canvasWidth: number;          // The width of the conceptual canvas for calculations
    canvasHeight: number;         // The height of the conceptual canvas for calculations
    waveAmplitude: number;        // Individual bar amplitude as a percentage (0-100)
    waveFrequency: number;        // Individual bar frequency
    wavePhase: number;            // Individual bar phase offset
    overallWaveAmplitude: number; // Overall wave amplitude as a percentage (0-50)
    overallWaveFrequency: number; // Overall wave frequency
    masterHeightScale: number;    // Master scale for all bar heights (e.g., 0.1 to 2.0)
    heightRandomness: number;     // Randomness percentage for bar height (0-0.5)
    barWidth: number;             // Width of each individual bar
    barSpacing: number;           // Spacing between bars
    verticalPadding?: number;     // Optional: Padding from top/bottom of canvas (defaults to 20)
    animationTime?: number;       // Optional: Time offset for static phase (defaults to 0 for static render)
    colorTheme?: string[];        // Optional: Array of hex color strings for the gradient (defaults to rainbow)
}

// Interface for the data representing a single bar
export interface BarData {
    x: number;      // X-coordinate of the top-left corner of the bar
    y: number;      // Y-coordinate of the top-left corner of the bar
    width: number;  // Width of the bar
    height: number; // Height of the bar
    color: string;  // Color of the bar (hex string)
}

/**
 * Generates an array of data objects representing the bars of a PEAL-style wave.
 * This function is designed to be a pure data generator, allowing the consumer
 * to render these bars using any chosen rendering technology (Canvas, SVG, React, etc.).
 *
 * @param options - An object containing all the parameters to generate the wave data.
 * @returns An array of BarData objects, each describing a vertical bar in the wave.
 */
export function generatePealWaveData(options: WaveGeneratorOptions): BarData[] {
    const {
        canvasWidth,
        canvasHeight,
        waveAmplitude,
        waveFrequency,
        wavePhase,
        overallWaveAmplitude,
        overallWaveFrequency,
        masterHeightScale,
        heightRandomness,
        barWidth,
        barSpacing,
        verticalPadding = 20, // Default padding
        animationTime = 0,   // Default to 0 for static render
        colorTheme = [      // Default color theme (rainbow)
            '#4299e1', '#63b3ed', '#a78bfa', '#f6ad55', '#fc8181'
        ]
    } = options;

    const initialCenterY = canvasHeight / 2;
    const barData: BarData[] = [];

    // Maximum amplitude space for the wave, considering overall wave and padding
    // This is the total height the 'core' wave can occupy
    const maxCoreAmplitudeSpace = (canvasHeight / 2) - verticalPadding;

    // The effective amplitude for the individual bars, scaled by waveAmplitude
    const effectiveIndividualAmplitude = (waveAmplitude / 100) * maxCoreAmplitudeSpace;

    // The effective amplitude for the overall wave offset, scaled by overallWaveAmplitude
    const effectiveOverallWaveAmplitude = (overallWaveAmplitude / 100) * maxCoreAmplitudeSpace;

    for (let x = 0; x < canvasWidth; x += (barWidth + barSpacing)) {
        // Calculate the amplitude for the individual bar based on sine wave
        const rawIndividualBarHeight = effectiveIndividualAmplitude * Math.sin(
            (x / canvasWidth) * waveFrequency * Math.PI * 2 + wavePhase + animationTime
        );

        // Apply deterministic "randomness" to bar height based on position
        let randomMultiplier = 1;
        if (heightRandomness > 0) {
            // Use a deterministic pseudo-random based on position
            const seed = x * 13.37;
            const pseudoRandom = Math.sin(seed) * 10000;
            const randomValue = pseudoRandom - Math.floor(pseudoRandom);
            const randomDeviation = (randomValue * 2 - 1) * heightRandomness;
            randomMultiplier = 1 + randomDeviation;
        }
        
        // Apply randomness and master height scale
        let rectHeight = Math.abs(rawIndividualBarHeight) * randomMultiplier * masterHeightScale;

        // Ensure rectHeight does not exceed the available space or become negative
        rectHeight = Math.max(0, Math.min(rectHeight, canvasHeight - verticalPadding * 2));

        // Calculate the vertical offset for the entire wave
        const overallWaveOffset = effectiveOverallWaveAmplitude * Math.sin(
            (x / canvasWidth) * overallWaveFrequency * Math.PI * 2 + animationTime / 2
        );

        // Combined vertical center for the current bar
        const currentBarCenterY = initialCenterY + overallWaveOffset;

        // Calculate the top-left Y position of the bar (centered around currentBarCenterY)
        let rectY = currentBarCenterY - (rectHeight / 2);

        // Ensure bars don't draw outside vertical padding
        rectY = Math.max(verticalPadding, Math.min(rectY, canvasHeight - verticalPadding - rectHeight));

        // Determine the color for the current bar from the provided theme
        const colorIndex = Math.floor((x / canvasWidth) * colorTheme.length);
        const barColor = colorTheme[colorIndex % colorTheme.length];

        // Ensure barWidth doesn't exceed remaining canvas width
        const currentBarWidth = Math.min(barWidth, canvasWidth - x);

        // Only add bar data if it has a positive width and height
        if (currentBarWidth > 0 && rectHeight > 0) {
            barData.push({
                x: x,
                y: rectY,
                width: currentBarWidth,
                height: rectHeight,
                color: barColor
            });
        }
    }

    return barData;
}

// Preset configurations for different logo variations
export const logoPresets = {
    default: {
        waveAmplitude: 70,
        waveFrequency: 5,
        wavePhase: 0,
        overallWaveAmplitude: 10,
        overallWaveFrequency: 0.5,
        masterHeightScale: 1.2,
        heightRandomness: 0.05,
        barWidth: 3,
        barSpacing: 1,
        verticalPadding: 5,
        colorTheme: ['#4299e1', '#63b3ed', '#a78bfa', '#f6ad55', '#fc8181']
    },
    compact: {
        waveAmplitude: 60,
        waveFrequency: 3,
        wavePhase: 0,
        overallWaveAmplitude: 5,
        overallWaveFrequency: 0.3,
        masterHeightScale: 1.0,
        heightRandomness: 0.03,
        barWidth: 2,
        barSpacing: 1,
        verticalPadding: 3,
        colorTheme: ['#4299e1', '#63b3ed', '#a78bfa', '#f6ad55', '#fc8181']
    },
    vibrant: {
        waveAmplitude: 80,
        waveFrequency: 7,
        wavePhase: 0,
        overallWaveAmplitude: 15,
        overallWaveFrequency: 0.7,
        masterHeightScale: 1.3,
        heightRandomness: 0.1,
        barWidth: 4,
        barSpacing: 2,
        verticalPadding: 5,
        colorTheme: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
    },
    minimal: {
        waveAmplitude: 50,
        waveFrequency: 2,
        wavePhase: 0,
        overallWaveAmplitude: 0,
        overallWaveFrequency: 0,
        masterHeightScale: 1.0,
        heightRandomness: 0,
        barWidth: 3,
        barSpacing: 2,
        verticalPadding: 10,
        colorTheme: ['#4a9eff', '#4a9eff', '#4a9eff', '#4a9eff', '#4a9eff']
    },
    layered: {
        waveAmplitude: 85,        // High amplitude for individual bars
        waveFrequency: 12,        // High frequency creates many small waves
        wavePhase: 0,
        overallWaveAmplitude: 30, // Strong overall wave creates the "outer" wave
        overallWaveFrequency: 1.5, // Lower frequency for the containing wave
        masterHeightScale: 1.1,
        heightRandomness: 0.02,
        barWidth: 2,
        barSpacing: 1,
        verticalPadding: 5,
        colorTheme: ['#4299e1', '#63b3ed', '#a78bfa', '#f6ad55', '#fc8181']
    },
    ocean: {
        waveAmplitude: 75,        // Moderate individual waves
        waveFrequency: 8,         // Medium-high frequency
        wavePhase: Math.PI / 4,   // Phase offset for variety
        overallWaveAmplitude: 35, // Strong overall wave
        overallWaveFrequency: 2,  // Multiple large waves
        masterHeightScale: 1.15,
        heightRandomness: 0.08,   // Some randomness for organic feel
        barWidth: 3,
        barSpacing: 0.5,          // Tighter spacing
        verticalPadding: 4,
        colorTheme: ['#006994', '#0099cc', '#00b4d8', '#48cae4', '#90e0ef']
    },
    nested: {
        waveAmplitude: 90,        // Very high for pronounced inner waves
        waveFrequency: 15,        // Many small waves
        wavePhase: 0,
        overallWaveAmplitude: 40, // Very strong container wave
        overallWaveFrequency: 0.8, // Single large containing wave
        masterHeightScale: 0.95,
        heightRandomness: 0.01,
        barWidth: 2.5,
        barSpacing: 0.8,
        verticalPadding: 3,
        colorTheme: ['#3182ce', '#4299e1', '#805ad5', '#ed8936', '#e53e3e']
    }
}

// Theme-aware color palettes
export const colorThemes = {
    light: ['#4299e1', '#63b3ed', '#a78bfa', '#f6ad55', '#fc8181'],
    dark: ['#3182ce', '#4299e1', '#805ad5', '#ed8936', '#e53e3e'],
    ocean: ['#006994', '#0099cc', '#00b4d8', '#48cae4', '#90e0ef'],
    sunset: ['#ff006e', '#ff4365', '#ff8500', '#ffb700', '#ffdd00'],
    forest: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
    monochrome: ['#212529', '#495057', '#6c757d', '#adb5bd', '#dee2e6']
}

export type { WaveGeneratorOptions };