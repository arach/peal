# Peal product tokens

## CSS variable naming

Prefix per page: `--docs-*`, `--about-*`, `--presets-*`, `--library-*`.

## Type scale

| Role | Size | Weight | Font |
|------|------|--------|------|
| Kicker | 10px | 500 | JetBrains Mono, uppercase, 0.18em tracking |
| Page title | 1.65rem | 400 | Space Grotesk |
| Lead | 15px | 300 | Space Grotesk |
| Section h2 | 1.05rem | 500 | Space Grotesk |
| Card title | 14px | 500 | Space Grotesk |
| Card body | 12px | 400 | Space Grotesk, dim |
| Mono chip / CTA | 10–11px | 500 | JetBrains Mono |

## Spacing

- Shell padding: `20px 32px 88px` (mobile `20px`)
- Max content width: `880px` (about), `1080px` (docs/presets/library)
- Card grid gap: `14px 16px`
- Section margin below header: `24–28px`

## PealNav

- Height: `52px` (`min-height` on `.peal-nav-inner`)
- Sticky `top: 0`, `z-index: 50`
- Active link: blue tint — keep this as the **only** blue accent on most pages

## Icons

- Lucide, `size={14–18}` in nav/cards
- Icon well: `40px` square, `border-radius: 10px`, `rgba(255,255,255,0.04)` fill