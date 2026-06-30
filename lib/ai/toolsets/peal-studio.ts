import { tool } from 'ai'
import { z } from 'zod'
import type { ToolsetDefinition } from '@hudsonkit/ai/toolsets'
import { formatSoundDesignExamplesForPrompt } from '@/lib/ai/soundDesignExamples'

const SOUND_DESIGN_REFERENCE = formatSoundDesignExamplesForPrompt()

const system = `You are the Peal Sound Designer — an in-studio assistant for crafting UI notification audio.

You work inside Peal Sound Studio. Users describe sounds in plain language; you translate intent into concrete synthesis parameters via the propose_sound tool.

## How to work
1. Ask one clarifying question only when the request is genuinely ambiguous.
2. When you have enough detail, call propose_sound — do not only describe parameters in prose.
3. After propose_sound, summarize what you proposed in one short sentence.
4. Use open_library when the user wants presets; use open_ai_design only if they ask to focus this panel.

## Design rules
- Never use purple in your language or metaphors — Peal accent is blue (#4a9eff).
- UI sounds are short: typically 50–800ms. Clicks often 30–120ms.
- One propose_sound per distinct sound. For sequences (e.g. "3 clicks"), propose the composite feel in one call or explain you'd need multiple passes.
- Coerce numeric fields as numbers, not strings.

## Sound craft
- Clicks: type click, short duration (0.03–0.08s), square or noise, sharp attack, little sustain.
- Success / achievement: brighter frequency, sine or triangle, gentle decay, upward feel.
- Error / warning: lower frequency, slightly longer decay, avoid harsh clipping.
- Notifications: soft attack (0.02+), moderate release, sine or triangle.
- Swoosh / transition: type sweep or noise, longer duration (0.2–0.6s).

## Response style
- Brief, direct, craft-focused — like a sound engineer, not a marketer.
- No apologies, no filler.

${SOUND_DESIGN_REFERENCE}`

interface PealStudioContext {
  currentTool?: string
  soundId?: string | null
  soundType?: string | null
  isPlaying?: boolean
  prompt?: string
}

function context(ctx: Record<string, unknown>): string {
  const c = ctx as PealStudioContext
  const sections: string[] = ['## Studio\nPeal Sound Studio — SFX design with live Web Audio code.']

  if (c.currentTool) sections.push(`Tool: **${c.currentTool}**`)
  if (c.soundId) sections.push(`Active sound: \`${c.soundId}\` (${c.soundType ?? 'unknown'})`)
  else sections.push('No sound loaded — propose a new design or suggest opening the library.')
  if (c.prompt) sections.push(`User prompt: "${c.prompt}"`)
  if (c.isPlaying) sections.push('Playback: playing')

  return sections.join('\n\n')
}

function tools(_ctx: Record<string, unknown>) {
  return {
    propose_sound: tool({
      description: 'Propose structured parameters for a UI sound the studio can synthesize.',
      inputSchema: z.object({
        summary: z.string().describe('Short label for the sound, e.g. "soft success chime"'),
        type: z.enum(['click', 'tone', 'noise', 'sweep']).describe('Primary oscillator/noise type'),
        frequency: z.number().optional().describe('Base frequency in Hz'),
        duration: z.number().describe('Duration in seconds (e.g. 0.15)'),
        waveform: z.enum(['sine', 'square', 'sawtooth', 'triangle']).optional(),
        attack: z.number().optional(),
        decay: z.number().optional(),
        sustain: z.number().optional(),
        release: z.number().optional(),
        notes: z.string().optional().describe('Extra craft notes for the user'),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    open_ai_design: tool({
      description: 'Focus the studio AI Design inspector panel.',
      inputSchema: z.object({}),
      execute: async () => ({ applied: true }),
    }),
    open_library: tool({
      description: 'Open the sound library picker.',
      inputSchema: z.object({}),
      execute: async () => ({ applied: true }),
    }),
  }
}

export const pealStudioToolset: ToolsetDefinition = { system, context, tools }