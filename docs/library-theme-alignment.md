# Library — Peal dark shell alignment

**Target:** `http://localhost:3001/library`
**Date:** 2026-06-30
**Scope:** Visual / theme alignment of the `/library` shell + chrome to the Peal dark product surfaces (landing / docs / about / peal-nav). No functional changes to SoundDesigner.
**Motivated by:** `docs/library-ui-review.md` — "a generic Tailwind dashboard grafted onto a product whose landing and Presets pages already speak a polished, dark language."

---

## What was wrong

The library was the only core surface still on a **light/dark Tailwind theme** (`bg-gray-50 dark:bg-gray-950`) with a **cool blue-gray palette** (`gray-900` / `gray-800` cards, `gray-200` borders). Landing, docs, about, studio, and PealNav are all **always-dark** on the Peal shell (`#111113` bg, `#1c1c1e` surfaces, `rgba(255,255,255,.06)` hairlines, Space Grotesk, blue `#4a9eff` accent). Result: in light mode a bright page sat under the dark nav; in dark mode the cool grays clashed with the warmer Peal neutrals, and the page lacked the signature radial lighting + panel depth.

## Approach

Made `/library` an **always-dark Peal surface**, like the other product pages, with the change **contained to `/library`** and **no edits to shared components**.

- The page is wrapped in `<div className="library dark">`. The `dark` class makes Tailwind's `dark:` variants resolve for the whole SoundDesigner subtree **independent of the global theme toggle** — so the library always renders its (already well-designed) dark variants. The global `<html>.dark` state is untouched, so the toggle still drives every other surface. This mirrors how landing/docs/about are effectively dark-only.
- A new scoped `styles/library.css` owns the shell and **retones the cool-gray dark utilities to the Peal-neutral palette** via `.library`-prefixed overrides. Because `SoundCardRedesign` and `SkeletonCard` are **shared with the Studio sound-library modal**, retoning via scoped CSS (rather than editing those files) keeps Studio's palette untouched.

## Changed files

| File | Change |
|------|--------|
| `app/library/page.tsx` | Wrap surface in `.library dark`; import `styles/library.css`; drop the `bg-gray-50 dark:bg-gray-950` main background (the shell owns it). |
| `styles/library.css` *(new)* | Scoped Peal shell (bg gradient + radial lighting, Space Grotesk, tokens) + surface/border retones + sound-card panel depth. |

> Note: the page wrapper + initial `library.css` landed in commit `a6da8f6` ("Align library page with Peal dark product shell"). The sound-card **panel-depth** block (`.library [data-id]` box-shadow, +11 lines) is currently **uncommitted** in the working tree.

## What was aligned

- **Shell:** page background → `#111113` with the same radial-gradient lighting used by landing/docs/about; min-height; Space Grotesk type (was Figtree). Verified computed: `rgb(17,17,19)`, gradient present, `Space Grotesk`.
- **Surfaces:** cards / panels / inputs `gray-900(/50)` → `#1c1c1e`; controls `gray-800` → `#232326`; hovers `gray-700` → `#2c2c2e`. Verified card bg = `rgb(28,28,30)`.
- **Borders:** `gray-800` → `rgba(255,255,255,.06)`; `gray-700` → `rgba(255,255,255,.1)`. Verified hairline borders.
- **Generate-More card:** dropped the cool-gray `from-gray-900 to-gray-800` gradient for a flat Peal surface with a hairline-lit dashed border.
- **Depth:** sound cards get the landing/docs panel shadow (inset top highlight + soft drop) for the same material lift.
- **Chrome continuity:** the PealNav now blends seamlessly into the page instead of capping a bright dashboard. Modals (Generate Options, etc.) inherit the retone and dim the library behind them.

Verified across empty state, populated grid (6 seeded sounds), sidebar/filters, and the Generate Options modal. `/studio` still returns 200 and is visually unaffected (scoped CSS does not leak — every rule is `.library`-prefixed).

## Deliberate behavior change

`/library` **no longer responds to the light/dark toggle** — it is always dark, matching landing/docs/about/studio. This is intentional (there is no "Peal light shell" to align to; the product is dark-only everywhere else). If a real light mode for the library is wanted, that's a separate design effort. Easy to revert: remove `dark` from the wrapper class.

## Remaining gaps (out of scope — content/IA, not theme)

From `docs/library-ui-review.md`, deferred as feature work rather than a theme pass:

1. **Curated sound names** — cards still label sounds by raw type (`PULSE`, `CLICK`) instead of friendly names.
2. **Click-to-preview in the empty state** — first-time users can't hear anything before generating.
3. **Promo card accent** — `GenerateMorePromoCard` (and the Generate modal header) use a purple→pink gradient that competes with the blue product accent. Kept as-is since it's the established "AI/generate" brand cue; worth a product decision on whether to fold it into blue.
4. **Mobile** — sidebar + grid compete for width on narrow viewports; the sidebar could collapse.
5. **Empty-state headline** weight (`font-bold`) is slightly heavier than the airy landing/docs hero rhythm; left as-is for "get started" emphasis.
