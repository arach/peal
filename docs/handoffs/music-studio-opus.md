# Handoff: Peal Music Studio — Strudel × Sonic Pi × AI

**Project:** `/Users/art/dev/peal`  
**Requester:** Grok (Peal nav/session)  
**Assignee:** Opus (`arc-opus`)  
**Date:** 2026-07-05

## Goal

Design and begin implementation of a third **Music** leg in Peal Studio (`SFX | Voice | Music`), integrating:

1. **Strudel.cc** — browser live-coding (TidalCycles in JS, Web Audio)
2. **Sonic Pi** — optional macOS desktop bridge via OSC (not embedded engine)
3. **Minimax** — generative stems (already exists inside Voice/Deck; should move to Music)

Deliverable: a **polished engineering spec** (`docs/specs/peal-NNN-music-studio.md`) plus **Phase 1 scaffolding PR** if scope is clear.

## Current Peal Studio architecture

- Hudson app at `app/hudson/peal-studio/`
- Tools: `PealStudioTool = 'sfx' | 'voice'` via `?tool=voice` URL
- Nav: centered toggle in `components/PealNav.tsx` + `components/peal-nav/routing.ts`
- SFX: `components/Studio.tsx` with `publishSfxRuntime` bridge
- Voice: `app/hudson/peal-studio/voice/*` nested providers
- Music today: only inside Voice deck (`DeckClipSource` includes `'music'`), API at `app/api/generate-music/route.ts`, AI tools in `lib/ai/toolsets/peal-voice.ts`

## Strudel integration notes

- Packages: `@strudel/web`, `@strudel/repl`, `@strudel/embed` (see https://strudel.cc/technical-manual/project-start/)
- Architecture: transpile → Pattern → Scheduler (50ms) → WebAudio
- **License: AGPL-3.0** — Peal is MIT; legal strategy required before bundling
- Embedding options: iframe (low coupling) vs `@strudel/web` (full Hudson control)

## Sonic Pi integration notes

- Desktop app, Ruby DSL → SuperCollider
- OSC in on UDP 4560, paths prefixed `/osc`
- App code MIT; engine stack GPL
- Sam Aaron warns against unattended AI `run_code` — Ruby has full machine access
- Recommended: OSC triggers + explicit user-approved export, not blind remote eval
- MCP reference: https://github.com/yevbar/live-prompting (see security thread on in-thread.sonic-pi.net)

## Recommended hybrid (starting hypothesis)

| Lane | Engine | Where |
|------|--------|-------|
| Live Code | Strudel | Browser, LeftPanel editor + Content visualizer |
| Generate | Minimax | Inspector tab, extract from Voice |
| Bridge | Sonic Pi | macOS only, OSC sidecar |

## Phased plan (sequence for Opus to refine)

0. Legal/spec — AGPL decision, spec doc with Studio route
1. Tool scaffolding — extend `PealStudioTool`, nav toggle, Hudson slots, `music/` module
2. Strudel POC — client-only `@strudel/web` or iframe spike
3. AI toolset — `peal-music.ts` for pattern generation
4. Extract Minimax from Voice deck
5. Record/export to Library
6. Sonic Pi OSC bridge (macOS)

## Files Opus should read first

- `app/hudson/peal-studio/routing.ts`
- `app/hudson/peal-studio/Provider.tsx`
- `app/hudson/peal-studio/Content.tsx`, `LeftPanel.tsx`, `Inspector.tsx`, `hooks.ts`, `index.ts`
- `components/peal-nav/routing.ts`
- `components/PealNav.tsx`
- `app/api/generate-music/route.ts`
- `lib/ai/toolsets/peal-voice.ts`
- `docs/hudson-studio-spec.md`

## What to return

1. **Spec doc** at `docs/specs/peal-NNN-music-studio.md` with metadata (`**Studio**: /eng/peal-NNN`)
2. **Architecture diagram** (mermaid ok)
3. **License recommendation** for Strudel (iframe vs bundle vs separate AGPL module)
4. **Refined phase DAG** with PR-sized chunks and file touch list
5. **AI tool design** for `peal-music` toolset
6. If unblocked: **Phase 1 PR** — `music` in routing + nav + empty `PealMusicEditor` shell

## Constraints

- Peal uses pnpm, Next.js, HudsonKit (`file:../hudson/packages/web/hudsonkit`)
- Swift/iOS rules don't apply here — this is the Peal web app
- Do not break existing SFX/Voice tools
- Dev server: `pnpm dev` on port 3001
- Match existing Peal chrome (dark `#111113`, accent `#4a9eff`, JetBrains Mono)