import { create } from 'zustand'
import type { SfxPatch } from '@/lib/sfx/patch'

/**
 * AI composition history for the SFX studio. Every AI turn that composes a
 * sound pushes a full patch; back/forward walk the list and re-apply in place.
 * Session-only: patches are small and re-render deterministically.
 */
interface CompositionState {
  history: SfxPatch[]
  index: number
  push: (patch: SfxPatch) => void
  go: (delta: number) => SfxPatch | null
  clear: () => void
}

export const useCompositionStore = create<CompositionState>((set, get) => ({
  history: [],
  index: -1,
  push: (patch) => set((s) => {
    const history = [...s.history.slice(0, s.index + 1), patch].slice(-50)
    return { history, index: history.length - 1 }
  }),
  go: (delta) => {
    const { history, index } = get()
    const next = index + delta
    if (next < 0 || next >= history.length) return null
    set({ index: next })
    return history[next]
  },
  clear: () => set({ history: [], index: -1 }),
}))

export function currentComposition(): SfxPatch | null {
  const { history, index } = useCompositionStore.getState()
  return history[index] ?? null
}
