# Peal Landing — Luxury / Material Pass (Talkie lens)

**Reviewer:** Talkie design-studio lens · **Live:** `http://localhost:3001/` (200 OK)
**Scope:** `styles/landing.css`, `components/Landing*`, `HeroSoundGrid.tsx`, `PealBrandMark.tsx`, `app/layout.tsx`
**In-house luxury reference:** `styles/studio-instruments.css` (the `.peal-studio-shell` instrument rack)
**Status:** **Pass 3.** The material foundation shipped — this pass separates *what's fixed* from *what's still flat*.

---

## 0. State check — what changed since Pass 2

**Most of Pass 2 P0+P1 landed** in commit `df43afc 🎨 Landing luxury pass — material depth, lighting, and headline`. The page is no longer flat; it's **milled**. Verified against current source:

| Pass-2 item | Status | Evidence (current `landing.css`) |
|---|---|---|
| P0.1 dual-tone hairlines | ✅ done | tokens `--landing-edge-hi/-lo` :9–10; applied on `.landing-pillar` :281, `.landing-sound-card` :571, `.landing-install-surface` :355, `.landing-code-block` :700, `.landing-feature` :803 |
| P0.2 layered inset+cast shadow | ✅ done | `--landing-panel-shadow` / `-hover` :18–23, used on every panel |
| P1.1 engraved nav seam + underglow | ✅ done | `.landing-nav` box-shadow :69–71 |
| P1.2 LED badge + recessed pill | ✅ done | `.landing-badge` :209–229, `.landing-badge-dot` :231–239 |
| P1.3 jewel pillar-icons (resting) | ✅ done | `.landing-pillar-icon` inset+glow :307–309 |
| P1.4 phosphor hero glow (core+halo) | ✅ done | `.landing-hero::before` :180–191 |
| P1.5 recessed command/code wells | ✅ done | `.landing-install-cmd` :411–423, `.landing-code-pre` :742–745 |
| P1.6 jewel brand mark + split stroke | ✅ done | `.peal-brand-mark` resting glow :118–126; gradient stroke `PealBrandMark.tsx:36–39,55` |
| P1.7 engraved kickers/labels | ✅ done | `.landing-kicker` :535–544, `.landing-bucket-label` :784–793, `.landing-install-head` :363–374 |
| P2.5 scope-well sound cards (CSS) | ✅ partial | well + scanline `.landing-sound-wave` :597–634 *(canvas play-head still missing — see P1.3 below)* |
| P2.6 machined primary button | ✅ done | `.landing-btn-primary` :496–510 (180° gradient + inset highlight) |
| P2.4 expo-out fade-in motion | ✅ partial | `.fade-in` `cubic-bezier(0.16,1,0.3,1)` :982–988 *(hover translate still not coordinated — see P2.3)* |

**Net:** the "professional → luxurious" gap is no longer about *material depth*. The surfaces are milled, lit from above, recessed where they should be. The remaining gap is **editorial confidence and jewel detail** — the final register. That reframes the whole priority stack below.

---

## 1. Verdict (Pass 3)

> **The page is now milled, but still *speaks in one voice* — a sans UI voice — and leaves three declared-but-unspent luxury signals on the floor.**

The single biggest remaining lever is the **headline**: it's still Space Grotesk (`:241`), and the only "luxury" applied to it was a blue gradient on the accent word (`:251–258`). Gradient text is a *2019 SaaS* move, not an editorial one — it actively works against "jewel-like restraint." A high-contrast serif display face is the fastest, highest-leverage jump to *luxurious* still available, and it's untouched.

Three signals are **declared but unspent**: `--landing-amber` (`:24`) now has **zero uses** (the studio-card went blue-only at `:841`); there is **no grain** (flat gradients can band); and there are **no custom focus rings** (keyboard nav falls back to the cheap default outline). Each is cheap and each is pure upside.

Stay blue, no Talkie brass. Amber is *Peal-native* (`--inst-amber`, studio-instruments.css:16) — spending it as the warm "active/playing" note is on-brand, not a brass violation.

---

## 2. Prioritized improvements (re-ranked for current state)

### P0 — Editorial register (the one thing still missing the most)

**P0.1 · Serif display headline + kill the gradient text.** *Highest leverage remaining.*
- Add **Instrument Serif** (free, high-contrast editorial) or **Fraunces** (`opsz`, variable) via `next/font/google` in `app/layout.tsx` (currently only Figtree / Space_Grotesk / JetBrains_Mono, `:2`). Expose `--font-display`.
- Apply **only** to `.landing-hero h1` (`:241`) and `.landing-cta h2` (`:906`):
  ```css
  font-family: var(--font-display), var(--font-space-grotesk), serif;
  font-weight: 400;
  font-size: clamp(2.5rem, 5.5vw, 3.9rem);
  line-height: 1.02;
  letter-spacing: -0.015em;
  ```
- **Replace the gradient accent** (`:251–258`) with a single solid `--landing-accent-hi` on the accent word + a *restrained* `text-shadow: 0 0 24px rgba(74,158,255,.28)`. Jewel = one light source, not a rainbow clip.
- **A/B worth seeing** (see §4): serif-display 400 vs. Space Grotesk **800** at `-0.04em`. Largest element on the page, most subjective call, hardest to revert by feel — this is the one item that justifies a visual study before committing.

**P0.2 · Pull the two inline-styled headers into CSS first.** *Blocks P0.1 from drifting.*
`LandingHero.tsx:168` and `:268` style the section H2s inline instead of via `.landing-section-header h2` (`:546`). Any display-face change then lives in three places and one gets forgotten. Move them to the class *before* touching type.

### P1 — Unspent jewels (declared, cheap, pure upside)

**P1.1 · Spend the amber, or cut it.** (`--landing-amber` `:24`, zero uses)
Promote it to the **active/playing** warm note — it already half-belongs there. On `.landing-sound-card.is-playing` (`:588`) the glow is all-blue; add a warm inner edge so a *playing* card reads warm against the cold resting grid:
```css
box-shadow:
  0 1px 0 rgba(255,255,255,.08) inset,
  0 0 32px rgba(74,158,255,.22),
  inset 0 0 0 1px rgba(245,166,35,.16);   /* warm play indicator */
```
One warm note against the blue is the move. If you won't spend it, delete the token — don't leave a ghost.

**P1.2 · Custom `:focus-visible`.** (none exists)
The one thing that still looks cheap, on keyboard nav. Match the studio's drop-shadow focus (studio-instruments.css:792):
```css
.landing :focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(74,158,255,.45);
  border-radius: inherit;
}
```

**P1.3 · Canvas play-head (finish P2.5).** (`HeroSoundGrid.tsx:139–147`)
The scope-well + scanline shipped, but inside the canvas played vs. unplayed bars differ only `1.0` vs `0.8` alpha — invisible. Drop unplayed to ~`.35` and draw a 1px accent play-head at `x = progress * width` with a small `shadowBlur`. ~6 lines in the existing draw loop (`:129–155`); the mag-tape tape-head in Peal blue.

**P1.4 · Code-header dots → LEDs.** (`.landing-code-dot-red/yellow/green` `:723–725`)
Still flat fills. Give all three the studio LED material (studio-instruments.css:72–98): `box-shadow: 0 0 0 1px rgba(0,0,0,.5) inset` on each, plus `0 0 6px` green glow on the "live" one only. Keeps the IDE motif, in the instrument's metal.

### P2 — Texture, rhythm, motion polish

**P2.1 · Fine grain / texture.** (none; `.landing::before` `:41` is gradients only)
Flat fills on the hero + pillar gradients can band. Add a 2–3% noise overlay on `.landing` (SVG `feTurbulence` data-URI or tiny tiled PNG, `mix-blend-mode: overlay`, `pointer-events:none`). Classic luxury-dark move, nearly free.

**P2.2 · Vertical crescendo.** (`.landing-hero` `56px` `:176`; `.landing-section` `48px` `:526`; `.landing-features` `40px` `:776`; `.landing-cta` `48px` `:890`)
Still monotone — every section ~40–48px with an identical hairline. Let the hero dominate (top `56px → 72px`) and split rhythm: primary sections `64–72px`, secondary `48px`. Keep the 960px column — restraint is correct.

**P2.3 · Coordinate the hover, extend reduced-motion.** (`.landing-pillar:hover` `:289`, `.landing-sound-card:hover` `:581`)
Hover already lifts + brightens border + deepens shadow — good. Bump lift to `translateY(-2px)` and brighten the **top hairline** (`border-top-color`) in the same transition so it reads "machined," not "floaty." Then extend the `prefers-reduced-motion` guard (`:1044`) to also disable the hover `transform` (it currently only kills `.fade-in` and the scanline).

**P2.4 · Section-header H2 + lede sizing.** (`.landing-section-header h2` `1.45rem` `:546`; `.landing-sub` `16px`/max-w `480` `:260`)
Minor: bump section H2 to `1.55rem` `-0.02em`; lede to `17px`, `lh 1.65`, max-w `500`. Tightens the type ramp under the new display face.

---

## 3. Concrete tokens / type / motion

### Tokens — already present (✅), add only these
```css
/* present: --landing-edge-hi/-lo, --landing-accent-hi/-lo/-glow,
   --landing-panel-shadow(-hover) — keep as-is */
--landing-well: #09090b;                 /* you inline #09090b in 3 places — promote to a token */
--landing-label: rgba(255,255,255,.42);  /* engrave against this, not the .30 muted (see note) */
```
*Contrast note:* `.landing-install-head` rides on `--landing-text-muted: rgba(255,255,255,.3)` (`:13`, applied `:370`) **and** now carries `text-shadow` (`:373`). Engraving a `.30` label sinks it below comfortable legibility — the studio engraves against `.42` (`--inst-label`) on purpose. Raise engraved label colors to `--landing-label` first.

### Typography
| Role | Current | Proposed |
|---|---|---|
| Hero H1 / CTA H2 | Space Grotesk 700 `-0.04em`, **gradient accent** | **Instrument Serif / Fraunces 400** `clamp(2.5rem,5.5vw,3.9rem)` `lh 1.02` `-0.015em`; **solid** accent + one soft glow *(A/B vs SG-800 `-0.04em`)* |
| Section H2 | SG 700 `1.45rem` | SG 700 `1.55rem` `-0.02em` |
| Sub / lede | 16px dim, max-w 480 | 17px `lh 1.65` max-w 500 |

### Motion
```css
--ease-settle: cubic-bezier(0.22, 1, 0.36, 1);   /* current 0.16,1,0.3,1 is fine; this settles softer */
.landing-pillar:hover, .landing-sound-card:hover {
  transform: translateY(-2px);
  border-top-color: rgba(255,255,255,.16);
}
/* extend the :1044 reduced-motion guard: */
@media (prefers-reduced-motion: reduce) {
  .landing .landing-pillar:hover,
  .landing .landing-sound-card:hover { transform: none; }
}
```

---

## 4. Optional — Talkie-style study route (narrowed; only if you want to see the headline both ways)

The full 3-register board from Pass 2 (Flat / Milled / Editorial) is now **mostly redundant** — "Milled" shipped. The only call that genuinely benefits from seeing both options side-by-side is the **headline**, because it's subjective and hard to judge from a snippet.

If a mock helps before editing `landing.css`:
- **Route:** `app/styleguide/landing-luxe/` → register in the styleguide index + mirror the sibling entry (never URL-only). No `app/design/` dir exists; `app/styleguide/` is the natural home (currently a single `page.tsx`).
- **Scope it down:** hero block only, frozen layout, two switches:
  1. **Headline face:** Serif-display 400 ↔ Space Grotesk 800 (`-0.04em`), accent solid+glow ↔ current gradient.
  2. **Temperature:** blue-only ↔ blue + amber play-note.
- **NamesMarginalia:** `display-register`, `warm-note`, `well`, `engrave`, `phosphor-core`, `seam`.

Everything else in §2 is a deterministic port (focus rings, grain, rhythm, LEDs, play-head) — no board needed; apply directly.

---

## 5. TL;DR for the operator
- **Pass-2 P0+P1 shipped** (commit `df43afc`): the page is **milled, not flat** — dual-tone edges, layered shadows, LED badge, jewel pillar-icons, phosphor hero glow, recessed wells, engraved labels, machined button all confirmed in source.
- **Remaining gap = editorial confidence + jewel detail**, not material depth.
- **P0 (highest leverage left):** real **serif display headline** + **kill the gradient accent** (do it after pulling the two inline H2 styles into CSS).
- **P1 (declared but unspent):** spend the now-**zero-use** amber as the warm play-note · add **`:focus-visible`** · finish the **canvas play-head** · turn **code-dots into LEDs**.
- **P2:** fine grain · vertical crescendo (hero 56→72px) · coordinated hover + reduced-motion guard · type-ramp sizing.
- **Study route:** optional and **narrowed** — only the headline A/B + temperature toggle are worth a board now; the rest apply directly.
