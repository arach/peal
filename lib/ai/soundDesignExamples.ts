/**
 * Reference recipes for the peal-studio AI toolset.
 * Grounded in assets/sounds/SOUND_DESIGN.md and Peal UI sound categories.
 */
export const SOUND_DESIGN_EXAMPLES = [
  {
    category: 'UI click / tap',
    summary: 'Soft interface tap',
    propose: { type: 'click' as const, duration: 0.045, frequency: 1400, waveform: 'square' as const, attack: 0.001, decay: 0.02, release: 0.03 },
    notes: 'Tactile but not loud — keyboard/toggle feedback.',
  },
  {
    category: 'UI click / tap',
    summary: 'Mechanical confirm click',
    propose: { type: 'click' as const, duration: 0.06, frequency: 900, waveform: 'square' as const, attack: 0.001, decay: 0.04, sustain: 0.2, release: 0.05 },
    notes: 'Sharper, slightly longer — primary button confirm.',
  },
  {
    category: 'Notification',
    summary: 'Gentle notification chime',
    propose: { type: 'tone' as const, duration: 0.35, frequency: 620, waveform: 'sine' as const, attack: 0.02, decay: 0.15, sustain: 0.35, release: 0.2 },
    notes: 'Soft attack, non-intrusive toast/badge.',
  },
  {
    category: 'Success / complete',
    summary: 'Bright success ding',
    propose: { type: 'tone' as const, duration: 0.4, frequency: 523, waveform: 'sine' as const, attack: 0.005, decay: 0.2, sustain: 0.4, release: 0.25 },
    notes: 'C5 fundamental — achievement, form submitted (cf. Crystal Form profile).',
  },
  {
    category: 'Success / complete',
    summary: 'Quick positive blip',
    propose: { type: 'tone' as const, duration: 0.12, frequency: 880, waveform: 'triangle' as const, attack: 0.003, decay: 0.06, release: 0.08 },
    notes: 'Short upward feel — checkbox, toggle on.',
  },
  {
    category: 'Error / alert',
    summary: 'Subtle error buzz',
    propose: { type: 'tone' as const, duration: 0.28, frequency: 280, waveform: 'square' as const, attack: 0.002, decay: 0.12, sustain: 0.15, release: 0.15 },
    notes: 'Low, attention-getting but not alarming.',
  },
  {
    category: 'Error / alert',
    summary: 'Validation double-tap',
    propose: { type: 'click' as const, duration: 0.08, frequency: 400, waveform: 'square' as const, attack: 0.001, decay: 0.05, release: 0.04 },
    notes: 'For form errors — user may ask for two; mention second pass if needed.',
  },
  {
    category: 'Transition / motion',
    summary: 'Smooth downward swoosh',
    propose: { type: 'sweep' as const, duration: 0.45, frequency: 500, waveform: 'sine' as const, attack: 0.01, decay: 0.2, release: 0.3 },
    notes: 'Panel dismiss, sheet close, navigate back.',
  },
  {
    category: 'Transition / motion',
    summary: 'Light whoosh up',
    propose: { type: 'sweep' as const, duration: 0.35, frequency: 350, waveform: 'triangle' as const, attack: 0.015, decay: 0.18, release: 0.22 },
    notes: 'Modal open, drawer slide.',
  },
  {
    category: 'Loading / processing',
    summary: 'Soft processing pulse',
    propose: { type: 'tone' as const, duration: 0.18, frequency: 220, waveform: 'sine' as const, attack: 0.04, decay: 0.08, sustain: 0.25, release: 0.1 },
    notes: 'Background tick — keep quiet, loop-friendly feel.',
  },
  {
    category: 'Recording / state',
    summary: 'Activate / start sweep',
    propose: { type: 'sweep' as const, duration: 0.18, frequency: 440, waveform: 'sine' as const, attack: 0.005, decay: 0.1, release: 0.12 },
    notes: 'Ascending readiness — 440→880Hz feel in short sweep.',
  },
  {
    category: 'Recording / state',
    summary: 'Stop / seal pulse',
    propose: { type: 'tone' as const, duration: 0.22, frequency: 440, waveform: 'square' as const, attack: 0.008, decay: 0.14, sustain: 0.1, release: 0.18 },
    notes: 'Descending completion — finalize action.',
  },
  {
    category: 'Toggle / switch',
    summary: 'Toggle on blip',
    propose: { type: 'tone' as const, duration: 0.08, frequency: 720, waveform: 'triangle' as const, attack: 0.002, decay: 0.04, release: 0.06 },
    notes: 'Quick upward confirmation — switch on, checkbox checked.',
  },
  {
    category: 'Toggle / switch',
    summary: 'Toggle off thud',
    propose: { type: 'tone' as const, duration: 0.1, frequency: 380, waveform: 'sine' as const, attack: 0.003, decay: 0.06, release: 0.08 },
    notes: 'Slightly lower and softer — switch off.',
  },
  {
    category: 'Message / send',
    summary: 'Outgoing send blip',
    propose: { type: 'click' as const, duration: 0.05, frequency: 1100, waveform: 'square' as const, attack: 0.001, decay: 0.03, release: 0.025 },
    notes: 'Crisp send button — chat, email compose.',
  },
  {
    category: 'Message / send',
    summary: 'Incoming message chime',
    propose: { type: 'tone' as const, duration: 0.25, frequency: 740, waveform: 'sine' as const, attack: 0.015, decay: 0.12, sustain: 0.3, release: 0.15 },
    notes: 'Glassy, friendly — new message toast.',
  },
  {
    category: 'Keyboard / type',
    summary: 'Soft key tap',
    propose: { type: 'click' as const, duration: 0.035, frequency: 1800, waveform: 'square' as const, attack: 0.001, decay: 0.015, release: 0.02 },
    notes: 'Very short, high — virtual keyboard feedback.',
  },
  {
    category: 'Selection / focus',
    summary: 'List item select tick',
    propose: { type: 'click' as const, duration: 0.04, frequency: 1200, waveform: 'triangle' as const, attack: 0.001, decay: 0.02, release: 0.025 },
    notes: 'Subtle navigation — menu highlight, list select.',
  },
] as const

/** Natural-language starters shown in the AI Design panel empty state. */
export const STUDIO_EXAMPLE_PROMPTS = [
  'A soft notification chime for a toast',
  'Quick punchy click for a primary button',
  'Bright success ding when a form submits',
  'Low subtle error buzz for validation failure',
  'Smooth downward swoosh when a panel closes',
  'Short toggle-on blip for a switch',
  'Crisp send blip for a chat message',
  'Very soft keyboard tap for typing feedback',
  'Three short ascending beeps for a countdown',
  'Quiet processing pulse while data loads',
] as const

export function formatSoundDesignExamplesForPrompt(): string {
  const byCategory = new Map<string, typeof SOUND_DESIGN_EXAMPLES[number][]>()
  for (const ex of SOUND_DESIGN_EXAMPLES) {
    const list = byCategory.get(ex.category) ?? []
    list.push(ex)
    byCategory.set(ex.category, list)
  }

  const lines: string[] = ['## Reference recipes (use as starting points for propose_sound)']
  for (const [category, examples] of byCategory) {
    lines.push(`\n### ${category}`)
    for (const ex of examples) {
      const p = ex.propose
      lines.push(
        `- **${ex.summary}**: type=${p.type}, ${p.duration}s, ${p.frequency ?? '—'}Hz, ` +
        `waveform=${p.waveform ?? 'default'}, attack=${p.attack ?? 0.01}, decay=${p.decay ?? 0.1}, ` +
        `release=${p.release ?? 0.1}. ${ex.notes}`,
      )
    }
  }
  return lines.join('\n')
}