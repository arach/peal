# Talkie mic-recovery earcons — bespoke sound family

Authored by **peal.master** (Peal is a UI-sound-design project) for TalkieAgent's automatic
microphone-recovery flow. Fully **synthesized**, no samples, no copyrighted material —
regenerate anytime with `node generate.cjs`.

## The family

One shared **"soft glass bell"** voice (additive partials `1 · 2.01 · 2.76 · 3.94 · 5.41`,
mild inharmonicity for shimmer, 4 ms attack, exponential decay, light air tail) across all four
stages, all drawn from the **A-major pentatonic** set. Identical timbre + pitch world →
they unmistakably belong together; only the *melodic contour* changes to carry meaning.

| Stage | File (`.wav` + `.aiff`) | Motif | Contour → meaning | Dur | Peak | Mean |
|---|---|---|---|---|---|---|
| 1 · reset begins | `talkie-mic-reset-begin` | E5 → A5 (P4 up), rounded | gentle rise = "noticed, working" | 340 ms | −2.9 dB | −15.1 dB |
| 2 · reset succeeds | `talkie-mic-reset-succeed` | A5 → C#6 → E6 (maj triad up), bright | resolves upward = "fixed, good" | 500 ms | −2.9 dB | −16.1 dB |
| 3 · succeeds, HAL degraded | `talkie-mic-reset-degraded` | A5 → C#6 → **B5** (hangs on the 2nd), veiled + ~3 Hz waver | success onset that *doesn't* resolve and quietly wavers = "fixed, but still shaky" | 540 ms | −2.9 dB | −17.7 dB |
| 4 · reset fails | `talkie-mic-reset-fail` | F#5 → D5 → A4 (descending), dark | falls to a soft dark low = "didn't work" — **not** an alarm | 580 ms | −2.9 dB | −14.2 dB |

The clever one is **degraded**: it opens exactly like *succeed* (so the ear expects a win), then
lands on a suspended tone with a slow detuned waver and dimmed upper partials — the "but…" is
carried by *unresolved harmony + instability*, not by loudness. That keeps it low-salience while
still reading as qualified.

## Recommended playback levels

Assets are pre-normalized to **−2.9 dBFS peak**, so apply attenuation in-app. Starting points
(linear gain on a 0–1 scale), tuned for subtlety with a light information-priority gradient:

| Stage | Gain | Notes |
|---|---|---|
| begin | **0.22** | quietest — least informative; see silence note below |
| succeed | **0.28** | |
| degraded | **0.30** | a touch above succeed so the caveat is noticed |
| fail | **0.32** | most important to register |

Tune ±20% to taste; these land the earcons a few dB above your current Tink/Pop system-sound
level (10–16%). Keep them gated off whenever all user feedback-sound settings are `None`.

## Silence recommendation

- **`reset begins` should be silent for fast recoveries.** Most auto-recoveries resolve in a few
  hundred ms; a begin chime would collide with the succeed chime as a double-beep. Recommended:
  play `begin` **only if the reset has not resolved within ~400 ms** (a "this is taking a moment"
  cue). If you can't gate on elapsed time, prefer **silent begin** and let `succeed`/`degraded`/`fail`
  be the whole vocabulary.
- **`succeed`, `degraded`, `fail` always play** (when feedback ≠ None) — each is a distinct,
  actionable outcome and deserves its own earcon.

## Integration (macOS / Swift)

Bundle the `.aiff` files (BEI16 / 48 kHz, idiomatic for the platform) into your app's Resources,
then play via `AVAudioPlayer` (lets you apply the per-stage gain):

```swift
enum MicRecoverySound: String {
    case begin = "talkie-mic-reset-begin"
    case succeed = "talkie-mic-reset-succeed"
    case degraded = "talkie-mic-reset-degraded"
    case fail = "talkie-mic-reset-fail"

    var gain: Float {
        switch self {
        case .begin: return 0.22
        case .succeed: return 0.28
        case .degraded: return 0.30
        case .fail: return 0.32
        }
    }
}

func playMicRecovery(_ s: MicRecoverySound) {
    guard feedbackSoundsEnabled else { return }          // gated off when all == None
    guard let url = Bundle.main.url(forResource: s.rawValue, withExtension: "aiff"),
          let player = try? AVAudioPlayer(contentsOf: url) else { return }
    player.volume = s.gain
    player.prepareToPlay()
    player.play()
    micRecoveryPlayer = player                            // retain until finished
}
```

`NSSound(contentsOf:byReference:)` also works but gives less volume control. WAV versions are
included for non-Apple playback paths.

## Regenerate / iterate

`node generate.cjs` rewrites the WAVs; re-run the `afconvert` loop for AIFFs. All timbre, pitch,
duration and level parameters live at the top of `generate.cjs` — easy to nudge brightness, tempo,
or swap the pentatonic root.

> **Audition before shipping.** These are DSP-designed v1 earcons; the contours and levels are
> deliberate, but I can't ear-check them from here. Play them through `afplay talkie-mic-reset-*.aiff`,
> and I'm happy to iterate on brightness / length / level on request.
