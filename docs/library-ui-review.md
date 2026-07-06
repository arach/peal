# Peal Library UI Review

**Target:** `http://localhost:3001/library`  
**Reviewer:** Agent (browser + code inspection)  
**Date:** 2026-06-30  
**Scope:** UX, visual design, information architecture, empty/populated states, play/browse/generate flows  
**Reference aesthetic:** `styles/landing.css` (luxury/material pass), `styles/studio-instruments.css` (`.peal-studio-shell` rack aesthetic)  
**Out of scope:** Application code changes (review only)

---

## Verdict

The Library page is functionally coherent—empty-state onboarding, generation modal, sidebar filters, and sound cards all work—but it reads as a **generic Tailwind dashboard grafted onto a product whose landing and Presets pages already speak a polished, dark, instrument-rack language**. The empty state is clear but sparse (large dead zone, no playable previews), populated cards show waveforms and actions but label sounds as raw types (`PULSE`, `CLICK`) instead of curated names, and the purple/pink promo gradient fights the Peal blue accent system established on the landing. Navigating from Library → Browse Presets is especially jarring: Presets arrives with a dark, milled UI while Library still uses flat `bg-gray-50` / `border-gray-200` cards. The page needs a **luxury shell pass** (shared tokens, recessed wells, engraved labels, scope-well waveforms) and tighter IA so first-time users see the same “click to preview” magic the landing promises before they generate anything.

---

## Screenshots

| File | What it shows |
|------|----------------|
| `/.screenshots-library-review.png` | Empty state — onboarding hero + three action cards |
| `/.screenshots-library-generate-modal.png` | Quick Generate modal (light theme, emoji type chips) |
| `/.screenshots-library-modal-dark.png` | Generate modal over dimmed library (modal stays light) |
| `/.screenshots-library-populated.png` | Populated library — sidebar, 8 sound cards, promo + generate tiles |
| `/.screenshots-library-presets-flow.png` | Presets page reached via “Browse Presets” (much darker/polished) |
| `/.screenshots-library-mobile.png` | Narrow viewport — sidebar + grid compete for width |

---

## P0 — Must fix (brand continuity & first-run experience)

### P0.1 — Library shell does not inherit the landing luxury pass
**Elements:** `app/library/page.tsx` (`bg-gray-50 dark:bg-gray-950`), `components/Header.tsx` (`variant="app"`), `components/LibraryWelcome.tsx`, `components/SoundCardRedesign.tsx`

The landing uses `--landing-bg: #111113`, radial phosphor glows, dual-tone edge hairlines (`--landing-edge-hi/lo`), recessed wells, and engraved mono labels. The library uses plain Tailwind grays, white cards, and 2px generic borders. A user who clicks **Explore Library** on the landing lands in what feels like a different product skin. Neither `.landing` nor `.peal-studio-shell` scopes the library route.

**Recommendation:** Wrap library in a shared app shell (landing tokens or `peal-inst-rack` panels) so nav, background, and cards share the same material language as `/` and Studio.

### P0.2 — Empty state lacks playable curated previews (landing promises them)
**Elements:** `LibraryWelcome` headline + three cards; empty `SoundGrid` (returns `null` when `sounds.length === 0`)

Landing hero ships six **click-to-preview** curated sounds with phosphor scope wells. Library empty state shows only three static CTA cards and ~60% viewport whitespace below—no sounds, no waveforms, no “try before you generate.” First-run delight is deferred entirely to generation.

**Recommendation:** Embed a slim curated preview row (reuse `HeroSoundGrid` patterns or preset snippets) below the onboarding cards, or pre-seed 3–4 demo sounds with clear “sample” labeling.

### P0.3 — Browse Presets flow breaks visual continuity
**Elements:** `LibraryWelcome` “Browse Presets” card → `/presets`

Clicking **Browse Presets** from the light, flat library opens a dark, polished Presets browser (`Modern App Sounds`, category tabs, duration badges, tag chips). The transition undermines trust in a single design system and makes Library feel like the unfinished sibling.

**Recommendation:** Bring Presets surface tokens into Library (or vice versa) before linking them as peer onboarding paths.

---

## P1 — Should fix (UX clarity & polish)

### P1.1 — No active state on current nav item
**Elements:** `Header.tsx` app nav — “Library” button when on `/library`

All nav links share identical `text-gray-600 hover:text-gray-900` styling. No `pathname` check, underline, or accent indicator. Users cannot tell which section they are in without reading the page content.

### P1.2 — Sound cards expose machine type, not human names
**Elements:** `SoundCardRedesign.tsx` — `{sound.type}` rendered uppercase (`PULSE`, `CLICK`, `CHIME`)

Landing cards use evocative names (“Resonant Pulse”, “Ethereal Chime”). Library cards show raw generator types. Cards feel like debug output, not a curated collection.

### P1.3 — Generate modal aesthetic is off-brand
**Elements:** `GenerateOptionsModal.tsx` — emoji chips (👆 🎵 🔔 🌊 💫), pink/purple temperature cards, light modal on dark page

Modal content is friendly but casual compared to landing’s engraved labels and machined buttons. In dark mode the modal panel stays bright white, creating a harsh overlay (see `/.screenshots-library-modal-dark.png`). Emoji icons clash with `lucide-react` usage elsewhere.

### P1.4 — `GenerateMorePromoCard` gradient conflicts with Peal blue accent
**Elements:** `GenerateMorePromoCard.tsx` — `from-purple-600 to-pink-600` full-width promo in grid

The promo tile is the loudest surface on the populated page—larger and more saturated than primary CTAs on landing (`--landing-accent: #4a9eff`). Two generation entry points sit adjacent (promo + dashed `GenerateMoreCard`), creating visual competition and inconsistent purple vs blue hierarchy.

### P1.5 — Empty state vertical layout wastes space
**Elements:** `LibraryWelcome` centered hero; `SoundGrid` hidden; no footer content

On a 1280×720 viewport, onboarding cards occupy the top third; the rest is blank `bg-gray-50`. No keyboard-shortcut hint, no “what you’ll get” preview, no link to docs. The page feels abandoned rather than intentionally minimal.

### P1.6 — Sidebar appears with zero sounds in some filter states
**Elements:** `SimpleSidebar.tsx` (`if (sounds.length === 0) return null`) vs `SimpleStatsBar` (“Showing 0 of 8 sounds”)

When mock data lacked top-level `frequency`, all 8 sounds were filtered out: sidebar + stats appeared but the grid was empty—confusing “broken library” state. Data integrity issues surface as UX failures. Empty filtered results need an explicit empty-state message in the grid area.

### P1.7 — App header nav density differs from landing
**Elements:** `Header.tsx` — Library, Studio, Presets (dev), Voice, Docs, About vs `LandingNav.tsx` — Library, Studio, Docs

Landing nav is sparse and material (sticky blur, edge glow). App header crams five product links + docs/about with no visual grouping. Presets/Voice only in dev adds noise for reviewers and may ship inconsistently.

---

## P2 — Nice to have (refinement)

### P2.1 — Mobile layout keeps fixed sidebar beside grid
**Elements:** `SoundDesigner.tsx` `flex gap-8`; `SimpleSidebar.tsx` `w-64`

At narrow widths (see `/.screenshots-library-mobile.png`), the 256px sidebar consumes horizontal space; cards compress into a dense 4-column micro-grid. Consider collapsible filters or a top sheet on `md` breakpoint.

### P2.2 — Sound card action icons lack labels
**Elements:** `SoundCardRedesign.tsx` bottom toolbar — Play, Favorite, equalizer icon, overflow menu

Play and favorite are recognizable; the equalizer / lines icon (Studio shortcut) has no tooltip in the default view. Discoverability suffers for “Edit in Studio.”

### P2.3 — “No tags” copy on every untagged card
**Elements:** Tag row on `SoundCardRedesign`

Repeated “No tags” text adds noise across the grid. Prefer omitting the row or a subtle icon-only empty state.

### P2.4 — No sort control in sidebar
**Elements:** `soundStore.sortBy` exists; `SimpleSidebar` has search + type only

Users cannot sort by duration, frequency, or date from the UI despite store support.

### P2.5 — Selection bar “Copy Code” is a dead end
**Elements:** `SelectionBar.tsx` — `alert('Copy functionality coming soon!')`

Broken affordance in a visible multi-select flow. Hide until implemented or show disabled state with explanation.

### P2.6 — Library welcome disappears entirely once sounds exist
**Elements:** `LibraryWelcome.tsx` — `!hasSounds` guard on hero + cards

Populated libraries lose all onboarding context. A compact persistent “+ Generate” strip or header action would help returning users (welcome cards vanish; only grid promo remains).

### P2.7 — Keyboard shortcuts panel not surfaced on empty state
**Elements:** `SoundDesigner.tsx` shortcuts (`G` generate, Space play); `ShortcutsPanel` exists but hidden until toggled

Power-user features are invisible during first visit when they would help most (after first generation).

### P2.8 — Light mode is the default empty-state presentation
**Elements:** Theme toggle “System theme” on first load

Landing screenshot skews dark/luxury; library empty state screenshot is predominantly light gray/white. If brand default is dark instrument-rack, library should default to match or inherit system with dark-preferred styling.

---

## Comparison vs landing page polish

| Dimension | Landing (`styles/landing.css`) | Library (current) | Gap |
|-----------|-------------------------------|-------------------|-----|
| **Background** | Layered radials, `#111113` gradient stack, fixed glow overlays | Flat `bg-gray-50` / `dark:bg-gray-950` | No depth, no phosphor source |
| **Navigation** | `.landing-nav` sticky blur, edge hi/lo, accent hover glow | Generic white/90 header, flat border-b | Missing machined rim |
| **Cards** | Recessed scope wells, scanline on play, engraved labels | White/gray cards, 2px border, flat blue waveform canvas | Cards read “dashboard” not “instrument” |
| **Typography** | Space Grotesk + mono engraved kickers | Same fonts available but unused for labels | No uppercase tracked labels on cards/filters |
| **Accent** | `#4a9eff` mono-accent, amber syntax sparingly | Blue + purple + pink + green simultaneously | Rainbow onboarding cards dilute brand |
| **Sound names** | “Resonant Pulse”, “Quantum Cascade” | `PULSE`, `CLICK` (type enum) | Emotional vs mechanical |
| **Empty state** | 6 playable curated sounds + CLI story | 3 static buttons, no audio | Landing sells; library waits |
| **Primary CTA** | Machined gradient button, rim light inset | Flat bordered cards with chevron text links | No transport-button material |
| **Motion** | Expo-out fade-in stagger | `group-hover:scale-110` on icons only | Library feels static |
| **Cross-route** | — | Presets page is darker/richer than Library | Internal inconsistency |

**Studio instruments reference (`studio-instruments.css`):** Rack panels (`.peal-inst-rack`), scope wells (`.peal-inst-scope-well`), LED indicators, and pad trays are not used anywhere on the library route. Studio and Presets are closer in spirit; Library is the outlier.

---

## Flow notes (browser-tested)

### Empty → Quick Generate
1. **Start Building Your Library** + three cards render correctly.
2. **Quick Generate → Start now** opens `GenerateOptionsModal` with type multi-select, count slider (6–50), temperature presets.
3. Modal is usable but visually detached; Generate button click hung in headless session (likely audio-context / generation latency)—could not capture post-generation native screenshot without localStorage seeding.

### Empty → AI Studio / Browse Presets
- **AI Studio** navigates to `/studio` (not re-screenshoted here).
- **Browse Presets** navigates to `/presets` — polished dark UI, clear category tabs, preview buttons. Best-in-app reference for what Library should aspire to.

### Populated browse/play (seeded state)
- Sidebar: search + type filters work; `All sounds` active state uses blue pill.
- Grid: 4-column layout, waveform canvases render, play/favorite/studio/menu buttons exposed.
- Bottom: `GenerateMorePromoCard` (purple gradient) + `GenerateMoreCard` (dashed border) appear together—redundant CTAs.
- Play on seeded sounds without `audioBuffer` may no-op or error silently (mock data limitation).

---

## Suggested pass order (for implementers)

1. **Shell unification** — library layout + header under landing/studio tokens (P0.1, P0.3).
2. **Empty-state richness** — curated preview sounds + reduce whitespace (P0.2, P1.5).
3. **Card redesign** — scope wells, display names, single accent (P1.2, P1.4, comparison table).
4. **Modal + nav polish** — dark modal variant, active nav, remove emoji chips (P1.1, P1.3).
5. **Responsive + edge cases** — mobile sidebar, filtered-empty message, hide dead actions (P1.6, P2.1, P2.5).

---

## Top 3 findings (summary)

1. **Visual identity fracture** — Library uses generic light Tailwind chrome while landing and Presets already deliver the luxury/instrument-rack aesthetic; the route feels like a different app.
2. **Empty state undersells the product** — No playable curated sounds or waveform previews despite the landing promising instant click-to-preview; huge dead whitespace on first visit.
3. **Populated cards and promo tiles need brand alignment** — Raw type labels (`PULSE`), purple/pink promo gradient, and emoji-heavy generate modal conflict with Peal blue and the milled surfaces elsewhere.