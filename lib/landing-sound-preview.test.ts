import { describe, expect, it, vi } from 'vitest'
import { connectSoundPreview, previewDuration } from './landing-sound-preview'

const buffer = { duration: 0.4 } as AudioBuffer

function audioContext(currentTime: number) {
  const source = { buffer: null, playbackRate: { value: 1 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
  const envelope = { gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn() }
  const context = { currentTime, destination: {}, createBufferSource: () => source, createGain: () => envelope } as unknown as BaseAudioContext
  return { source, envelope, context }
}

describe('landing sound preview', () => {
  it('keeps duration unchanged with neutral pitch and full decay', () => {
    expect(previewDuration(buffer, { pitch: 0, decay: 1, volume: 55 })).toBe(0.4)
  })

  it('transposes by octaves while preserving the selected decay fraction', () => {
    expect(previewDuration(buffer, { pitch: 12, decay: 1, volume: 55 })).toBe(0.2)
    expect(previewDuration(buffer, { pitch: -12, decay: 0.5, volume: 55 })).toBe(0.4)
  })

  it.each([0, 42])('uses identical relative timing for offline and running contexts (clock %s)', currentTime => {
    const { source, envelope, context } = audioContext(currentTime)
    connectSoundPreview(context, buffer, { volume: 75, pitch: 12, decay: 0.5 })
    expect(source.buffer).toBe(buffer)
    expect(source.playbackRate.value).toBe(2)
    expect(source.stop).toHaveBeenCalledWith(currentTime + 0.1)
    expect(envelope.gain.setValueAtTime).toHaveBeenNthCalledWith(1, 0.75, currentTime)
    expect(envelope.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, currentTime + 0.1)
    expect(source.connect).toHaveBeenCalledWith(envelope)
    expect(envelope.connect).toHaveBeenCalledWith(context.destination)
  })

  it('keeps a muted preview silent through its fade', () => {
    const { envelope, context } = audioContext(0)
    connectSoundPreview(context, buffer, { volume: 0, pitch: 0, decay: 1 })
    expect(envelope.gain.setValueAtTime.mock.calls.every(([value]) => value === 0)).toBe(true)
    expect(envelope.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 0.4)
  })
})
