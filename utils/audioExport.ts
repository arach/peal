export function exportAudioAsWAV(audioBuffer: AudioBuffer, filename: string = 'sound.wav') {
  const numberOfChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const length = audioBuffer.length
  
  // Calculate buffer size
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2)
  const view = new DataView(arrayBuffer)
  
  // Write WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  const writeInt16 = (offset: number, value: number) => {
    view.setInt16(offset, value, true)
  }
  
  const writeInt32 = (offset: number, value: number) => {
    view.setInt32(offset, value, true)
  }
  
  // WAV header
  writeString(0, 'RIFF')
  writeInt32(4, 36 + length * numberOfChannels * 2)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  writeInt32(16, 16) // fmt chunk size
  writeInt16(20, 1) // PCM format
  writeInt16(22, numberOfChannels)
  writeInt32(24, sampleRate)
  writeInt32(28, sampleRate * numberOfChannels * 2) // byte rate
  writeInt16(32, numberOfChannels * 2) // block align
  writeInt16(34, 16) // bits per sample
  writeString(36, 'data')
  writeInt32(40, length * numberOfChannels * 2)
  
  // Convert audio data
  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i]
      const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF
      view.setInt16(offset, intSample, true)
      offset += 2
    }
  }
  
  // Create blob and download
  const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  URL.revokeObjectURL(url)
}

export function generateSoundFilename(sound: any): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
  const type = sound.type || 'sound'
  const freq = Math.round(sound.frequency || 0)
  const duration = Math.round(sound.duration || 0)
  
  return `peal-${type}-${freq}hz-${duration}ms-${timestamp}.wav`
}