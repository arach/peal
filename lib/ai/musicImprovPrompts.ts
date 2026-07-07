import { analyzeCompositionStart } from '@/lib/ai/musicAiFollowUps'

export type MusicImprovStyle = 'subtle' | 'bold' | 'arc'

export const MUSIC_IMPROV_INTERVAL_OPTIONS = [
  { value: 30, label: '30s' },
  { value: 45, label: '45s' },
  { value: 60, label: '60s' },
  { value: 90, label: '90s' },
  { value: 120, label: '2m' },
] as const

export const DEFAULT_MUSIC_IMPROV_INTERVAL_SEC = 45

const SUBTLE_PROMPTS = [
  'Improv pass: rotate one hi-hat or rim pattern with <a b> alternation — same groove, new cycle.',
  'Improv pass: nudge one layer — gain, lpf, or room. Instrumental only.',
  'Improv pass: add a ghost note or single rest (~) so the loop breathes.',
  'Improv pass: shift one Euclidean hit (euclid offset +1) on percussion.',
  'Improv pass: vary bass root on one beat — motif, not a vocal line.',
] as const

const BOLD_PROMPTS = [
  'Improv pass: add a contrasting stack layer — counter-rhythm or chord stab, no vocals.',
  'Improv pass: rewrite drums for syncopation; keep tempo and instrumental feel.',
  'Improv pass: add a 2-bar .mask() breakdown on the densest layer.',
  'Improv pass: introduce a short arp or pluck motif (2–4 notes) answering the drums.',
  'Improv pass: filter sweep or chord rotation — timbral/harmonic motion.',
] as const

const ARC_PHASES = ['build', 'twist', 'breathe', 'strip'] as const

function arcPrompt(phase: (typeof ARC_PHASES)[number]): string {
  switch (phase) {
    case 'build':
      return 'Improv pass (build): layer one new element — bass, pad, or counter-rhythm. Use edit_pattern or layer_track.'
    case 'twist':
      return 'Improv pass (twist): surprise the listener — odd fill, metric shift, or timbre change on one layer.'
    case 'breathe':
      return 'Improv pass (breathe): thin the texture for one bar — rests, fewer hits, more space.'
    case 'strip':
      return 'Improv pass (strip): remove or simplify the busiest layer; keep the pulse alive.'
  }
}

function contextualHint(patternCode: string): string | null {
  const start = analyzeCompositionStart(patternCode)
  if (!start.hasDrums && !start.hasBass && !start.hasLead && !start.hasPad) {
    return 'The pattern is still sparse — consider establishing a kick or pulse first.'
  }
  if (start.hasDrums && !start.hasBass) {
    return 'Drums are present without bass — a sub layer would anchor this pass.'
  }
  if (start.layerCount >= 3 && !start.openingSparse) {
    return 'The stack is dense — favor a subtractive edit, mask dropout, or filter motion this pass.'
  }
  if (start.openingSparse && start.hasDrums) {
    return 'The opening is sparse — thicken bar 2 or add <a b> hat variation without touching bar 1.'
  }
  if (start.hasDrums && start.layerCount <= 2) {
    return 'Still room to vary — add a second hat phrase length or a slow lpf sweep on one layer.'
  }
  return null
}

export function pickImprovPrompt(input: {
  tick: number
  style: MusicImprovStyle
  patternCode: string
}): { directive: string; phase: string | null } {
  let directive: string
  let phase: string | null = null

  if (input.style === 'arc') {
    const arcPhase = ARC_PHASES[(input.tick - 1) % ARC_PHASES.length] ?? 'build'
    phase = arcPhase
    directive = arcPrompt(arcPhase)
  } else if (input.style === 'bold') {
    directive = BOLD_PROMPTS[(input.tick - 1) % BOLD_PROMPTS.length] ?? BOLD_PROMPTS[0]
  } else {
    directive = SUBTLE_PROMPTS[(input.tick - 1) % SUBTLE_PROMPTS.length] ?? SUBTLE_PROMPTS[0]
  }

  const hint = contextualHint(input.patternCode)
  if (hint) {
    directive = `${directive} ${hint}`
  }

  return { directive, phase }
}

export function buildImprovUserMessage(input: {
  tick: number
  style: MusicImprovStyle
  patternCode: string
  isPlaying: boolean
}): string {
  const { directive, phase } = pickImprovPrompt(input)
  const playing = input.isPlaying ? 'Strudel is playing the current pattern.' : 'Route when done — Peal auto-plays after your edit.'
  const phaseLabel = phase ? ` Phase: ${phase}.` : ''
  return `[Improv loop #${input.tick} · ${input.style}${phaseLabel}] ${directive} ${playing} Instrumental beat — no vocals. Vary one dimension. Use tools only.`
}