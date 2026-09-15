export type SoundPreviewSettings = { volume: number; pitch: number; decay: number }

export function previewDuration(buffer: AudioBuffer, settings: SoundPreviewSettings) {
  return buffer.duration / 2 ** (settings.pitch / 12) * settings.decay
}

/** Use the same playback rate and fade envelope for the live deck and WAV export. */
export function connectSoundPreview(audio: BaseAudioContext, buffer: AudioBuffer, settings: SoundPreviewSettings) {
  const duration = previewDuration(buffer, settings)
  const node = audio.createBufferSource()
  const envelope = audio.createGain()
  node.buffer = buffer
  node.playbackRate.value = 2 ** (settings.pitch / 12)
  envelope.gain.setValueAtTime(settings.volume / 100, audio.currentTime)
  envelope.gain.setValueAtTime(settings.volume / 100, audio.currentTime + duration * 0.65)
  envelope.gain.linearRampToValueAtTime(0, audio.currentTime + duration)
  node.connect(envelope)
  envelope.connect(audio.destination)
  node.start()
  node.stop(audio.currentTime + duration)
  return { node, envelope }
}
