import { getPreset } from './modernAppSounds'
import { getPresetAudioBuffer } from './presetSound'

// Play a preset sound by ID
export async function playPresetSound(presetId: string, volume: number = 0.3) {
  const preset = getPreset(presetId)
  if (!preset) {
    console.warn(`Preset sound not found: ${presetId}`)
    return
  }

  try {
    const buffer = await getPresetAudioBuffer(presetId)
    if (!buffer) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const source = audioContext.createBufferSource()
    const gain = audioContext.createGain()
    gain.gain.value = volume

    source.buffer = buffer
    source.connect(gain)
    gain.connect(audioContext.destination)
    source.start(0)
    source.onended = () => {
      void audioContext.close()
    }
  } catch (error) {
    console.error('Error playing preset sound:', error)
  }
}
