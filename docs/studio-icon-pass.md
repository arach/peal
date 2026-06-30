# Studio icon pass — Phosphor for the Sound Studio chrome

Goal: replace the generic **Lucide** icons in the Hudson Sound Studio (`/studio`)
with a single, professional, cohesive set that reads well on the dark shell
(`#111113` / `#1c1c1e`) and the Peal blue accent (`#4a9eff`).

## Library chosen

**Phosphor Icons** — `@phosphor-icons/react@^2.1.10` (added via `pnpm add`).

- Weight `bold` by default, to match the hardware / EDC sound-designer
  instrument chrome (`styles/studio-instruments.css`): rack labels, pad
  captions, and module tabs are uppercase mono at `font-weight: 600`
  ("engraved"). Phosphor `regular` read visibly lighter than those labels —
  especially the 9–10px pad icons on the brushed-metal gradient — so `bold`
  gives the icons the same engraved weight and a crisp read on dark pads.
  (Set once in the wrapper; per-call overrides remain possible.)
- Icons inherit `currentColor`, so they pick up button text / active-accent
  colors automatically (light on dark pads; near-black on an active blue pad,
  matching the engraved label).
- Distinct geometric silhouette differentiates the studio from Lucide-based
  marketing/library pages, which were intentionally **left on Lucide** this pass.

`@phosphor-icons/react` is **not** in Next 16's default `optimizePackageImports`
list (unlike `lucide-react` / `@tabler/icons-react`), so it was added explicitly
in `next.config.js` to tree-shake the 3,000-icon barrel.

## Single source of truth

All studio icons now route through one wrapper — **`components/icons/PealStudioIcon.tsx`**
— which maps semantic names onto Phosphor glyphs. No studio file imports
`@phosphor-icons/react` directly; to change the set, edit one file.

Each export is a thin component defaulting to `size=14`, `weight="regular"`, and
forwarding `className` / `color` / aria props. Works as JSX (`<PlayIcon size={12} />`)
and via `createElement(PlayIcon, …)` (used in the `.ts` manifest + command palette).

## Mapping

| Wrapper export   | Phosphor glyph   | Replaced (Lucide)        | Used in                                              |
|------------------|------------------|--------------------------|------------------------------------------------------|
| `PlayIcon`       | `Play`           | `Play`                   | hooks (command palette, nav transport)               |
| `PauseIcon`      | `Pause`          | `Pause`                  | hooks (command palette, nav transport)               |
| `SaveIcon`       | `FloppyDisk`     | `Save`                   | hooks (Save cmd), Studio toolbar Save                |
| `LibraryIcon`    | `FolderOpen`     | `FolderOpen`             | hooks (Open Library), Studio Open / Browse Library   |
| `ParametersIcon` | `SlidersHorizontal` | `SlidersHorizontal` / `Settings` | hooks, `index` right panel, Inspector, Studio Parameters tab |
| `SettingsIcon`   | `GearSix`        | `Settings`               | Studio "Apply Changes / Add Sound" action            |
| `AiDesignIcon`   | `Sparkle`        | `Sparkles`               | hooks, Inspector, Studio AI Design tab + first-sound |
| `CodeIcon`       | `Code`           | `Code2`                  | `index` left panel, LeftPanel, code-editor surface   |
| `ScissorsIcon`   | `Scissors`       | `Scissors`               | Studio Trim tool + Cut context menu                  |
| `EditIcon`       | `PencilSimple`   | `Edit3`                  | Studio Edit tool                                     |
| `MagicWandIcon`  | `MagicWand`      | `Wand2`                  | Studio inline vibe-generate                          |
| `CopyIcon`       | `Copy`           | `Copy`                   | code-editor surface (copy code)                      |
| `CheckIcon`      | `Check`          | `Check`                  | code-editor surface (Apply / copied)                 |
| `RefreshIcon`    | `ArrowsClockwise`| `RefreshCw`              | code-editor surface (sync with Studio)               |
| `GitBranchIcon`  | `GitBranch`      | `GitBranch`              | code-editor surface (version history)                |
| `WarningIcon`    | `WarningCircle`  | `AlertCircle`            | code-editor surface (reconcile prompt)               |
| `VolumeIcon`     | `SpeakerHigh`    | `Volume2`                | hooks (SFX tool), `index` app icon (#4a9eff)         |
| `MicIcon`        | `Microphone`     | `Mic2`                   | hooks (Voice tool), LeftPanel voice copy             |
| `StopIcon`       | `Stop`           | (`Square`)               | reserved — transport now uses custom SVG (see below) |
| `LayersIcon`     | `StackSimple`    | (`Layers`)               | reserved — `audio` tool removed by layout pass       |
| `WaveformIcon`   | `Waveform`       | (`Waves`)                | reserved — tool switch now Voice/Mic                 |

One deliberate cohesion change: the Studio **Parameters tab** was a gear
(`Settings`) and is now `ParametersIcon` (sliders), matching the Hudson right
panel + command palette which already used sliders for "Parameters". The
"Apply Changes" action keeps a gear (`SettingsIcon`).

## Files changed

- **new** `components/icons/PealStudioIcon.tsx` — the wrapper / mapping
- `app/hudson/peal-studio/hooks.ts` — command palette, nav transport, status icons
- `app/hudson/peal-studio/index.ts` — app icon + left/right panel icons
- `app/hudson/peal-studio/Inspector.tsx` — inspector / tool headers
- `app/hudson/peal-studio/LeftPanel.tsx` — per-tool panel header icons
- `components/PealSfxCodeEditorSurface.tsx` — code editor chrome (6 icons)
- `components/Studio.tsx` — toolbar, edit tools, tabs, library buttons (11 icons)
- `next.config.js` — `experimental.optimizePackageImports: ['@phosphor-icons/react']`
- `package.json` / `pnpm-lock.yaml` — `@phosphor-icons/react` dependency

## Verification

- Dev server on **:3001 left running** (not restarted by me; Next auto-reloaded
  the config change). `http://localhost:3001/studio` → **HTTP 200**, clean SSR
  (no compile-error overlay), Phosphor chunk loaded, SVGs render.
- `tsc --noEmit`: **zero** icon-related errors. The wrapper and every swapped
  call site type-check.
- `pnpm lint` cannot run repo-wide — pre-existing breakage: `eslint@10.6.0` is
  incompatible with `eslint-plugin-react@7.37.5`
  (`contextOrFilename.getFilename is not a function`). Unrelated to this pass.

## Notes / follow-ups

- The center **transport deck** (`components/studio/StudioInstruments.tsx`,
  added by the concurrent layout pass) uses intentional hand-rolled SVG
  play/pause/stop glyphs in a hardware-instrument style — **not** an icon
  library — so it was left as-is. `StopIcon` stays in the wrapper as vocabulary.
- The layout pass removed the `audio` tool, so `LayersIcon` / `WaveformIcon`
  are currently unused but kept as the documented semantic set.
- Pre-existing `tsc` errors unrelated to icons: hudsonkit `layout` /
  `AppShellLayoutConfig` (layout pass) and the `app/api/ai/chat` route types.
- Marketing / library / presets pages still use Lucide (out of scope). A future
  pass could route them through a shared icon module the same way.
