import type { Sound } from '@/store/soundStore'
import { extractWaveformData } from '@/lib/audioUtils'
import { getPreset, type SoundPreset } from './modernAppSounds'
import { renderPresetAudioBuffer } from './renderPresetSound'

export { renderPresetAudioBuffer }

function presetTypeToSoundType(preset: SoundPreset): Sound['type'] {
  if (preset.tags.includes('click')) return 'click'
  if (preset.tags.includes('sweep') || preset.category === 'navigation') return 'sweep'
  if (preset.category === 'feedback' || preset.tags.includes('success')) return 'chime'
  if (preset.tags.includes('pulse')) return 'pulse'
  return 'tone'
}

export function presetToSound(preset: SoundPreset): Sound {
  const durationSec = preset.parameters.duration || 0.2

  return {
    id: `preset-${preset.id}`,
    type: presetTypeToSoundType(preset),
    duration: Math.round(durationSec * 1000),
    frequency: preset.parameters.oscillator?.frequency || preset.parameters.frequency || 440,
    brightness: 50,
    created: new Date(0),
    favorite: false,
    tags: [...new Set([preset.name, preset.category, ...preset.tags.slice(0, 3)])],
    parameters: preset.parameters,
    waveformData: null,
    audioBuffer: null,
  }
}

export function isPresetSoundId(id: string): boolean {
  return id.startsWith('preset-')
}

export function presetIdFromSoundId(id: string): string {
  return id.replace(/^preset-/, '')
}

const presetWaveformCache = new Map<string, number[]>()
const presetAudioCache = new Map<string, AudioBuffer>()
const PRESET_AUDIO_CACHE_VERSION = 2

let presetAudioCacheVersion = PRESET_AUDIO_CACHE_VERSION

export function invalidatePresetAudioCache() {
  presetAudioCache.clear()
  presetWaveformCache.clear()
  presetAudioCacheVersion = PRESET_AUDIO_CACHE_VERSION
}

export async function getPresetAudioBuffer(presetId: string, force = false): Promise<AudioBuffer | null> {
  if (force) {
    presetAudioCache.delete(presetId)
    presetWaveformCache.delete(presetId)
  }

  const cached = presetAudioCache.get(presetId)
  if (cached && presetAudioCacheVersion === PRESET_AUDIO_CACHE_VERSION) return cached

  const preset = getPreset(presetId)
  if (!preset) return null

  const buffer = await renderPresetAudioBuffer(preset)
  presetAudioCache.set(presetId, buffer)
  return buffer
}

export async function getPresetWaveform(presetId: string): Promise<number[]> {
  const cached = presetWaveformCache.get(presetId)
  if (cached) return cached

  const buffer = await getPresetAudioBuffer(presetId)
  if (!buffer) return []

  const waveform = extractWaveformData(buffer)
  presetWaveformCache.set(presetId, waveform)
  return waveform
}

export async function playPresetPreview(sound: Sound): Promise<AudioBufferSourceNode | null> {
  if (!isPresetSoundId(sound.id) || typeof window === 'undefined') return null

  const buffer = await getPresetAudioBuffer(presetIdFromSoundId(sound.id))
  if (!buffer) return null

  sound.audioBuffer = buffer
  if (!sound.waveformData) {
    sound.waveformData = extractWaveformData(buffer)
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  const source = audioContext.createBufferSource()
  source.buffer = buffer

  const gain = audioContext.createGain()
  gain.gain.value = 1.75

  source.connect(gain)
  gain.connect(audioContext.destination)
  source.start(0)
  source.onended = () => {
    void audioContext.close()
  }

  return source
}

export async function ensureSoundAudioBuffer(sound: Sound): Promise<Sound> {
  if (sound.audioBuffer) return sound

  if (isPresetSoundId(sound.id)) {
    const buffer = await getPresetAudioBuffer(presetIdFromSoundId(sound.id))
    if (buffer) {
      sound.audioBuffer = buffer
      if (!sound.waveformData) {
        sound.waveformData = extractWaveformData(buffer)
      }
    }
    return sound
  }

  const { SoundGenerator } = await import('@/hooks/useSoundGeneration')
  const generator = new SoundGenerator()
  await (generator as any).renderSound(sound)
  return sound
}