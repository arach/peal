'use client'

/**
 * Sound Sets — conversation-first Peal.
 *
 * Three panes over one store (store.ts): SetsSidebar (projects,
 * conversations, sounds), SetsThread (chat history + composer, sounds inline
 * as cards with a player and toggles) and SetsPages (pages spun up from cards:
 * the studio player plus the mixer). In the studio they mount in the Hudson
 * shell's left panel, content and inspector; `SoundSetsApp` lays them out
 * standalone for /design/sets and Flows embeds.
 *
 * The agent is scripted; every sound is a real patch from the ebook-reader
 * run, rendered and played live.
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { downloadBlob, encodeWav, slugify } from '@/lib/sfx/wav'
import { loudnessDb, renderCached } from './audio'
import { FullPlayer, InlinePlayer } from './Player'
import { MixRack } from './MixRack'
import {
  livePatch,
  PROJECTS,
  SET_BRIEF,
  SET_PROJECT,
  SOUNDS,
  STARTERS,
  stageFromLocation,
  useSets,
  versionsOf,
  type CardState,
  type SetSound,
  type SetsStage,
} from './store'
import ebook from './ebookReader.json'
import '@/styles/studio-instruments.css'
import './sets.css'

export type { SetsStage } from './store'

// ── Cards ──────────────────────────────────────────────────────────────────

function Toggle({ on, onChange, children, title }: { on: boolean; onChange: (v: boolean) => void; children: ReactNode; title?: string }) {
  return (
    <button type="button" title={title} className={`pss-toggle ${on ? 'is-on' : ''}`} onClick={() => onChange(!on)}>
      {children}
    </button>
  )
}

function SoundCard({ sound, state, ready, status, pinned, onUpdate, onOpen }: {
  sound: SetSound
  state: CardState
  ready: boolean
  status?: string | null
  /** An earlier turn's take: show that version as it was, not the live one. */
  pinned?: number
  onUpdate: (patch: Partial<CardState>) => void
  onOpen: () => void
}) {
  const versions = versionsOf(sound, state)
  const isPinned = pinned !== undefined && pinned !== state.version
  const patch = !versions.length ? null : isPinned ? versions[pinned] : livePatch(sound, state)
  const hasPrev = versions.length > 1 && !isPinned
  const edited = !!state.mixes[state.version]
  return (
    <div className={`pss-card ${ready ? '' : 'is-pending'}`}>
      <div className="pss-card-head">
        <div className="min-w-0">
          <p className="pss-card-name">{sound.name}</p>
          <p className="pss-card-sub">{sound.trigger}</p>
        </div>
        {ready && patch ? <span className="pss-card-meta">{isPinned ? <span>v{pinned + 1} · </span> : null}{edited && !isPinned ? <span className="pss-edited">edited · </span> : null}{Math.round(patch.duration * 1000)}ms · {patch.layers.length} layers</span> : null}
      </div>
      {ready && patch ? (
        <>
          <InlinePlayer id={isPinned ? `${sound.key}@${pinned}` : sound.key} patch={patch} vary={state.vary} />
          <div className="pss-card-tools">
            {patch.variation ? (
              <Toggle on={state.vary} onChange={(vary) => onUpdate({ vary })} title="Humanize each play">Vary</Toggle>
            ) : null}
            {hasPrev ? (
              <Toggle
                on={state.version === 0}
                onChange={(prev) => onUpdate({ version: prev ? 0 : versions.length - 1 })}
                title="A/B against the previous version"
              >
                {state.version === 0 ? 'A · v1' : `B · v${state.version + 1}`}
              </Toggle>
            ) : null}
            <Toggle on={state.kept} onChange={(kept) => onUpdate({ kept })} title="Keep this take">
              {state.kept ? '★ Kept' : '☆ Keep'}
            </Toggle>
            <button type="button" className="pss-link" onClick={onOpen}>Open ↗</button>
          </div>
        </>
      ) : (
        <div className="pss-card-pending"><span className="pss-dot-pulse" /> {status ?? 'Composing…'}</div>
      )}
    </div>
  )
}

// ── Plan / export cards ────────────────────────────────────────────────────

function PlanCard({ selected, onToggle, onCompose, locked }: {
  selected: Set<string>
  onToggle: (key: string) => void
  onCompose: () => void
  locked: boolean
}) {
  return (
    <div className="pss-panel">
      <p className="pss-eyebrow">Sound palette</p>
      <dl className="pss-palette">
        {ebook.palette.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      <p className="pss-eyebrow mt-4">Sounds · {selected.size} of {SOUNDS.length}</p>
      <ul className="pss-slots">
        {SOUNDS.map((s) => (
          <li key={s.key}>
            <label>
              <input type="checkbox" checked={selected.has(s.key)} disabled={locked} onChange={() => onToggle(s.key)} />
              <span className="pss-slot-name">{s.name}</span>
              <span className="pss-slot-trigger">{s.trigger}</span>
            </label>
          </li>
        ))}
      </ul>
      {locked ? null : (
        <div className="pss-panel-actions">
          <button type="button" className="pss-primary" onClick={onCompose} disabled={selected.size === 0}>
            Compose {selected.size} sounds
          </button>
          <span className="pss-hint">or reply to change the plan</span>
        </div>
      )}
    </div>
  )
}

function ExportCard({ keys }: { keys: string[] }) {
  const states = useSets((s) => s.cards)
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [takes, setTakes] = useState(4)
  const all = useSets((s) => s.sounds)
  const sounds = useMemo(() => all.filter((s) => keys.includes(s.key)), [all, keys])

  useEffect(() => {
    let live = true
    Promise.all(sounds.map(async (s) => [s.key, loudnessDb(await renderCached(livePatch(s, states[s.key])))] as const))
      .then((pairs) => { if (live) setLevels(Object.fromEntries(pairs)) })
    return () => { live = false }
  }, [sounds, states])

  return (
    <div className="pss-panel">
      <p className="pss-eyebrow">Loudness balance</p>
      <ul className="pss-levels">
        {sounds.map((s) => {
          const db = levels[s.key]
          const pct = db === undefined ? 0 : Math.max(4, Math.min(100, ((db + 40) / 32) * 100))
          return (
            <li key={s.key}>
              <span className="pss-slot-name">{s.name}</span>
              <span className="pss-level"><span style={{ width: `${pct}%` }} /></span>
              <span className="pss-level-db">{db === undefined ? '…' : `${db.toFixed(1)} dB`}</span>
            </li>
          )
        })}
      </ul>
      <p className="pss-hint mt-2">All takes are peak-normalized today — a per-sound loudness target would let the bookmark sit quieter than the close.</p>
      <p className="pss-eyebrow mt-4">Package</p>
      <div className="pss-export-row">
        <span>Round-robin takes for varying sounds</span>
        <div className="pss-seg">
          {[1, 4, 6].map((n) => (
            <button key={n} type="button" className={takes === n ? 'is-on' : ''} onClick={() => setTakes(n)}>{n}</button>
          ))}
        </div>
      </div>
      <pre className="pss-code">peal add {slugify(ebook.project)}</pre>
      <div className="pss-panel-actions">
        <button
          type="button"
          className="pss-primary"
          onClick={async () => {
            for (const s of sounds) {
              const patch = livePatch(s, states[s.key])
              downloadBlob(encodeWav(await renderCached(patch)), `${slugify(ebook.project)}-${s.key}.wav`)
            }
          }}
        >
          Download WAV pack
        </button>
        <button
          type="button"
          className="pss-secondary"
          onClick={() => downloadBlob(new Blob([JSON.stringify({
            version: 1,
            kind: 'peal-sfx-set',
            name: ebook.project,
            sounds: sounds.map((s) => ({ name: s.name, key: s.key, patch: livePatch(s, states[s.key]) })),
          }, null, 2)], { type: 'application/json' }), `${slugify(ebook.project)}.peal-set.json`)}
        >
          Set JSON
        </button>
      </div>
    </div>
  )
}

// ── Right pane: pages spun up from cards ───────────────────────────────────

function SoundPage({ sound }: { sound: SetSound }) {
  const state = useSets((s) => s.cards[sound.key])
  const updateCard = useSets((s) => s.updateCard)
  const versions = versionsOf(sound, state)
  const patch = livePatch(sound, state)
  const onUpdate = (p: Partial<CardState>) => updateCard(sound.key, p)
  return (
    <div className="pss-page">
      <div className="pss-page-head">
        <div>
          <p className="pss-page-title">{sound.name}</p>
          <p className="pss-card-sub">{versions[state.version].summary}</p>
        </div>
        <div className="pss-stepper">
          <button type="button" disabled={state.version === 0} onClick={() => onUpdate({ version: state.version - 1 })} aria-label="Previous version">‹</button>
          <span>v{state.version + 1} of {versions.length}</span>
          <button type="button" disabled={state.version >= versions.length - 1} onClick={() => onUpdate({ version: state.version + 1 })} aria-label="Next version">›</button>
        </div>
      </div>
      <FullPlayer id={sound.key} patch={patch} vary={state.vary} />
      <div className="pss-card-tools">
        {patch.variation ? <Toggle on={state.vary} onChange={(vary) => onUpdate({ vary })}>Vary {Math.round(patch.variation * 100)}%</Toggle> : null}
        {patch.room ? <span className="pss-chip">Room {patch.room.size.toFixed(2)} · mix {patch.room.mix.toFixed(2)}</span> : <span className="pss-chip">Dry</span>}
        <span className="pss-chip">{Math.round(patch.duration * 1000)}ms</span>
      </div>
      <MixRack soundKey={sound.key} />
      {patch.notes ? <p className="pss-hint mt-3">{patch.notes}</p> : null}
    </div>
  )
}

// ── Panes ──────────────────────────────────────────────────────────────────

/** Boot the shared store once with a stage (prop, then ?stage=). */
export function useSetsBoot(stage?: SetsStage) {
  const boot = useSets((s) => s.boot)
  useEffect(() => { boot(stage ?? stageFromLocation()) }, [boot, stage])
}

export function SetsSidebar({ brand = false }: { brand?: boolean }) {
  const ready = useSets((s) => s.ready)
  const cards = useSets((s) => s.cards)
  const activeTab = useSets((s) => s.activeTab)
  const sounds = useSets((s) => s.sounds)
  const { reset, openTab } = useSets.getState()
  return (
    <aside className="pss-sidebar">
      {brand ? <div className="pss-brand"><span className="pss-brand-mark">◉</span> peal</div> : null}
      <button type="button" className="pss-new" onClick={reset}>＋ New set</button>
      <p className="pss-side-label">Projects</p>
      <nav className="pss-projects">
        {PROJECTS.map((p, pi) => (
          <div key={p.name} className="pss-project">
            <p className={`pss-project-name ${pi === 0 ? 'is-active' : ''}`}>{p.name}</p>
            {p.conversations.map((c, ci) => (
              <p key={c} className={`pss-convo ${pi === 0 && ci === 0 ? 'is-active' : ''}`}>{c}</p>
            ))}
            {pi === 0 && ready.size > 0 ? (
              <div className="pss-side-sounds">
                {sounds.filter((s) => ready.has(s.key)).map((s) => (
                  <button key={s.key} type="button" className={`pss-side-sound ${activeTab === s.key ? 'is-active' : ''}`} onClick={() => openTab(s.key)}>
                    <span className={`pss-dot ${cards[s.key].kept ? 'is-kept' : ''}`} />
                    {s.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
      <div className="pss-side-foot">
        <span className="pss-status-dot" /> Codex via Scout · ready
      </div>
    </aside>
  )
}

export function SetsThread() {
  const stage = useSets((s) => s.stage)
  const messages = useSets((s) => s.messages)
  const selected = useSets((s) => s.selected)
  const ready = useSets((s) => s.ready)
  const thinking = useSets((s) => s.thinking)
  const draft = useSets((s) => s.draft)
  const cards = useSets((s) => s.cards)
  const sounds = useSets((s) => s.sounds)
  const status = useSets((s) => s.status)
  const focusKey = useSets((s) => s.focusKey)
  // A new sound's card carries the live status itself.
  const pendingCard = !!focusKey && !ready.has(focusKey)
  const focusSound = focusKey ? sounds.find((x) => x.key === focusKey) : undefined
  const { send, compose, toggleSelected, openTab, setDraft, updateCard } = useSets.getState()
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, ready.size, thinking])

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(draft)
    }
  }

  const empty = messages.length === 0
  const planLocked = stage !== 'plan'
  const composedKeys = useMemo(() => sounds.filter((s) => selected.has(s.key)).map((s) => s.key), [sounds, selected])

  const composer = (
    <form className={`pss-composer ${empty ? 'pss-composer--hero' : ''}`} onSubmit={(e) => { e.preventDefault(); send(draft) }}>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        rows={empty ? 3 : 1}
        placeholder={empty ? 'Describe one sound, or the app and the moments that need sound…' : focusSound ? `Refine ${focusSound.name.toLowerCase()} — softer, brighter, longer…` : stage === 'plan' ? 'Change the plan, or press Compose…' : 'Ask for changes — name a sound, or the whole set…'}
      />
      <div className="pss-composer-bar">
        <div className="pss-composer-chips">
          <button type="button" className="pss-chip pss-chip--btn" title="Attach a brand guide, screenshot or reference sound">+ Reference</button>
          <span className="pss-chip">Set size · auto</span>
          <span className="pss-chip"><span className="pss-status-dot" /> Codex via Scout</span>
        </div>
        <button type="submit" className="pss-send" disabled={!draft.trim() || thinking} aria-label="Send">↑</button>
      </div>
    </form>
  )

  return (
    <main className="pss-main">
      <header className="pss-main-head">
        <span className="pss-crumb">{SET_PROJECT}</span>
        <span className="pss-crumb-sep">/</span>
        <span className="pss-crumb-strong">{empty ? 'New conversation' : focusSound ? focusSound.name : `${SET_PROJECT} sounds`}</span>
      </header>

      {empty ? (
        <div className="pss-hero">
          <h1>What should it sound like?</h1>
          <p>Describe one sound and Peal composes it. Describe an app and its moments, and it plans a coherent set. Either way, refine in conversation.</p>
          {composer}
          <div className="pss-starters">
            {STARTERS.map((s, i) => (
              <button key={s} type="button" className="pss-starter" onClick={() => send(i === 0 ? SET_BRIEF : s)}>{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="pss-thread" ref={threadRef}>
            <div className="pss-thread-inner">
              {messages.map((m) => m.role === 'user' ? (
                <div key={m.id} className="pss-msg pss-msg--user"><div className="pss-bubble">{m.text}</div></div>
              ) : (
                <div key={m.id} className="pss-msg pss-msg--agent">
                  <p className="pss-agent-text">{m.text}</p>
                  {m.card === 'plan' ? (
                    <PlanCard selected={selected} locked={planLocked} onCompose={compose} onToggle={toggleSelected} />
                  ) : null}
                  {m.card === 'composing' ? (
                    <div className="pss-cards">
                      {sounds.filter((s) => composedKeys.includes(s.key)).map((s) => (
                        <SoundCard
                          key={s.key}
                          sound={s}
                          state={cards[s.key]}
                          ready={ready.has(s.key)}
                          onUpdate={(p) => updateCard(s.key, p)}
                          onOpen={() => openTab(s.key)}
                        />
                      ))}
                    </div>
                  ) : null}
                  {m.card === 'sound' && m.soundKey ? (() => {
                    const s = sounds.find((x) => x.key === m.soundKey)!
                    return (
                      <div className="pss-cards pss-cards--single">
                        <SoundCard
                          sound={s}
                          state={cards[s.key]}
                          ready={ready.has(s.key)}
                          status={status}
                          pinned={m.version}
                          onUpdate={(p) => updateCard(s.key, p)}
                          onOpen={() => openTab(s.key)}
                        />
                      </div>
                    )
                  })() : null}
                  {m.card === 'export' ? <ExportCard keys={composedKeys} /> : null}
                  {m.chips ? (
                    <div className="pss-starters pss-starters--inline">
                      {m.chips.map((c) => <button key={c} type="button" className="pss-starter" onClick={() => send(c)}>{c}</button>)}
                    </div>
                  ) : null}
                </div>
              ))}
              {thinking && !pendingCard ? <div className="pss-msg pss-msg--agent"><p className="pss-agent-text pss-thinking"><span className="pss-dot-pulse" /> {status ?? 'Thinking…'}</p></div> : null}
            </div>
          </div>
          <div className="pss-composer-dock">{composer}</div>
        </>
      )}
    </main>
  )
}

export function SetsPages({ empty }: { empty?: ReactNode }) {
  const tabs = useSets((s) => s.tabs)
  const activeTab = useSets((s) => s.activeTab)
  const split = useSets((s) => s.split)
  const sounds = useSets((s) => s.sounds)
  const { setActiveTab, closeTab, setSplit } = useSets.getState()
  const shownTabs = split ? tabs.slice(-2) : tabs.filter((k) => k === activeTab)

  if (tabs.length === 0) return empty ? <>{empty}</> : null

  return (
    <section className="pss-pane">
      <div className="pss-tabs">
        {tabs.map((key) => {
          const s = sounds.find((x) => x.key === key)!
          return (
            <div key={key} className={`pss-tab ${shownTabs.includes(key) ? 'is-active' : ''}`}>
              <button type="button" onClick={() => setActiveTab(key)}>{s.name}</button>
              <button type="button" className="pss-tab-x" aria-label={`Close ${s.name}`} onClick={() => closeTab(key)}>×</button>
            </div>
          )
        })}
        {tabs.length > 1 ? (
          <button type="button" className={`pss-split ${split ? 'is-on' : ''}`} onClick={() => setSplit(!split)} title="Compare the last two side by side">
            {split ? 'Single' : 'Compare'}
          </button>
        ) : null}
      </div>
      <div className={`pss-pages ${split && shownTabs.length > 1 ? 'is-split' : ''}`}>
        {shownTabs.map((key) => <SoundPage key={key} sound={sounds.find((x) => x.key === key)!} />)}
      </div>
    </section>
  )
}

/** Standalone layout (/design/sets, Flows embeds). */
export function SoundSetsApp({ stage }: { stage?: SetsStage }) {
  useSetsBoot(stage)
  const booted = useSets((s) => s.booted)
  if (!booted) return null
  return (
    <div className="pss-root pss-app">
      <SetsSidebar brand />
      <SetsThread />
      <SetsPages />
    </div>
  )
}

/** Flows embeds: one no-props screen per stage of the journey. */
export const StartScreen = () => <SoundSetsApp stage="start" />
export const PlanScreen = () => <SoundSetsApp stage="plan" />
export const ComposingScreen = () => <SoundSetsApp stage="composing" />
export const DetailScreen = () => <SoundSetsApp stage="detail" />
export const ExportScreen = () => <SoundSetsApp stage="export" />
