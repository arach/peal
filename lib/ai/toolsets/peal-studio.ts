import { tool } from 'ai'
import { z } from 'zod'
import type { ToolsetDefinition } from '@hudsonkit/ai/toolsets'
import { sfxPatchSchema } from '@hudsonkit/sfx/engine'
import { formatSfxDesignGuideForPrompt } from '@hudsonkit/sfx/engine'

const DESIGN_GUIDE = formatSfxDesignGuideForPrompt()

const system = `You are the SFX Sound Designer — an in-studio sound designer for UI and product audio.

You work inside SFX Sound Studio. Users describe a moment or a material in plain language; you compose a layered sound with the compose_sound tool. Every compose_sound call replaces the whole composition in the studio — the user can step back and forward through your versions.

## How to work
1. Ask one clarifying question only when the request is genuinely ambiguous.
2. Otherwise call compose_sound with the complete patch — do not only describe it in prose.
3. When a current composition is shown below and the user asks for a change ("warmer", "add a click", "shorter"), start from it: keep what works, change what they asked, and return the full updated patch.
4. After compose_sound, say in one short sentence what you built and which layer does what.
5. Use open_library when the user wants presets; use open_ai_design only if they ask to focus this panel.

## Response style
- Brief, direct, craft-focused — like a sound engineer, not a marketer. No apologies, no filler.
- Never use purple in your language or metaphors — SFX accent is blue (#4a9eff).
- Numbers as numbers, not strings.

${DESIGN_GUIDE}`

interface PealStudioContext {
  currentTool?: string
  soundId?: string | null
  soundType?: string | null
  isPlaying?: boolean
  prompt?: string
  composition?: unknown
}

function context(ctx: Record<string, unknown>): string {
  const c = ctx as PealStudioContext
  const sections: string[] = ['## Studio\nPeal Sound Studio — SFX design with live Web Audio code.']

  if (c.currentTool) sections.push(`Tool: **${c.currentTool}**`)
  if (c.composition) {
    sections.push(`## Current composition (edit this when the user asks for changes)\n${JSON.stringify(c.composition)}`)
  } else if (c.soundId) {
    sections.push(`Active sound: \`${c.soundId}\` (${c.soundType ?? 'unknown'}) — not an AI composition; compose a new one from the request.`)
  } else {
    sections.push('No sound loaded — compose a new one from the request.')
  }
  if (c.isPlaying) sections.push('Playback: playing')

  return sections.join('\n\n')
}

function tools(_ctx: Record<string, unknown>) {
  return {
    compose_sound: tool({
      description: 'Compose (or recompose) the whole sound as a layered patch. Replaces the current composition in the studio.',
      inputSchema: sfxPatchSchema,
      execute: async (args) => ({ applied: true, summary: args.summary, layers: args.layers.length }),
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
