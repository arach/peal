'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { PEAL_VOICE_MODELS, PEAL_VOICE_OPTIONS } from './constants'
import { loadStoredDeckClips, saveDeckClips, soundboardLabel } from './storage'
import { renderSfxProposalToBase64 } from '@/lib/deck/renderSfxProposal'
import {
  DECK_BANK_COUNT,
  DECK_PADS_PER_BANK,
  type DeckCaptureSource,
  type DeckClip,
  type DeckSfxType,
  type PealVoiceTake,
} from './types'
import { getMessageBedPreset, type MessageBedId } from '@/lib/deck/messageBeds'
import { playTakeWithVoiceFx } from './voiceFx'
import type { VoiceFxHandle, VoiceFxParams } from '@voxd/client/fx'

interface PealVoiceContextValue {
  projectName: string
  setProjectName: (name: string) => void
  script: string
  setScript: (script: string) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  selectedVoice: string
  setSelectedVoice: (voice: string) => void
  speed: number
  setSpeed: (speed: number) => void
  defaultFxPresetId: string
  setDefaultFxPresetId: (presetId: string) => void
  mixerGenreId: string
  mixerKnobOverrides: Partial<VoiceFxParams> | undefined
  loadMixerGenre: (genreId: string) => void
  setMixerKnob: (params: Partial<VoiceFxParams>) => void
  resetMixerKnobs: () => void
  applyMixerToClip: (takeId?: string) => void
  previewClipThroughMixer: (takeId?: string) => void
  previewClipWithMixerState: (state: { genreId: string; knobOverrides?: Partial<VoiceFxParams> }, takeId?: string) => void
  captureSource: DeckCaptureSource
  setCaptureSource: (source: DeckCaptureSource) => void
  musicPrompt: string
  setMusicPrompt: (prompt: string) => void
  musicModel: string
  sfxBrief: string
  setSfxBrief: (brief: string) => void
  sfxType: DeckSfxType
  setSfxType: (type: DeckSfxType) => void
  sfxDuration: number
  setSfxDuration: (seconds: number) => void
  activeBank: number
  setActiveBank: (bank: number) => void
  targetSlot: number | null
  setTargetSlot: (slot: number | null) => void
  deckSlots: Array<DeckClip | null>
  musicProviderReady: boolean
  captureReady: boolean
  takes: PealVoiceTake[]
  selectedTakeId: string | null
  setSelectedTakeId: (id: string | null) => void
  currentlyPlayingId: string | null
  isGenerating: boolean
  generateError: string | null
  providerBanner: string | null
  activeProviderReady: boolean
  isMac: boolean
  selectedTake: PealVoiceTake | null
  generate: () => Promise<void>
  generateFromScript: (text?: string) => Promise<void>
  generateMusic: (prompt?: string) => Promise<void>
  generateSfx: (brief?: string) => Promise<void>
  captureToDeck: () => Promise<void>
  importStarterMessageBeds: () => Promise<void>
  captureMessagePair: (bedId: MessageBedId) => Promise<void>
  previewMessagePair: (bedId: MessageBedId) => void
  hasMessagePair: (bedId: MessageBedId) => boolean
  applySelectedFxAsDefault: () => void
  triggerTake: (takeId: string) => void
  togglePlay: (takeId: string) => void
  stopPlayback: () => void
  setTakeFxPreset: (takeId: string, presetId: string) => void
  setTakeFxOverride: (takeId: string, params: Partial<VoiceFxParams> | undefined) => void
  applyFxPreset: (input: { presetId: string; target: 'selected' | 'default' | 'take'; takeId?: string }) => void
  previewTake: (takeId?: string) => void
  downloadTake: (take: PealVoiceTake) => void
  copyFilename: (filename: string) => void
  deleteTake: (id: string) => void
}

const PealVoiceContext = createContext<PealVoiceContextValue | null>(null)

function slugFragment(text: string) {
  return text.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
}

function generateTtsFilename(projectName: string, script: string, model: string, voice: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${projectName}_${model}_${voice}_${slugFragment(script)}_${timestamp}.mp3`
}

function generateMusicFilename(projectName: string, prompt: string, model: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${projectName}_${model}_${slugFragment(prompt)}_${timestamp}.mp3`
}

function generateSfxFilename(projectName: string, summary: string, type: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${projectName}_sfx_${type}_${slugFragment(summary)}_${timestamp}.wav`
}

function nextDeckSlot(clips: DeckClip[], bank: number, preferred: number | null) {
  if (preferred != null && !clips.some((c) => c.bank === bank && c.slot === preferred)) {
    return preferred
  }
  for (let slot = 0; slot < DECK_PADS_PER_BANK; slot += 1) {
    if (!clips.some((c) => c.bank === bank && c.slot === slot)) return slot
  }
  return null
}

export function PealVoiceProvider({ children }: { children: ReactNode }) {
  const [projectName, setProjectName] = useState('peal-voice-project')
  const [script, setScript] = useState('')
  const [selectedModel, setSelectedModelState] = useState('tts-1')
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [speed, setSpeed] = useState(1)
  const [defaultFxPresetId, setDefaultFxPresetId] = useState('')
  const [mixerGenreId, setMixerGenreId] = useState('')
  const [mixerKnobOverrides, setMixerKnobOverrides] = useState<Partial<VoiceFxParams> | undefined>(undefined)
  const [captureSource, setCaptureSource] = useState<DeckCaptureSource>('tts')
  const [musicPrompt, setMusicPrompt] = useState('')
  const [musicModel] = useState('music-2.6-free')
  const [sfxBrief, setSfxBrief] = useState('')
  const [sfxType, setSfxType] = useState<DeckSfxType>('click')
  const [sfxDuration, setSfxDuration] = useState(0.12)
  const [activeBank, setActiveBank] = useState(0)
  const [targetSlot, setTargetSlot] = useState<number | null>(null)
  const [takes, setTakes] = useState<DeckClip[]>([])
  const [selectedTakeId, setSelectedTakeId] = useState<string | null>(null)
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({})
  const [isMac, setIsMac] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const playbackAbortRef = useRef<AbortController | null>(null)
  const playbackHandleRef = useRef<VoiceFxHandle | null>(null)
  const playbackBedHandleRef = useRef<VoiceFxHandle | null>(null)
  const playbackGenerationRef = useRef(0)
  const takesRef = useRef<DeckClip[]>([])
  const mixerGenreRef = useRef('')
  const mixerKnobOverridesRef = useRef<Partial<VoiceFxParams> | undefined>(undefined)
  const mixerPreviewActiveRef = useRef(false)
  const previewRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedPadRef = useRef<string | null>(null)
  const currentlyPlayingIdRef = useRef<string | null>(null)

  useEffect(() => {
    takesRef.current = takes
  }, [takes])

  useEffect(() => {
    mixerGenreRef.current = mixerGenreId
  }, [mixerGenreId])

  useEffect(() => {
    mixerKnobOverridesRef.current = mixerKnobOverrides
  }, [mixerKnobOverrides])

  useEffect(() => {
    currentlyPlayingIdRef.current = currentlyPlayingId
  }, [currentlyPlayingId])

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && navigator.platform.includes('Mac'))
    setTakes(loadStoredDeckClips())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveDeckClips(takes)
  }, [hydrated, takes])

  useEffect(() => {
    fetch('/api/check-providers')
      .then((res) => res.json())
      .then((status: Record<string, boolean>) => {
        setProviderStatus(status)
        if (!status.OPENAI_API_KEY && status.GROQ_API_KEY) {
          setSelectedModelState('playai-tts')
          setSelectedVoice('Fritz-PlayAI')
        }
      })
      .catch(() => {})
  }, [])

  const setSelectedModel = useCallback((model: string) => {
    setSelectedModelState(model)
    const voices = PEAL_VOICE_OPTIONS[model]
    if (voices?.length) setSelectedVoice(voices[0])
  }, [])

  const activeModel = PEAL_VOICE_MODELS.find((m) => m.id === selectedModel)
  const providersLoaded = Object.keys(providerStatus).length > 0
  const activeProviderReady = !providersLoaded || !activeModel || providerStatus[activeModel.envKey] === true
  const musicProviderReady = !providersLoaded || providerStatus.MINIMAX_API_KEY === true
  const captureReady = captureSource === 'music'
    ? musicProviderReady
    : captureSource === 'sfx'
      ? true
      : activeProviderReady
  const providerBanner = providersLoaded && !captureReady
    ? captureSource === 'music'
      ? 'Minimax is not configured. Add MINIMAX_API_KEY to .env.local and restart the dev server on port 3001.'
      : captureSource === 'tts' && activeModel
        ? `${activeModel.provider} is not configured. Add ${activeModel.envKey} to .env.local and restart the dev server on port 3001.`
        : null
    : null

  const selectedTake = takes.find((t) => t.id === selectedTakeId) ?? null

  useEffect(() => {
    if (!selectedTakeId) {
      loadedPadRef.current = null
      return
    }
    if (loadedPadRef.current === selectedTakeId) return
    loadedPadRef.current = selectedTakeId
    const take = takesRef.current.find((t) => t.id === selectedTakeId)
    if (!take) return
    setMixerGenreId(take.fxPresetId)
    setMixerKnobOverrides(take.fxParamsOverride)
  }, [selectedTakeId])

  const deckSlots = useMemo(() => {
    const slots: Array<DeckClip | null> = Array(DECK_PADS_PER_BANK).fill(null)
    for (const clip of takes) {
      if (clip.bank === activeBank && clip.slot >= 0 && clip.slot < DECK_PADS_PER_BANK) {
        slots[clip.slot] = clip
      }
    }
    return slots
  }, [activeBank, takes])

  const stopPlayback = useCallback(() => {
    if (previewRestartTimerRef.current) {
      clearTimeout(previewRestartTimerRef.current)
      previewRestartTimerRef.current = null
    }
    mixerPreviewActiveRef.current = false
    playbackGenerationRef.current += 1
    playbackAbortRef.current?.abort()
    playbackAbortRef.current = null
    playbackHandleRef.current?.stop()
    playbackHandleRef.current = null
    playbackBedHandleRef.current?.stop()
    playbackBedHandleRef.current = null
    setCurrentlyPlayingId(null)
  }, [])

  const patchClipFx = useCallback((
    takeId: string,
    genreId: string,
    overrides: Partial<VoiceFxParams> | undefined,
  ) => {
    setTakes((prev) => prev.map((take) => (
      take.id === takeId
        ? { ...take, fxPresetId: genreId, fxParamsOverride: overrides }
        : take
    )))
  }, [])

  const playTake = useCallback((take: PealVoiceTake) => {
    mixerPreviewActiveRef.current = false
    stopPlayback()
    const generation = playbackGenerationRef.current
    setCurrentlyPlayingId(take.id)
    setSelectedTakeId(take.id)

    const controller = new AbortController()
    playbackAbortRef.current = controller

    void (async () => {
      try {
        const handle = await playTakeWithVoiceFx(take.audioUrl, take.fxPresetId, {
          paramsOverride: take.fxParamsOverride,
          signal: controller.signal,
          onEnded: () => {
            if (
              !controller.signal.aborted
              && generation === playbackGenerationRef.current
            ) {
              setCurrentlyPlayingId(null)
            }
          },
        })
        if (controller.signal.aborted || generation !== playbackGenerationRef.current) {
          handle.stop()
          return
        }
        playbackHandleRef.current = handle
        await handle.promise
      } catch {
        if (
          !controller.signal.aborted
          && generation === playbackGenerationRef.current
        ) {
          setCurrentlyPlayingId(null)
        }
      } finally {
        if (playbackAbortRef.current === controller) {
          playbackAbortRef.current = null
          playbackHandleRef.current = null
        }
      }
    })()
  }, [stopPlayback])

  const triggerTake = useCallback((takeId: string) => {
    const take = takes.find((t) => t.id === takeId)
    if (!take) return
    if (currentlyPlayingId === takeId) {
      stopPlayback()
      return
    }
    playTake(take)
  }, [currentlyPlayingId, playTake, stopPlayback, takes])

  const togglePlay = triggerTake

  const setTakeFxPreset = useCallback((takeId: string, presetId: string) => {
    setTakes((prev) => prev.map((take) => (
      take.id === takeId ? { ...take, fxPresetId: presetId } : take
    )))
    if (currentlyPlayingId === takeId) stopPlayback()
  }, [currentlyPlayingId, stopPlayback])

  const setTakeFxOverride = useCallback((takeId: string, params: Partial<VoiceFxParams> | undefined) => {
    setTakes((prev) => prev.map((take) => (
      take.id === takeId ? { ...take, fxParamsOverride: params } : take
    )))
    if (currentlyPlayingId === takeId) stopPlayback()
  }, [currentlyPlayingId, stopPlayback])

  const applyFxPreset = useCallback((input: {
    presetId: string
    target: 'selected' | 'default' | 'take'
    takeId?: string
  }) => {
    if (input.target === 'default') {
      setDefaultFxPresetId(input.presetId)
      return
    }
    const takeId = input.target === 'take' && input.takeId
      ? input.takeId
      : selectedTakeId ?? takes[0]?.id
    if (takeId) setTakeFxPreset(takeId, input.presetId)
  }, [selectedTakeId, setTakeFxPreset, takes])

  const startMixerPreview = useCallback((take: PealVoiceTake, restart = false) => {
    if (restart) {
      playbackHandleRef.current?.stop()
      playbackAbortRef.current?.abort()
      playbackHandleRef.current = null
      playbackAbortRef.current = null
      playbackGenerationRef.current += 1
    } else {
      stopPlayback()
    }

    mixerPreviewActiveRef.current = true
    const generation = playbackGenerationRef.current
    setCurrentlyPlayingId(take.id)
    setSelectedTakeId(take.id)

    const controller = new AbortController()
    playbackAbortRef.current = controller

    void (async () => {
      try {
        const handle = await playTakeWithVoiceFx(take.audioUrl, mixerGenreRef.current, {
          paramsOverride: mixerKnobOverridesRef.current,
          signal: controller.signal,
          onEnded: () => {
            if (
              !controller.signal.aborted
              && generation === playbackGenerationRef.current
            ) {
              mixerPreviewActiveRef.current = false
              setCurrentlyPlayingId(null)
            }
          },
        })
        if (controller.signal.aborted || generation !== playbackGenerationRef.current) {
          handle.stop()
          return
        }
        playbackHandleRef.current = handle
        await handle.promise
      } catch {
        if (
          !controller.signal.aborted
          && generation === playbackGenerationRef.current
        ) {
          mixerPreviewActiveRef.current = false
          setCurrentlyPlayingId(null)
        }
      } finally {
        if (playbackAbortRef.current === controller) {
          playbackAbortRef.current = null
          playbackHandleRef.current = null
        }
      }
    })()
  }, [stopPlayback])

  useEffect(() => {
    if (!currentlyPlayingIdRef.current) return

    if (previewRestartTimerRef.current) clearTimeout(previewRestartTimerRef.current)
    previewRestartTimerRef.current = setTimeout(() => {
      const takeId = currentlyPlayingIdRef.current
      if (!takeId) return
      const take = takesRef.current.find((t) => t.id === takeId)
      if (take) startMixerPreview(take, true)
    }, 42)

    return () => {
      if (previewRestartTimerRef.current) {
        clearTimeout(previewRestartTimerRef.current)
        previewRestartTimerRef.current = null
      }
    }
  }, [mixerGenreId, mixerKnobOverrides, startMixerPreview])

  const loadMixerGenre = useCallback((genreId: string) => {
    setMixerGenreId(genreId)
    setMixerKnobOverrides(undefined)
    if (selectedTakeId) patchClipFx(selectedTakeId, genreId, undefined)
  }, [patchClipFx, selectedTakeId])

  const setMixerKnob = useCallback((params: Partial<VoiceFxParams>) => {
    setMixerKnobOverrides((prev) => {
      const next = { ...(prev ?? {}), ...params }
      if (selectedTakeId) patchClipFx(selectedTakeId, mixerGenreRef.current, next)
      return next
    })
  }, [patchClipFx, selectedTakeId])

  const resetMixerKnobs = useCallback(() => {
    setMixerKnobOverrides(undefined)
    if (selectedTakeId) patchClipFx(selectedTakeId, mixerGenreRef.current, undefined)
  }, [patchClipFx, selectedTakeId])

  const applyMixerToClip = useCallback((takeId?: string) => {
    const id = takeId ?? selectedTakeId
    if (!id) return
    patchClipFx(id, mixerGenreRef.current, mixerKnobOverridesRef.current)
  }, [patchClipFx, selectedTakeId])

  const previewClipThroughMixer = useCallback((takeId?: string) => {
    const id = takeId ?? selectedTakeId
    if (!id) return
    const take = takes.find((t) => t.id === id)
    if (!take) return
    if (currentlyPlayingId === id) {
      stopPlayback()
      return
    }
    startMixerPreview(take)
  }, [currentlyPlayingId, selectedTakeId, startMixerPreview, stopPlayback, takes])

  const previewClipWithMixerState = useCallback((
    state: { genreId: string; knobOverrides?: Partial<VoiceFxParams> },
    takeId?: string,
  ) => {
    const id = takeId ?? selectedTakeId
    if (!id) return
    const take = takes.find((t) => t.id === id)
    if (!take) return

    mixerGenreRef.current = state.genreId
    mixerKnobOverridesRef.current = state.knobOverrides
    setMixerGenreId(state.genreId)
    setMixerKnobOverrides(state.knobOverrides)

    const restart = currentlyPlayingId === id
    if (restart) {
      startMixerPreview(take, true)
      return
    }
    startMixerPreview(take)
  }, [currentlyPlayingId, selectedTakeId, startMixerPreview, takes])

  const previewTake = useCallback((takeId?: string) => {
    previewClipThroughMixer(takeId)
  }, [previewClipThroughMixer])

  const addClipToDeck = useCallback((clip: DeckClip) => {
    setTakes((prev) => [clip, ...prev.filter((c) => !(c.bank === clip.bank && c.slot === clip.slot))])
    setSelectedTakeId(clip.id)
    setTargetSlot(null)
  }, [])

  const generateFromScript = useCallback(async (text?: string) => {
    const payload = (text ?? script).trim()
    if (!payload || !activeProviderReady) return

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const response = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: payload,
          voice: selectedVoice,
          model: selectedModel,
          speed,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const parts = [errorData.error || 'Generation failed', errorData.hint].filter(Boolean)
        throw new Error(parts.join(' '))
      }

      const data = await response.json()
      const mimeType = data.mimeType ?? 'audio/mpeg'
      const audioBase64 = data.audio as string
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))],
        { type: mimeType },
      )
      const audioUrl = URL.createObjectURL(audioBlob)
      const trimmed = payload
      const slot = nextDeckSlot(takes, activeBank, targetSlot)
      if (slot == null) throw new Error('This bank is full — switch banks or delete a clip.')

      const newClip: DeckClip = {
        id: Date.now().toString(),
        source: 'tts',
        bank: activeBank,
        slot,
        label: soundboardLabel(trimmed),
        script: trimmed,
        model: selectedModel,
        voice: selectedVoice,
        speed,
        filename: generateTtsFilename(projectName, trimmed, selectedModel, selectedVoice),
        createdAt: new Date().toLocaleString(),
        mimeType,
        audioBase64,
        audioUrl,
        fxPresetId: defaultFxPresetId,
        fxParamsOverride: undefined,
      }

      addClipToDeck(newClip)
      setScript('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed'
      setGenerateError(message)
    } finally {
      setIsGenerating(false)
    }
  }, [
    script,
    selectedModel,
    selectedVoice,
    speed,
    projectName,
    activeProviderReady,
    defaultFxPresetId,
    takes,
    activeBank,
    targetSlot,
    addClipToDeck,
  ])

  const generateMusic = useCallback(async (prompt?: string) => {
    const payload = (prompt ?? musicPrompt).trim()
    if (!payload || !musicProviderReady) return

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: payload,
          model: musicModel,
          isInstrumental: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const parts = [errorData.error || 'Music generation failed', errorData.hint].filter(Boolean)
        throw new Error(parts.join(' '))
      }

      const data = await response.json()
      const mimeType = data.mimeType ?? 'audio/mpeg'
      const audioBase64 = data.audio as string
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))],
        { type: mimeType },
      )
      const audioUrl = URL.createObjectURL(audioBlob)
      const slot = nextDeckSlot(takes, activeBank, targetSlot)
      if (slot == null) throw new Error('This bank is full — switch banks or delete a clip.')

      const newClip: DeckClip = {
        id: Date.now().toString(),
        source: 'music',
        bank: activeBank,
        slot,
        label: soundboardLabel(payload),
        prompt: payload,
        model: data.model ?? musicModel,
        filename: generateMusicFilename(projectName, payload, data.model ?? musicModel),
        createdAt: new Date().toLocaleString(),
        mimeType,
        audioBase64,
        audioUrl,
        fxPresetId: defaultFxPresetId,
        fxParamsOverride: undefined,
      }

      addClipToDeck(newClip)
      setMusicPrompt('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Music generation failed'
      setGenerateError(message)
    } finally {
      setIsGenerating(false)
    }
  }, [
    musicPrompt,
    musicModel,
    musicProviderReady,
    takes,
    activeBank,
    targetSlot,
    projectName,
    defaultFxPresetId,
    addClipToDeck,
  ])

  const generateSfx = useCallback(async (brief?: string) => {
    const summary = (brief ?? sfxBrief).trim()
    if (!summary) return

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const rendered = await renderSfxProposalToBase64({
        summary,
        type: sfxType,
        duration: sfxDuration,
        frequency: sfxType === 'click' ? 1200 : sfxType === 'sweep' ? 440 : 880,
        waveform: sfxType === 'click' ? 'square' : 'sine',
      })
      const audioBlob = new Blob(
        [Uint8Array.from(atob(rendered.audioBase64), (c) => c.charCodeAt(0))],
        { type: rendered.mimeType },
      )
      const audioUrl = URL.createObjectURL(audioBlob)
      const slot = nextDeckSlot(takes, activeBank, targetSlot)
      if (slot == null) throw new Error('This bank is full — switch banks or delete a clip.')

      const newClip: DeckClip = {
        id: Date.now().toString(),
        source: 'sfx',
        bank: activeBank,
        slot,
        label: soundboardLabel(summary),
        prompt: summary,
        model: 'web-audio',
        filename: generateSfxFilename(projectName, summary, sfxType),
        createdAt: new Date().toLocaleString(),
        mimeType: rendered.mimeType,
        audioBase64: rendered.audioBase64,
        audioUrl,
        fxPresetId: defaultFxPresetId,
        fxParamsOverride: undefined,
      }

      addClipToDeck(newClip)
      setSfxBrief('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'SFX synthesis failed'
      setGenerateError(message)
    } finally {
      setIsGenerating(false)
    }
  }, [
    sfxBrief,
    sfxType,
    sfxDuration,
    takes,
    activeBank,
    targetSlot,
    projectName,
    defaultFxPresetId,
    addClipToDeck,
  ])

  const applySelectedFxAsDefault = useCallback(() => {
    setDefaultFxPresetId(mixerGenreId)
  }, [mixerGenreId])

  const importStarterMessageBeds = useCallback(async () => {
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
      const manifestRes = await fetch(`${basePath}/message-beds/manifest.json`)
      if (!manifestRes.ok) {
        throw new Error('Starter beds not found. Run pnpm seed:message-beds from the repo root.')
      }

      const manifest = await manifestRes.json() as {
        beds: Array<{
          id: string
          label: string
          file: string
          mimeType?: string
          musicPrompt?: string
          suggestedSpeech?: string
        }>
      }

      const bank = 1
      let slot = 0
      for (const bed of manifest.beds) {
        if (slot >= DECK_PADS_PER_BANK) break
        const audioRes = await fetch(`${basePath}${bed.file}`)
        if (!audioRes.ok) continue

        const bytes = new Uint8Array(await audioRes.arrayBuffer())
        let binary = ''
        for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
        const audioBase64 = btoa(binary)
        const mimeType = bed.mimeType ?? 'audio/mpeg'
        const audioUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }))

        addClipToDeck({
          id: `starter-bed-${bed.id}-${Date.now()}`,
          source: 'music',
          bank,
          slot,
          label: bed.label,
          prompt: bed.musicPrompt ?? bed.label,
          script: bed.suggestedSpeech,
          model: 'music-2.6-free',
          filename: `message-bed_${bed.id}.mp3`,
          createdAt: new Date().toLocaleString(),
          mimeType,
          audioBase64,
          audioUrl,
          fxPresetId: '',
          messageBedId: bed.id,
        })
        slot += 1
      }

      if (slot === 0) throw new Error('Could not load starter bed audio files.')
      setActiveBank(bank)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import message beds'
      setGenerateError(message)
    } finally {
      setIsGenerating(false)
    }
  }, [addClipToDeck])

  const hasMessagePair = useCallback((bedId: MessageBedId) => {
    const clips = takesRef.current
    return clips.some((c) => c.messageBedId === bedId && c.source === 'music')
      && clips.some((c) => c.messageBedId === bedId && c.source === 'tts')
  }, [])

  const captureMessagePair = useCallback(async (bedId: MessageBedId) => {
    const preset = getMessageBedPreset(bedId)
    if (!preset || !musicProviderReady || !activeProviderReady) return

    setIsGenerating(true)
    setGenerateError(null)

    const fxPresetId = preset.suggestedFxPresetId || defaultFxPresetId
    if (preset.suggestedFxPresetId) setDefaultFxPresetId(preset.suggestedFxPresetId)

    try {
      const bank = activeBank
      const clips = takesRef.current
      const bedSlot = nextDeckSlot(clips, bank, targetSlot)
      if (bedSlot == null) throw new Error('This bank is full — switch banks or delete a clip.')

      const speechSlot = bedSlot + 1
      if (
        speechSlot >= DECK_PADS_PER_BANK
        || clips.some((c) => c.bank === bank && c.slot === speechSlot)
      ) {
        throw new Error('Need two adjacent empty pads for bed + speech.')
      }

      const musicResponse = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: preset.musicPrompt,
          model: musicModel,
          isInstrumental: true,
        }),
      })

      if (!musicResponse.ok) {
        const errorData = await musicResponse.json().catch(() => ({}))
        const parts = [errorData.error || 'Music generation failed', errorData.hint].filter(Boolean)
        throw new Error(parts.join(' '))
      }

      const musicData = await musicResponse.json()
      const musicMime = musicData.mimeType ?? 'audio/mpeg'
      const musicBase64 = musicData.audio as string
      const musicBlob = new Blob(
        [Uint8Array.from(atob(musicBase64), (c) => c.charCodeAt(0))],
        { type: musicMime },
      )
      const musicUrl = URL.createObjectURL(musicBlob)

      const bedClip: DeckClip = {
        id: `bed-${bedId}-${Date.now()}`,
        source: 'music',
        bank,
        slot: bedSlot,
        label: `${preset.label} bed`,
        prompt: preset.musicPrompt,
        script: preset.suggestedSpeech,
        model: musicData.model ?? musicModel,
        filename: `message-bed_${bedId}.mp3`,
        createdAt: new Date().toLocaleString(),
        mimeType: musicMime,
        audioBase64: musicBase64,
        audioUrl: musicUrl,
        fxPresetId: '',
        messageBedId: bedId,
      }
      addClipToDeck(bedClip)

      const ttsResponse = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: preset.suggestedSpeech,
          voice: selectedVoice,
          model: selectedModel,
          speed,
        }),
      })

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json().catch(() => ({}))
        const parts = [errorData.error || 'Speech generation failed', errorData.hint].filter(Boolean)
        throw new Error(parts.join(' '))
      }

      const ttsData = await ttsResponse.json()
      const ttsMime = ttsData.mimeType ?? 'audio/mpeg'
      const ttsBase64 = ttsData.audio as string
      const ttsBlob = new Blob(
        [Uint8Array.from(atob(ttsBase64), (c) => c.charCodeAt(0))],
        { type: ttsMime },
      )
      const ttsUrl = URL.createObjectURL(ttsBlob)

      const speechClip: DeckClip = {
        id: `speech-${bedId}-${Date.now()}`,
        source: 'tts',
        bank,
        slot: speechSlot,
        label: `${preset.label} voice`,
        script: preset.suggestedSpeech,
        model: selectedModel,
        voice: selectedVoice,
        speed,
        filename: generateTtsFilename(projectName, preset.suggestedSpeech, selectedModel, selectedVoice),
        createdAt: new Date().toLocaleString(),
        mimeType: ttsMime,
        audioBase64: ttsBase64,
        audioUrl: ttsUrl,
        fxPresetId,
        messageBedId: bedId,
      }
      addClipToDeck(speechClip)
      setScript('')
      setMusicPrompt('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Message pair capture failed'
      setGenerateError(message)
    } finally {
      setIsGenerating(false)
    }
  }, [
    activeBank,
    activeProviderReady,
    addClipToDeck,
    defaultFxPresetId,
    musicModel,
    musicProviderReady,
    projectName,
    selectedModel,
    selectedVoice,
    speed,
    targetSlot,
  ])

  const previewMessagePair = useCallback((bedId: MessageBedId) => {
    const clips = takesRef.current
    const bedTake = clips.find((c) => c.messageBedId === bedId && c.source === 'music')
    const speechTake = clips.find((c) => c.messageBedId === bedId && c.source === 'tts')
    if (!bedTake || !speechTake) return

    stopPlayback()
    const generation = playbackGenerationRef.current
    setCurrentlyPlayingId(speechTake.id)
    setSelectedTakeId(speechTake.id)

    const controller = new AbortController()
    playbackAbortRef.current = controller

    void (async () => {
      try {
        const bedHandle = await playTakeWithVoiceFx(bedTake.audioUrl, '', {
          paramsOverride: { outputGain: 0.22, wetMix: 0 },
          signal: controller.signal,
        })
        const speechHandle = await playTakeWithVoiceFx(speechTake.audioUrl, speechTake.fxPresetId, {
          paramsOverride: speechTake.fxParamsOverride,
          signal: controller.signal,
          onEnded: () => {
            if (
              !controller.signal.aborted
              && generation === playbackGenerationRef.current
            ) {
              setCurrentlyPlayingId(null)
            }
          },
        })

        if (controller.signal.aborted || generation !== playbackGenerationRef.current) {
          bedHandle.stop()
          speechHandle.stop()
          return
        }

        playbackBedHandleRef.current = bedHandle
        playbackHandleRef.current = speechHandle
        await speechHandle.promise
      } catch {
        if (
          !controller.signal.aborted
          && generation === playbackGenerationRef.current
        ) {
          setCurrentlyPlayingId(null)
        }
      } finally {
        if (playbackAbortRef.current === controller) {
          playbackAbortRef.current = null
          playbackHandleRef.current = null
          playbackBedHandleRef.current = null
        }
      }
    })()
  }, [stopPlayback])

  const captureToDeck = useCallback(async () => {
    if (captureSource === 'music') await generateMusic()
    else if (captureSource === 'sfx') await generateSfx()
    else await generateFromScript()
  }, [captureSource, generateFromScript, generateMusic, generateSfx])

  const generate = useCallback(async () => {
    await captureToDeck()
  }, [captureToDeck])

  useEffect(() => () => {
    playbackAbortRef.current?.abort()
    playbackHandleRef.current?.stop()
  }, [])

  const downloadTake = useCallback((take: PealVoiceTake) => {
    const link = document.createElement('a')
    link.href = take.audioUrl
    link.download = take.filename
    link.click()
  }, [])

  const copyFilename = useCallback((filename: string) => {
    void navigator.clipboard.writeText(filename)
  }, [])

  const deleteTake = useCallback((id: string) => {
    setTakes((prev) => prev.filter((t) => t.id !== id))
    if (selectedTakeId === id) setSelectedTakeId(null)
    if (currentlyPlayingId === id) stopPlayback()
  }, [currentlyPlayingId, selectedTakeId, stopPlayback])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!isGenerating && captureReady) {
          const hasInput = captureSource === 'music'
            ? musicPrompt.trim()
            : captureSource === 'sfx'
              ? sfxBrief.trim()
              : script.trim()
          if (hasInput) void captureToDeck()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [captureReady, captureSource, captureToDeck, isGenerating, musicPrompt, script, sfxBrief])

  const value = useMemo<PealVoiceContextValue>(() => ({
    projectName,
    setProjectName,
    script,
    setScript,
    selectedModel,
    setSelectedModel,
    selectedVoice,
    setSelectedVoice,
    speed,
    setSpeed,
    defaultFxPresetId,
    setDefaultFxPresetId,
    mixerGenreId,
    mixerKnobOverrides,
    loadMixerGenre,
    setMixerKnob,
    resetMixerKnobs,
    applyMixerToClip,
    previewClipThroughMixer,
    previewClipWithMixerState,
    captureSource,
    setCaptureSource,
    musicPrompt,
    setMusicPrompt,
    musicModel,
    sfxBrief,
    setSfxBrief,
    sfxType,
    setSfxType,
    sfxDuration,
    setSfxDuration,
    activeBank,
    setActiveBank,
    targetSlot,
    setTargetSlot,
    deckSlots,
    musicProviderReady,
    captureReady,
    takes,
    selectedTakeId,
    setSelectedTakeId,
    currentlyPlayingId,
    isGenerating,
    generateError,
    providerBanner,
    activeProviderReady,
    isMac,
    selectedTake,
    generate,
    generateFromScript,
    generateMusic,
    generateSfx,
    captureToDeck,
    importStarterMessageBeds,
    captureMessagePair,
    previewMessagePair,
    hasMessagePair,
    applySelectedFxAsDefault,
    triggerTake,
    togglePlay,
    stopPlayback,
    setTakeFxPreset,
    setTakeFxOverride,
    applyFxPreset,
    previewTake,
    downloadTake,
    copyFilename,
    deleteTake,
  }), [
    projectName,
    script,
    selectedModel,
    setSelectedModel,
    selectedVoice,
    speed,
    defaultFxPresetId,
    mixerGenreId,
    mixerKnobOverrides,
    loadMixerGenre,
    setMixerKnob,
    resetMixerKnobs,
    applyMixerToClip,
    previewClipThroughMixer,
    previewClipWithMixerState,
    captureSource,
    musicPrompt,
    musicModel,
    activeBank,
    targetSlot,
    deckSlots,
    musicProviderReady,
    captureReady,
    takes,
    selectedTakeId,
    currentlyPlayingId,
    isGenerating,
    generateError,
    providerBanner,
    activeProviderReady,
    isMac,
    selectedTake,
    generate,
    generateFromScript,
    generateMusic,
    generateSfx,
    captureToDeck,
    importStarterMessageBeds,
    captureMessagePair,
    previewMessagePair,
    hasMessagePair,
    applySelectedFxAsDefault,
    triggerTake,
    togglePlay,
    stopPlayback,
    setTakeFxPreset,
    setTakeFxOverride,
    applyFxPreset,
    previewTake,
    downloadTake,
    copyFilename,
    deleteTake,
    setCaptureSource,
    setMusicPrompt,
    setActiveBank,
    setTargetSlot,
  ])

  return (
    <PealVoiceContext.Provider value={value}>
      {children}
    </PealVoiceContext.Provider>
  )
}

export function usePealVoice() {
  const context = useContext(PealVoiceContext)
  if (!context) {
    throw new Error('usePealVoice must be used inside PealVoiceProvider')
  }
  return context
}

export function useOptionalPealVoice() {
  return useContext(PealVoiceContext)
}