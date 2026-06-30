import { tool } from 'ai'
import { z } from 'zod'
import { VOICE_FX_PRESETS } from '@voxd/client/fx'
import type { ToolsetDefinition } from '@hudsonkit/ai/toolsets'
import {
  formatVoiceFxPresetsForPrompt,
  VOICE_CAPTURE_EXAMPLE_PROMPTS,
  VOICE_EDIT_EXAMPLE_PROMPTS,
} from '@/lib/ai/voiceDesignExamples'

const FX_PRESET_IDS = VOICE_FX_PRESETS.map((p) => p.id)
const fxPresetIdSchema = z.string().describe('Genre id from the list, or empty string for dry')

const fxParamFields = {
  lowCutHz: z.number().optional(),
  highCutHz: z.number().optional(),
  bandQ: z.number().optional(),
  saturationAmount: z.number().min(0).max(1).optional(),
  bitcrushAmount: z.number().min(0).max(1).optional(),
  hissGain: z.number().min(0).max(0.5).optional(),
  hissCutoffHz: z.number().optional(),
  presencePeakDb: z.number().min(0).max(12).optional(),
  presenceCenterHz: z.number().optional(),
  presenceQ: z.number().optional(),
  compressorThresholdDb: z.number().optional(),
  compressorRatio: z.number().optional(),
  clickEnabled: z.boolean().optional(),
  clickGain: z.number().min(0).max(1).optional(),
  clickDurationMs: z.number().optional(),
  squelchTailEnabled: z.boolean().optional(),
  squelchTailGain: z.number().min(0).max(0.3).optional(),
  squelchTailDurationMs: z.number().optional(),
  playbackRate: z.number().min(0.7).max(1.4).optional(),
  outputGain: z.number().min(0).max(2).optional(),
  wetMix: z.number().min(0).max(1).optional(),
}

const system = `You are the Peal Voice AI Editor — an in-studio assistant for shaping clips after capture.

Peal Deck is a multi-source soundboard. Users **capture** speech (TTS), instrumentals (Minimax), and one-shots (SFX) onto deck pads, then **edit** them through the programmable mixer.

## Workflow
1. **Capture** — set script/prompt and call generate_voice, generate_music, or generate_sfx (Capture panel).
2. **AI Edit** — after a clip lands on a pad, load **genres** (named FX chains) into the mixer and **tweak strip knobs** for the selected clip. Changes apply live to the pad.
3. Use tools for every edit — do not only describe settings in prose.
4. After tool calls, summarize what changed in one short sentence.

## Mixer terminology
- **Genre** — a named chain (Tower Control, AM Broadcast, Walkie, etc.). \`apply_fx_preset\` loads a genre into the mixer and applies to the selected clip.
- **Channel strip** — EQ, grit, hiss, presence, rate, level knobs. \`tweak_fx\` adjusts strip values on the selected clip.
- Empty genre id \`""\` means dry (no FX).
- \`preview_clip\` auditions the selected clip through the current mixer program.

## FX craft (Vox voice engine)
- **dispatch** family: mission-control, calm or urgent room comms.
- **walkie** family: close-range pocket radio, more grit and band-limiting.
- tweak_fx merges partial params onto the clip's genre base — use for "more hiss", "slower", "push presence", etc.

## Available genres
${formatVoiceFxPresetsForPrompt(VOICE_FX_PRESETS)}

## Example capture prompts
${VOICE_CAPTURE_EXAMPLE_PROMPTS.map((p) => `- "${p}"`).join('\n')}

## Example edit prompts (post-capture)
${VOICE_EDIT_EXAMPLE_PROMPTS.map((p) => `- "${p}"`).join('\n')}

## Response style
- Brief, direct, craft-focused.
- Peal accent is blue (#4a9eff), not purple.`

interface PealVoiceContext {
  selectedModel?: string
  selectedVoice?: string
  speed?: number
  defaultFxPresetId?: string
  selectedTakeId?: string | null
  selectedTakeLabel?: string | null
  selectedTakeSource?: string | null
  selectedTakeScript?: string | null
  selectedTakeFxPresetId?: string | null
  mixerGenreId?: string
  mixerKnobTweakCount?: number
  takeCount?: number
  activeBank?: number
  captureSource?: string
  script?: string
  musicPrompt?: string
  isGenerating?: boolean
  currentlyPlayingId?: string | null
}

function context(ctx: Record<string, unknown>): string {
  const c = ctx as PealVoiceContext
  const sections: string[] = [
    '## Studio\nPeal Voice Studio — capture clips to the deck, then AI-edit through the programmable mixer.',
  ]

  sections.push(`Clips on board: **${c.takeCount ?? 0}** · active bank **${(c.activeBank ?? 0) + 1}**`)
  if (c.captureSource) sections.push(`Capture source: **${c.captureSource}**`)
  sections.push(`Generation: ${c.selectedModel ?? 'tts-1'} / ${c.selectedVoice ?? 'alloy'} @ ${c.speed ?? 1}x`)
  sections.push(`Default genre for new clips: \`${c.defaultFxPresetId || 'dry'}\``)

  const mixerGenre = c.mixerGenreId || 'dry'
  const tweakNote = (c.mixerKnobTweakCount ?? 0) > 0
    ? ` · **${c.mixerKnobTweakCount}** knob${c.mixerKnobTweakCount === 1 ? '' : 's'} off-recipe`
    : ''
  sections.push(`Mixer program: \`${mixerGenre}\`${tweakNote}`)

  if (c.selectedTakeId) {
    sections.push(`Selected clip: \`${c.selectedTakeId}\`${c.selectedTakeLabel ? ` (${c.selectedTakeLabel})` : ''}`)
    if (c.selectedTakeSource) sections.push(`Clip source: **${c.selectedTakeSource}**`)
    if (c.selectedTakeScript) sections.push(`Selected script: "${c.selectedTakeScript}"`)
    if (c.selectedTakeFxPresetId != null) {
      sections.push(`Clip committed genre: \`${c.selectedTakeFxPresetId || 'dry'}\``)
    }
  } else {
    sections.push('No clip selected — select a deck pad before edit tools; capture tools still work.')
  }

  if (c.script?.trim()) sections.push(`Script draft: "${c.script.trim()}"`)
  if (c.isGenerating) sections.push('Status: capturing')
  if (c.currentlyPlayingId) sections.push(`Status: previewing clip \`${c.currentlyPlayingId}\``)

  return sections.join('\n\n')
}

function tools(_ctx: Record<string, unknown>) {
  return {
    apply_fx_preset: tool({
      description: 'Load a genre (named FX chain) into the mixer and apply to the selected clip, a specific clip, or the default for new clips.',
      inputSchema: z.object({
        presetId: fxPresetIdSchema,
        target: z.enum(['selected', 'default', 'take']).default('selected'),
        takeId: z.string().optional(),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    tweak_fx: tool({
      description: 'Adjust channel-strip knobs on the selected clip (merges partial VoiceFxParams onto its genre base).',
      inputSchema: z.object({
        takeId: z.string().optional().describe('Clip id; defaults to selected clip'),
        params: z.object(fxParamFields),
        clearOverrides: z.boolean().optional().describe('Reset strip knobs back to the loaded genre recipe'),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    set_script: tool({
      description: 'Set the script textarea for the next TTS capture.',
      inputSchema: z.object({
        text: z.string().min(1),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    set_voice_defaults: tool({
      description: 'Set TTS provider defaults (model, voice, speed, default genre).',
      inputSchema: z.object({
        model: z.string().optional(),
        voice: z.string().optional(),
        speed: z.number().min(0.25).max(2).optional(),
        defaultFxPresetId: fxPresetIdSchema.optional(),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    set_music_prompt: tool({
      description: 'Set the instrumental capture prompt for Minimax music generation.',
      inputSchema: z.object({
        text: z.string().min(1),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    generate_voice: tool({
      description: 'Capture TTS speech to the active deck bank.',
      inputSchema: z.object({
        text: z.string().optional().describe('Override script; otherwise uses the script field'),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    generate_sfx: tool({
      description: 'Capture a short UI sound effect (Web Audio synthesis) to the active deck bank.',
      inputSchema: z.object({
        summary: z.string().min(1),
        type: z.enum(['click', 'tone', 'noise', 'sweep']).optional(),
        duration: z.number().min(0.03).max(1.5).optional(),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    generate_music: tool({
      description: 'Capture an instrumental clip via Minimax to the active deck bank.',
      inputSchema: z.object({
        prompt: z.string().optional().describe('Override music prompt'),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
    preview_clip: tool({
      description: 'Preview a clip through the current mixer program (selected clip if takeId omitted).',
      inputSchema: z.object({
        takeId: z.string().optional(),
      }),
      execute: async (args) => ({ applied: true, ...args }),
    }),
  }
}

export const pealVoiceToolset: ToolsetDefinition = { system, context, tools }