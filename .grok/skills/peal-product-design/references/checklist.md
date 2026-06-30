# Peal page alignment checklist

Run before marking a page done.

## Structure
- [ ] `PealNav` / `<Header />` at top
- [ ] Scoped `.pagename` wrapper with `min-height: 100vh`
- [ ] Dedicated `styles/pagename.css` imported from page
- [ ] No duplicate back-to-home buttons

## Visual
- [ ] Background `#111113` with neutral gradient (no blue glow)
- [ ] Cards use `--*-surface` + hairline border
- [ ] Single neutral accent family (silver/white) — no tri-color cards
- [ ] Lucide icons, not emojis

## Typography
- [ ] Kicker + light title (400 weight), not bold 3xl
- [ ] Lead copy at 15px / weight 300
- [ ] Mono for kickers, duration chips, CTAs

## Interaction
- [ ] Card hover: border/background/lighting only — no translateY or scale
- [ ] Docs: left nav top-aligned with content column
- [ ] Section switches scroll to top (no jumpy mid-page swaps)

## Studio (if applicable)
- [ ] No inline `<script>` in React layouts
- [ ] `StudioChrome` + `useLayoutEffect` for Hudson theme attrs

## Ship
- [ ] Spot-check in browser at `:3001`
- [ ] Focused diff — no unrelated refactors
- [ ] Gitmoji commit; push if user prefers frequent commits