# Landing — Softer / Airier Pass

**Goal:** less glare, more breathing room, lighter type, fewer boxed panels — without losing the dual-tone material language or the `#4a9eff` accent.

**Files:** `styles/landing.css`, `components/LandingHero.tsx`, `app/layout.tsx`

> Note: the structural flattening, spacing, and font-weight work (open pillar columns, open sound-card list, borderless feature lists, opened studio promo, weight-500 headers, and the `layout.tsx` weight swap) landed first; this pass completed the **lighting reduction** that was still outstanding, plus extra hero air and lighter headline/lede weights.

## 1 · Lower lighting brightness (less glare)
- **Global glow** (`.landing`, `.landing::before`): hero-top blue radial `0.04 → 0.02`, white sheen `0.015 → 0.008`, fixed overlay `0.025 → 0.014`; bottom vignette `0.25 → 0.18` and gradients widened so light diffuses instead of pooling.
- **Hero phosphor core** (`.landing-hero::before`): the main glare source — `0.10 / 0.06 / 0.03 → 0.045 / 0.025 / 0.014`, ellipses widened and spread (`inset -40→-60px`, `height 340→380px`) so it reads as a soft wash, not a hot spot.
- **Hero horizon hairline** (`::after`): `0.15 → 0.07`.
- **Nav**: blue underglow swapped for a neutral shadow (`rgba(74,158,255,.05) → rgba(0,0,0,.35)`).
- **Badge**: dropped the `24px` blue bloom (inset highlight only). **Badge dot**: double-glow `0.4 + 0.15 → ` single soft `0.22`.
- **Accent headline**: drop-shadow `12px/0.15 → 20px/0.08` (kept the blue gradient, just calmer).
- **Primary button**: machined glare softened (cast `0.28 → 0.12`, hover bloom `0.35 → 0.15`).
- **CTA / sound-playing / studio glows** were already dialed down in the earlier flatten; left subtle.

## 2 · More breathing room
- Hero padding `80/56 → 108/88` (mobile `48/36 → 64/44`).
- Sections `48 → 72`, feature band `40 → 72`, CTA `48 → 80`, footer `28/40 → 40/52`.
- Pillar gap `→ 40`, sound grid `→ 20`, feature columns `→ 48`, config grid `→ 40`, section-header margin `→ 36`, lede margin `48 → 60`.

## 3 · Lighter type
- `layout.tsx`: Space Grotesk weights `['500','600','700'] → ['300','400','500','600']` (removes faux-bold `700`, adds light weights).
- Hero H1 `500 → 400`, looser leading (`1.08 → 1.14`), softer tracking (`-0.03 → -0.02em`).
- Lede `400 → 300`, line-height `1.7 → 1.75`.
- Section / pillar / feature / CTA headers all `700 → 500/400` (CSS + the two inline H2s in `LandingHero.tsx`).
- JetBrains Mono stays scoped to code blocks, CLI, install head, kickers, bucket labels.

## 4 · Fewer boxes
- **Pillars** → open columns (no border / fill / shadow / hover-lift); icons flattened to bare glyphs at `0.85` opacity.
- **Feature buckets** → open lists (padding-only, no panels).
- **Sound cards** → open rows divided by a single hairline, lit blue on hover/play instead of a raised lit panel; the scope-well softened (`#09090b` heavy inset → `#0c0c0e` light recess).
- **Studio promo** → opened (borderless, no blue card glow); preview pane recess softened to match.
- **Install / code blocks** kept as flat bordered surfaces; the terminal command/code wells stay dark by design (terminal-chic), only the decorative wells were lightened.

**Preserved:** 960px column, `#4a9eff` accent + blue gradient word, dual-tone seams (kept, just subtler), terminal-mono code surfaces.
