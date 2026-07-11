# Strudel mount (managed, not vendored)

Strudel is **AGPL** and lives **outside** the Peal repo. Peal **manages** the process with **Bun** — install, start, stop, path, status — and proxies `/strudel` to the running instance.

## CLI

```bash
bun run strudel:install              # clone + bun install (default ../strudel)
bun run strudel:install --path ~/dev/strudel
bun run strudel:set-path ~/dev/strudel
bun run strudel:start                # detached process, waits for health
bun run strudel:stop
bun run strudel:status
bun run strudel:path
```

State is stored under `.peal/` (gitignored):

| File | Purpose |
|------|---------|
| `strudel.json` | checkout path, port (4321), package manager (default `bun`) |
| `strudel-state.json` | pid, upstream URL when running |
| `strudel.log` | process stdout/stderr |

When Strudel is running, Peal auto-proxies `/strudel/*` without setting `STRUDEL_UPSTREAM` manually.

Package manager detection: `bun.lock` → bun (default), else `pnpm-lock.yaml` → pnpm, else `package-lock.json` → npm.

## Override upstream

```bash
STRUDEL_UPSTREAM=http://localhost:4321   # takes precedence over managed state
NEXT_PUBLIC_STRUDEL_MOUNT=https://strudel.cc   # Open-in-Strudel deep links only
```

## Studio UI

Music → left **Transport** panel: path, Install, Start, Stop, live status (polls `GET /api/strudel`).

Open: [`/studio/music`](http://localhost:3001/studio/music) · User guide: [`docs/music-studio.md`](../../docs/music-studio.md)

## What Peal owns (MIT)

- **Editor + REPL** — pattern editor (top), Strudel iframe (bottom); Route ⌘↵ or AI auto-route
- **Managed engine UI** — Install / Start / Stop in Transport; polls `GET /api/strudel`
- **`peal-music` AI toolset** — Minimax + Codex sessions, split-pane, smart follow-up chips
- **Grounded curriculum** — lyricless varied beats (`lib/ai/musicCurriculum.ts`)
- **Improv loop** — Subtle / Bold / arc; 30s–2m interval; one variation dimension per pass
- **Version history** — 32 snapshots, roll back, last-edit undo in copilot
- **Codex auth** — `~/.codex/auth.json` or `OPENAI_CODEX_ACCESS_TOKEN` (`lib/ai/codexCredentials.ts`)
- `postMessage` bridge (`peal-strudel`) — `lib/strudel/mount.ts`, `peal-bridge.mjs` in Strudel checkout

`public/strudel/index.html` is only a fallback when nothing is running and no upstream is configured.

## AI + Strudel workflow

1. User or AI edits pattern in the Peal editor.
2. On turn end, Peal posts `route-and-play` (or same-origin mirror click) to the Strudel iframe.
3. Strudel evaluates via Web Audio; playing state syncs back over `peal-strudel`.

**Synth rule:** use `note()` for pitch on waveforms — not `n()` (see curriculum).