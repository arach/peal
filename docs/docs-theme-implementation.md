# Peal `/docs` Theme Alignment — Implementation Notes

Companion to `docs/docs-theme-review.md`. Records what shipped to align `/docs`
with the landing design system + product chrome, and what's left.

## Outcome (verified in-browser, port 3001)

`/docs` now renders on the dark Peal shell, matching landing + PealNav:

| Axis | Result (computed style) |
|---|---|
| Nav | `<Header>` (default `app` variant) → `<PealNav />` — already the dark branded chrome |
| Shell bg | `rgb(17,17,19)` = `#111113` + landing gradient layers, dark-locked |
| Accent | `#4a9eff` family (kicker, sidebar active, icons, prompts) — no stock Tailwind blue |
| UI font | `Space Grotesk` on shell/headings/sidebar |
| Code font | `JetBrains Mono` on all code wells + inline code (see fix below) |
| Kickers | JetBrains Mono 10px uppercase `0.18em` accent — hero + per-section |
| Code wells | `#09090b` inset wells, shared `lib/highlight-javascript.ts` + `.hl-*` classes |
| Surfaces | translucent gradient cards, `rgba(255,255,255,0.06)` borders, no `shadow-sm` |

## Changed files

- **`styles/docs.css`** — scoped `.docs` stylesheet (dark tokens, shell, hero,
  quick-links, sidebar, content panel, prose, code wells, terminal, features).
- **`app/docs/page.tsx`** — wrapped in `.docs`, imports `styles/docs.css`, uses the
  shared `highlightJavaScript`, `.docs-*` class vocabulary, mono section kickers.

Most of the re-skin landed in an earlier pass. This pass added the review +
two correctness fixes:

1. **Code wells were silently system-mono, not JetBrains.**
   `app/globals.css` declares `code, pre { font-family: var(--font-mono) !important }`
   inside `@layer base`. A **layered `!important` outranks any unlayered rule**, so
   docs.css's `var(--font-jetbrains)` on `code`/`pre` never applied (confirmed:
   computed font was `ui-monospace…`). Fixed docs-locally by re-asserting the brand
   font in the **same `base` layer** at higher specificity:
   ```css
   @layer base {
     .docs-prose code, .docs-code-block pre, .docs-terminal-cmd code {
       font-family: var(--font-jetbrains), ui-monospace, monospace !important;
     }
   }
   ```
   Computed font is now `"JetBrains Mono"`. Colors were never affected (not `!important`).

2. **Multi-line terminal blocks collapsed onto one line.**
   The single-line `.docs-terminal-cmd` pill rendered `<code>{children}</code>` with
   `white-space: normal`, so multi-line bash (CLI `add`/`remove`/`play`, troubleshooting
   `mv`/`peal.load`) flattened to `$# Interactive selection npx …add # Add specific …`.
   `CodeBlock` now branches: single line → inline pill; multi-line → a `.docs-terminal-block`
   `<pre>` well with per-line accent `$` prompts and muted-italic `#` comments. New CSS:
   `.docs-terminal-block pre { white-space: pre }`, `.docs-term-prompt`, `.docs-term-cmt`.

PealNav and landing were not touched.

## Remaining gaps

1. **Site-wide font cascade (not docs-scoped).** The globals `code, pre … !important`
   means **landing and every other surface also render code in system mono**, not
   JetBrains. Docs is patched locally; the durable fix is at the globals level (scope or
   drop that `!important`, or move code-font into the shared token layer) so all surfaces
   get the brand mono without per-page overrides. This is the `peal-shell` consolidation
   the review's Option C points at.
2. **Syntax palette is intentionally muted, not the literal landing `.hl-*` colors.**
   The pass softened `hl-str/kw/key/fn` to low-saturation tints (anti-rainbow for dense
   docs) rather than landing's `#4a9eff / #c792ea / #7ec8e3 / #e6c07b`. Reasonable, but a
   deliberate divergence from "landing palette" — worth a design sign-off.
3. **Token duplication.** docs.css re-declares `--docs-*` mirroring landing `--landing-*`
   and nav `--peal-nav-*` (review Option B). The shared `peal-shell` token layer (Option C)
   is still the eventual de-drift step.
4. **Tooling.** Project ESLint is broken (`eslint@10` vs `eslint-plugin-react`:
   `getFilename is not a function`) — verified instead via dev-server compile + Playwright
   computed-style/screenshot checks.
5. **Minor.** The language-less fenced block in Troubleshooting (the `DOMException` example)
   runs through the JS highlighter; harmless, but could get a plain treatment.
