# Studio styling pass — harmonize /studio surface (right sidebar priority)

Goal: make `/studio` read as one cohesive IDE in the Peal dark-terminal family
(`#111113` shell, `#1c1c1e` panels, subtle borders, single **Peal blue `#4a9eff`**
accent) — instead of a mix of Hudson tokens, blue-tinted Tailwind grays, and
one-off purple/blue chrome. Styling/layout only; **no synthesis / Web Audio logic
changed.**

## Starting point (already landed by the Hudson shell pass)

The Hudson migration had already harmonized the **chrome**: nav, status bar,
left code editor (`components/PealSfxCodeEditorSurface.tsx` — `#0a0f12`/`#0d1317`
wells, `white/10` borders, `#4a9eff` accents), the right-panel **tabs**
(purple→`#4a9eff`, accent underline), mode badges, and
`ResizableSidebar` (`surface="dark"`). The host slots
(`Inspector.tsx`, `LeftPanel.tsx`) were already `bg-transparent`.

What was still off-palette and clashing was concentrated **inside
`components/Studio.tsx`**: the right-panel AI Design + Parameters content and the
center canvas.

## What this pass changed

### `components/Studio.tsx` (the bulk)

Collapsed the ad-hoc accent family onto the single Peal brand color and remapped
the blue-tinted Tailwind gray ramp to a neutral Peal surface ramp — uniformly,
preserving every opacity modifier / variant prefix:

| Before (Tailwind)            | After (Peal token)        | Meaning                       |
|------------------------------|---------------------------|-------------------------------|
| `purple-500/600/400/300`     | `#4a9eff` / `#6bb0ff`     | kill purple → brand blue      |
| `blue-600/700`, `blue-500/400` | `#4a9eff` / `#6bb0ff`   | primary actions → brand blue  |
| `primary-500/400` *(undefined in config → invisible)* | `#4a9eff`/`#6bb0ff` | **fixes** the broken big Play button + segmented active state |
| `gray-950`                   | `#111113`                 | shell / recessed wells        |
| `gray-900`                   | `#1c1c1e`                 | card / panel surface          |
| `gray-800`                   | `#232327`                 | raised control (input/button) |
| `gray-700`                   | `#2c2c2e`                 | hover / secondary surface     |
| `gray-600`                   | `#3a3a3e`                 | hover-2                       |

Text grays (`gray-300/400/500`), and the deliberate **semantic** colors —
green (apply/success + "modified" markers), amber (full-edit caution), red
(delete) — were intentionally left as-is.

Also retinted the **canvas waveform edit/insert-region highlights** (literal
`#9333ea` / `#a855f7` / `rgba(147,51,234,…)` purples) to the accent blue, so the
in-canvas editing overlay matches the UI. The multi-track categorical palette
(`Studio.tsx:2195`) is intentionally **left varied** for per-track differentiation.

### `app/hudson/peal-studio/Inspector.tsx`

Empty-state secondary "Library" button: `border-gray-700 / hover:bg-gray-800`
→ `border-white/15 / hover:bg-white/5` to match the `PealSfxCodeEditorSurface`
white-alpha vocabulary (the "AI Design" button already used the accent).

## Result

- Right Inspector: tabs, input + Generate button, suggestion/example chips,
  generated-sound card, segmented waveform selector, insert-region card, sliders,
  checkboxes, Apply/Add buttons — all one neutral-dark + `#4a9eff` system.
- Center canvas, left code panel, and right Inspector share the same surface
  hierarchy (`#111113` shell, `#1c1c1e` cards, `#232327`/`#2c2c2e` controls).
- No purple anywhere in the chrome; status bar accent swatch reads `#4a9eff`.

## Verification

- `http://localhost:3001/studio` compiles (HTTP 200) after each change.
  **Dev server left running on 3001 — not restarted.**
- Playwright screenshots (`/tmp/studio-0{1,2}-*.png`): default state, AI Design
  tab, and Parameters tab all read cohesively.
- `grep` confirms zero residual `purple/primary-500/blue-[4-7]00/gray-[6-9]00`
  Tailwind classes in `Studio.tsx` (only the intentional track-palette purple at
  line 2195 remains, in JS not chrome).

## Known follow-ups (out of styling scope)

- The Inspector's floating "Start" hint (`Inspector.tsx`,
  `sfxSummary.mounted && !sfxSummary.soundId`) overlaps the open panel's AI Design
  content in the no-sound state. The portaled panel already shows its own
  guidance, so the hint is redundant when the panel is open — but hiding it
  cleanly needs a "panel open" signal that doesn't exist yet (logic, not styling).
- Optional: promote remaining solid neutral borders (`#232327`/`#2c2c2e`) to
  `white/[0.08]` to exactly match `PealSfxCodeEditorSurface` / `landing.css`.
- Optional: extract the Peal studio palette into CSS variables on the
  `PealStudioShell` root (alongside `--hud-accent`) so the hex values become
  shared tokens rather than inline arbitraries.
</content>
