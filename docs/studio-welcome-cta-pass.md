# Studio welcome empty-state CTA pass

Elegance pass on the Studio empty state (shown when no sound is loaded) so the
two CTAs read as instrument-rack chrome instead of default/bootstrap buttons.

## Scope

- **Empty state only** — `components/Studio.tsx` (the `: (` branch when no
  `currentSound` is loaded, ~L2932).
- Copy and `onClick` behavior unchanged (`setShowVibeModal` /
  `setShowLibraryModal`). Icons unchanged (`AiDesignIcon`, `LibraryIcon`).
- No unrelated Studio.tsx areas touched.

## What changed

### `styles/studio-instruments.css`

Added a small self-contained `.peal-studio-welcome*` block at the end of the
file. It uses the instrument tokens **with literal fallbacks**
(`var(--inst-accent, #4a9eff)`, etc.) so it renders identically whether mounted
inside `.peal-studio-shell` (Hudson layout, where the `--inst-*` tokens live) or
the legacy `/studio` layout (where they don't).

New classes:

- `.peal-studio-welcome` — column flex wrapper (replaces `text-center
  space-y-6 max-w-md`); tighter `gap: 1.4rem`, `max-width: 25rem`.
- `.peal-studio-welcome-title` / `.peal-studio-welcome-copy` — heading + body
  copy, slightly tightened (title `1.05rem`/`-0.01em`, copy `0.8rem`/`1.6`).
- `.peal-studio-welcome-actions` — button row (`gap: 0.6rem`).
- `.peal-studio-welcome-cta` — shared CTA base (inline-flex, `0.6rem 1.05rem`
  padding, `7px` radius, `0.8rem`/500 type, `:active` press of `translateY(1px)`).
- `.peal-studio-welcome-cta--primary` — **machined blue cap**: vertical
  `accent-hi → accent → #2d6eb8` gradient (mirrors `.peal-inst-transport--main`
  / `.landing-btn-primary`), inset top-light (`rgba(255,255,255,0.28) inset`),
  **restrained** accent glow (`14px` resting / `20px` hover, vs the deck's `24px`)
  plus a tight `0 4px 14px` drop shadow.
- `.peal-studio-welcome-cta--secondary` — **recessed outlined pad** (not a flat
  gray slab): `face-raised → face` gradient with dual-tone hairline
  (`border-top-color: --inst-line-hi`, sides `--inst-line-lo`) and inset rim
  light, echoing `.peal-inst-pad`. Hover lifts the accent edge
  (`rgba(74,158,255,0.4)`) with a faint accent glow.

### `components/Studio.tsx`

Swapped the inline Tailwind on the wrapper, heading, copy, and two buttons for
the classes above. Structure, icons, copy, and handlers are otherwise identical.

## Token references

- Instrument tokens (`styles/studio-instruments.css`): `--inst-accent`,
  `--inst-accent-hi`, `--inst-face`, `--inst-face-raised`, `--inst-line-hi`,
  `--inst-line-lo`; patterns from `.peal-inst-pad`, `.peal-inst-transport--main`.
- Landing material language (`styles/landing.css`): inset top-light + restrained
  glow from `.landing-btn-primary`, accent-lo `#2d6eb8`.

## Before → after

| | Before | After |
|---|---|---|
| Primary | flat `bg-[#4a9eff]`, `rounded-lg`, color-only hover | machined blue gradient, inset top-light, tight drop shadow + restrained accent glow that brightens on hover |
| Secondary | flat `bg-[#232327]` gray slab, `1px` flat border | recessed outlined pad — subtle gradient, dual-tone hairline + inset rim light, accent edge on hover |
| Type/spacing | `text-xl` title, `space-y-6`, `gap-3` | tightened title/copy, `1.4rem` stack, `0.6rem` button gap |
