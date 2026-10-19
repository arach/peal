'use client'

/**
 * The SFX tool is @hudsonkit/sfx mounted in the studio's shell slots. Peal
 * supplies the AI route (Scout-backed `sfx` toolset), its CLI line and the
 * shell's persisted panel key.
 */
import { configureSfx } from '@hudsonkit/sfx'

configureSfx({
  chatEndpoint: '/api/ai/chat',
  toolset: 'sfx',
  provider: 'scout',
  model: 'codex',
  modelLabel: 'Codex via Scout',
  exportCommand: (slug) => `peal add ${slug}`,
  shellPersistKey: 'inst:peal-studio:appshell.peal-studio',
})

export { SfxLeftPanel as PealSetsLeftPanel, SfxContent as PealSetsContent, SfxInspector as PealSetsInspector } from '@hudsonkit/sfx'
