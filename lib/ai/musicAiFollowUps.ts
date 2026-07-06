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

const PATTERN_WRITE_TOOLS = new Set([
  'describe_to_pattern',
  'write_pattern',
  'edit_pattern',
  'layer_track',
  'auto_route',
])

function postRouteSuggestions(start: CompositionStartSnapshot): string[] {
  const suggestions: string[] = []

  if (!start.openingSparse && start.hasDrums) {
    suggestions.push('Soften the opening — sparse first bar')
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
  if (start.hasDrums) {
    suggestions.push('Alternate hat pattern with <a b c>')
    suggestions.push('Add swing to the hi-hats')
  }
  if (start.hasBass || start.hasLead) {
    suggestions.push('Make it darker — lower the filter')
    suggestions.push('Vary bass roots every 2 bars')
  }
  if (start.tempoCps != null && start.tempoCps >= 1.2) {
    suggestions.push('Half-time feel on the first bar')
  } else if (start.hasDrums) {
    suggestions.push('Add a 2-bar breakdown mask')
  }
  if (start.firstLayerHint === 'kick-forward opening') {
    suggestions.push('Add a fill into bar 2')
  }
  if (start.layerCount >= 2) {
    suggestions.push('Slow filter sweep on one layer')
  }
  if (!start.hasPad && start.layerCount >= 2) {
    suggestions.push('Rotate chord voicing — instrumental bed')
  }

  return suggestions
}

export function getMusicFollowUpSuggestions(edit: PealMusicLastEdit): string[] {
  const suggestions: string[] = []
  const { tool, start, routed, isDirty, patternAfter } = edit
  const changed = edit.patternBefore.trim() !== edit.patternAfter.trim()
  const patternWritten = PATTERN_WRITE_TOOLS.has(tool) && changed
  const listening = routed && !isDirty

  if (listening && (patternWritten || tool === 'evaluate_pattern' || tool === 'auto_route')) {
    suggestions.push(...postRouteSuggestions(start))
  }

  if (tool === 'set_tempo') {
    if (start.tempoCps != null && start.tempoCps >= 1.25) {
      suggestions.push('Slow the opening — half-time feel for bar 1')
    } else {
      suggestions.push('Push energy — denser hats after the intro')
    }
    if (patternAfter.trim()) {
      suggestions.push('Tighten the kick pattern to match the new tempo')
    }
  }

  if (patternWritten && !listening) {
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
    if (patternAfter.trim()) {
      suggestions.push('Refine the opening layer')
    }
  }

  if (tool === 'set_lane' || tool === 'set_music_prompt' || tool === 'generate_music') {
    suggestions.push('Return to live code and refine the opening')
    suggestions.push('Match the generate prompt to the current tempo')
  }

  if (suggestions.length === 0) {
    if (!patternAfter.trim()) {
      return [
        'Instrumental lo-fi beat — dusty drums, chords, no vocals, 82 bpm',
        'House groove with alternating hats every 2 bars, 124 bpm',
        'Downtempo trip-hop — heavy kick, filtered pad, 90 bpm',
      ]
    }
    if (!listening) {
      suggestions.push('Route to hear the current pattern')
    } else {
      suggestions.push(...postRouteSuggestions(start))
    }
    if (suggestions.length === 0) {
      suggestions.push('Add a sub bass under the current pattern')
      suggestions.push('Make it darker — lower the filter and add room')
    }
  }

  let unique = [...new Set(suggestions)]
  if (isDirty) {
    unique = [
      'Route to hear the new pattern',
      ...unique.filter((s) => !s.toLowerCase().includes('route')),
    ]
  }
  return unique.slice(0, 4)
}

/** Refresh routed/dirty flags and follow-ups after an end-of-turn Strudel push. */
export function finalizeMusicLastEdit(
  edit: PealMusicLastEdit | null,
  input: {
    patternBefore: string
    patternAfter: string
    tempoCps: number | null
    tempoBpm: number | null
    summary?: string
    tool?: string
  },
): PealMusicLastEdit {
  if (edit) {
    return buildMusicLastEdit({
      tool: edit.tool,
      summary: input.summary ?? edit.summary,
      patternBefore: edit.patternBefore,
      patternAfter: input.patternAfter,
      routed: true,
      isDirty: false,
      tempoCps: input.tempoCps,
      tempoBpm: input.tempoBpm,
    })
  }

  return buildMusicLastEdit({
    tool: input.tool ?? 'auto_route',
    summary: input.summary ?? 'Playing in Strudel',
    patternBefore: input.patternBefore,
    patternAfter: input.patternAfter,
    routed: true,
    isDirty: false,
    tempoCps: input.tempoCps,
    tempoBpm: input.tempoBpm,
  })
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