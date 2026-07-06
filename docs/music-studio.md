# Music Studio

Live-code **lyricless, varied instrumental beats** in Peal Studio — Strudel patterns, a grounded AI copilot, improv loop, and managed engine.

**Open:** [`/studio?tool=music`](http://localhost:3001/studio?tool=music)

**Spec:** [`specs/peal-001-music-studio.md`](./specs/peal-001-music-studio.md)

---

## Latest features (2026)

| Feature | What it does |
| --- | --- |
| **Managed Strudel engine** | Install / Start / Stop from Transport (left) or `bun run strudel:*` — no manual Vite setup |
| **Editor + REPL** | Strudel code on top, live REPL iframe below; **Route** (⌘↵) or AI **auto-route** after each turn |
| **Grounded AI curriculum** | Composition syllabus from Open Music Theory, Tidal course, Strudel workshop — **lyricless varied beats** by default |
| **Dual AI sessions** | Default **Minimax** + **Codex** tabs; optional **split-pane** to compare models side by side |
| **Smart follow-ups** | Context chips after each edit (*alternate hats*, *breakdown mask*, *filter sweep*, etc.) |
| **Improv loop** | Timed instrumental passes — Subtle / Bold / Build→twist→breathe→strip; 30s–2m interval |
| **Version history** | Up to 32 pattern snapshots (localStorage); restore any version or roll back one step |
| **Last-edit undo** | Roll back the most recent AI edit from the copilot panel |
| **Composition hints** | Opening density, layer roles, and groove hints surfaced on each AI change |

---

## Layout

```
┌ Transport ──────────┬─ Strudel editor (pattern) ───┬─ Copilot ─────────┐
│ Strudel install/    │                               │ Minimax │ Codex   │
│ start/stop          ├─ Strudel REPL (iframe) ───────┤ Chat + improv loop │
│ Tempo CPS/BPM       │                               │ Follow-up chips   │
│ Version history     │                               │ Last edit / undo    │
└─────────────────────┴───────────────────────────────┴────────────────────┘
```

- **Left — Transport:** engine controls, tempo, pattern status, version list
- **Center — Editor + REPL:** write patterns; Route loads into Strudel Web Audio
- **Right — Copilot:** AI sessions, improv loop, suggested next steps

---

## Quick start

### 1. Run Peal

```bash
cd peal
pnpm install
pnpm dev
```

Open [http://localhost:3001/studio?tool=music](http://localhost:3001/studio?tool=music).

### 2. Start Strudel

**In the UI:** Transport → **Install Strudel** (first time) → **Start engine**

**Or CLI:**

```bash
bun run strudel:install
bun run strudel:start
bun run strudel:status
```

Peal proxies `/strudel` to the managed checkout (`:4321`) and speaks to the iframe over `peal-strudel` postMessage.

### 3. Make a beat

**Type or paste** in the editor (default starter uses `note()` for synth pitch):

```javascript
setcps(1)

stack(
  s("bd ~ sd ~").bank('RolandTR909'),
  note("c2 eb2 g2").scale('C:minor').s('sawtooth').gain(0.35).lpf(800),
)
```

Press **Route** or **⌘↵** to hear it.

**Or ask the copilot:**

- *Instrumental lo-fi beat — dusty drums, Rhodes chords, no vocals, 82 bpm*
- *House groove — alternate hat patterns every 2 bars, 124 bpm*
- *Add a 2-bar breakdown mask on the busiest layer*

When the AI changes the pattern, Peal **auto-routes to Strudel** at end of turn — no extra Route click.

---

## AI copilot

### Sessions

- **Minimax** — fast iteration (default tab)
- **Codex** — stronger Strudel/code reasoning (GPT-5.4, 5.5, Spark, etc.)
- **+** add more sessions · **Split** icon for side-by-side panes
- Settings persist in `peal-music-ai-sessions.v1`

### Harness & models

| Setting | Value |
| --- | --- |
| **Harness** | **API** — `POST /api/ai/chat` via pi-ai (CLI harness placeholder) |
| **Models** | MiniMax M2.7/M3, Codex GPT-5.4/5.5/Mini, Spark, GPT-4o Mini, Claude Sonnet 4 |
| **Effort** | Off / Low / Med / High (reasoning depth where supported) |

### Codex credentials

Codex uses OAuth — not a plain API key. Peal resolves tokens from:

1. `OPENAI_CODEX_ACCESS_TOKEN` in `.env.local` (optional)
2. `~/.codex/auth.json` (Codex CLI login)
3. `~/.pi/auth.json` pi-ai OAuth entry

See `.env.local.example` and `lib/ai/codexCredentials.ts`.

### After each AI edit

- **Last change** — tool name, summary, *playing in Strudel*, opening hint
- **Roll back** — undo that single AI edit (copilot strip)
- **Suggested next** — chips from `musicAiFollowUps` (composition-aware)
- **Working** — live tool activity while streaming

### Lanes

| Lane | Engine | Status |
| --- | --- | --- |
| **Live** | Strudel | Default — improv loop requires this |
| **Generate** | Minimax `music_generation` | AI can `set_lane` + `generate_music` |
| **Bridge** | Sonic Pi OSC | Future / desktop |

---

## Improv loop

Autonomous **instrumental variation** — one dimension per pass (rhythm, timbre, harmony, or arrangement).

1. Get a pattern on the **Live** lane
2. Copilot → **Improv loop** → **Start**
3. First pass after ~3s warmup; then every **30s–2m** (your interval)
4. AI sends `[Improv loop #N · style]` prompts; auto-route plays each pass
5. **Stop** anytime; only user abort pauses the chain (errors keep going)

**Styles:**

- **Subtle** — ghost notes, hat rotation, micro-filters
- **Bold** — new layers, syncopation, breakdown masks
- **Build → twist → breathe → strip** — four-phase arc cycling

---

## Pattern versions

Every AI write, manual Route of dirty code, and restore pushes a version (max **32**, deduped).

| Storage key | Content |
| --- | --- |
| `peal-music-pattern-v1` | Current editor code |
| `peal-music-pattern-versions.v1` | Version list + active id |

**Roll back** in Transport sidebar, code panel toolbar, or copilot last-edit strip. Click any version to restore + route.

---

## Grounded curriculum

The agent's system prompt includes `lib/ai/musicCurriculum.ts` — not generic LLM music knowledge.

| Source | License | Teaches |
| --- | --- | --- |
| [Open Music Theory 2e](https://viva.pressbooks.pub/openmusictheory/) | CC BY-SA | Rhythm, harmony, melody, form |
| [Learning TidalCycles](https://tidalcycles.org/docs/patternlib/tutorials/course1/) | Open access | Mini-notation, Euclidean, polyrhythm |
| [Strudel Workshop](https://strudel.cc/workshop/getting-started/) | AGPL (Strudel) | `stack`, chords, voicing, effects |

**Default goal:** lyricless beats that **vary across cycles** — `<a b c>` hats, `.mask()` breakdowns, filter sweeps, chord rotation. No vocals unless you ask.

### Synth pitch (important)

```javascript
// ✅ Synth melodies / bass
note("c2 eb2 g2").scale('C:minor').s('sawtooth')

// ❌ Breaks Web Audio oscillators
n("c2 eb2 g2").scale('C:minor').s('sawtooth')
```

Samples: `s("bd sd")` — `n` is only for sample variant index.

---

## AI tools (`peal-music`)

| Tool | Purpose |
| --- | --- |
| `describe_to_pattern` | NL brief → full Strudel in editor |
| `write_pattern` / `edit_pattern` | Replace or surgical edit |
| `layer_track` | Add drums/bass/lead/pad via `stack()` |
| `set_tempo` | CPS / BPM |
| `explain_pattern` | Plain-English readback |
| `set_lane` | live · generate · bridge |
| `set_music_prompt` / `generate_music` | Minimax instrumental |
| `evaluate_pattern` | Manual re-route (usually unnecessary — auto-route handles it) |

Client execution: `usePealMusicAI.ts` · Server: `POST /api/ai/chat` · Toolset: `lib/ai/toolsets/peal-music.ts`

---

## Strudel CLI

| Command | Action |
| --- | --- |
| `bun run strudel:install` | Clone + `bun install` (default `../strudel`) |
| `bun run strudel:set-path <path>` | Use existing checkout |
| `bun run strudel:start` | Detached dev server |
| `bun run strudel:stop` | Stop process |
| `bun run strudel:status` | Phase, PID, reachability |

State: `.peal/strudel.json`, `strudel-state.json`, `strudel.log` (gitignored).

Details: [`lib/strudel/README.md`](../lib/strudel/README.md)

---

## License (Strudel)

Strudel is **AGPL-3.0**. Peal stays **MIT** by running Strudel as a **separate managed process** (iframe + proxy), not bundling `@strudel/web` into the main app. See spec §5 before any in-process bundle.

---

## Related

- [`music-leg-strudel-sonicpi-integration.md`](./music-leg-strudel-sonicpi-integration.md)
- [`handoffs/music-studio-opus.md`](./handoffs/music-studio-opus.md)
- [`hudson-studio-spec.md`](./hudson-studio-spec.md)