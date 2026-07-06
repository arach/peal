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

## What Peal owns (MIT)

- Strudel-compatible editor (center panel)
- `peal-music` AI tools
- `postMessage` bridge (`peal-strudel`) into the proxied mount

`public/strudel/index.html` is only a fallback when nothing is running and no upstream is configured.