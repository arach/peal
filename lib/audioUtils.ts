import { Sound } from '@/store/soundStore'

export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44
  const arrayBuffer = new ArrayBuffer(length)
  const view = new DataView(arrayBuffer)
  const channels: Float32Array[] = []
  let offset = 0
  let pos = 0

  // Helper functions
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true)
    pos += 4
  }

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true)
    pos += 2
  }

  // Write WAV header
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"

  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM
  setUint16(buffer.numberOfChannels)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels)
  setUint16(buffer.numberOfChannels * 2)
  setUint16(16) // 16-bit

  setUint32(0x61746164) // "data" chunk
  setUint32(length - pos - 4)

  // Write interleaved samples
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = channels[i][offset] * 0.8
      sample = Math.max(-1, Math.min(1, sample))
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(pos, sample, true)
      pos += 2
    }
    offset++
  }

  return arrayBuffer
}

export async function exportSounds(sounds: Sound[]): Promise<void> {
  // Dynamic import to avoid SSR issues
  const JSZip = (await import('jszip')).default
  
  const zip = new JSZip()
  const metadata: any[] = []

  for (const sound of sounds) {
    if (!sound.audioBuffer) continue

    const wav = audioBufferToWav(sound.audioBuffer)
    const filename = `peal-${sound.type}-${sound.id}.wav`
    zip.file(filename, wav)

    metadata.push({
      filename: filename,
      type: sound.type,
      duration: sound.duration,
      frequency: sound.frequency,
      brightness: sound.brightness,
      favorite: sound.favorite,
      tags: sound.tags,
      parameters: sound.parameters,
      created: sound.created
    })
  }

  // Add metadata
  zip.file('metadata.json', JSON.stringify(metadata, null, 2))

  // Generate and download zip
  const content = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = `peal-sounds-${Date.now()}.zip`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadSingleSound(sound: Sound): void {
  if (!sound.audioBuffer) return

  const wav = audioBufferToWav(sound.audioBuffer)
  const blob = new Blob([wav], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `peal-${sound.type}-${sound.id}.wav`
  a.click()
  URL.revokeObjectURL(url)
}