export interface CompositionStartSnapshot {
  tempoCps: number | null
  layerCount: number
  hasDrums: boolean
  hasBass: boolean
  hasPad: boolean
  hasLead: boolean
  openingSparse: boolean
  firstLayerHint: string | null
}

export interface PealMusicLastEdit {
  id: string
  tool: string
  summary: string
  patternBefore: string
  patternAfter: string
  routed: boolean
  isDirty: boolean
  tempoCps: number | null
  tempoBpm: number | null
  start: CompositionStartSnapshot
  timestamp: number
  followUpSuggestions: string[]
}

function nextId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/** Heuristic read of how the groove opens — first stack layer, tempo, density. */
export function analyzeCompositionStart(code: string): CompositionStartSnapshot {
  const trimmed = code.trim()
  const cpsMatch = trimmed.match(/setcps\s*\(\s*([0-9.]+)\s*\)/i)
  const tempoCps = cpsMatch ? Number.parseFloat(cpsMatch[1]) : null

  const stackBody = trimmed.match(/stack\s*\(([\s\S]*?)\)\s*$/m)?.[1] ?? trimmed
  const layers = stackBody
    .split(/,(?![^(]*\))/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  const layerCount = layers.length > 0 ? layers.length : 1
  const firstLayer = layers[0] ?? trimmed

  const hasDrums = /\b(bd|sd|hh|cp|rim|drum|rolandtr)/i.test(trimmed) || /s\s*\(\s*["'][^"']*(?:bd|sd|hh)/i.test(trimmed)
  const hasBass = /\b(sub|bass)\b/i.test(trimmed) || /n\s*\(\s*["'][^"']*(?:c\d|eb\d|g\d|f\d)/i.test(firstLayer)
  const hasPad = /\b(pad|ambient|room|sawtooth|sine)\b/i.test(trimmed) && /\.room\s*\(|\.attack\s*\(|\.release\s*\(/i.test(trimmed)
  const hasLead = /\b(lead|arp|pluck|melody)\b/i.test(trimmed) || /n\s*\(\s*["'][^"']{3,}/i.test(trimmed)

  const openingSparse = /[~]/.test(firstLayer) || /euclid\s*\(\s*1\s*,/i.test(firstLayer)

  let firstLayerHint: string | null = null
  if (/\bbd\b/i.test(firstLayer)) firstLayerHint = 'kick-forward opening'
  else if (/\b(sd|rim|cp)\b/i.test(firstLayer)) firstLayerHint = 'snare/perc opening'
  else if (/n\s*\(/i.test(firstLayer)) firstLayerHint = 'melodic opening'
  else if (/s\s*\(\s*["']~/.test(firstLayer)) firstLayerHint = 'rest-first opening'

  return {
    tempoCps,
    layerCount,
    hasDrums,
    hasBass,
    hasPad,
    hasLead,
    openingSparse,
    firstLayerHint,
  }
}

export function getMusicFollowUpSuggestions(edit: PealMusicLastEdit): string[] {
  const suggestions: string[] = []
  const { tool, start, routed, isDirty, patternAfter } = edit
  const changed = edit.patternBefore.trim() !== edit.patternAfter.trim()

  if (tool === 'evaluate_pattern') {
    suggestions.push('Tighten the intro — sparse first bar')
    suggestions.push('Add a counter-melody on bar 2')
    if (!start.hasBass && start.hasDrums) {
      suggestions.push('Add sub bass under the downbeat')
    }
    suggestions.push('Double hi-hat density in the chorus')
  }

  if (tool === 'set_tempo') {
    if (start.tempoCps != null && start.tempoCps >= 1.25) {
      suggestions.push('Slow the opening — half-time feel for bar 1')
    } else {
      suggestions.push('Push energy — denser hats after the intro')
    }
    suggestions.push('Route and listen to the new tempo')
  }

  if (['describe_to_pattern', 'write_pattern', 'edit_pattern', 'layer_track'].includes(tool) && changed) {
    if (!start.openingSparse && start.hasDrums) {
      suggestions.push('Soften the opening — sparse first bar')
    }
    if (start.firstLayerHint === 'kick-forward opening' && !start.hasPad) {
      suggestions.push('Add a pad swell into bar 1')
    }
    if (start.hasDrums && !start.hasBass) {
      suggestions.push('Add sub bass under the kick')
    }
    if (start.layerCount === 1) {
      suggestions.push('Layer a second part with stack()')
    }
    if (start.layerCount >= 2 && !start.hasPad) {
      suggestions.push('Add room and a pad for width')
    }
    if (start.tempoCps == null) {
      suggestions.push('Set tempo with setcps() at the top')
    }
    if (!routed || isDirty) {
      suggestions.push('Route to hear the new pattern')
    }
    if (tool === 'layer_track') {
      suggestions.push('Balance layers — lower gain on the newest part')
    }
    if (tool === 'edit_pattern') {
      suggestions.push('A/B the intro — compare before and after')
    }
  }

  if (tool === 'explain_pattern') {
    suggestions.push('Make the intro more cinematic')
    suggestions.push('Add a fill into bar 2')
    suggestions.push('Route and iterate on the opening')
  }

  if (tool === 'set_lane' || tool === 'set_music_prompt' || tool === 'generate_music') {
    suggestions.push('Return to live code and refine the opening')
    suggestions.push('Match the generate prompt to the current tempo')
  }

  if (suggestions.length === 0) {
    if (!patternAfter.trim()) {
      return [
        'Lo-fi hip-hop bed, dusty drums, 78 bpm, 8 bars',
        'Four-on-the-floor house kick with offbeat hats at 128 bpm',
        'Ambient pad in C minor — slow evolution, lots of room',
      ]
    }
    if (!routed || isDirty) {
      suggestions.push('Route to hear the current pattern')
    }
    if (!start.openingSparse) {
      suggestions.push('Soften the opening — sparse first bar')
    }
    suggestions.push('Add a sub bass under the current pattern')
    suggestions.push('Make it darker — lower the filter and add room')
  }

  return [...new Set(suggestions)].slice(0, 4)
}

export function buildMusicLastEdit(input: {
  tool: string
  summary: string
  patternBefore: string
  patternAfter: string
  routed: boolean
  isDirty: boolean
  tempoCps: number | null
  tempoBpm: number | null
}): PealMusicLastEdit {
  const edit: PealMusicLastEdit = {
    id: nextId(),
    tool: input.tool,
    summary: input.summary,
    patternBefore: input.patternBefore,
    patternAfter: input.patternAfter,
    routed: input.routed,
    isDirty: input.isDirty,
    tempoCps: input.tempoCps,
    tempoBpm: input.tempoBpm,
    start: analyzeCompositionStart(input.patternAfter),
    timestamp: Date.now(),
    followUpSuggestions: [],
  }
  edit.followUpSuggestions = getMusicFollowUpSuggestions(edit)
  return edit
}