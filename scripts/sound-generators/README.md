# Sound generators

One-shot Node scripts that synthesize WAV banks into `assets/sounds/<set>/` and copy them to `public/sounds/<set>/` for local serving.

Run from the repo root:

```bash
node scripts/sound-generators/generate_signature_sounds.js
node scripts/sound-generators/generate_ui_mechanics.js
# …
```

These are **authoring tools**, not part of the runtime app or npm package. The active CLI catalog lives in `cli/sounds/`; the larger web-app banks live under `assets/sounds/`.

`assets/sounds/generate-sounds.cjs` is the smaller Scout custom set generator (success/error/start/stop).
