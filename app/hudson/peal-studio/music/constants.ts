export const DEFAULT_STRUDEL_PATTERN = `// Peal Music — live-coded patterns (Strudel / Tidal)
setcps(1)

stack(
  s("bd ~ sd ~").bank('RolandTR909'),
  note("c2 eb2 g2").scale('C:minor').s('sawtooth').gain(0.35).lpf(800),
)
`

/** @deprecated use resolveStrudelReplUrl — mount is self-hosted at /strudel */
export const STRUDEL_REPL_ORIGIN = 'https://strudel.cc'

export { strudelMountBase, strudelMountIndexPath, resolveStrudelReplUrl } from '@/lib/strudel/mount'