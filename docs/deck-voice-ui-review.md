# Deck voice studio — UI review (`/studio?tool=voice`)

Review-only. Covers the shipped Deck (commit `7b72f92`): AI Edit panel (last-edit diff,
before/after compare, composer), the programmable mixer, and the 3-panel layout
(deck left / mixer center / AI right), measured against the SFX instrument chrome in
`styles/studio-instruments.css` + `components/studio/StudioInstruments.tsx`.

**Verdict:** the *instrument* surfaces (deck pads, knobs, racks, transport, last-edit
diff) are genuinely on-brand and well executed — they reuse the `peal-inst-*` vocabulary
faithfully. The drift is concentrated in **the AI Edit right panel** (too many stacked
bands, no scroll containment, hardcoded hexes, leftover Lucide, chat-app radii) and in
**redundancy** (duplicate AI entry points, duplicate suggestion chips, duplicate/dead FX
+ deck code, 4 separate play buttons). Nothing here is a rewrite; it's consolidation +
token alignment.

How the 3 panels map to the shell:
- **Left** = `LeftPanel.tsx` → `<PealDeck compact />`
- **Center** = `Content.tsx` → `PealVoiceEditor` → `PealVoiceLayoutBar` + `PealFxDesigner` (mixer)
- **Right** = `Inspector.tsx` → `PealVoiceInspector` → tabs `AI Edit` (`PealVoiceAIDesign`) / `Capture` (`PealVoiceConfig`)

---

## P0 — high impact, low risk

### 1. The AI Edit right panel stacks up to 7 bands with no scroll containment
`app/hudson/peal-studio/voice/PealVoiceAIDesign.tsx`

The panel is a vertical stack of `shrink-0` bands around one `flex-1` chat:
header → chat (`flex-1`) → "Working" activity → `PealVoiceAILastEdit` → "Selected pad"
→ "Suggested next" chips → composer. Only the **chat** scrolls. When `PealVoiceAILastEdit`
is expanded (applied chips + compare cards + full strip diff + follow-ups + dismiss it
can be 250–350px), it eats the column from the bottom while the chat is still claiming
`flex-1` — the chat collapses to a sliver and, on a short inspector, the **composer can be
pushed below the fold**. There is no outer scroll region wrapping lastEdit + selected-pad
+ suggested.

- **Target:** wrap everything between the header and the composer in a single
  `min-h-0 flex-1 overflow-y-auto`, and pin only the header (top) and composer (bottom).
  Let lastEdit live *inside* that scroll region rather than as its own `shrink-0` sibling.
- Default `PealVoiceAILastEdit` to **collapsed** (it already supports `lastEditExpanded`)
  so the resting state is chat + composer, not a wall of diff.

### 2. Suggestion chips render the same list twice
`PealVoiceAIDesign.tsx:24-27` vs `PealVoiceAILastEdit.tsx:187-206`

When a `lastEdit` exists, `PealVoiceAIDesign` sets `starterChips = lastEdit.followUpSuggestions`
(`:24`) and renders them in its "Suggested next" band (`:80-92`) — **and** `PealVoiceAILastEdit`
renders the *same* `lastEdit.followUpSuggestions` in its "Next" band (`:192-204`). The identical
chip set appears twice, ~80px apart, in the same column.

- **Target:** pick one home. Recommend keeping follow-ups **inside** the last-edit panel
  (they're contextual to that edit) and have `PealVoiceAIDesign`'s band fall back to
  `editSuggestions`/capture prompts only when `lastEdit` is absent.

### 3. Three AI entry points within one screen-width
`PealVoiceAIEditBar.tsx` (inside the mixer) + `PealVoiceInspector` tab + `PealVoiceAIDesign` header

`PealFxDesigner` embeds `PealVoiceAIEditBar` at the top of the mixer rack
(`PealFxDesigner.tsx:49`) — a full LED + `AiDesignIcon` + "AI edit" + suggestion-chip block —
while the right panel is *also* an AI Edit surface (tab label + `PealVoiceAIDesign` header,
both with `AiDesignIcon` + "AI Edit"). The mixer (center) and the AI panel (right) sit side by
side, so the user sees the same "AI edit" lockup and the same suggestion chips twice, adjacent.

- **Target:** drop `PealVoiceAIEditBar` from the mixer, or reduce it to a one-line "→ AI Edit"
  affordance that focuses the right-panel composer. Remove the import/use at
  `PealFxDesigner.tsx:20,49`.

### 4. Leftover Lucide icons in the chat (consistency regression)
`PealVoiceAIChat.tsx:5` — `import { Square, AlertCircle } from 'lucide-react'`

Everything else in the voice surface uses Phosphor via `PealStudioIcon`; this is the only
Lucide left. `StopIcon` (`PealStudioIcon.tsx:76`) and `WarningIcon` (`:101`) already exist.

- **Target:** swap `Square`→`StopIcon` (`PealVoiceAIChat.tsx:127`) and
  `AlertCircle`→`WarningIcon` (`:75`); delete the Lucide import.

---

## P1 — chrome/token alignment (AI surfaces drift from SFX)

### 5. AI panels hardcode hexes instead of `--inst-*` tokens
`PealVoiceAIDesign.tsx`, `PealVoiceAIChat.tsx`, `PealVoiceAILastEdit.tsx`

The deck/mixer use `var(--inst-line-lo)`, `--inst-well`, `--inst-face`, `--inst-accent`.
The AI panels hardcode `#2c2c2e`, `#0d0d0f`, `#1c1c1e`, `#111113`, `#4a9eff` for the same
roles (band dividers, surfaces, accent). Net effect: the AI panel's internal hairlines are a
*solid gray* (`#2c2c2e`) while the mixer/deck seams are *black-alpha* (`--inst-line-lo` =
`rgba(0,0,0,0.55)`), so the panels read as two slightly different greys where they meet.

- **Targets:** `PealVoiceAIDesign.tsx:31,57,70,76` (`border-[#2c2c2e]`, `bg-[#0d0d0f]`,
  `bg-[#111113]`); `PealVoiceAIChat.tsx:38,66` (`border-[#2c2c2e] bg-[#1c1c1e]`);
  `PealVoiceAILastEdit.tsx:34` (`border-[#2c2c2e] bg-[#0d0d0f]`). Map → `--inst-line-lo`,
  `--inst-well`/`--inst-face`, `--inst-accent`. This is the biggest single drift vector: if the
  palette moves, these won't.

### 6. Chat bubbles + composer use chat-app radii, not instrument radii
`PealVoiceAIChat.tsx:35` (`rounded-lg`), `:66` (`rounded-lg`); `styles/studio-instruments.css:966` (composer `6px`)

Instrument vocabulary clusters at 3–6px (`peal-inst-pad` 3px, racks 6px, scope-well 4px).
The `rounded-lg` (8px) message bubbles read as a generic chat widget dropped into the rack.

- **Target:** bring bubbles to ~4px and back them with `--inst-well`/`--inst-face` rather than
  `bg-[#1c1c1e]/80`. Consider an engraved/scope-well treatment for the assistant side so the
  transcript reads like a readout, not iMessage.

### 7. Composer input is the only always-blue-bordered field in the studio
`styles/studio-instruments.css:963-975` (`.peal-voice-ai-composer-input`)

Every other field uses `.peal-inst-field`/`.peal-inst-select` (token border, blue **only on
focus**, `:471`). The composer carries a permanent `rgba(74,158,255,0.35)` border, making it
shout relative to the rest of the chrome.

- **Target:** align `.peal-voice-ai-composer-input` to the `.peal-inst-field` recipe — neutral
  `--inst-line-lo` border at rest, blue glow on `:focus` only.

### 8. Standardize the chip primitive on `<StudioPad>`
`PealVoiceAIDesign.tsx:87` and `PealVoiceAILastEdit.tsx:199` build chips with raw
`className="peal-inst-pad …"` buttons; `PealVoiceAIEditBar.tsx:37` uses the `<StudioPad>`
component. Same look, two code paths.

- **Target:** route all three through `<StudioPad>` so disabled/active/tone states stay in sync.

---

## P2 — mixer ergonomics
`app/hudson/peal-studio/voice/PealFxDesigner.tsx`

### 9. Two `flex-1` regions fight inside one scrolling rack
The mixer rack stacks AI-bar → scope-well (`min-h-[9rem] flex-1`, `:50`) → "Load genre" block
→ "Channel strip" → knob grid (`flex-1 overflow-y-auto`, `:145`) → reset/default pads, all
inside one `StudioRack`. Two `flex-1` children (scope-well **and** knob grid) compete for the
same vertical space, so in a narrow center column the knob grid can get squeezed to a few rows
and scroll while the scope-well hogs height — height distribution is ambiguous.

- **Target:** give the scope-well a fixed/`max-h` height and let only the knob area flex; or
  split into two stacked racks so each owns its scroll.

### 10. Helper-paragraph overload
Four gray `font-mono text-[9px]` explainer paragraphs (`:88-90`, `:102-104`, `:126-134`,
`:141-143`) plus the scope-well caption (`:53-59`). SFX racks are terse — engraved label +
`peal-inst-rack-readout`. This reads like onboarding copy bolted onto an instrument.

- **Target:** collapse to `title=` tooltips or a single helper line; let the engraved labels +
  readouts carry the meaning the way the SFX racks do.

### 11. 4-up knob grid orphans the 5th knob
`styles/studio-instruments.css:745-751` — `.peal-inst-fx-knob-grid` is 4 columns, but there are
exactly 5 `FX_KNOBS` → 4 + 1 lonely knob on row 2 (and the `max-width:720px` rule drops to 2-up,
which the narrow center column will usually hit → 3 ragged rows). A 5-knob channel strip reads
best as a **single horizontal row** (5-up), like a real console strip.

- **Target:** consider `grid-template-columns: repeat(5, …)` (or auto-fit) for the strip; revisit
  the 720px breakpoint given the center column is flanked by deck + inspector.

### 12. Four separate play affordances for "audition the selected clip"
deck-pad action (`PealDeck.tsx:108`), scope-well preview pad (`PealFxDesigner.tsx:68`), mixer
bottom `StudioTransportDeck` (`:181`), and the last-edit play button (`PealVoiceAILastEdit.tsx:66`)
all ultimately audition the selected take. The big transport deck repeats the same control already
present three other places on screen.

- **Target:** keep the bottom `StudioTransportDeck` as the canonical transport and demote the
  inline ones, or scope each to a distinct meaning (raw vs through-mixer vs before/after) and label
  them so the redundancy becomes intentional.

---

## P3 — layout, dead code, diff affordances

### 13. Orphaned duplicate FX UI — `PealFxRack` is never mounted
`app/hudson/peal-studio/voice/PealFxRack.tsx` (confirmed: no import outside its own file)

It's a second, full FX surface (insert-chain `peal-inst-select` dropdown + the same `FX_KNOBS`
channel strip) built on `clip.fxParamsOverride` instead of the mixer's `mixerKnobOverrides`. It
duplicates the mixer concept with a *different* mental model and different chrome (dropdown vs the
designer's genre pad-grid). Dead today; a confusing fork if ever wired in.

- **Target:** delete `PealFxRack.tsx`, or fold its per-clip-override idea into `PealFxDesigner`.

### 14. Dead `PealDeck` transport branch
`PealDeck.tsx:136-146` — the `!compact` block (with its own `StudioTransportDeck`) never renders;
`PealDeck` is only ever `<PealDeck compact />` (`LeftPanel.tsx:12`).

- **Target:** drop the `compact` prop and the non-compact branch, or actually use the full deck
  somewhere.

### 15. Deck "selected" state is too quiet for the panel that anchors the other two
`styles/studio-instruments.css:632-634` — `.peal-inst-deck-pad--selected` is a **1px rgba outline**,
while `--playing` (`:636-641`) gets a full amber glow. But *selection* is the load-bearing state:
selecting a deck pad drives the mixer (center) and AI (right). The anchor reads weaker than the
transient.

- **Target:** strengthen `--selected` (accent left-bar + soft fill, like `.peal-inst-take-row--active`
  at `:492-495`) so the cross-panel anchor is obvious.

### 16. Per-row before/after buttons imply per-row audition but set a global side
`PealVoiceAILastEdit.tsx:141-176` — each diff row renders its own before/after buttons, but they all
call `previewEditCompare('before'|'after')`, which flips the **whole** `compareSide`. Tapping one
row's "before" doesn't audition just that knob; it switches the entire mixer. The affordance over-
promises.

- **Target:** make the per-row values **display-only** and keep the single big
  `peal-voice-ai-compare` card pair (`:105-133`) as the one audition control — or genuinely wire
  per-row solo if that's the intent.

### 17. Dead / ruleless diff CSS
`styles/studio-instruments.css` — `.peal-voice-ai-diff-before` (`:1049`) and
`.peal-voice-ai-diff-after` (`:1059`) are never used (JSX uses `-diff-btn--before/--after`).
Conversely `.peal-voice-ai-applied` (`PealVoiceAILastEdit.tsx:88`) and `.peal-voice-ai-diff`
(`:135`) wrappers have **no** CSS rule (they coast on utility spacing).

- **Target:** delete the two dead rules; either add rules for `-applied`/`-diff` or drop the class
  names. Pure hygiene.

### 18. Layout-mode naming + the "capture in center" concept
`PealVoiceLayout.tsx` / `voiceLayout.ts` — modes are **Single / Tabs / Tile** and the center modules
are `fx` (mixer) and `capture` (TTS config). The product story is "deck / mixer / AI," but Tile/Tabs
let `capture` take the center, introducing a 4th surface into the "mixer center" frame. The mode names
don't say *what* is being tabbed/tiled.

- **Target:** rename modes to describe the content (e.g. "Mixer" / "Mixer + Capture" / "Split"), and
  reconsider whether `capture` belongs in the center vs. staying the right-panel "Capture" tab it
  already is (`PealVoiceInspector.tsx:32`) — today it's reachable in *both* places.

---

## Quick-reference: file/CSS targets

| # | Pri | Target |
|---|-----|--------|
| 1 | P0 | `PealVoiceAIDesign.tsx` — single scroll region, pin header+composer, collapse lastEdit by default |
| 2 | P0 | `PealVoiceAIDesign.tsx:24-92` ↔ `PealVoiceAILastEdit.tsx:187-206` — dedupe follow-up chips |
| 3 | P0 | `PealFxDesigner.tsx:20,49` — drop/slim `PealVoiceAIEditBar` |
| 4 | P0 | `PealVoiceAIChat.tsx:5,75,127` — Lucide → `StopIcon`/`WarningIcon` |
| 5 | P1 | `PealVoiceAIDesign.tsx:31,57,70,76`, `PealVoiceAIChat.tsx:38,66`, `PealVoiceAILastEdit.tsx:34` — hex → `--inst-*` |
| 6 | P1 | `PealVoiceAIChat.tsx:35,66` — `rounded-lg` → instrument radii + tokens |
| 7 | P1 | `studio-instruments.css:963-975` — composer border → `.peal-inst-field` recipe |
| 8 | P1 | `PealVoiceAIDesign.tsx:87`, `PealVoiceAILastEdit.tsx:199` — chips → `<StudioPad>` |
| 9 | P2 | `PealFxDesigner.tsx:50,145` — resolve dual `flex-1` |
| 10 | P2 | `PealFxDesigner.tsx:88-143` — trim helper paragraphs |
| 11 | P2 | `studio-instruments.css:745-757` — 5-up channel strip |
| 12 | P2 | `PealDeck.tsx:108`, `PealFxDesigner.tsx:68,181`, `PealVoiceAILastEdit.tsx:66` — consolidate transports |
| 13 | P3 | `PealFxRack.tsx` — delete/merge (orphaned) |
| 14 | P3 | `PealDeck.tsx:136-146` — remove dead `!compact` branch |
| 15 | P3 | `studio-instruments.css:632-634` — strengthen `--selected` |
| 16 | P3 | `PealVoiceAILastEdit.tsx:141-176` — per-row buttons display-only |
| 17 | P3 | `studio-instruments.css:1049,1059` — delete dead diff CSS |
| 18 | P3 | `voiceLayout.ts` / `PealVoiceLayout.tsx` — rename modes, reconcile `capture` |
