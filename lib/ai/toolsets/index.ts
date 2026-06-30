import { defaultRegistry } from '@hudsonkit/ai/toolsets'
import { intentsToolset } from './intents'
import { pealStudioToolset } from './peal-studio'
import { pealVoiceToolset } from './peal-voice'

defaultRegistry.register('intents', intentsToolset)
defaultRegistry.register('peal-studio', pealStudioToolset)
defaultRegistry.register('peal-voice', pealVoiceToolset)

export function loadToolset(id: string, context: Record<string, unknown>) {
  const entry = defaultRegistry.resolve(id)
  if (!entry) return { tools: {}, system: undefined, toolPrompt: '' }

  const system = [entry.system, entry.context(context)].filter(Boolean).join('\n\n---\n\n')
  const tools = entry.tools(context)

  return { tools, system, toolPrompt: '' }
}