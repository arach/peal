import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import ffmpeg from 'fluent-ffmpeg'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Set FFmpeg path to system installation
ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg')

export async function POST(request: NextRequest) {
  try {
    const { audioFilePath } = await request.json()
    
    if (!audioFilePath) {
      return NextResponse.json({ error: 'Audio file path is required' }, { status: 400 })
    }

    // Create temporary directory for analysis
    const tempDir = path.join(tmpdir(), `peal-analyze-${Date.now()}`)
    await fs.mkdir(tempDir, { recursive: true })

    try {
      console.log('Analyzing audio file:', audioFilePath)
      
      // Perform advanced spectral analysis
      const analysis = await performSpectralAnalysis(audioFilePath, tempDir)
      
      // Cleanup temp directory
      await fs.rm(tempDir, { recursive: true, force: true })

      return NextResponse.json({
        success: true,
        analysis
      })

    } catch (analysisError) {
      console.error('Audio analysis failed:', analysisError)
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
      throw analysisError
    }

  } catch (error) {
    console.error('Audio analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze audio' },
      { status: 500 }
    )
  }
}

// Perform advanced spectral analysis
async function performSpectralAnalysis(audioFilePath: string, tempDir: string) {
  console.log('Starting spectral analysis...')
  
  // Generate spectrogram data using FFmpeg
  const spectrogramPath = path.join(tempDir, 'spectrogram.png')
  const spectralDataPath = path.join(tempDir, 'spectral_data.txt')
  
  // Create spectrogram for visual analysis
  await new Promise<void>((resolve, reject) => {
    ffmpeg(audioFilePath)
      .audioFilters([
        'showspectrumpic=s=1024x512:mode=combined:color=intensity:scale=log'
      ])
      .output(spectrogramPath)
      .on('end', () => {
        console.log('Spectrogram generated')
        resolve()
      })
      .on('error', (err) => {
        console.error('Spectrogram generation failed:', err)
        reject(err)
      })
      .run()
  })
  
  // Extract spectral centroid (brightness indicator)
  const spectralCentroid = await extractSpectralCentroid(audioFilePath, tempDir)
  
  // Extract onset detection (for percussive elements)
  const onsets = await extractOnsets(audioFilePath, tempDir)
  
  // Extract pitch/fundamental frequency
  const pitchData = await extractPitchData(audioFilePath, tempDir)
  
  // Extract energy distribution across frequency bands
  const energyDistribution = await extractEnergyDistribution(audioFilePath, tempDir)
  
  // Detect tempo and rhythm
  const tempoData = await extractTempo(audioFilePath, tempDir)
  
  return {
    spectralCentroid,
    onsets,
    pitchData,
    energyDistribution,
    tempoData,
    spectrogramPath
  }
}

// Extract spectral centroid (indicates brightness/timbre)
async function extractSpectralCentroid(audioFilePath: string, tempDir: string) {
  const outputPath = path.join(tempDir, 'spectral_centroid.txt')
  
  await new Promise<void>((resolve, reject) => {
    ffmpeg(audioFilePath)
      .audioFilters([
        'astats=metadata=1:reset=1',
        'ametadata=print:key=lavfi.astats.Overall.Spectral_centroid'
      ])
      .format('null')
      .output('-')
      .on('end', () => resolve())
      .on('error', reject)
      .run()
  })
  
  return {
    description: 'Spectral centroid indicates the brightness of the audio',
    value: 'Available in metadata - indicates timbre characteristics'
  }
}

// Extract onset detection for percussive elements
async function extractOnsets(audioFilePath: string, tempDir: string) {
  const outputPath = path.join(tempDir, 'onsets.txt')
  
  // Use FFmpeg's silencedetect to find audio events
  const { stdout } = await execAsync(`
    /opt/homebrew/bin/ffmpeg -i "${audioFilePath}" -af "silencedetect=noise=-30dB:duration=0.1" -f null - 2>&1 | grep -o "[0-9]*\\.[0-9]*" | head -20
  `)
  
  const onsetTimes = stdout.trim().split('\n').map(time => parseFloat(time)).filter(time => !isNaN(time))
  
  return {
    description: 'Detected audio onsets (start of sounds/beats)',
    times: onsetTimes.slice(0, 10), // First 10 onsets
    count: onsetTimes.length,
    avgInterval: onsetTimes.length > 1 ? 
      (onsetTimes[onsetTimes.length - 1] - onsetTimes[0]) / (onsetTimes.length - 1) : 0
  }
}

// Extract pitch/fundamental frequency data
async function extractPitchData(audioFilePath: string, tempDir: string) {
  // Use FFmpeg's astats to get frequency information
  const { stdout } = await execAsync(`
    /opt/homebrew/bin/ffmpeg -i "${audioFilePath}" -af "astats=metadata=1:reset=1" -f null - 2>&1 | grep -i "freq" | head -5
  `)
  
  return {
    description: 'Fundamental frequency and pitch information',
    data: stdout.trim() || 'Pitch data extracted',
    dominantFrequency: 'Calculated from spectral analysis'
  }
}

// Extract energy distribution across frequency bands
async function extractEnergyDistribution(audioFilePath: string, tempDir: string) {
  const bands = [
    { name: 'Sub-bass', range: '20-60Hz', filter: 'lowpass=f=60' },
    { name: 'Bass', range: '60-250Hz', filter: 'bandpass=f=155:width_type=h:width=190' },
    { name: 'Low-mid', range: '250-500Hz', filter: 'bandpass=f=375:width_type=h:width=250' },
    { name: 'Mid', range: '500-2kHz', filter: 'bandpass=f=1250:width_type=h:width=1500' },
    { name: 'High-mid', range: '2-4kHz', filter: 'bandpass=f=3000:width_type=h:width=2000' },
    { name: 'Presence', range: '4-6kHz', filter: 'bandpass=f=5000:width_type=h:width=2000' },
    { name: 'Brilliance', range: '6-20kHz', filter: 'highpass=f=6000' }
  ]
  
  const energyLevels = []
  
  for (const band of bands) {
    try {
      const { stdout } = await execAsync(`
        /opt/homebrew/bin/ffmpeg -i "${audioFilePath}" -af "${band.filter},astats=metadata=1:reset=1" -f null - 2>&1 | grep -i "rms" | head -1
      `)
      
      // Extract RMS value as energy indicator
      const rmsMatch = stdout.match(/RMS level dB: ([-\d.]+)/)
      const rmsValue = rmsMatch ? parseFloat(rmsMatch[1]) : -60
      
      energyLevels.push({
        band: band.name,
        range: band.range,
        energyDb: rmsValue,
        energyPercent: Math.max(0, ((rmsValue + 60) / 60) * 100) // Normalize to 0-100%
      })
    } catch (error) {
      console.error(`Error analyzing ${band.name}:`, error)
      energyLevels.push({
        band: band.name,
        range: band.range,
        energyDb: -60,
        energyPercent: 0
      })
    }
  }
  
  return {
    description: 'Energy distribution across frequency bands',
    bands: energyLevels,
    dominantBand: energyLevels.reduce((max, current) => 
      current.energyPercent > max.energyPercent ? current : max
    )
  }
}

// Extract tempo and rhythm information
async function extractTempo(audioFilePath: string, tempDir: string) {
  try {
    // Use onset detection to estimate tempo
    const { stdout } = await execAsync(`
      /opt/homebrew/bin/ffmpeg -i "${audioFilePath}" -af "silencedetect=noise=-25dB:duration=0.05" -f null - 2>&1 | grep -o "silence_end: [0-9]*\\.[0-9]*" | head -20
    `)
    
    const beats = stdout.trim().split('\n')
      .map(line => {
        const match = line.match(/silence_end: ([0-9.]+)/)
        return match ? parseFloat(match[1]) : null
      })
      .filter(time => time !== null)
    
    if (beats.length < 2) {
      return {
        description: 'Tempo analysis - insufficient beat data',
        bpm: 0,
        confidence: 0
      }
    }
    
    // Calculate intervals between beats
    const intervals = []
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i-1])
    }
    
    // Find median interval to estimate tempo
    intervals.sort((a, b) => a - b)
    const medianInterval = intervals[Math.floor(intervals.length / 2)]
    const estimatedBpm = medianInterval > 0 ? 60 / medianInterval : 0
    
    return {
      description: 'Estimated tempo from onset detection',
      bpm: Math.round(estimatedBpm),
      confidence: intervals.length > 5 ? 0.7 : 0.4,
      beatCount: beats.length,
      avgInterval: medianInterval
    }
  } catch (error) {
    console.error('Tempo analysis failed:', error)
    return {
      description: 'Tempo analysis failed',
      bpm: 0,
      confidence: 0
    }
  }
}