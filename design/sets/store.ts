'use client'

import { create } from 'zustand'
import type { SfxPatch } from '@/lib/sfx/patch'
import { bake, derive, neutralMix, type PatchMix } from './mix'
import { composeSound, isSingleSoundPrompt } from './composeClient'
import ebook from './ebookReader.json'

/**
 * Sound Sets session state, shared by the three panes (sidebar, thread,
 * pages) so they can live in separate shell slots. The agent is scripted;
 * every sound is a real patch from the ebook-reader run.
 */
export type SetsStage = 'start' | 'plan' | 'composing' | 'detail' | 'export'

export interface SetSound {
  key: string
  name: string
  trigger: string
  prompt: string
  versions: SfxPatch[]
}

export const SOUNDS = ebook.sounds as unknown as SetSound[]
export const SET_BRIEF = ebook.brief
export const SET_PROJECT = ebook.project

export type Message =
  | { id: string; role: 'user'; text: string }
  | {
      id: string
      role: 'agent'
      text: string
      card?: 'plan' | 'composing' | 'export' | 'sound'
      /** card 'sound': the one sound this turn composed or refined. */
      soundKey?: string
      /** card 'sound': the version this turn produced (earlier turns stay pinned to theirs). */
      version?: number
      chips?: string[]
    }

export interface CardState {
  version: number
  vary: boolean
  kept: boolean
  /** Versions kept from mixer edits, after the composed ones. */
  extra: SfxPatch[]
  /** Unsaved mixer edits, per version index. */
  mixes: Record<number, PatchMix>
  /** Hear the version without its edits. */
  bypass: boolean
}

export const versionsOf = (sound: SetSound, state: CardState) => [...sound.versions, ...state.extra]
export const basePatch = (sound: SetSound, state: CardState) => versionsOf(sound, state)[state.version]
export const mixOf = (sound: SetSound, state: CardState) => state.mixes[state.version] ?? neutralMix(basePatch(sound, state))
/** What every player for this sound plays. */
export const livePatch = (sound: SetSound, state: CardState) =>
  state.bypass ? basePatch(sound, state) : derive(basePatch(sound, state), state.mixes[state.version])

export const PROJECTS = [
  { name: 'Ebook reader', conversations: ['New sound set', 'Page turn variants'] },
  { name: 'Checkout flow', conversations: ['Payment success'] },
  { name: 'Meditation timer', conversations: ['Bell & interval cues'] },
]

/** First is the scripted set (sends the full brief); the rest compose live. */
export const STARTERS = [
  'Sounds for an ebook reader app',
  'A soft pop for a new chat message',
  'A hardcover book opening, pages fanning',
]

const PLAN_REPLY = 'Here\'s a plan for the ebook reader. One shared palette keeps the set coherent; untick anything you don\'t need, or reply to change it.'
const DONE_CHIPS = ['Make page turns a touch softer', 'Review & export']
const done = (n: number) => `All ${n} are in. Open any card to inspect it on the right; ask for changes here and I'll recompose in place — previous versions stay on each card.`
const EXPORT_REPLY = 'Here\'s the set as it stands — balance first, then the package.'

const uid = () => Math.random().toString(36).slice(2, 9)

function initialMessages(stage: SetsStage): Message[] {
  if (stage === 'start') return []
  const msgs: Message[] = [
    { id: 'u1', role: 'user', text: ebook.brief },
    { id: 'a1', role: 'agent', text: PLAN_REPLY, card: 'plan' },
  ]
  if (stage === 'plan') return msgs
  msgs.push({ id: 'a2', role: 'agent', text: `Composing ${SOUNDS.length} sounds with the shared palette.`, card: 'composing' })
  if (stage === 'composing') return msgs
  msgs.push({ id: 'a3', role: 'agent', text: done(SOUNDS.length), chips: DONE_CHIPS })
  if (stage === 'detail') return msgs
  msgs.push({ id: 'u2', role: 'user', text: 'Review & export' })
  msgs.push({ id: 'a4', role: 'agent', text: EXPORT_REPLY, card: 'export' })
  return msgs
}

const freshCard = (s: SetSound): CardState => ({ version: Math.max(0, s.versions.length - 1), vary: true, kept: false, extra: [], mixes: {}, bypass: false })
const freshCards = (): Record<string, CardState> => Object.fromEntries(SOUNDS.map((s) => [s.key, freshCard(s)]))

/** Short sound name from a one-line prompt: "a soft bubble pop" → "Soft bubble pop". */
function nameFromPrompt(text: string) {
  const t = text.trim().replace(/^(make|design|create|give me|i need|compose)\s+/i, '').replace(/^(an?|the)\s+/i, '').replace(/[.!?]+$/, '')
  const short = t.split(/\s+/).slice(0, 5).join(' ')
  return short.charAt(0).toUpperCase() + short.slice(1)
}

interface SetsState {
  booted: boolean
  stage: SetsStage
  messages: Message[]
  selected: Set<string>
  ready: Set<string>
  thinking: boolean
  draft: string
  tabs: string[]
  activeTab: string | null
  split: boolean
  cards: Record<string, CardState>
  /** Every sound in this session: the scripted set plus anything composed live. */
  sounds: SetSound[]
  /** Single-sound conversation: the sound each turn refines. */
  focusKey: string | null
  /** Live agent status line while a real compose runs. */
  status: string | null

  boot: (stage: SetsStage) => void
  reset: () => void
  setDraft: (draft: string) => void
  send: (text: string) => void
  compose: () => void
  toggleSelected: (key: string) => void
  openTab: (key: string) => void
  closeTab: (key: string) => void
  setActiveTab: (key: string) => void
  setSplit: (split: boolean) => void
  updateCard: (key: string, patch: Partial<CardState>) => void
  setMix: (key: string, mix: PatchMix) => void
  resetMix: (key: string) => void
  keepMix: (key: string) => void
}

let timers: number[] = []
const later = (ms: number, fn: () => void) => { timers.push(window.setTimeout(fn, ms)) }
const clearTimers = () => { timers.forEach((t) => window.clearTimeout(t)); timers = [] }

function stageState(stage: SetsStage) {
  return {
    stage,
    messages: initialMessages(stage),
    selected: new Set(SOUNDS.map((s) => s.key)),
    // A forced "composing" screen shows the set mid-stream.
    ready: stage === 'start' || stage === 'plan'
      ? new Set<string>()
      : new Set(SOUNDS.slice(0, stage === 'composing' ? 3 : SOUNDS.length).map((s) => s.key)),
    thinking: false,
    draft: '',
    tabs: stage === 'detail' ? ['page-forward', 'page-back'] : [],
    activeTab: stage === 'detail' ? 'page-forward' : null,
    split: stage === 'detail',
    cards: freshCards(),
    sounds: SOUNDS,
    focusKey: null as string | null,
    status: null as string | null,
  }
}

export const useSets = create<SetsState>()((set, get) => {
  const agentSays = (msg: Omit<Extract<Message, { role: 'agent' }>, 'id' | 'role'>, delay = 900) => {
    set({ thinking: true })
    later(delay, () => set((s) => ({ thinking: false, messages: [...s.messages, { id: uid(), role: 'agent', ...msg }] })))
  }

  /** A real compose turn through the AI route; each turn is a new version. */
  const composeLive = async (text: string) => {
    let key = get().focusKey
    const refining = !!key
    if (!key) {
      const fresh = `sound-${uid()}`
      key = fresh
      const sound: SetSound = { key: fresh, name: nameFromPrompt(text), trigger: text, prompt: text, versions: [] }
      set((s) => ({
        stage: 'composing',
        focusKey: fresh,
        sounds: [...s.sounds, sound],
        selected: new Set([fresh]),
        cards: { ...s.cards, [fresh]: freshCard(sound) },
      }))
    }
    const soundKey = key
    const before = get().sounds.find((x) => x.key === soundKey)!
    const card = get().cards[soundKey]
    const current = before.versions.length ? livePatch(before, card) : undefined
    set((s) => ({
      thinking: true,
      status: refining ? 'Reworking the sound…' : 'Starting a Codex session via Scout…',
      ...(refining ? {} : { messages: [...s.messages, { id: uid(), role: 'agent', text: 'Composing it now.', card: 'sound', soundKey }] }),
    }))
    const turns = get().messages
      .filter((m) => m.role === 'user')
      .map((m) => ({ role: 'user' as const, text: m.text }))
    try {
      const { text: reply, patch } = await composeSound({
        turns,
        composition: current,
        onStatus: (line) => set({ status: line }),
      })
      if (!patch) throw new Error(reply || 'The agent replied without composing a sound.')
      set((s) => {
        const sound = s.sounds.find((x) => x.key === soundKey)!
        const versions = [...sound.versions, patch]
        const next = { ...sound, versions, name: sound.versions.length ? sound.name : nameFromPrompt(patch.summary) || sound.name }
        const c = s.cards[soundKey]
        return {
          thinking: false,
          status: null,
          stage: 'detail',
          sounds: s.sounds.map((x) => (x.key === soundKey ? next : x)),
          ready: new Set(s.ready).add(soundKey),
          // Composed versions come before mixer-kept ones; land on the new take.
          cards: { ...s.cards, [soundKey]: { ...c, version: versions.length - 1, mixes: {}, bypass: false } },
          messages: [
            // The first card shows v1 once it lands.
            ...s.messages.map((m) => (m.role === 'agent' && m.card === 'sound' && m.soundKey === soundKey && m.version === undefined
              ? { ...m, version: versions.length - 1 }
              : m)),
            {
              id: uid(),
              role: 'agent',
              text: reply || (refining ? `Here's v${versions.length}.` : `Here's ${next.name.toLowerCase()}.`),
              card: refining ? 'sound' : undefined,
              soundKey: refining ? soundKey : undefined,
              version: refining ? versions.length - 1 : undefined,
              chips: refining ? undefined : ['Softer', 'Brighter and shorter', 'More texture'],
            },
          ],
        }
      })
    } catch (err) {
      set((s) => ({
        thinking: false,
        status: null,
        messages: [...s.messages, { id: uid(), role: 'agent', text: `Couldn't compose that: ${err instanceof Error ? err.message : String(err)}. Try again, or rephrase.` }],
      }))
    }
  }

  return {
    booted: false,
    ...stageState('start'),

    boot: (stage) => {
      if (get().booted) return
      set({ booted: true, ...stageState(stage) })
    },
    reset: () => {
      clearTimers()
      set({ ...stageState('start'), booted: true })
    },
    setDraft: (draft) => set({ draft }),

    send: (text) => {
      const t = text.trim()
      const { thinking, stage } = get()
      if (!t || thinking) return
      set((s) => ({ draft: '', messages: [...s.messages, { id: uid(), role: 'user', text: t }] }))
      // One thing in, one sound out — composed live, then refined in place.
      if (get().focusKey || (stage === 'start' && isSingleSoundPrompt(t))) {
        void composeLive(t)
        return
      }
      if (stage === 'start') {
        set({ stage: 'plan' })
        agentSays({ text: PLAN_REPLY, card: 'plan' }, 1400)
        return
      }
      if (/export|review|package|download/i.test(t)) {
        set({ stage: 'export' })
        agentSays({ text: EXPORT_REPLY, card: 'export' })
        return
      }
      const mentioned = get().sounds.filter((s) => t.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) || t.includes(`@${s.key}`))
      agentSays({
        text: mentioned.length
          ? `Prototype note: in the live build I'd recompose ${mentioned.map((s) => s.name).join(', ')} in place as a new version on ${mentioned.length === 1 ? 'its card' : 'their cards'}.`
          : 'Prototype note: in the live build this turn recomposes the sounds it names (or the whole set) as new versions on their cards.',
      })
    },

    compose: () => {
      const { selected } = get()
      const keys = get().sounds.filter((s) => selected.has(s.key)).map((s) => s.key)
      set((s) => ({
        stage: 'composing',
        messages: [...s.messages, { id: uid(), role: 'agent', text: `Composing ${keys.length} sounds with the shared palette.`, card: 'composing' }],
      }))
      keys.forEach((key, i) => later(700 + i * 650, () => set((s) => ({ ready: new Set(s.ready).add(key) }))))
      later(900 + keys.length * 650, () => {
        set({ stage: 'detail' })
        agentSays({ text: done(keys.length), chips: DONE_CHIPS }, 500)
      })
    },

    toggleSelected: (key) => set((s) => {
      const next = new Set(s.selected)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return { selected: next }
    }),

    openTab: (key) => set((s) => ({ tabs: s.tabs.includes(key) ? s.tabs : [...s.tabs, key], activeTab: key })),
    closeTab: (key) => set((s) => {
      const tabs = s.tabs.filter((k) => k !== key)
      return { tabs, activeTab: s.activeTab === key ? tabs[tabs.length - 1] ?? null : s.activeTab }
    }),
    setActiveTab: (key) => set({ activeTab: key }),
    setSplit: (split) => set({ split }),

    updateCard: (key, patch) => set((s) => ({ cards: { ...s.cards, [key]: { ...s.cards[key], ...patch } } })),
    setMix: (key, mix) => set((s) => {
      const card = s.cards[key]
      return { cards: { ...s.cards, [key]: { ...card, bypass: false, mixes: { ...card.mixes, [card.version]: mix } } } }
    }),
    resetMix: (key) => set((s) => {
      const card = s.cards[key]
      const mixes = { ...card.mixes }
      delete mixes[card.version]
      return { cards: { ...s.cards, [key]: { ...card, bypass: false, mixes } } }
    }),
    keepMix: (key) => set((s) => {
      const sound = s.sounds.find((x) => x.key === key)!
      const card = s.cards[key]
      const mix = card.mixes[card.version]
      if (!mix) return {}
      const kept = { ...bake(basePatch(sound, card), mix), summary: `${basePatch(sound, card).summary} (mixed)` }
      const mixes = { ...card.mixes }
      delete mixes[card.version]
      const extra = [...card.extra, kept]
      return { cards: { ...s.cards, [key]: { ...card, extra, mixes, bypass: false, version: sound.versions.length + extra.length - 1 } } }
    }),
  }
})

export function stageFromLocation(): SetsStage {
  if (typeof window === 'undefined') return 'start'
  const q = new URLSearchParams(window.location.search).get('stage') as SetsStage | null
  return q && ['start', 'plan', 'composing', 'detail', 'export'].includes(q) ? q : 'start'
}

/** Shell transport: play/pause the sound on the active page (or the first). */
export async function toggleSetsPlayback() {
  const { getActive, pauseTake, startTake, takeFor } = await import('./audio')
  const { activeTab, ready, cards, sounds } = useSets.getState()
  const key = activeTab ?? sounds.find((s) => ready.has(s.key))?.key
  if (!key) return
  const active = getActive()
  if (active?.id === key && active.playing) {
    pauseTake()
    return
  }
  if (active?.id === key && active.offset > 0) {
    await startTake(key, active.buffer, active.offset)
    return
  }
  const sound = sounds.find((s) => s.key === key)!
  await startTake(key, await takeFor(livePatch(sound, cards[key]), cards[key].vary), 0)
}
