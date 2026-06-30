# Voice / TTS Studio — style review + restyle plan

Review of `components/TTSStudio.tsx` (rendered by `app/hudson/peal-studio/Content.tsx`
voice branch) against the SFX/Hudson instrument chrome
(`styles/studio-instruments.css`, `components/studio/StudioInstruments.tsx`,
`components/icons/PealStudioIcon.tsx`, the `docs/studio-styling-pass.md` palette pass).

**Scope: review + plan only. No code changed.**

---

## 0. The headline problem: the Voice surface duplicates the Hudson shell

This is the root cause of "very offbrand," not the colors. The Hudson `AppShell`
already provides a **3-column layout**: `LeftPanel.tsx` · center `Content.tsx` ·
`Inspector.tsx` (right). The SFX tool fills those three slots:

| Slot | SFX content |
|------|-------------|
| Left | `PealSfxCodeEditorSurface` (live code / library) |
| Center | `Studio` canvas |
| Right (Inspector) | Parameters + AI Design, portaled in via `hudson.inspectorElement` |

The Voice tool does **not**. `TTSStudio` renders its **own** 3-column layout —
`ResizableSidebar side="left"` (Generated Files, `TTSStudio.tsx:205`) + center +
`ResizableSidebar side="right"` (Configuration, `TTSStudio.tsx:447`) — *inside* the
Hudson center column. Meanwhile the Hudson `LeftPanel.tsx` (voice branch, lines
34–42) and `Inspector.tsx` (voice branch, lines 25–33) show **placeholder copy**
("controls are in the center workspace").

Net result in the screenshot = **5 columns**:

```
[Hudson Left      ] [TTS Left   ] [TTS Center      ] [TTS Right    ] [Hudson Inspector ]
 "Voice Studio"      Generated     Project / Script   Configuration   "Voice tools"
 (placeholder)       Files         Generate           Model/Voice/Spd (placeholder)
```

Two columns are dead placeholders, the real content is crammed into the top ~40%,
and there is a large empty void below because nothing fills vertical height
(`TTSStudio.tsx:296` center is `flex-1 p-6 overflow-auto` with top-aligned
`space-y-6` content). Fixing the chrome tokens without fixing this still leaves a
double-sidebar, five-column surface.

**The fix is to dissolve `TTSStudio`'s two sidebars and route their content into the
Hudson shell slots, exactly like SFX does.**

---

## 1. Specific off-brand issues

### Layout / density / empty space
- **Duplicated sidebars** (`ResizableSidebar` left+right, lines 205 & 447) nested
  inside the Hudson center → 5 columns, 2 of them redundant placeholders. (See §0.)
- **Content floats in the top third** — center column is natural-height, top-aligned;
  no element grabs `flex-1`, so the lower 60% is empty `#111113`.
- **Loose density** vs the instrument rack: `p-6`, `p-12` empty state, `space-y-6`,
  `min-h-40` textarea, 384px sidebars — against rack headers at `0.5rem 0.75rem`
  and 9–10px pad captions.
- **Root `bg-gray-50 dark:bg-gray-950`** (`:203`) conflicts with the shell — the
  voice branch wrapper in `Content.tsx:14` already paints `#111113`.

### Color
- **Gradient glass cards** `bg-gradient-to-br from-gray-900/50 to-gray-800/30
  border-gray-800/50 rounded-sm backdrop-blur-sm` (lines 208, 307, 326, 381, 450)
  — SFX uses flat brushed-metal racks (`peal-inst-rack`: `#16161a → #0c0c0e`, hairline
  borders, no blur).
- **Gradient blue CTA** `bg-gradient-to-r from-blue-600 to-blue-500 ...
  shadow-blue-500/20` (`:357`) — SFX primaries are `peal-inst-pad--active` /
  transport deck (flat `#4a9eff → #2d6eb8`, engraved).
- **Raw Tailwind ramp** `gray-700/800/900/950`, `blue-400/500/600` throughout —
  the palette pass collapsed these to `--inst-*` tokens everywhere else.
- **Tier badge** `bg-blue-500/10 text-blue-400 border-blue-500/20` (`:469`) — soft
  pill, not a mono engraved chip.
- **Amber provider banner** `border-amber-500/30 bg-amber-500/10 rounded` (`:299`) —
  right *idea* (amber is a studio semantic, `--inst-amber`), wrong vocabulary (raw
  Tailwind amber, generic `rounded`, no LED/icon).

### Typography
- **`font-extralight` / `font-light` everywhere** (lines 212, 232, 244, 316, 332,
  357, 453, 463, 491, 501) — the SFX system is the opposite: **engraved 600-weight
  mono** labels (`peal-inst-rack-label`: 10px / 600 / `0.2em` uppercase).
- **Section titles via `styles.studio.sectionTitle`** (`lib/styles.ts:93` =
  `text-sm font-light ... tracking-wide`) — a light 14px label, not the 10px
  engraved rack label with an LED. `styles.studio.inputLabel` (`:97`) is `font-light`
  too. The whole `styles.studio.*` family is the *old* design language.
- **Generic light labels** CONFIGURATION / PROJECT / SCRIPT / GENERATED FILES read
  as marketing headers, not instrument captions. Compare the SFX inspector's
  `<ParametersIcon/> Inspector` — `text-[10px] font-mono uppercase tracking-[0.18em]
  text-[#4a9eff]` (`Inspector.tsx:17`).

### Components / icons
- **Lucide icons** `Download, Copy, Trash2, FileAudio` (`:11`) — the studio
  standardized on **Phosphor via `PealStudioIcon`** (the file's own doc-comment says
  "replacing Lucide across the Hudson studio surfaces"; "Do not import
  `@phosphor-icons/react` directly").
- **shadcn defaults** `Button / Input / Select / Slider / Badge / Textarea`
  (lines 4–10) with default radii + focus rings — vs `StudioPad`, `StudioScopeWell`,
  native `.peal-instruments input[type=range]` faders.
- **Unicode transport glyphs** `▶` / `⏸` (`:402`) instead of `PlayIcon` / `PauseIcon`
  or a `StudioTransportDeck`.
- **shadcn `Slider`** (`:505`) for Speed — bypasses the knurled-thumb / accent-glow
  fader styling that `.peal-instruments input[type=range]` already provides.

---

## 2. Where each piece belongs in the 3-column shell

Mirror the SFX arrangement. Voice maps cleanly:

| Slot | Today (inside TTSStudio) | Should host |
|------|--------------------------|-------------|
| **Left** (`LeftPanel.tsx` voice) | placeholder copy | **TAKES** — the generated-files / take history list (move from `TTSStudio.tsx:205–293`). This is the voice analog of the SFX code/library panel. |
| **Center** (`TTSStudio`) | Project + Script + Generate + own sidebars | **Project name + Script editor + Generate transport + selected-take preview/waveform**. Drop both `ResizableSidebar`s. Make the script rack `flex-1 min-h-0` and pin Generate as a bottom transport so the column fills height. |
| **Right** (`Inspector.tsx` voice) | placeholder copy | **CONFIGURATION** — Model / Voice / Speed (move from `TTSStudio.tsx:447–511`). Direct analog of the SFX Parameters inspector. |

- **Audio Tracks** block (`:378–439`) — fold selection into the left TAKES list
  (a take row already sets `selectedAudioId`); defer the "Play All / timeline"
  multi-track feature to a follow-up rather than keeping it as a 4th center stack.
- **Empty state** (`:209` "No recordings yet") moves with the list into Left.
- **Provider banner + generate error** (`:298`) stay in center, above the script rack.

### Wiring mechanism (how to fill the slots)
The Inspector slot is already a portal target: `Studio` portals via
`hudson.inspectorElement` (`Provider.tsx:74–75`, `Studio.tsx:2968–2969`). Voice
should reuse the **same** pattern; the cleanest, lowest-risk shape:

1. Add a **voice state slice** to `Provider.tsx` mirroring the `publishSfxRuntime` /
   `sfxSummary` pattern — e.g. `publishVoiceRuntime({ files, config, actions })` +
   `voiceSummary`. `TTSStudio` keeps owning state and publishes it up.
2. `Inspector.tsx` (voice branch) renders **Configuration** from `voiceSummary`
   (replacing lines 25–33). Or, even simpler for the right side only, portal the
   config JSX into the existing `hudson.inspectorElement` — zero Provider change.
3. For the **left** slot, add a symmetric `leftPanelElement` setter to `Provider.tsx`
   (mirror `inspectorElement`) so `TTSStudio` can portal the TAKES list into
   `LeftPanel.tsx`; or render it directly in `LeftPanel.tsx` off the published
   voice slice.

Recommendation: **lift a voice slice into the Provider** (option 1) and render Left +
Inspector content directly there — it matches the SFX precedent, avoids a second
portal-target plumbing, and keeps `TTSStudio` as a pure center editor.

---

## 3. Concrete restyle plan — token / class mapping

The voice surface **already lives inside `.peal-studio-shell`**
(`PealStudioShell.tsx:8,28` imports `studio-instruments.css` and sets the scope +
`--inst-*` vars + `--hud-accent`). So **no new CSS import is needed** — every
`peal-inst-*` class and `--inst-*` token is already in scope. Add the
**`peal-instruments`** class on the voice root to activate the range-input fader
styling (as `Studio.tsx:2428` does).

| TTSStudio construct (line) | Replace with |
|----------------------------|--------------|
| Root `bg-gray-50 dark:bg-gray-950` (`:203`) | drop bg (shell paints `#111113`); add `peal-instruments`; make it a vertical flex that fills height |
| `<h2 className={styles.studio.sectionTitle}>` (`:207,306,325,380,449`) | `StudioRack` header — `peal-inst-rack-label` (engraved 10px/600) + `StudioLed`; delete the separate `<h2>` |
| Gradient glass card (`:208,307,326,381,450`) | `StudioRack` (`peal-inst-rack`) with `label` + optional `readout` |
| Script `<Textarea>` well (`:328`) | wrap in `StudioScopeWell` (`peal-inst-scope-well`, `#09090b`); mono text at **normal** weight, not `font-extralight` |
| Char-count footer (`:347–352`) | rack `readout` (`peal-inst-rack-readout`) — `${len} CH · ~${est}s` |
| Generate CTA gradient (`:354–372`) | a wide `peal-inst-pad--active` pad or `peal-inst-nav-transport`; keep the `⌘/Ctrl+Enter` kbd but restyle to mono chip; lead with `AiDesignIcon`/`MagicWandIcon` |
| Generating state (`:336–346`) | LED `StudioLed on` (drop the ad-hoc blue dot); engraved mono label; keep `Waveform` in a `StudioScopeWell` |
| Model/Voice `<Select>` (`:454,482`) | keep shadcn `Select` but restyle trigger to `--inst-face-raised`/`--inst-line-lo` (or a `StudioPad`-style trigger); labels → `peal-inst-rack-label` |
| Tier `<Badge>` (`:469`) | mono uppercase chip, `1px` `--inst-accent` border, transparent fill — not `bg-blue-500/10` |
| Speed `<Slider>` (`:505`) | native `<input type="range">` so `.peal-instruments input[type=range]` faders apply; `SPEED` engraved label + right-aligned `peal-inst-rack-readout` value |
| Take-row action buttons (`:254–277`) | `StudioPad` icon pads in a `StudioPadTray`, using `CopyIcon` + new `DownloadIcon` / `TrashIcon` |
| Unicode `▶`/`⏸` (`:402`) | `PlayIcon` / `PauseIcon` from `PealStudioIcon` |
| Lucide `FileAudio` empty state (`:211`) | `WaveformIcon` or `MicIcon`; tighten `p-12`→`p-6`; copy as engraved "NO TAKES YET" |
| Amber banner (`:299`) | `StudioLed tone="amber"` + `WarningIcon` + mono text; border `rgba(232,163,23,…)` (`--inst-amber`) |
| `selectedAudioId` highlight `bg-blue-900/20 border-blue-500` (`:220`) | accent-soft fill + `2px` `--inst-accent` left border (matches SFX active rows) |

**Icons to add to `PealStudioIcon.tsx`** (only two missing): `DownloadIcon`
(`DownloadSimple`) and `TrashIcon` (`Trash`). `Copy/Save/Refresh/Waveform/Mic/
Volume/Play/Pause/Stop` already exist there.

**Leave alone:** the semantic amber (provider-not-configured) and red (delete) tones —
they already match the studio's semantic palette (`--inst-amber`, red delete).

---

## 4. Priority-ordered file list for implementation

1. **`app/hudson/peal-studio/Provider.tsx`** — add a `voice` state slice
   (`publishVoiceRuntime` / `voiceSummary`, mirroring the `publishSfxRuntime` /
   `sfxSummary` shape), and/or a symmetric `leftPanelElement` setter. *Unblocks 2 & 3;
   small, do first.*
2. **`components/TTSStudio.tsx`** — the bulk. Remove both `ResizableSidebar`s; reduce
   to a center editor (Project + Script + Generate transport + preview); publish
   files+config up to the Provider; swap shadcn/Lucide/gradient chrome for
   `peal-inst-*` + `StudioInstruments` + `PealStudioIcon`; add `peal-instruments`;
   make the column fill vertical height. Drop the `styles.studio.*` and
   `ResizableSidebar` imports.
3. **`app/hudson/peal-studio/Inspector.tsx`** — voice branch: render **Configuration**
   (Model / Voice / Speed) from the voice slice instead of the placeholder copy
   (lines 25–33).
4. **`app/hudson/peal-studio/LeftPanel.tsx`** — voice branch: render the **TAKES**
   list instead of the placeholder copy (lines 34–42); icon `MicIcon` → `WaveformIcon`.
5. **`components/icons/PealStudioIcon.tsx`** — add `DownloadIcon` (`DownloadSimple`)
   and `TrashIcon` (`Trash`).
6. **`styles/studio-instruments.css`** — only if new primitives are wanted (e.g. a
   `peal-inst-take-row`, a select-trigger face, or a textarea-well variant). Most of
   this reuses existing classes; expect small additive rules, not a rewrite.

*No change needed to `lib/styles.ts` — just stop referencing `styles.studio.*` from
the voice surface. `ResizableSidebar` stays for any non-Hudson legacy use; it simply
drops out of `TTSStudio`'s imports.*

---

### One-line summary
The Voice surface isn't just mis-tinted — it **re-implements the 3-column shell
inside one column**, leaving two Hudson slots as placeholders and the chrome on the
old shadcn/Lucide/`font-extralight` system. Dissolve its sidebars into the Hudson
Left (Takes) and Inspector (Configuration) slots, keep `TTSStudio` as a center
editor, and re-skin with the already-in-scope `peal-inst-*` / `StudioInstruments` /
`PealStudioIcon` vocabulary.
