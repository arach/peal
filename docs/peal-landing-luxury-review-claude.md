# Peal Landing — Luxury Pass (fresh Claude review)

**Reviewer:** Claude (fresh-eyes pass) · **Target:** `http://localhost:3001/`
**Scope:** `styles/landing.css`, `components/LandingHero.tsx`, `LandingNav.tsx`, `HeroSoundGrid.tsx`, `PealBrandMark.tsx`
**Reference:** `styles/studio-instruments.css` (`.peal-studio-shell` instrument rack)
**Prior input (not gospel):** `docs/peal-landing-luxury-review-talkie.md` (Ada / Talkie lens)

---

## 0. Important context — the page changed under me

This review was requested against a "material flatness" baseline. **That baseline no longer exists.** While I was inspecting, a concurrent agent implemented and committed the entire Talkie luxury pass:

> `df43afc` — 🎨 Landing luxury pass — material depth, lighting, and headline
> `app/layout.tsx (+1)` · `components/LandingHero.tsx (+8)` · `components/PealBrandMark.tsx (+15)` · `styles/landing.css (+293/-58)`

The file mutated live across my reads (866 → 1052 lines) before landing as a clean commit. **Every P0/P1/P2 item in the Talkie review is now implemented.** So this is not a "do the work" review — it's an independent assessment of the *result*, plus the genuinely remaining gaps a fresh pair of eyes sees. I held off re-implementing anything the commit already did (that would be churn + collision risk against a peer agent's just-committed files); see §4.

---

## 1. Verdict

**The pass succeeded.** The landing is no longer flat — it reads as milled from the same metal as the studio. Confirmed in the render (modal dismissed): pillars are raised panels with lit-from-above edges and a resting shadow whisper; the hero glow is a phosphor source with a horizon hairline, not a haze; the install command and code block are recessed near-black wells; labels are engraved; the primary button is a machined transport gradient with a rim light; section seams are dual-tone; the brand mark carries a resting jewel glow with a dual-tone stroke and a center-bar bloom; motion is expo-out with stagger; and the sound cards are now phosphor scope wells with a scanline when playing.

What the commit got *right* (and why it works):

| Element | Where (committed) | Why it reads luxurious |
|---|---|---|
| Dual-tone hairlines | `--landing-edge-hi/lo` (landing.css:9–10), applied to pillar/card/install/code/feature/studio | Lit-from-above edges — the single biggest depth cue, exactly the `.peal-inst-rack` recipe |
| Layered elevation tokens | `--landing-panel-shadow` / `-hover` (landing.css:18–24) | Inset top-light + tight deep cast; resting panels carry a whisper, hover deepens it |
| Phosphor hero glow | `.landing-hero::before` two-radial stack + `::after` horizon hairline (~152–177) | Tight saturated core + faint halo tied to a 1px accent seam — a source, not a wash |
| Recessed wells | `.landing-install-cmd` (~365), `.landing-code-pre` (~651): `#09090b` + inset rim/shadow | Precision-instrument recess, mirrors `.peal-inst-scope-well` |
| Engraved labels | kicker / install-head / bucket-label: `0.16em` + `text-shadow 0 1px 0 #000~.55` | Stamped-metal feel, matches `.peal-inst-rack-label` |
| Machined primary button | `.landing-btn-primary` (496): `linear-gradient(180deg, hi→accent→lo)` + inset rim | Transport-button material; no longer a flat fill |
| Jewel brand mark | `PealBrandMark.tsx`: dual-tone stroke gradient + center-bar `feGaussianBlur` glow + resting outer glow | Reads as *emitting* sound; the most-repeated brand signal now has depth |
| Scope-well sound cards | `.landing-sound-wave` (597) well + `::before` phosphor + `.is-playing ::after` scanline (609–634) | Waveform canvas sits in a near-black scope; the Talkie mag-tape idea in Peal blue |
| Expo motion + stagger | `.fade-in` cubic-bezier(0.16,1,0.3,1), 0.75s, delays to `-3` (883–895) | Settles rather than snaps; arrives in sequence |
| Accent depth | `--landing-accent-hi/lo` (15–16) | 3-stop gradients throughout instead of 2-stop plastic |

It stayed honest and stayed blue. No fake metrics, no Talkie brass. Good pass.

---

## 2. Fresh-eyes remaining gaps

These are *my* findings against the committed state — not the (now-done) Talkie list.

### P0 — the one element the pass missed

**P0.1 — `.landing-studio-preview-pane` is the last flat surface, and the least product-honest.** (`landing.css:876`)
Every sibling surface got milled, but the studio promo's inner pane is still `background: rgba(255,255,255,.03)` with a plain `--landing-border` and the static centered string `"Web Audio API · live"` (`LandingHero.tsx:287`). Beside the freshly-recessed code well and scope-well sound cards, it reads as an unfinished placeholder — and a *claim* ("live") rendered as flat chrome rather than something that looks live. Make it a recessed scope well consistent with `.landing-sound-wave`:
```css
background: #09090b;
box-shadow: 0 0 0 1px rgba(255,255,255,.03) inset, 0 2px 12px rgba(0,0,0,.5) inset;
```
This is the single change that makes the page materially complete. **Implemented in this pass** — see §4.

### P1 — register & consistency

**P1.1 — The editorial display register is the one luxury lever consciously *not* pulled.** (`LandingHero.tsx:65`, `landing.css:241`)
The commit *tried* a serif headline (`--font-display` / Instrument Serif is wired in `layout.tsx:19`) and reverted it — the H1 is now Space Grotesk 700 with a `text-shadow`. That's a defensible, restrained choice and I'm **not** overriding it. But it leaves the headline as the *default* luxury-adjacent geometric sans. If you want one more notch of "jewel," the highest-leverage move is a serif↔sans contrast on the **two** big headlines only (hero H1 + CTA H2), at weight 400 (`Instrument Serif` only ships 400 — note the current `font-weight: 700` on the H1 is a no-op/faux-bold risk for a serif). Worth an A/B on `/styleguide` before committing either way. Recommend, don't force.

**P1.2 — Hero H1 `font-weight: 700` is dead weight for any 400-only display face.** (`landing.css:243`)
Harmless today (Space Grotesk has 700), but if the serif ever returns this silently triggers faux-bold. If you keep sans, fine; if you reintroduce the serif, drop to 400.

**P1.3 — `.landing-studio-preview-bar` dots are the old flat traffic lights.** (`landing.css:870`)
Minor: the three window dots in the studio preview are pure flat fills while the rest of the page learned to light from above. A 1px inner top-light (`box-shadow: 0 1px 0 rgba(255,255,255,.25) inset`) would bring them in line. Cosmetic.

### P2 — motion & life

**P2.1 — The scanline is the only thing that moves in the scope well; the canvas play-head doesn't.** (`HeroSoundGrid.tsx:118–162`)
The CSS scanline (`::after`, 618) animates on `.is-playing`, but the canvas draw loop highlights the played portion by `progressRef` *without* a visible moving play-head marker. A 1px accent vertical line at the play position would make the scope read as actively scanning rather than just brightening. The `progressRef` is already there — it's a few lines in the draw loop. Pure polish.

**P2.2 — Stagger only reaches `-3`; the feature grid and CTA arrive as a block.** (`landing.css:891–893`)
The sound grid / feature buckets / studio card all share `fade-in-delay-2`. Extending to `-4`/`-5` down the longer grids would let them settle in sequence. Diminishing returns — the page already feels considered.

**P2.3 — Respect `prefers-reduced-motion` for the new scanline.** (`landing.css:` reduced-motion block)
The reduced-motion guard disables `.fade-in` but not `landingScanline`. Add `.landing .landing-sound-card.is-playing .landing-sound-wave::after { animation: none }` under the guard.

---

## 3. What I would *not* change

- **The 960px column.** Restraint is correct; the luxury is in material/type/light, not width.
- **Blue accent + amber-as-spice.** On-brand and consistent with the studio.
- **The headline copy** ("Design your own / SFX library"). It's a sharper value prop than the prior "Lightweight sounds." Leave it.
- **The committed material tokens.** They match the studio's `--inst-*` vocabulary closely enough that the two surfaces now speak the same language. Don't fork them.

---

## 4. What this pass actually changed

Because the Talkie P0/P1/P2 was already committed (`df43afc`) and a peer agent owns those files, I did **not** re-implement committed work (redundant + collision risk). I made exactly one safe, isolated, non-overriding fix — the single flat surface the pass missed:

- **`styles/landing.css` — `.landing-studio-preview-pane`** → recessed scope well (`#09090b` + inset rim/shadow), consistent with `.landing-sound-wave`. Makes the page materially complete. (Left uncommitted for review.)

Everything in §2 P1/P2 is left as recommendations — they touch either a deliberate just-committed decision (the serif revert) or are diminishing-returns polish. Happy to apply any of them on a go-ahead.

---

## TL;DR

- The "flat landing" premise is **stale**: commit `df43afc` already ported the full instrument-panel material language — and did it well.
- Fresh-eyes **P0:** one missed flat surface — `.landing-studio-preview-pane` (now fixed: recessed scope well).
- Fresh-eyes **P1/P2 (recommend):** optional editorial serif on the two headlines (A/B it; if used, weight 400), canvas play-head marker, deeper stagger, reduced-motion guard for the scanline.
- Stayed honest, stayed blue, didn't clobber the peer agent's commit.
</content>
</invoke>
