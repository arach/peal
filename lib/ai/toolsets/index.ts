import type { ToolsetDefinition } from './types'
import { intentsToolset } from './intents'
import { pealStudioToolset } from './peal-studio'
import { pealVoiceToolset } from './peal-voice'
import { pealMusicToolset } from './peal-music'
import { sfxToolset } from '@hudsonkit/sfx/toolset'

const toolsets = new Map<string, ToolsetDefinition>()

toolsets.set('intents', intentsToolset)
toolsets.set('peal-studio', pealStudioToolset)
toolsets.set('peal-voice', pealVoiceToolset)
toolsets.set('peal-music', pealMusicToolset)
// The SFX conversation (@hudsonkit/sfx) composes through its own toolset.
toolsets.set('sfx', sfxToolset)

export function loadToolset(id: string, context: Record<string, unknown>) {
  const entry = toolsets.get(id)
  if (!entry) return { tools: {}, system: undefined, toolPrompt: '' }

  const system = [entry.system, entry.context(context)].filter(Boolean).join('\n\n---\n\n')
  const tools = entry.tools(context)

  return { tools, system, toolPrompt: '' }
}
