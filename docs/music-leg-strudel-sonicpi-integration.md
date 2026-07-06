# Music Leg — Strudel + Sonic Pi Integration Analysis

**Scope:** Add a third tool leg — **Music** — to Peal Studio, alongside **SFX** and **Voice**, powered by live-coding engines (Strudel, Sonic Pi) plus the existing Minimax generative path.
**Surface:** Next.js app on port 3001, Hudson `AppShell` app at `app/hudson/peal-studio/`.
**Author:** Scout analysis session · **Date:** 2026-07-05

---

## 0. TL;DR / Recommendation

- **Strudel is the primary engine.** It is a pure-JavaScript port of TidalCycles that runs 100% in the browser on the Web Audio API. It drops into Peal's existing Next.js + Web Audio stack with near-zero infrastructure. This is the only option that is truly *web-embeddable*.
- **Sonic Pi is a desktop-only "Pro bridge," deferred.** It is a native app stack (Ruby DSL + Erlang scheduler + SuperCollider + Qt GUI) driven over OSC. It **cannot run in a browser**. It is only worth building if/when Peal ships a desktop shell (Tauri/Electron) and there is real demand for its Ruby/SuperCollider ecosystem.
- **The hybrid is an engine-adapter pattern.** Define one `MusicEngine` contract; Strudel (browser), Minimax (generative REST), and Sonic Pi (OSC/desktop) all implement it. The Music leg unifies them, and every engine's output "captures to a deck pad" — exactly the model the Voice deck already uses for Minimax instrumentals.
- **The Music leg is a near-clone of the Voice leg.** The `voice/` folder, its provider tree, its AI provider/chat, and its Minimax `generateMusic()` are the template. ~80% of the scaffolding is structural copy-adapt.
- **One hard gate before writing product code: Strudel's license.** Strudel's source is **AGPL-3.0-or-later** (verify current). Bundling it into Peal's proprietary hosted web app has network-copyleft implications. The MVP path (iframe embed of the standalone REPL) sidesteps this; the npm-native path requires a licensing decision. **Do not skip Phase 0.**

---

## 1. Comparative Analysis — Strudel vs Sonic Pi

### 1.1 What they are

| | **Strudel** (strudel.cc) | **Sonic Pi** (sonic-pi.net) |
|---|---|---|
| Origin | Web port of TidalCycles pattern language | Standalone educational/live-coding app |
| Language | JavaScript / TS mini-notation DSL | Ruby DSL |
| Paradigm | Declarative **patterns** (functional, cyclic) | Imperative **loops** (`play`, `sleep`, `live_loop`) |
| Audio engine | **Web Audio API** (browser-native) + optional MIDI/OSC/WebSerial out | **SuperCollider** (`scsynth`) native synth server |
| Runtime | Browser (also Node via packages) | Native desktop: Ruby + Erlang/Elixir server + SuperCollider + Qt |
| Distribution | npm packages / iframe / hosted REPL | OS installer (macOS/Win/Linux/RPi) |
| License | **AGPL-3.0-or-later** (verify) | **GPL-3.0** |
| Samples | Built-in synths + sample banks fetched from CDN (dirt-samples), soundfonts | SuperCollider synthdefs + bundled samples |

### 1.2 Web / desktop embedding fit — the decisive axis

**Strudel — web-native, embeds three ways:**

1. **Iframe (lowest friction, MVP):** embed the hosted REPL (`https://strudel.cc/#<base64-pattern>`) or self-host the standalone REPL as an isolated route. Drive it with `postMessage`. Zero bundle cost to Peal's main app, and keeps AGPL code at arm's length.
2. **Web component:** `@strudel/repl` / `<strudel-editor>` custom element — a single script tag, self-contained editor + engine.
3. **Native npm (deepest control):** `@strudel/web` exposes `initStrudel()` + `evaluate(code)`; compose `@strudel/core`, `@strudel/webaudio`, `@strudel/codemirror`, `@strudel/transpiler`, `@strudel/mini`, `@strudel/tonal`, `@strudel/soundfonts`. Full theming, transport control, and **offline rendering** via `OfflineAudioContext` for capture-to-WAV. This is the endgame for tight Peal integration.

All three run in Peal's existing browser context. No servers, no native deps, no install step for the end user.

**Sonic Pi — not web-embeddable at all:**

- No browser runtime exists. It is a multi-process native app: the Ruby "Spider" server schedules events and forwards to SuperCollider; the GUI is a separate Qt process.
- Integration requires: (a) a **desktop shell** (Tauri/Electron) for Peal, (b) the user to **install Sonic Pi + SuperCollider** (~hundreds of MB), (c) launching/attaching to the running server and driving it via **OSC** (send Ruby buffers to the Spider's listening UDP port, à la `sonic-pi-tool` / `sonic-pi-cli`). Sonic Pi can also receive OSC (`live_loop` + `sync "/osc/..."`) and emit OSC/MIDI, enabling a two-way bridge.
- Capture would be off the system audio output (or SuperCollider record), not a clean in-process buffer.

### 1.3 Musician-facing tradeoffs

- **Strudel** shines at terse, algorithmic, generative patterns (`note("c a f e").s("piano").slow(2)`), rhythmic mini-notation, and Euclidean/probabilistic sequencing. Great match for *UI-adjacent musical beds, loops, and motifs* — which is exactly Peal's Minimax "instrumental bed" use case, but deterministic and editable.
- **Sonic Pi** is friendlier for narrative/step-by-step composition and has a large SuperCollider synth palette and a strong education following. Its imperative style reads more like "programming a song."
- For **Peal's product** (UI sound design, short beds, deck capture), Strudel's pattern model and browser reach dominate. Sonic Pi's advantages (SuperCollider depth, Ruby ecosystem) matter to a narrower pro/desktop audience.

### 1.4 Licensing (must verify before Phase 1)

- **Strudel: AGPL-3.0-or-later.** AGPL's §13 network clause means if Peal *conveys or operates a modified/combined work over a network*, users are entitled to the corresponding source of that combined work. Mitigations, in order of least → most commitment:
  - **Iframe the unmodified upstream/standalone REPL** — Peal links to a separate work rather than combining. Cleanest for a proprietary app.
  - **Self-host the standalone REPL as an isolated service/route** with an explicit source offer for that service only.
  - **Bundle npm packages and accept AGPL on the integration layer** — open-source the Strudel-integration module. Viable if Peal is comfortable open-sourcing that seam.
  - **Legal review** — confirm exact license of each `@strudel/*` package used (some sub-packages / sample data may differ).
- **Sonic Pi: GPL-3.0** — but you never link its code; you drive a separately-installed process over OSC, so the copyleft boundary is not crossed by Peal's code. The obligation is on the *user's* install.

> **Action:** Treat the Strudel license as a Phase-0 gate. Recommend iframe-first for MVP to keep the decision reversible.

---

## 2. Recommended Hybrid Architecture

### 2.1 Guiding principle — one leg, pluggable engines, unified capture

Peal already has the right primitive: the **deck**. The Voice leg captures speech (TTS), instrumentals (Minimax), and one-shots (SFX) onto **deck pads**, then edits them in a programmable mixer (`app/hudson/peal-studio/voice/`, see `PealVoiceProvider.tsx:594` `generateMusic()`). The Music leg extends this: **live-coded patterns render to audio, then capture to a deck pad like any other clip.**

```
                       Peal Studio (Hudson AppShell app)
   ┌───────────────────────────────────────────────────────────────┐
   │  Nav leg switcher:   [ SFX ]   [ Voice/Deck ]   [ Music ] ◀ new │
   └───────────────────────────────────────────────────────────────┘
                                     │  currentTool === 'music'
                                     ▼
                        ┌────────────────────────┐
                        │   PealMusicProvider     │  (mirrors PealVoiceProvider)
                        │   - pattern code state  │
                        │   - transport / tempo   │
                        │   - engine selection    │
                        │   - capture → deck pad  │
                        └───────────┬─────────────┘
                                    │  MusicEngine contract
             ┌──────────────────────┼───────────────────────────┐
             ▼                      ▼                            ▼
   ┌──────────────────┐  ┌───────────────────┐      ┌────────────────────────┐
   │  StrudelEngine    │  │  MinimaxEngine     │      │  SonicPiEngine (P4)     │
   │  browser, live    │  │  generative REST   │      │  desktop OSC bridge     │
   │  @strudel/web or  │  │  /api/generate-    │      │  (Tauri/Electron only)  │
   │  iframe+postMsg   │  │  music (exists)    │      │  install-gated          │
   └──────────────────┘  └───────────────────┘      └────────────────────────┘
             │                      │                            │
             └──────────── renders/returns audio ───────────────┘
                                    ▼
                        capture WAV → deck pad → mixer/FX
```

### 2.2 The `MusicEngine` contract

```ts
// app/hudson/peal-studio/music/engine/types.ts
export interface MusicEngine {
  id: 'strudel' | 'minimax' | 'sonic-pi'
  kind: 'live-code' | 'generative'
  isAvailable(): boolean            // desktop gate for sonic-pi, key gate for minimax
  // live-code engines:
  evaluate?(code: string): Promise<void>          // hot-swap running pattern
  stop?(): void
  setTempo?(cps: number): void
  // all engines:
  render(opts: { code?: string; prompt?: string; bars?: number }): Promise<AudioBuffer | Blob>
}
```

- **StrudelEngine** — the workhorse. Live `evaluate()` for jamming + `OfflineAudioContext` render for capture.
- **MinimaxEngine** — wraps the existing `/api/generate-music` route; `kind: 'generative'`, prompt-in / clip-out. No new backend needed.
- **SonicPiEngine** — Phase 4, desktop-only, OSC transport; `isAvailable()` returns false in browser so the UI hides/greys it.

### 2.3 Two AI affordances, one leg

The Music leg exposes both authorship modes, and the AI can drive both:

- **Generative** (Minimax): natural language → prompt → audio clip. *Already wired.*
- **Live-coding** (Strudel): natural language → **Strudel pattern code** (LLM writes/edits the code) → evaluate/render. This is the new flagship capability.

This mirrors how the Voice leg already blends TTS + Minimax + SFX capture on one deck.

### 2.4 Layout / shell

Reuse `PEAL_STUDIO_SHELL_LAYOUT` (`shell-layout.ts`): left = code editor (Strudel/CodeMirror), right = AI conversation — identical to the SFX/Voice split. Music leg needs no new shell geometry.

---

## 3. Sequenced Build Phases — File-Level Touch Points in Peal

> Legend: **M** = modify existing, **N** = new file. All paths relative to repo root.

### Phase 0 — Spike & license gate (no product code)

- Verify exact license of each `@strudel/*` package intended for use.
- Prototype both embeds in a throwaway route: (a) iframe `strudel.cc/#…` + `postMessage`, (b) `@strudel/web` `initStrudel()`/`evaluate()` in a scratch component.
- Confirm **offline render → WAV** works with sample banks loaded (`OfflineAudioContext`).
- **Decision:** iframe-first (reversible, AGPL-safe) vs npm-native (deeper, needs license call).
- **Deliverable:** update this doc's §1.4 with the confirmed license and chosen embed mode.

### Phase 1 — Music leg scaffolding (Strudel iframe MVP)

Register the leg in the shell so `?tool=music` routes and the nav pill appears.

- **M** `app/hudson/peal-studio/routing.ts` — extend `PealStudioTool` union to `'sfx' | 'voice' | 'music'`; add `'music'` to `PEAL_STUDIO_TOOLS`; handle it in `parsePealStudioTool`, `applyPealStudioToolParam`, `studioHrefWithTool`.
- **M** `app/hudson/peal-studio/Content.tsx` — add `if (currentTool === 'music') return <PealMusicEditor />`.
- **M** `app/hudson/peal-studio/hooks.ts` — add `music` to `TOOL_LABELS` / `TOOL_DESCRIPTIONS` / `TOOL_ORDER`; add `peal-studio:switch-music` command + icon; extend `useStatus`, `PealNavCenter` detail, and `useNavActions` play/pause target for the music engine.
- **M** `app/hudson/peal-studio/index.ts` — manifest: add commands (`peal-studio:switch-music`, `peal-studio:music-play`, `peal-studio:music-capture`).
- **M** `app/hudson/peal-studio/intents.ts` — add "Switch to Music Studio" intent (+ later, live-code intents).
- **M** `app/hudson/peal-studio/Provider.tsx` — mount `PealMusicProvider` (lazy) alongside the voice providers; add `currentTool === 'music'` handling; optional `musicSummary` parallel to `sfxSummary`.
- **N** `components/icons/PealStudioIcon` — add a `MusicIcon` (waveform/note) for the nav pill.
- **N** `app/hudson/peal-studio/music/` (mirror `voice/`):
  - `PealMusicEditor.tsx` — hosts the Strudel iframe/REPL for MVP.
  - `PealMusicProvider.tsx` — code state, transport, capture, engine selection.
  - `PealMusicLayout.tsx`, `types.ts`, `constants.ts`, `storage.ts` — copy-adapt from voice equivalents (`voiceLayout.ts`, `types.ts`, `constants.ts`, `storage.ts`).

**Exit:** `?tool=music` shows a working Strudel REPL; can play a pattern in-browser.

### Phase 2 — Native Strudel engine + capture-to-deck

Replace/augment the iframe with an in-process engine and wire capture into the deck.

- **M** `package.json` — add `@strudel/web`, `@strudel/codemirror`, `@strudel/transpiler` (+ `@strudel/tonal`, `@strudel/soundfonts` as needed). *Gated by Phase-0 license decision.*
- **N** `app/hudson/peal-studio/music/engine/types.ts` — the `MusicEngine` contract (§2.2).
- **N** `app/hudson/peal-studio/music/engine/StrudelEngine.ts` — wrap `initStrudel()` / `evaluate()` / stop / tempo; implement `render()` via `OfflineAudioContext`.
- **N** `app/hudson/peal-studio/music/engine/MinimaxEngine.ts` — thin adapter over the existing `/api/generate-music`; reuse `generateMusic()` logic from `voice/PealVoiceProvider.tsx:594`.
- **M** `app/hudson/peal-studio/music/PealMusicEditor.tsx` — swap iframe for CodeMirror editor + transport bar.
- **N** `app/hudson/peal-studio/music/capture.ts` — offline-render pattern → WAV Blob → push onto a deck pad.
- **Deck unification (recommended):** the deck currently lives under `voice/` (`PealDeck.tsx`, `PealMessageBeds.tsx`, takes/pads). Consider promoting it to a shared `app/hudson/peal-studio/deck/` so Music and Voice share pad/capture/mixer code instead of forking it. Touches: `voice/PealDeck.tsx`, `voice/PealVoiceTakes.tsx`, `voice/PealVoiceProvider.tsx` (extract capture/pad model).

**Exit:** live-code a pattern, hit capture, get a deck pad clip playable through the existing mixer/FX rack.

### Phase 3 — AI live-coding + generative toolset

Give the AI panel the ability to write/evaluate Strudel and trigger Minimax.

- **N** `lib/ai/toolsets/peal-music.ts` — a `ToolsetDefinition` (same shape as `lib/ai/toolsets/peal-voice.ts`): `system`, `context(ctx)`, `tools(ctx)`. Tools in §4.
- **M** `lib/ai/toolsets/index.ts` — `defaultRegistry.register('peal-music', pealMusicToolset)`.
- **M** `app/api/ai/chat/route.ts` — add `'peal-music'` to the `PEAL_LOCAL_TOOLSETS` set so it resolves locally (else it proxies to Hudson).
- **N** `lib/ai/musicPatternExamples.ts` — few-shot Strudel examples (mirror `lib/ai/voiceDesignExamples.ts` / `soundDesignExamples.ts`) to ground the model in mini-notation, sample banks, and function vocabulary.
- **N** `app/hudson/peal-studio/music/PealMusicAIProvider.tsx`, `PealMusicAIChat.tsx`, `usePealMusicAI.ts` — mirror `voice/PealVoiceAIProvider.tsx`, `PealVoiceAIChat.tsx`, `usePealVoiceAI.ts`; call `/api/ai/chat` with `toolset: 'peal-music'` and a context payload (current code, tempo, sample banks, deck state).
- **M** `app/hudson/peal-studio/Provider.tsx` — nest `PealMusicAIProvider` (matches how voice AI is nested).
- No new inference backend: everything rides `lib/ai/host.ts` → pi-ai. Minimax key already registered in `lib/credentials/registry.ts` (`MINIMAX_API_KEY`, feature `music-generation`).

**Exit:** "make me a lo-fi 4-bar bassline at 82 bpm" → AI writes Strudel code into the editor, evaluates it, and can capture it to a pad; "make a warm ambient bed" can route to Minimax instead.

### Phase 4 — Sonic Pi desktop bridge (optional / Pro)

Only if Peal has a desktop shell and there's demand. Fully feature-gated.

- **N** `app/hudson/peal-studio/music/engine/SonicPiEngine.ts` — implements `MusicEngine` via OSC to a running Sonic Pi Spider server; `isAvailable()` false in browser.
- **N** transport layer — a Tauri/Electron sidecar (or `app/api/sonic-pi/route.ts` in a Node/desktop context) that opens a UDP OSC client, sends Ruby run-buffers, and optionally records output.
- **M** `lib/credentials/registry.ts` (or a runtime config) — OSC host/port; an "install Sonic Pi + SuperCollider" onboarding/detection flow.
- **M** `app/hudson/peal-studio/music/PealMusicProvider.tsx` — engine picker exposes Sonic Pi only when available; graceful degradation otherwise.
- **N** `lib/ai/toolsets/peal-music.ts` — add a desktop-only `sonic_pi_eval` tool (Ruby buffer over OSC).

**Exit:** on desktop with Sonic Pi installed, drive Ruby live-loops from Peal and capture the result.

### Phase 5 — Polish

- Pattern presets/starters (drums, bass, arps, ambient beds) — a `music/presets.ts` catalog surfaced in the left panel like the SFX library.
- Project persistence/versioning of pattern code (extend `music/storage.ts`).
- Share/permalink (Strudel already encodes patterns in the URL hash — reuse).
- WebMIDI / hardware out (Strudel supports it) for pro users.
- Finish deck unification; retire any forked pad code.

---

## 4. AI Tool Design — Live-Coding + Generative Music

Register a `peal-music` toolset following `lib/ai/toolsets/peal-voice.ts` (a `ToolsetDefinition` with Zod `inputSchema`s). It bridges **both** authorship modes.

### 4.1 System prompt (`system`)

Teach the model to be a **Strudel live-coder and a Minimax prompt-writer**:
- Strudel mini-notation (`"c3 e3 g3"`, `[a b]`, `<a b>`, `a*2`, `a(3,8)` Euclid), core functions (`note`, `sound`/`s`, `n`, `stack`, `slow`/`fast`, `rev`, `jux`, `every`, `gain`, `room`, `lpf`, `.cpm`/`.cps`), sample banks, and soundfonts.
- When to **write code** (deterministic, editable, rhythmic/melodic patterns, loops, beds) vs **generate** via Minimax (rich timbres, full-mix "vibe" beds, textures hard to synth).
- Always leave the editor with runnable code; prefer small edits to full rewrites when iterating.

### 4.2 Context (`context(ctx)`)

Inject live state: current pattern code, tempo/cps, selected engine, available sample banks/soundfonts, deck bank/pad state, and whether Minimax (`MINIMAX_API_KEY`) and Sonic Pi (desktop) are available.

### 4.3 Tools (`tools(ctx)`)

| Tool | Purpose | Input (Zod) |
|---|---|---|
| `describe_to_pattern` | **Flagship** — NL → Strudel code, written into the editor | `{ description: string, bars?: number, style?: string }` |
| `write_pattern` | Set/replace editor code directly | `{ code: string }` |
| `edit_pattern` | Targeted edit of current code (add layer, change instrument, tweak rhythm) | `{ instruction: string }` |
| `evaluate_pattern` | Hot-swap / run current code (live-code eval) | `{}` |
| `set_tempo` | Set cps/bpm | `{ bpm?: number, cps?: number }` |
| `layer_track` | Stack a part (drums/bass/lead) via `stack` | `{ role: 'drums'|'bass'|'lead'|'pad', pattern: string }` |
| `render_capture` | Offline-render N bars → WAV → deck pad | `{ bars?: number, padLabel?: string }` |
| `set_music_prompt` | Set Minimax instrumental prompt | `{ text: string }` |
| `generate_music` | Generative clip via Minimax → deck pad (reuse `/api/generate-music`) | `{ prompt?: string }` |
| `explain_pattern` | Read current code back in plain English | `{}` |
| `sonic_pi_eval` *(P4, desktop)* | Send Ruby buffer to Sonic Pi over OSC | `{ code: string }` |

### 4.4 Wiring

- Client: `usePealMusicAI.ts` posts to `/api/ai/chat` with `toolset: 'peal-music'` + context; tool calls resolve against the `PealMusicProvider` (write code, evaluate, capture) exactly as `usePealVoiceAI.ts:309` calls `voice.generateMusic(...)` today.
- Server: `app/api/ai/chat/route.ts` already streams via pi-ai (`lib/ai/host.ts`); just add `'peal-music'` to `PEAL_LOCAL_TOOLSETS`.
- Grounding: `lib/ai/musicPatternExamples.ts` few-shots for reliable mini-notation output.

### 4.5 UX moment to aim for

> User: *"lo-fi hip-hop bed, dusty, 78 bpm, 8 bars."*
> AI calls `describe_to_pattern` → writes a `stack(...)` of drums/bass/keys at `.cpm(78/4)` → `evaluate_pattern` (it plays) → user says "warmer" → `edit_pattern` adds `.room(.4).lpf(1200)` → `render_capture` drops an 8-bar WAV onto a deck pad, ready for the mixer/FX rack.

The same panel, one intent later, could route "make it a real vinyl-textured mix" to `generate_music` (Minimax) instead — deterministic code and generative audio, side by side on one deck.

---

## 5. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Strudel AGPL** on a proprietary hosted app | Phase-0 gate; iframe-first MVP; open-source only the integration seam if going npm-native; legal review of each `@strudel/*` package. |
| **Bundle size** (Strudel core + CodeMirror + sample banks) | Lazy-load the whole `music/` leg + engine on `?tool=music`; fetch sample banks on demand from CDN; iframe path keeps main bundle untouched. |
| **Autoplay / AudioContext** gating | Require a user gesture to `initStrudel()`; reuse Peal's existing Web Audio unlock pattern. |
| **Offline render fidelity** | Ensure sample banks/soundfonts are fully loaded before `OfflineAudioContext` render; test tempo↔bar math so captured clips loop seamlessly. |
| **CPS ↔ deck BPM mismatch** | Store tempo on the clip; convert Strudel cps to deck bpm at capture; expose tempo in AI context. |
| **Sonic Pi install burden** | Desktop-only, feature-gated, `isAvailable()` hides it in browser; clear onboarding; never block the Strudel path on it. |
| **Deck fork drift** | Unify deck into shared `deck/` early (Phase 2) rather than copy-forking `voice/` pad code. |

---

## 6. Summary of Touch Points (quick index)

**Shell/leg registration:** `routing.ts` · `Content.tsx` · `hooks.ts` · `index.ts` · `intents.ts` · `Provider.tsx` · `components/icons/PealStudioIcon`
**New Music leg:** `app/hudson/peal-studio/music/{PealMusicEditor,PealMusicProvider,PealMusicLayout,PealMusicAIProvider,PealMusicAIChat,capture,storage,types,constants,presets}.tsx/ts` + `music/engine/{types,StrudelEngine,MinimaxEngine,SonicPiEngine}.ts`
**AI:** `lib/ai/toolsets/peal-music.ts` · `lib/ai/toolsets/index.ts` · `app/api/ai/chat/route.ts` · `lib/ai/musicPatternExamples.ts`
**Reuse as-is:** `app/api/generate-music/route.ts` (Minimax) · `lib/ai/host.ts` (pi-ai) · `lib/credentials/registry.ts` (`MINIMAX_API_KEY`) · `shell-layout.ts`
**Template to copy:** the entire `app/hudson/peal-studio/voice/` folder.

---

*Facts to confirm before build: exact license of each `@strudel/*` package (stated AGPL-3.0), and whether Peal has/plans a desktop (Tauri/Electron) shell — that single fact decides whether Phase 4 (Sonic Pi) is ever in scope.*
