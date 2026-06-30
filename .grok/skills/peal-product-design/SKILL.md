---
name: peal-product-design
description: >
  Apply Peal's dark product chrome to web app pages — PealNav, scoped CSS shells,
  typography rhythm, unified neutral accents, and stable hover lighting. Use when
  polishing UI, aligning a page with landing/docs/studio, cleaning up typography,
  removing per-card rainbow colors, or running /peal-product-design.
metadata:
  short-description: "Peal dark product chrome & UI polish"
---

# Peal Product Design

You are the design implementer for the Peal web app. Match existing product surfaces — not a separate marketing site.

## When to use

- New or legacy page needs to look like `/`, `/docs`, `/about`, `/presets`, `/library`
- User asks to polish UI, fix typography, unify nav, or remove garish multi-color cards
- Hudson Studio shell needs PealNav above it (not inside Hudson chrome)

## Reference surfaces (read before editing)

| Surface | Wrapper | Stylesheet | Nav |
|---------|---------|------------|-----|
| Landing | `.landing` | `styles/landing.css` | `LandingNav` → `PealNav` |
| Docs | `.docs` | `styles/docs.css` | `<Header />` |
| About | `.about` | `styles/about.css` | `<Header />` |
| Presets | `.presets` | `styles/presets.css` | `<Header />` |
| Library | `.library.dark` | `styles/library.css` | `<Header variant="app" />` |
| Studio | `StudioChrome` | `app/studio/layout.tsx` | `PealNav` above shell |

Canonical nav: `components/PealNav.tsx` + `styles/peal-nav.css` (imported in `app/layout.tsx`).

Load `references/tokens.md` and `references/checklist.md` when implementing.

## Design tokens (do not invent new palettes per page)

```css
--*-bg: #111113;
--*-surface: #1c1c1e;
--*-border: rgba(255, 255, 255, 0.06);
--*-border-lit: rgba(255, 255, 255, 0.1);
--*-text: rgba(255, 255, 255, 0.92);
--*-text-dim: rgba(255, 255, 255, 0.5);
--*-text-muted: rgba(255, 255, 255, 0.32);
```

**Accent policy**
- PealNav active tab: `#4a9eff` (product chrome only)
- In-page UI (cards, CTAs, filters): **neutral silver/white** — no per-card blue/purple/green triads
- Prefer `rgba(255, 255, 255, 0.06–0.14)` tints over saturated accent fills

**Typography**
- UI: `var(--font-space-grotesk)` — headlines weight **400**, not bold 3xl
- Kicker: JetBrains Mono, `10px`, uppercase, `letter-spacing: 0.18em`, muted color
- Page title: `~1.65rem`, `letter-spacing: -0.025em`
- Lead: `15px`, weight `300`, `--*-text-dim`
- Card title: `14px` weight `500`; body `12–13px` dim
- Data/CTA chips: JetBrains Mono `10–11px`

**Shell background**
```css
background-image:
  radial-gradient(ellipse 72% 42% at 50% 0%, rgba(255, 255, 255, 0.008), transparent 56%),
  linear-gradient(180deg, #121214 0%, #111113 32%, #0f0f11 100%);
```
Skip blue radial glows on content pages unless explicitly requested.

## Implementation pattern

1. **Scoped wrapper** — `<div className="pagename">` on the page root (or `.library.dark` for forced dark subtree)
2. **Stylesheet** — `styles/pagename.css` with tokens under `.pagename { --pagename-*: ... }`
3. **Nav** — `<Header />` or `PealNav`; never duplicate ArrowLeft back buttons
4. **Page sub-header** — title + toolbar actions below nav, not inside PealNav
5. **Cards** — surface `#1c1c1e`, hairline border, optional stable hover lighting (see below)
6. **Minimal diff** — override shared Tailwind components via `.pagename` scope in CSS when they're reused elsewhere (library pattern)

## Hover & motion rules

**Never** use `transform: translateY()` or `scale()` on grid cards — causes layout jump.

**Do** use stable lighting:
```css
.card {
  position: relative;
  overflow: hidden;
  transition: border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
}
.card::before {
  /* top wash + soft corner light */
  opacity: 0;
  transition: opacity 0.22s ease;
}
.card:hover::before { opacity: 1; }
```

Sidebar/docs: top-align left nav with main column — hero content lives in the main column, not above the two-column grid.

## Studio-specific

- **No** `next/script` or `HudsonThemeScript` in client-rendered layouts (Next.js 16 client nav won't execute them)
- Theme bootstrap: `useLayoutEffect` in `app/studio/StudioChrome.tsx`
- PealNav sits above Hudson shell; shell height `calc(100vh - 52px)`

## Verification

1. `agent-browser open http://localhost:3001/<page>` — confirm `peal-nav` present
2. Check empty + populated states where relevant
3. Switch docs sections / hover cards — no vertical grid shift
4. Do **not** kill dev server on port 3001
5. Commit with gitmoji; `secret run NPM_TOKEN --` for npm publish if asked

## Anti-patterns (reject these)

- `text-3xl font-bold` heroes on product pages
- Emoji category icons (use Lucide, size 14)
- `bg-primary-500` / `text-blue-600` / `purple-600` / `green-600` per-card accents
- `hover:scale-110` on cards in grids
- Rainbow gradient shimmer bars that change card height
- Light `bg-gray-50` page bodies under dark PealNav
- Writing new markdown docs unless user asks