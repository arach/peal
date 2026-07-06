# Peal `/docs` Theme Review

**Scope:** Visual/theme audit of `app/docs/page.tsx` against the landing design system (`styles/landing.css`) and product chrome (Studio/Library/Header). Review only — no changes made.

**TL;DR:** The docs page is the only primary surface still wearing the *old* generic Tailwind skin — light-mode-first, Figtree + ui-monospace, raw `blue-600`/`gray-50` utility colors, `shadow-sm` cards, and the legacy `<Header />` nav. The landing has moved to a dark-locked, token-driven "Peal shell" (`#111113` bg, `#4a9eff` accent, Space Grotesk + JetBrains Mono, alpha-surface cards with inset-highlight depth). Docs diverges on essentially every axis: chrome, color, type, surface, and code treatment. Closing the gap is mostly a re-skin against a shared token set plus a nav swap — the content/markdown logic can stay.

---

## 1. Gap Analysis — where docs diverges from landing/product chrome

| Axis | Landing / product chrome | `/docs` today | Divergence |
|---|---|---|---|
| **Nav** | `LandingNav` — sticky, `backdrop-blur(16px)`, translucent `#111113@88%`, `PealBrandMark` w/ blue glow, 13px dim links | `<Header variant="app">` — `bg-white/90 dark:bg-gray-900/90`, `DynamicPealLogo`, generic gray links | **Different component entirely.** Docs wears the light-first app nav, not the dark branded shell. Highest-visibility mismatch. |
| **Color mode** | Always dark (`.landing.dark`, hard-coded hex) | Light-mode **by default** (`bg-white dark:bg-gray-950`) | Docs renders white unless dark toggled; landing is unconditionally dark. |
| **Background** | `#111113` + layered radial/linear gradients, fixed glow layer | `bg-white` / `dark:bg-gray-950` (`#030712`) | Flat, cooler, blue-tinted vs landing's warm-neutral graded shell. |
| **Accent** | `#4a9eff` family (`--landing-accent`, hi `#6bb0ff`, lo `#2d6eb8`) | Tailwind `blue-600` `#2563eb`, `blue-400` `#60a5fa`, `blue-50` `#eff6ff` | Wrong blue. Icons, sidebar active, links all use stock Tailwind blue, not Peal blue. |
| **Fonts** | Space Grotesk (UI) + JetBrains Mono (code) | Inherits global `--font-sans` = **Figtree**; `font-mono` = generic ui-monospace stack | Neither brand font is used on docs. |
| **Surfaces** | Alpha-white gradients (`rgba(255,255,255,0.022)`), inset-highlight shadows, no `shadow-sm` | `bg-gray-50 dark:bg-gray-900`, `rounded-xl`, `shadow-sm`, `border-gray-200/800` | Opaque gray cards w/ drop shadow vs translucent depth. |
| **Code blocks** | `#09090b` near-black, inset shadows, accent `$` prompt, curated hex syntax | `bg-gray-950` / `bg-gray-50` (light!), Tailwind class-based syntax colors | Two different highlighters, two different palettes (see §5). |
| **Layout width** | `1000px` shell, 88–108px section rhythm | `.container` `1400px` + `py-12`, `gap-6/8` | Docs is much wider and tighter-rhythmed than the landing shell. |
| **Labels / kickers** | JetBrains Mono 10px uppercase `tracking 0.18em` accent kickers, pill badges | None — plain `text-3xl font-semibold` hero, no kicker/badge | Missing the mono-label vocabulary that ties surfaces together. |

---

## 2. Specific token / color / type / spacing mismatches

### Color (exact values)
- **Accent blue** — docs `text-blue-600` = `#2563eb`, `dark:text-blue-400` = `#60a5fa`, sidebar active `bg-blue-50` = `#eff6ff` / `dark:bg-blue-900/20` = `#1e3a8a@20%`. Landing target: `--landing-accent #4a9eff`, glow `rgba(74,158,255,0.15)`, active tint `rgba(74,158,255,0.08)`. → every blue on the page is the wrong blue.
- **Background** — docs `dark:bg-gray-950` = `#030712` (cool/blue) vs landing `#111113` (warm-neutral). Even in dark mode the base hue is off.
- **Card surface** — docs `dark:bg-gray-900` = `#111827` (blue-tinted) vs landing `--landing-surface #1c1c1e` (neutral). Hue + lightness both differ.
- **Borders** — docs `border-gray-200` `#e5e7eb` / `dark:border-gray-800` `#1f2937` vs landing `rgba(255,255,255,0.06)` (subtle) / `0.1` (lit). Docs borders are opaque and heavier.
- **Inline code** — docs `bg-gray-100 dark:bg-gray-800` (neutral gray chip) vs landing `rgba(74,158,255,0.1)` + `color: var(--landing-accent)` (accent-tinted). Landing's pillar/feature `<code>` reads as a blue token; docs reads as a gray box.

### Typography
- **Family** — docs headings/body resolve to Figtree (global `--font-sans`); landing UI is `--font-space-grotesk`. Docs `font-mono` resolves to `ui-monospace…` (globals.css), **not** `--font-jetbrains`. JetBrains Mono never loads on docs.
- **Hero** — docs `text-3xl font-semibold` (Figtree 600). Landing hero is `clamp(2.25rem,5vw,3.5rem)` weight **400**, `letter-spacing -0.02em`, with `.landing-badge` + `.accent` span. Different weight, scale, and structure.
- **Headings** — docs h1 `text-2xl font-semibold`, h2 `text-xl font-medium`. Landing section h2 is `1.45rem` weight 500 `-0.02em`, preceded by a mono kicker. Docs has no kicker layer.
- **Labels** — landing leans on `font-jetbrains` 10–11px uppercase `tracking 0.14–0.18em` for badges/kickers/bucket labels. Docs has none of this vocabulary.

### Spacing / layout
- **Container** — docs uses `.container` (`max-width:1400px`, `design-system.css`) vs landing `.landing-shell` `max-width:1000px`. Docs content spans ~40% wider.
- **Rhythm** — docs `py-12` (48px) page padding, `mb-12`, `gap-6/8`. Landing sections are `88px` (`.landing-section`) / hero `108px 0 88px`. Docs feels compact-app; landing feels airy-marketing.
- **Radii** — docs `rounded-xl` (12px) quick-links, `rounded-lg` (8px) cards/sidebar. Landing cards 12px, nav links 6px, modal 14px — comparable scale but docs mixes `xl`/`lg`/`md` ad hoc rather than a token.
- **Elevation** — docs uses `shadow-sm` on the content card; landing deliberately avoids drop shadow in favor of `inset` highlight + `-12px` spread blooms (`--landing-panel-shadow`).

---

## 3. Priority-ranked recommendations

### P0 — structural, high visual impact
1. **Swap the nav.** Replace `<Header />` on docs with `LandingNav` (or a shared `PealNav`) so docs inherits the sticky dark branded chrome. Today docs jumps from the dark landing into a white app bar — the single most jarring transition.
2. **Dark-lock the page.** Wrap docs in the landing shell (`.landing.dark` or a new `.docs`/`.peal-shell` scope) so it stops rendering white-by-default. Adopt `#111113` background + the landing gradient layers.
3. **Replace the accent.** Map all `blue-600/400/50/900` usages (sidebar active, quick-link icons, feature icons, links) to `#4a9eff` / `--landing-accent` and its tints. This alone makes docs read as "Peal."

### P1 — type & surface fidelity
4. **Adopt brand fonts.** Apply Space Grotesk to headings/UI and **JetBrains Mono** to all code/`font-mono` on docs (the page currently never loads JetBrains). Drop hero to weight 400 with `-0.02em` tracking to match `.landing-hero h1`.
5. **Re-skin cards & borders.** Quick-link + feature + content cards → landing's translucent surfaces (`rgba(255,255,255,0.022)` gradient, `rgba(255,255,255,0.06)` border, inset-highlight shadow), drop `shadow-sm`, normalize radii to the landing scale.
6. **Accent-tint inline code.** `bg-gray-100/800` chips → `rgba(74,158,255,0.1)` bg + accent text, matching `.landing-pillar code`.
7. **Add the kicker/label vocabulary.** Give docs section headers a JetBrains-Mono uppercase kicker (e.g. a `.landing-kicker` equivalent: "API", "CLI", "Guide") so it speaks the same dialect as landing/Studio.

### P2 — polish & cohesion
8. **Unify the code highlighter** (see §5) so docs JS/TS uses the landing syntax palette instead of stock Tailwind class colors.
9. **Tighten width/rhythm.** Move docs onto the `1000px` shell (or a docs-appropriate `~1100–1200px`) and increase section spacing toward the landing's airier rhythm.
10. **Reconcile the terminal block** with `.landing-install-cmd` (accent `$` prompt, `#09090b` inset surface) so CLI snippets look identical on landing and docs.

---

## 4. Suggested approach — token strategy

**Recommendation: extract a shared `peal-shell` token layer, then build a scoped `.docs` stylesheet on top of it.**

Three options weighed:

- **A. Reuse `.landing` classes directly on docs** — fast but wrong: landing classes are component-specific (`.landing-hero`, `.landing-nav`, `.landing-sound-card`) and semantically marketing. Docs needs sidebar/content/quick-link primitives that don't exist in landing. Rejected.
- **B. Scoped `.docs` stylesheet that re-declares the landing variables** — pragmatic and low-risk. Copy the `--landing-*` token block into a `.docs` scope, build docs-specific layout against it. Ships fastest. Risk: token drift — two copies of the same palette to keep in sync.
- **C. Promote shared primitives to a `peal-shell` token set, consumed by both landing and docs (Recommended).** Lift the *non-component* tokens — `--peal-bg`, `--peal-surface`, `--peal-border(-lit)`, `--peal-text(-dim/-muted)`, `--peal-accent(-hi/-lo)`, `--peal-syntax-*`, font vars, panel shadows — out of `.landing` into a shared scope (e.g. `styles/peal-shell.css`, applied via a `.peal-shell` wrapper or `:root`). `.landing` keeps its marketing-specific component classes but references the shared tokens; `.docs` gets its own thin stylesheet (sidebar, content card, quick-links) that consumes the same tokens.

**Why C:** it's the only option that prevents the exact drift that produced this gap (landing evolved, docs didn't). It also sets up Studio/Library/Voice to converge on one token source later. **Sequence:** ship B first as the visible win (re-skin docs against copied tokens + nav swap), then refactor the shared tokens out under C once the docs layout is settled — B's `.docs` sheet becomes C's `.docs` sheet with the local `--landing-*` copies swapped for `--peal-*`.

**Nav note:** factor a `PealNav` that both `/` and `/docs` (and eventually Studio/Library) render, rather than duplicating `LandingNav`. The nav is the most-shared chrome and the highest-value thing to centralize.

---

## 5. Code block / sidebar / quick-link card treatment

### Code blocks
Docs ships **two** highlighters that don't match landing:

- **Terminal block** (`language === 'bash'`): `bg-gray-950` body, `bg-gray-900` header, traffic-light dots, `terminal` label. Closest to landing of the three, but should converge on `.landing-install-cmd`: `#09090b` body, `inset` shadows, **accent `$` prompt** (`color: var(--landing-accent)`), JetBrains Mono 12px. Keep the copy button.
- **JS/TS block**: `bg-gray-50 dark:bg-gray-950/50` — **light-gray background in light mode**, which clashes hard with a dark shell. Should be a single dark surface (`#09090b` + inset highlight) regardless of mode.
- **Syntax palette mismatch** (the biggest tell):

  | Token | Docs (Tailwind classes) | Landing (`--landing-syntax-*`) |
  |---|---|---|
  | String | `green-600/400` `#16a34a` / `#4ade80` | `#4a9eff` (**blue**, `--syntax-str`) |
  | Keyword | `blue-600/400` `#2563eb` / `#60a5fa` | `#c792ea` (**purple**, `--syntax-kw`) |
  | Number/Bool | `purple-600/400` | — (folds into kw/str) |
  | Function | `yellow-600/400` | `#e6c07b` (`hl-fn`) |
  | Key/prop | `red-500/400` | `#7ec8e3` (`--syntax-key`) |
  | `peal.*` | `orange-600/400` | — |

  Strings are green-vs-blue and keywords are blue-vs-purple — opposite enough that the same snippet looks like a different product. **Recommend:** retire the inline `highlightJavaScript` Tailwind-class tokenizer in favor of the landing `.hl-*` classes (and reuse `lib/highlight-javascript.ts` if it emits those). One highlighter, the landing palette, JetBrains Mono everywhere.

### Sidebar
- Today: `bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400` active, `rounded-lg`, sticky `top-24`, lucide icons.
- Target: dark-shell treatment — inactive `var(--landing-text-dim)`; active `color: var(--landing-accent)` + `background: rgba(74,158,255,0.08)` (mirror `.landing-install-tab.active` / `.landing-sound-modal-tab.active`); hover `rgba(255,255,255,0.05)`. Optional: a 2px accent left-border or a JetBrains-Mono section label above the list. Keep icons but tint to `--landing-text-muted`, accent on active.

### Quick-link cards
- Today: `bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100/800`, `blue-600` icon, `ArrowRight` slide.
- Target: model on `.landing-sound-card` / `.landing-pillar` — translucent gradient surface (`rgba(255,255,255,0.022→0.01)`), `rgba(255,255,255,0.06)` border, hover `translateY(-1px)` + `box-shadow: 0 8px 24px -16px rgba(0,0,0,0.5)` and border lift to `0.08`. Icon in `--landing-accent` at `opacity 0.85`, → `--landing-accent-hi` on hover (matches `.landing-pillar-icon`). Keep the `ArrowRight` micro-interaction; tint it `--landing-text-muted` → accent on hover.

### Content card
- Drop `shadow-sm` + `bg-white dark:bg-gray-900`; use a single dark panel (`--landing-surface` or transparent-on-shell) with a subtle `rgba(255,255,255,0.06)` border and the landing inset-highlight shadow if any elevation is wanted. Prose colors → `--landing-text` / `--landing-text-dim`.

---

## Appendix — reference files
- Target tokens: `styles/landing.css` (`--landing-*`, `.landing-nav`, `.landing-install-cmd`, `.landing-sound-card`, `.landing-pillar`, `.landing-kicker`, `.hl-*`)
- Docs source: `app/docs/page.tsx` (`CodeBlock`, `MarkdownContent`, quick-links, sidebar)
- Nav to adopt: `components/LandingNav.tsx` (vs current `components/Header.tsx` `app` variant)
- Fonts: `app/layout.tsx` (`--font-space-grotesk`, `--font-jetbrains`, `--font-figtree`)
- Globals that currently win on docs: `app/globals.css` (`--font-sans`→Figtree, `--font-mono`→ui-monospace), `styles/design-system.css` (`.container` 1400px)
- Terminal-chic reference (not currently used by docs): `lib/terminal-styles.ts`
