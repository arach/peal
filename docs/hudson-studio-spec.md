# Peal Studio as a Hudson Kit Web App

## Goal

Reimplement Peal's `/studio` surface as a **HudsonKit `HudsonApp`** mounted in **`AppShell`**, so the sound designer uses the same chrome, panels, command palette, and status bar patterns as other Hudson apps (Atelier, Hudson stage-design, OG app).

The marketing landing page was recently aligned to the Lattices dark terminal aesthetic (`styles/landing.css`). The studio should feel like the same product family — dark `#111113` shell, compact type, monospace for code — but **chrome comes from HudsonKit**, not custom `StudioHeader`.

## Non-goals (this pass)

- Do not rewrite sound synthesis / Web Audio logic in `components/Studio.tsx`
- Do not migrate Library, Voice, or Presets pages to Hudson yet — **studio only**
- Do not kill the Next dev server on port 3001

## Reference implementations (read these first)

| Reference | Path | Why |
|-----------|------|-----|
| HudsonApp contract | `/Users/art/dev/hudson/packages/web/hudsonkit/src/types/app.ts` | Required interface |
| Building apps guide | `/Users/art/dev/hudson/docs/building-apps.md` | Provider + slots + hooks |
| Panel app example | `/Users/art/dev/hudson/app/apps/stage-design/` | `mode: 'panel'`, left + content |
| Atelier single-app host | `/Users/art/dev/atelier/src/AppShellView.tsx` | How to mount `AppShell` with `PlatformProvider` + host routes |
| Atelier OG app | `/Users/art/dev/atelier/src/apps/og/hudson/` | Full panel app with LeftPanel, Inspector, Terminal, intents |
| Peal studio today | `/Users/art/dev/peal/app/studio/page.tsx` | Entry point |
| Peal studio UI | `/Users/art/dev/peal/components/UnifiedStudio.tsx` | SFX / Audio / Voice tool switcher |
| Peal SFX editor | `/Users/art/dev/peal/components/Studio.tsx` | Main sound designer (large — wrap, don't rewrite) |
| Peal code editor | `/Users/art/dev/peal/components/CodeEditor.tsx` | Belongs in `LeftPanel` slot |
| Terminal styles | `/Users/art/dev/peal/lib/terminal-styles.ts` | Existing dark aesthetic tokens |
| Landing tokens | `/Users/art/dev/peal/styles/landing.css` | Peal blue accent `#4a9eff` |

## Target architecture

```
app/studio/page.tsx
  └── <PealStudioShell />   (new)
        └── hudsonkit AppShell(app={pealStudioApp})
              Provider: PealStudioProvider (sound store, tool mode, selection)
              slots:
                LeftPanel  → CodeEditor (live Web Audio API code)
                Content    → Studio main canvas / waveform / welcome state
                Inspector  → Parameters + AI design (extract from Studio.tsx side panels)
              hooks:
                useCommands → play, pause, save, open library, switch tool
                useStatus   → playing / ready / generating
                useNavCenter → "SFX" | "Audio" | "Voice" tool indicator
                useNavActions → tool switcher (replaces StudioHeader tabs)
```

### HudsonApp manifest

```ts
id: 'peal-studio'
name: 'Sound Studio'
description: 'Design UI sounds with live Web Audio API code and AI'
mode: 'panel'
multiInstance: 'singleton'
```

### Tool modes (preserve UnifiedStudio behavior)

Map the three tools from `UnifiedStudio` without losing routes:

| Tool | Current component | Hudson mapping |
|------|-------------------|----------------|
| `sfx` | `Studio` | Default `Content` + Inspector |
| `audio` | `StudioAudioLab` | `Content` when tool=audio, or `tools[]` accordion entry |
| `voice` | `TTSStudio` | `Content` when tool=voice |

Prefer **nav actions / commands** for tool switching in v1; optional `tools[]` accordion in Inspector for v2.

## Dependency setup

Peal uses **pnpm**. Add HudsonKit via file dependency (mirror Atelier):

```json
"hudsonkit": "file:../hudson/packages/web/hudsonkit"
```

Also import Hudson styles once at the studio route:

```ts
import 'hudsonkit/styles.css';
```

If Vite-style subpath resolution is needed in Next.js, follow Atelier's `vite.config.ts` alias pattern or import from documented `hudsonkit` exports only.

**Next.js 16 + React 19** — already on peal. HudsonKit targets the same stack.

## File plan (create / modify)

```
app/hudson/
  PealStudioShell.tsx       # PlatformProvider + WorkspaceHostRoutesProvider + AppShell
  peal-studio/
    index.ts                # pealStudioApp export
    Provider.tsx
    hooks.ts                # useCommands, useStatus, useNavCenter, useNavActions
    Content.tsx             # delegates to Studio / StudioAudioLab / TTSStudio by tool
    LeftPanel.tsx           # CodeEditor wrapper
    Inspector.tsx           # parameters + AI panel shell
    intents.ts              # optional: play, export, generate

app/studio/page.tsx         # replace UnifiedStudio with PealStudioShell
```

Keep `components/Studio.tsx` etc. as implementation details called from slots.

## Host routes / AI (optional v1)

Atelier wires:

```ts
const HOST_ROUTES = {
  aiChat: '/api/ai/chat',  // peal may use existing API routes
  ...
};
```

If Peal has no `/api/ai/chat`, omit `WorkspaceHostRoutesProvider` AI routes or stub gracefully — **Assistant drawer can be disabled**; focus on panel chrome first.

## Visual requirements

- Dark background consistent with landing (`#111113` / gray-950)
- Peal accent blue `#4a9eff` for active states (not Hudson purple — Hudson CLAUDE.md says no purple)
- Remove custom `StudioHeader` once nav hooks replace it
- Import `hudsonkit/styles.css` + ensure Tailwind doesn't fight Hudson tokens on `/studio`

## Acceptance criteria

1. `/studio` loads inside Hudson `AppShell` with left code panel, center content, right inspector
2. SFX mode works: play sound, edit parameters, code editor updates (parity with current studio)
3. Tool switcher reaches Audio Lab and Voice studio without leaving `/studio`
4. Command palette (Cmd+K) exposes at least: Play, Pause, Open Library, Switch tool
5. Status bar shows playing/ready state
6. `pnpm build:web` passes
7. No regression on `/library` or landing page

## Verification

```bash
cd /Users/art/dev/peal
pnpm install
pnpm build:web
# dev already on :3001 — do not restart unless broken
```

## Report back

When done, reply with:

- Files changed (list)
- How to test `/studio`
- Known gaps / follow-ups
- Screenshots or short screen recording if possible