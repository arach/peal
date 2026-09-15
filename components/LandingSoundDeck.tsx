'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Download, Play, Square, RotateCcw } from 'lucide-react'
import { audioBufferToWav } from '@/lib/audioUtils'
import { getPublicUrl } from '@/utils/url'
import { connectSoundPreview, previewDuration } from '@/lib/landing-sound-preview'

const sounds = [
  { id: 'success', name: 'Success', description: 'A happy little “all done.”' },
  { id: 'click', name: 'Click', description: 'A small touch of feedback.' },
  { id: 'notification', name: 'Notification', description: 'Something worth a listen.' },
] as const

function Knob({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void
}) {
  return (
    <label className="sound-deck-knob">
      <span className="sound-deck-dial" style={{ '--dial-angle': `${-135 + (value - min) / (max - min) * 270}deg` } as CSSProperties}>
        <span className="sound-deck-pointer" />
        <input type="range" aria-label={label} aria-valuetext={display} min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
      </span>
      <span>{label}</span>
      <output>{display}</output>
    </label>
  )
}

export default function LandingSoundDeck() {
  const [selected, setSelected] = useState(0)
  const [volume, setVolume] = useState(55)
  const [pitch, setPitch] = useState(0)
  const [decay, setDecay] = useState(1)
  const [buffers, setBuffers] = useState<AudioBuffer[]>([])
  const [playing, setPlaying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const context = useRef<AudioContext | null>(null)
  const source = useRef<AudioBufferSourceNode | null>(null)
  const gain = useRef<GainNode | null>(null)
  const sound = sounds[selected]
  const buffer = buffers[selected]
  const settings = { volume, pitch, decay }
  const duration = buffer ? previewDuration(buffer, settings) : 0

  useEffect(() => {
    const audio = new AudioContext()
    context.current = audio
    const controller = new AbortController()
    Promise.all(sounds.map(async item => {
      const response = await fetch(getPublicUrl(`/sounds/modern/${item.id}.wav`), { signal: controller.signal })
      if (!response.ok) throw new Error('Audio unavailable')
      return audio.decodeAudioData(await response.arrayBuffer())
    })).then(loaded => {
      if (!controller.signal.aborted) setBuffers(loaded)
    }).catch(() => {
      if (!controller.signal.aborted) setError('Could not load the sounds. Refresh to try again.')
    })
    return () => {
      controller.abort()
      source.current?.stop()
      void audio.close()
    }
  }, [])

  const stop = () => {
    source.current?.stop()
    source.current = null
    gain.current?.disconnect()
    gain.current = null
    setPlaying(false)
  }

  const play = async () => {
    if (playing) { stop(); return }
    const audio = context.current
    if (!audio || !buffer) return
    try {
      await audio.resume()
      stop()
      const { node, envelope } = connectSoundPreview(audio, buffer, settings)
      source.current = node
      gain.current = envelope
      node.onended = () => {
        node.disconnect()
        envelope.disconnect()
        if (source.current === node) {
          source.current = null
          gain.current = null
          setPlaying(false)
        }
      }
      setPlaying(true)
      setError('')
    } catch { setError('Playback could not start. Press play to try again.') }
  }

  const save = async () => {
    if (!buffer) return
    setSaving(true)
    try {
      const offline = new OfflineAudioContext(buffer.numberOfChannels, Math.ceil(duration * buffer.sampleRate), buffer.sampleRate)
      connectSoundPreview(offline, buffer, settings)
      const rendered = await offline.startRendering()
      const url = URL.createObjectURL(new Blob([audioBufferToWav(rendered)], { type: 'audio/wav' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `peal-${sound.id}.wav`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setError('')
    } catch { setError('Could not save the sound. Try again.') }
    finally { setSaving(false) }
  }

  const samples = buffer?.getChannelData(0)
  const peakAmplitude = samples?.reduce((peak, sample) => Math.max(peak, Math.abs(sample)), 0) || 1
  const bars = Array.from({ length: 100 }, (_, i) => {
    if (!samples) return 1
    const start = Math.floor(i / 100 * samples.length * decay)
    const end = Math.floor((i + 1) / 100 * samples.length * decay)
    let peak = 0
    for (let j = start; j < end; j += Math.max(1, Math.floor((end - start) / 80))) peak = Math.max(peak, Math.abs(samples[j]))
    const fade = i < 65 ? 1 : (100 - i) / 35
    return Math.max(1, peak / peakAmplitude * 140 * volume / 100 * fade)
  })

  return (
    <div className="sound-deck-wrap">
      <section className="sound-deck" aria-label="Interactive sound preview">
        <header className="sound-deck-head">
          <span className="sound-deck-brand"><span aria-hidden="true">(((•)))</span> peal</span>
          <span className="sound-deck-caption">Your sound studio</span>
          <button className="sound-deck-save" onClick={save} disabled={!buffer || saving}><Download size={13} />{saving ? 'Saving…' : 'Save .wav'}</button>
        </header>
        <div className={`sound-deck-screen ${playing ? 'is-playing' : ''}`}>
          <div className="sound-deck-scope">
            <div className="sound-deck-ruler" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <span key={i}>{(duration * i / 4).toFixed(2)}s</span>)}</div>
            <svg viewBox="0 0 400 160" preserveAspectRatio="none" aria-label={`Waveform for ${sound.name}`} role="img">
              {bars.map((height, i) => <line key={i} x1={i * 4 + 2} x2={i * 4 + 2} y1={80 - height / 2} y2={80 + height / 2} stroke="currentColor" strokeWidth="1.5" />)}
            </svg>
            {playing && <span className="sound-deck-playhead" style={{ animationDuration: `${duration}s` }} />}
          </div>
          <div className="sound-deck-description"><h2>{sound.name}</h2><p>{sound.description}</p><span>{buffer ? `${duration.toFixed(2)}s · ${buffer.sampleRate / 1000} kHz` : 'Loading…'}<br />WAV audio</span></div>
        </div>
        <div className="sound-deck-controls">
          <button className="sound-deck-play" aria-label={playing ? 'Stop sound preview' : `Play ${sound.name}`} onClick={play} disabled={!buffer}>{playing ? <Square size={23} fill="currentColor" /> : <Play size={27} fill="currentColor" />}</button>
          <Knob label="Volume" min={0} max={100} step={1} value={volume} display={`${volume}%`} onChange={v => { stop(); setVolume(v) }} />
          <Knob label="Pitch" min={-12} max={12} step={1} value={pitch} display={`${pitch > 0 ? '+' : ''}${pitch} st`} onChange={v => { stop(); setPitch(v) }} />
          <Knob label="Decay" min={0.2} max={1} step={0.05} value={decay} display={`${decay.toFixed(2)}×`} onChange={v => { stop(); setDecay(v) }} />
        </div>
        <div className="sound-deck-presets" aria-label="Preview sound">{sounds.map((item, i) => <button key={item.id} aria-pressed={selected === i} onClick={() => { stop(); setSelected(i) }}><span className="sound-deck-led" />{item.name}</button>)}</div>
      </section>
      <div className="sound-deck-foot"><p role="status">{error || 'Press play. Try the knobs. Make it yours.'}</p><button onClick={() => { stop(); setVolume(55); setPitch(0); setDecay(1) }}><RotateCcw size={10} /> Reset</button></div>
    </div>
  )
}
