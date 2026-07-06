# Peal Presets UI Review

**Target:** `http://localhost:3001/presets`  
**Reviewer:** Agent (browser + code inspection)  
**Date:** 2026-06-30  
**Scope:** Design-token alignment, visual polish, UX flows (browse / preview / studio handoff)  
**Reference tokens:** `styles/landing.css` (`--landing-*`), `styles/studio-instruments.css` (`--inst-*`), `app/globals.css` (shadcn HSL vars)  
**Out of scope:** Application code changes (review only)

---

## Verdict

Presets is **visually darker and more intentional than Library** — dark shell, human-readable sound names, category tabs, duration badges, and tag chips give it a curated-catalog feel that Library lacks. However, it **does not use the Peal design-token system at all**. The entire page is built from ad-hoc Tailwind grays (`bg-gray-950`, `bg-gray-900`, `border-gray-800`) and broken `primary-500` classes that resolve to **transparent backgrounds** in the browser (verified via computed styles). The result is a page that *looks* polished at a glance but sits in a **parallel, blue-tinted Tailwind gray ramp** rather than the machined Peal surfaces (`#111113` / `#1c1c1e` / `#232327`) used on landing and Studio. Accent hierarchy is inconsistent: hover bars use `purple-500`, playing state uses `green-500`, and primary CTAs rely on undefined `primary-500` — none of which map to `--landing-accent` or `--inst-accent` (`#4a9eff`). Presets is the **reference dark UX** Library should inherit, but it still needs a **token migration pass** to match landing/Studio material language (edge hi/lo hairlines, scope wells, engraved mono labels, accent-glow play states).

**Token adoption score:** ~15% — dark-mode intent aligns with brand direction; zero CSS custom properties from `landing.css` or `studio-instruments.css` are referenced. Shared typography utilities from `design-system.css` (`.section-header`, `.heading-2`) are unused.

---

## Screenshots

| File | What it shows |
|------|----------------|
| `/.screenshots-presets-review.png` | Full page — Interaction category, 4 preset cards, About footer |
| `/.screenshots-presets-feedback-tab.png` | Feedback category tab selected — Success Chime / Soft Error / Confirm Pop |
| `/.screenshots-presets-playing.png` | Preview playing state — purple hover/progress bar on card |
| `/.screenshots-presets-mobile.png` | Narrow viewport — horizontal tab scroll, 3-column card grid persists |
| `/.screenshots-presets-studio-nav.png` | Studio handoff after "Open in Studio" (`/studio?sound=…&type=tone`) |
| `/.screenshots-library-presets-flow.png` | Library → Presets transition (from library review) |

---

## Token mapping table

| UI element | Should use (token) | Uses today | Gap |
|------------|-------------------|------------|-----|
| **Page shell** | `--landing-bg` `#111113` or `--inst-chassis` `#0c0c0e` | `bg-gray-950` (`app/presets/page.tsx:181`) | Blue-tinted Tailwind gray, not Peal neutral ramp |
| **Studio header** | `--landing-surface` + `--landing-edge-hi/lo` hairlines | `bg-gray-950 border-gray-800` (`Header.tsx:74`) | Flat border, no rim light / blur |
| **Sticky tab bar** | `--inst-face` gradient + `--inst-line-lo` bottom rule | `bg-gray-950 border-gray-800` (`page.tsx:184`) | No machined panel depth |
| **Category tab (active)** | `--landing-accent` / `--inst-accent` `#4a9eff` + glow | `bg-primary-500` (`page.tsx:193`) | **Broken — computes to `rgba(0,0,0,0)`** |
| **Category tab (idle)** | `--inst-face-raised` `#1e1e22` + `--inst-label` text | `bg-gray-800 text-gray-400` (`page.tsx:194`) | Generic gray, no engraved label style |
| **Create Custom CTA** | `.peal-inst-pad` or landing machined button (`--inst-accent` gradient) | `bg-primary-500 hover:bg-primary-400` (`page.tsx:165`) | **Broken transparent bg**; not transport-button material |
| **Preset card surface** | `--landing-surface` `#1c1c1e` + `--landing-panel-shadow` | `bg-gray-900 border-gray-800` (`page.tsx:211`) | Flat card, no dual-tone edge or inset highlight |
| **Card hover** | `--landing-accent` border + `--landing-panel-shadow-hover` | `hover:border-gray-700` (`page.tsx:211`) | Subtle gray shift only |
| **Duration badge** | `--inst-label` mono readout on `--inst-well` | `text-gray-500 bg-gray-800` (`page.tsx:220`) | Not engraved; wrong type scale |
| **Tag chips** | `--landing-text-dim` on `rgba(255,255,255,0.05)` (`.landing-sound-tag`) | `bg-gray-800 text-gray-400` (`page.tsx:230`) | Missing mono font, wrong opacity |
| **Preset title** | `--landing-text` / `--inst-engrave` | `font-semibold text-lg` default white (`page.tsx:217`) | No mono meta pairing |
| **Description** | `--landing-text-dim` | `text-gray-400` (`page.tsx:218`) | Close in intent, wrong token source |
| **Preview button** | `.landing-sound-play` or `.peal-inst-pad` (accent on active) | `bg-gray-800 hover:bg-gray-700` (`page.tsx:245`) | Recessed gray, not machined transport |
| **Playing state** | `--landing-accent` + `--landing-accent-glow` (`.is-playing`) | `bg-green-500` (`page.tsx:244`) | Green breaks single-accent system |
| **Hover progress bar** | `--landing-accent` → `--landing-accent-hi` scanline | `from-primary-500 to-purple-500` (`page.tsx:289`) | Purple + broken primary; landing uses accent-only |
| **Secondary icon buttons** | `.peal-inst-pad` tray icons | `bg-gray-800` (`page.tsx:264,276`) | Flat, no rim inset |
| **About footer panel** | `.peal-inst-rack` with `.peal-inst-rack-header` | `bg-gray-900 rounded-xl` (`page.tsx:305`) | Informational block lacks rack framing |
| **Footer section labels** | `.peal-inst-rack-label` (10px uppercase tracked) | `font-medium text-gray-300` (`page.tsx:315`) | Sans labels, not engraved mono |
| **Scope / waveform** | `.peal-inst-scope-well` / `.landing-sound-wave` | *none* | Cards have no audio preview surface |
| **Category icons** | Lucide icons + `--inst-label` (consistent with Header/Studio) | Emoji literals in `modernAppSounds.ts:18-44` | Casual vs machined UI elsewhere |

---

## P0 — Must fix (brand continuity & broken affordances)

### P0.1 — `primary-500` / `primary-400` are undefined → invisible CTAs and tabs
**Elements:** `app/presets/page.tsx:165,193` — Create Custom button, active category tab  
**Also:** `components/Header.tsx:74` (studio header inherits same page context)

`tailwind.config.js` defines `primary` as `hsl(var(--primary))` with **no `500`/`400` scale**. Studio styling pass (`docs/studio-styling-pass.md:34`) already documented this as breaking Play buttons. Browser verification on `/presets` shows `bg-primary-500` computes to `rgba(0, 0, 0, 0)` for both the Interaction tab and Create Custom CTA — users see white text on a transparent button with no fill.

**Recommendation:** Replace with `--landing-accent` / `--inst-accent` (`#4a9eff`) and `--inst-accent-hi` (`#6bb0ff`) via scoped CSS classes, not broken Tailwind scale.

### P0.2 — No design-token shell; parallel gray ramp
**Elements:** `app/presets/page.tsx:181-344` — entire page wrapper and cards

Page never imports `landing.css` or `studio-instruments.css`, never wraps in `.landing` or `.peal-studio-shell`. All surfaces use default Tailwind `gray-*` (blue-tinted), while Peal brand uses neutral `#111113` → `#2c2c2e` (see Studio pass mapping). Presets *feels* dark but is **chromatically off** from landing/Studio.

**Recommendation:** Introduce a scoped shell (see Migration Plan) that declares `--landing-*` or aliases `--inst-*` and replaces inline Tailwind color classes.

### P0.3 — Purple accent on hover bar conflicts with Peal blue
**Elements:** `app/presets/page.tsx:289` — `from-primary-500 to-purple-500` gradient

Studio pass explicitly eliminated purple from chrome. Presets reintroduces it on the only dynamic accent element (card hover bar). Combined with broken `primary-500`, the bar may render purple-only or invisible-primary → purple.

**Recommendation:** Single-hue accent gradient using `--landing-accent` → `--landing-accent-hi`, or reuse `landingScanline` animation from `.landing-sound-card.is-playing`.

---

## P1 — Should fix (UX clarity & polish)

### P1.1 — Cards lack scope-well / waveform preview
**Elements:** Preset card body (`page.tsx:209-291`); compare `styles/landing.css:597-607` (`.landing-sound-wave`), `styles/studio-instruments.css:61-68` (`.peal-inst-scope-well`)

Landing hero ships six cards with recessed phosphor wells and scanline-on-play. Presets cards are text + tags + buttons only — no visual audio affordance. For a *sound* catalog, the missing waveform well is the largest polish gap vs landing.

### P1.2 — Playing state uses green instead of accent blue
**Elements:** `app/presets/page.tsx:244-251` — `bg-green-500` when `playingId === preset.id`

Studio uses `--inst-accent` glow for active transport. Green reads as "success/semantic" not "now playing," and adds a third accent color alongside broken blue and purple.

### P1.3 — Emoji category icons vs Lucide system
**Elements:** `lib/presets/modernAppSounds.ts:18-44` — `icon: '👆'`, `'✓'`, etc.; rendered `page.tsx:197`

Header, landing, and Studio use `lucide-react`. Emoji tabs feel casual and break monospace/machined tone. The Feedback tab's `✓` emoji is visually indistinguishable from a "selected" checkmark.

### P1.4 — Studio header variant is functional but not tokenized
**Elements:** `components/Header.tsx:73-104` — `renderStudioHeader()`

Compact dark header works for Presets context, but uses `bg-gray-950`, `text-gray-400`, `bg-gray-800` hover — same non-Peal ramp. Title/subtitle lack `.peal-inst-rack-label` kicker styling used on instrument panels.

### P1.5 — No waveform data despite on-the-fly audio generation
**Elements:** `page.tsx:23-68` (`generatePresetSound`), `page.tsx:94` (`waveformData: null`)

Audio is synthesized client-side but never visualized. Landing cards pre-render waveform canvases. Adding a lightweight scope well (even static placeholder from frequency/duration) would close the preview gap.

### P1.6 — Library → Presets transition still jarring (downstream of Library)
**Elements:** `components/LibraryWelcome.tsx:74` → `/presets`

Library review (P0.3) noted Presets feels like a different product skin. Presets is the *better* dark sibling, but until Library adopts the same token shell, the handoff remains asymmetric. Presets should become the **token source of truth** for the dark app catalog pattern.

---

## P2 — Nice to have (refinement)

### P2.1 — Mobile: 3-column card grid at narrow widths
**Elements:** `page.tsx:207` — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

Screenshot at ~390px width still shows 3 columns (see `/.screenshots-presets-mobile.png`). Cards compress; titles truncate. Category tabs scroll horizontally (acceptable) but cards should collapse to 1-column below `sm`.

### P2.2 — No active nav indicator when arriving from Library
**Elements:** `Header.tsx:154-178` — app nav has no `pathname` check; Presets uses `variant="studio"` which hides product nav entirely

Users landing from Library lose global nav context. Studio header only shows Back + title. No indication Presets is the current section.

### P2.3 — Copy-parameters feedback uses conflated `hoveredId` state
**Elements:** `page.tsx:149,279` — `preset.id + '-copied'` stored in same state as card hover

Copy ✓ feedback can fight hover progress bar visibility. Separate `copiedId` state would be cleaner (implementation note for future pass).

### P2.4 — About footer is verbose for repeat visitors
**Elements:** `page.tsx:303-343`

Full-width info panel consumes ~30% of page height. Consider collapsible rack panel or link to `/docs` for repeat users.

### P2.5 — No sub-collection deep links
**Elements:** Category tabs only; no `/presets/[category]` routes

All filtering is client-side `useState`. URLs are not shareable per category. Not a visual issue, but limits "navigate to a preset collection" flow — browser test found no linked collection pages beyond tabs.

### P2.6 — `brands` and `premium` pages duplicate the same ad-hoc pattern
**Elements:** `app/brands/page.tsx`, `app/premium/page.tsx` — identical `bg-gray-950` + `bg-primary-500` approach

A shared presets shell CSS file would benefit all three catalog routes.

### P2.7 — Theme toggle on an always-dark page
**Elements:** `Header.tsx:99` — `ThemeToggle` in studio header

Presets hardcodes `bg-gray-950 text-gray-100` with no `dark:` variants. Toggling theme may not affect page body (only header/body base). Page should either commit to dark instrument shell or respect theme via tokens.

---

## Comparison vs Library review (`docs/library-ui-review.md`)

| Dimension | Library (current) | Presets (current) | Notes |
|-----------|-------------------|-------------------|-------|
| **Shell darkness** | Light `bg-gray-50` / white cards | Dark `bg-gray-950` / `bg-gray-900` cards | Presets wins; Library review P0.1/P0.3 |
| **Token usage** | None (Tailwind grays) | None (Tailwind grays) | Both need migration; Presets closer in *values* |
| **Sound naming** | Raw types (`PULSE`, `CLICK`) | Curated names ("Soft Click", "Glass Tap") | Presets wins; Library review P1.2 |
| **Category IA** | Sidebar type filters | Horizontal category tabs with counts | Presets clearer for browsing presets |
| **Preview UX** | Waveform canvas, play button | Text card + Preview button, no waveform | Library has visualization; Presets has better names |
| **Primary CTA** | Purple/pink promo gradient | Broken `primary-500` transparent buttons | Both off-brand; different failure modes |
| **Accent colors** | Blue + purple + pink + green | Broken blue + purple hover + green playing | Presets slightly more restrained |
| **Header** | App variant (light, full nav) | Studio variant (compact dark) | Intentional but isolates Presets from nav |
| **Empty state** | Large whitespace, no sounds | Per-category "No presets" message (`page.tsx:296`) | Presets handles empty category |
| **Studio handoff** | Via card edit icon | Explicit "Open in Studio" — works (`/studio?sound=…`) | Presets flow tested successfully |
| **Cross-route polish** | Library is the outlier | Presets is reference dark catalog | Library review: "Presets is darker/richer" — confirmed |

**Summary:** Library review positioned Presets as the aspirational dark UI. This review confirms that positioning for **layout and IA**, but reveals Presets is equally **non-tokenized** — it achieves polish through consistent dark Tailwind choices, not through `--landing-*` / `--inst-*` classes. The broken `primary-500` is a regression Studio already fixed in its own pass; Presets was missed.

---

## Flow notes (browser-tested)

### Category tabs
1. Default category: **Interaction** (4 presets visible).
2. Click **Feedback** → grid swaps to Success Chime / Soft Error / Confirm Pop. Tab selection works; active styling is subtle because `bg-primary-500` is transparent (only emoji/icon differentiation visible).
3. Six categories total: Interaction, Feedback, Navigation, Notification, System, Ambient.

### Preview / play
1. Click **Preview** on first card → playing state activates (green button + purple bottom bar on hover).
2. Audio synthesizes via `OfflineAudioContext` and plays through `useSoundGeneration().playSound`.
3. Playing state clears after preset duration timeout.

### Open in Studio
1. Click sparkle **Open in Studio** on first Interaction preset.
2. Navigates to `http://localhost:3001/studio?sound={id}&type=tone` — confirmed working.
3. Sound added to library store before navigation.

### Mobile width
1. Category tabs scroll horizontally — usable.
2. Card grid remains 3-column at narrow width — cards compress (see P2.1).
3. About footer remains full-width below fold.

### Collection navigation
- No separate collection routes or linked sub-pages found. Categories are the only collection mechanism (client-side filter).

---

## CSS migration plan (do NOT implement in this review)

### Phase 0 — Extract shared tokens (foundation)

Create `styles/peal-tokens.css` (or extend `styles/design-system.css`) with a **route-agnostic** token block not scoped to `.landing` or `.peal-studio-shell`:

```css
/* peal-tokens.css — shared app shell */
.peal-app-shell {
  --peal-bg: #111113;           /* alias --landing-bg */
  --peal-surface: #1c1c1e;      /* alias --landing-surface */
  --peal-surface-raised: #232327;
  --peal-surface-hover: #2c2c2e;
  --peal-well: #09090b;         /* alias --inst-well */
  --peal-edge-hi: rgba(255, 255, 255, 0.1);
  --peal-edge-lo: rgba(0, 0, 0, 0.45);
  --peal-line-hi: rgba(255, 255, 255, 0.09);
  --peal-line-lo: rgba(0, 0, 0, 0.55);
  --peal-text: rgba(255, 255, 255, 0.92);
  --peal-text-dim: rgba(255, 255, 255, 0.5);
  --peal-text-muted: rgba(255, 255, 255, 0.3);
  --peal-accent: #4a9eff;
  --peal-accent-hi: #6bb0ff;
  --peal-accent-glow: rgba(74, 158, 255, 0.15);
  --peal-panel-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 22px -12px rgba(0,0,0,0.45);
  --peal-panel-shadow-hover: 0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 28px -10px rgba(0,0,0,0.55);
}
```

Import in `app/globals.css` after existing imports. This avoids coupling Presets to `.landing` marketing scope or `.peal-studio-shell` Studio layout.

### Phase 1 — Scoped presets stylesheet

Create `styles/presets.css` imported only by `app/presets/page.tsx` (and later `brands`, `premium`):

| Proposed class | Replaces (today) | Token source |
|----------------|------------------|--------------|
| `.peal-presets-shell` | `min-h-screen bg-gray-950 text-gray-100` | `--peal-bg`, `--peal-text` |
| `.peal-presets-tabbar` | sticky `border-b border-gray-800 bg-gray-950` | `--peal-line-lo`, `--peal-bg` |
| `.peal-presets-tab` | idle tab `bg-gray-800 text-gray-400` | `--peal-surface-raised`, `--peal-text-dim` |
| `.peal-presets-tab.is-active` | `bg-primary-500 text-white` | `--peal-accent`, white text |
| `.peal-presets-card` | `bg-gray-900 border-gray-800 rounded-xl` | `--peal-surface`, `--peal-edge-hi/lo`, `--peal-panel-shadow` |
| `.peal-presets-card:hover` | `hover:border-gray-700` | accent border + `--peal-panel-shadow-hover` |
| `.peal-presets-card.is-playing` | green button only | mirror `.landing-sound-card.is-playing` glow |
| `.peal-presets-scope-well` | *(new)* | `--peal-well`, inset shadow from `.peal-inst-scope-well` |
| `.peal-presets-tag` | `bg-gray-800 text-gray-400` | mono 10px, `rgba(255,255,255,0.05)` |
| `.peal-presets-duration` | duration badge | `.peal-inst-rack-readout` |
| `.peal-presets-btn-preview` | Preview button | `.landing-sound-play` / `.peal-inst-pad` |
| `.peal-presets-btn-cta` | Create Custom | `.peal-inst-pad--accent` gradient |
| `.peal-presets-about` | footer `bg-gray-900` | `.peal-inst-rack` panel |

Wrap page root:

```tsx
<div className="peal-app-shell peal-presets-shell">
  …
</div>
```

### Phase 2 — Component markup refactor (page.tsx)

1. Replace all `bg-gray-*` / `border-gray-*` / `text-gray-*` with presets.css classes (keep layout utilities: `grid`, `flex`, `gap`, `px`, responsive cols).
2. Remove `bg-primary-500`, `hover:bg-primary-400`, `from-primary-500`, `to-purple-500`, `bg-green-500`.
3. Add `is-playing` class to card when `playingId === preset.id` (not just button).
4. Add scope-well `<div>` above card title (48px height, optional canvas later).
5. Swap emoji icons for Lucide in `modernAppSounds.ts` (or map at render time).

### Phase 3 — Header unification

Option A (minimal): Add token classes to `renderStudioHeader()` in `Header.tsx` using `--peal-*` vars.  
Option B (preferred): New `variant="catalog"` that uses `.peal-inst-rack-header` layout with engraved title kicker + optional product nav pills.

### Phase 4 — Extend to Library (cross-route)

Once `peal-app-shell` + `presets.css` patterns exist:

1. Wrap `app/library/page.tsx` in `.peal-app-shell` (addresses Library review P0.1/P0.3).
2. Reuse `.peal-presets-card` as `.peal-sound-card` in `SoundCardRedesign.tsx`.
3. Add `primary-500` scale to Tailwind **or** ban it repo-wide (Studio pass already moved to literals/tokens).

### Phase 5 — Verification checklist

- [ ] Computed `background-color` on active tab === `rgb(74, 158, 255)`
- [ ] Create Custom CTA has visible accent fill
- [ ] Zero `purple-500` / `green-500` in presets route chrome
- [ ] `grep` confirms no raw `bg-gray-950` on `app/presets/page.tsx`
- [ ] Library → Presets → Studio flow screenshots match surface ramp
- [ ] Mobile: single-column cards below `640px`

### Recommended pass order

1. **Fix broken primary** (P0.1) — immediate visual win, 2-line CSS
2. **Shell + card tokens** (P0.2) — `peal-app-shell` + `peal-presets-card`
3. **Scope wells + playing glow** (P1.1, P1.2, P0.3)
4. **Header + icon consistency** (P1.3, P1.4)
5. **Library unification** (P1.6) — reuse same CSS
6. **Responsive + URL routes** (P2.1, P2.5)

---

## Top 3 findings (summary)

1. **Broken `primary-500` makes primary affordances invisible** — active category tabs and "Create Custom" render with transparent backgrounds; the page relies on dark grays alone, masking missing accent fills.
2. **Dark but not tokenized** — Presets uses ad-hoc Tailwind `gray-*` instead of `--landing-*` / `--inst-*`, so it sits off the Peal neutral ramp and lacks machined edges, scope wells, and accent-glow play states that landing/Studio already define.
3. **Accent palette fragmentation** — purple hover gradients, green playing state, and broken blue primary compete; Studio already standardized on `#4a9eff` only — Presets needs the same single-accent discipline, ideally by adopting shared `peal-app-shell` tokens that Library can reuse.