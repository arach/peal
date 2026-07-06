import { tool } from 'ai'
import { z } from 'zod'
import type { ToolsetDefinition } from '@hudsonkit/ai/toolsets'
import { analyzeCompositionStart } from '@/lib/ai/musicAiFollowUps'
import { formatMusicExamplesForPrompt } from '@/lib/ai/musicPatternExamples'

const system = `You are the Peal Music AI — a Strudel live-coding assistant inside Peal Studio.

Peal Music has a **Strudel-compatible editor** (source of truth) and a separately mounted Strudel app at /strudel (iframe). You **manage patterns agentically**: write code into the editor, then route/evaluate into the mount, adjust tempo, stack layers, and send generative beds to Minimax when appropriate.

## When to use which path
- **Live code (default):** deterministic Strudel patterns — drums, bass, arps, beds. Use \`describe_to_pattern\`, \`write_pattern\`, \`edit_pattern\`, \`layer_track\`.
- **Generate:** timbre-rich instrumental stems when live samples are not enough — \`set_music_prompt\` + \`generate_music\` (Minimax). Switch lane to generate first.

## Rules
1. Use tools for every change — do not only describe code in prose.
2. Always provide **complete runnable Strudel** in \`code\` fields (not fragments).
3. Prefer small \`edit_pattern\` / \`layer_track\` edits over full rewrites when the user asks for tweaks.
4. \`evaluate_pattern\` routes the editor pattern into the mounted Strudel iframe. \`render_capture\` is unavailable until native engine ships.
5. Never call \`sonic_pi_eval\` — Sonic Pi is desktop OSC only (Phase 4).
6. After tool calls, summarize in one short sentence.
7. When editing, consider the **opening of the composition** — first stack layer, intro density, downbeat, and whether the pattern needs \`setcps()\` at the top.

${formatMusicExamplesForPrompt()}

Peal accent is blue (#4a9eff).`

interface PealMusicContext {
  patternCode?: string
  lane?: string
  engineId?: string
  tempoCps?: number | null
  tempoBpm?: number | null
  isPlaying?: boolean
  strudelMountStatus?: string
  isPatternDirty?: boolean
  minimaxAvailable?: boolean
  musicPrompt?: string
}

function context(ctx: Record<string, unknown>): string {
  const c = ctx as PealMusicContext
  const sections: string[] = [
    '## Studio\nPeal Music Studio — Strudel live code (iframe) + optional Minimax generate.',
    `Lane: **${c.lane ?? 'live'}** · engine: **${c.engineId ?? 'strudel'}**`,
  ]

  if (c.tempoCps != null) sections.push(`Tempo: **${c.tempoCps} cps**${c.tempoBpm != null ? ` (~${c.tempoBpm} bpm)` : ''}`)
  sections.push(`Mount: **${c.strudelMountStatus ?? 'idle'}**${c.isPatternDirty ? ' · editor has unrouted edits' : ''}`)
  sections.push(`Playing: ${c.isPlaying ? 'yes' : 'no'}`)
  sections.push(`Minimax generate: ${c.minimaxAvailable ? 'available' : 'unconfigured (no MINIMAX_API_KEY)'}`)

  if (c.musicPrompt?.trim()) {
    sections.push(`Generate prompt draft: "${c.musicPrompt.trim()}"`)
  }

  const code = c.patternCode?.trim()
  if (code) {
    const start = analyzeCompositionStart(code)
    const startBits = [
      start.tempoCps != null ? `${start.tempoCps} cps` : 'tempo unset',
      `${start.layerCount} layer${start.layerCount === 1 ? '' : 's'}`,
      start.firstLayerHint ?? 'opening unclear',
      start.openingSparse ? 'sparse intro' : 'dense intro',
      [
        start.hasDrums ? 'drums' : null,
        start.hasBass ? 'bass' : null,
        start.hasPad ? 'pad' : null,
        start.hasLead ? 'lead' : null,
      ].filter(Boolean).join(' · ') || 'no role tags',
    ].join(' · ')
    sections.push(`## Composition start\n${startBits}`)
    sections.push('## Current pattern\n```strudel\n' + code + '\n```')
  } else {
    sections.push('No pattern in editor yet.')
  }

  return sections.join('\n\n')
}

function tools(_ctx: Record<string, unknown>) {
  return {
    describe_to_pattern: tool({
      description:
        'Turn a natural-language brief into Strudel code and write it to the editor. You must supply the full generated code.',
      inputSchema: z.object({
        description: z.string().min(1),
        code: z.string().min(1).describe('Complete runnable Strudel pattern'),
        bars: z.number().int().min(1).max(64).optional(),
        style: z.string().optional(),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    write_pattern: tool({
      description: 'Replace the editor pattern with new Strudel code.',
      inputSchema: z.object({
        code: z.string().min(1),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    edit_pattern: tool({
      description:
        'Apply a targeted edit to the current pattern. Supply the full updated code after the edit.',
      inputSchema: z.object({
        instruction: z.string().min(1),
        code: z.string().min(1).describe('Full pattern after the edit'),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    layer_track: tool({
      description: 'Add a layer to the pattern via stack(). Supply the full merged pattern.',
      inputSchema: z.object({
        role: z.enum(['drums', 'bass', 'lead', 'pad', 'perc', 'other']),
        pattern: z.string().min(1).describe('Strudel fragment for this layer'),
        code: z.string().min(1).describe('Full stack(...) pattern including the new layer'),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    set_tempo: tool({
      description: 'Set tempo via cps and/or bpm (stored on provider; include setcps in pattern when rewriting).',
      inputSchema: z.object({
        bpm: z.number().min(20).max(300).optional(),
        cps: z.number().min(0.25).max(16).optional(),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    evaluate_pattern: tool({
      description: 'Mark the current pattern as ready to play in the Strudel REPL (iframe).',
      inputSchema: z.object({}),
      execute: async () => ({ applied: true }),
    }),
    explain_pattern: tool({
      description: 'Summarize the current pattern in plain English (no code change).',
      inputSchema: z.object({
        summary: z.string().min(1),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    set_lane: tool({
      description: 'Switch inspector lane: live (Strudel), generate (Minimax), or bridge (Sonic Pi desktop).',
      inputSchema: z.object({
        lane: z.enum(['live', 'generate', 'bridge']),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    set_music_prompt: tool({
      description: 'Set the Minimax instrumental prompt (generate lane).',
      inputSchema: z.object({
        text: z.string().min(1),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    generate_music: tool({
      description:
        'Request a generative instrumental via Minimax (Phase 2 deck capture). Logs intent until deck unification ships.',
      inputSchema: z.object({
        prompt: z.string().optional(),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    render_capture: tool({
      description: 'Offline-render bars to WAV and capture to deck — requires native Strudel engine (not yet available).',
      inputSchema: z.object({
        bars: z.number().int().min(1).max(64).optional(),
        padLabel: z.string().optional(),
      }),
      execute: async (args) => ({ applied: false, reason: 'native_engine_required', ...args }),
    }),
  }
}

export const pealMusicToolset: ToolsetDefinition = { system, context, tools }