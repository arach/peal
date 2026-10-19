import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SfxPatch } from '@/lib/sfx/patch'

/**
 * Named sound sets — a group of AI compositions saved together (e.g. "Ebook
 * reader": open, page turn, close…). Patches are small JSON and re-render
 * deterministically, so a set is just names + patches, persisted locally.
 */
export interface SoundSetEntry {
  id: string
  name: string
  patch: SfxPatch
  savedAt: string
}

export interface SoundSet {
  id: string
  name: string
  createdAt: string
  sounds: SoundSetEntry[]
}

interface SoundSetState {
  sets: SoundSet[]
  activeSetId: string | null
  createSet: (name: string) => string
  setActive: (id: string) => void
  /** Add to the active set (creating one when none exists). Same summary replaces. */
  saveToActive: (patch: SfxPatch, name?: string) => { setName: string; replaced: boolean }
  removeSound: (setId: string, soundId: string) => void
}

const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const useSoundSetStore = create<SoundSetState>()(
  persist(
    (set, get) => ({
      sets: [],
      activeSetId: null,
      createSet: (name) => {
        const newSet: SoundSet = { id: id(), name: name.trim() || 'Untitled set', createdAt: new Date().toISOString(), sounds: [] }
        set((s) => ({ sets: [...s.sets, newSet], activeSetId: newSet.id }))
        return newSet.id
      },
      setActive: (setId) => set({ activeSetId: setId }),
      saveToActive: (patch, name) => {
        let { activeSetId } = get()
        if (!activeSetId || !get().sets.some((s) => s.id === activeSetId)) {
          activeSetId = get().createSet('Untitled set')
        }
        const soundName = (name ?? patch.summary).trim() || 'Untitled sound'
        let replaced = false
        let setName = ''
        set((s) => ({
          sets: s.sets.map((existing) => {
            if (existing.id !== activeSetId) return existing
            setName = existing.name
            const entry: SoundSetEntry = { id: id(), name: soundName, patch, savedAt: new Date().toISOString() }
            const index = existing.sounds.findIndex((e) => e.name === soundName)
            replaced = index !== -1
            const sounds = replaced
              ? existing.sounds.map((e, i) => (i === index ? { ...entry, id: e.id } : e))
              : [...existing.sounds, entry]
            return { ...existing, sounds }
          }),
        }))
        return { setName, replaced }
      },
      removeSound: (setId, soundId) => set((s) => ({
        sets: s.sets.map((existing) => existing.id === setId
          ? { ...existing, sounds: existing.sounds.filter((e) => e.id !== soundId) }
          : existing),
      })),
    }),
    { name: 'peal-sound-sets' },
  ),
)

/** Portable file shape shared by export and the set generator script. */
export function soundSetToJson(soundSet: SoundSet): string {
  return JSON.stringify({
    version: 1,
    kind: 'peal-sfx-set',
    name: soundSet.name,
    sounds: soundSet.sounds.map(({ name, patch }) => ({ name, patch })),
  }, null, 2)
}
