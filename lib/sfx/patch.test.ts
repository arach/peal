import { describe, expect, it } from 'vitest'
import { sfxPatchSchema } from './patch'
import { SFX_DESIGN_RECIPES } from '../ai/sfxDesignGuide'

describe('sfx design recipes', () => {
  it.each(SFX_DESIGN_RECIPES.map((r) => [r.ask, r.patch] as const))('%s is a valid patch', (_ask, patch) => {
    expect(sfxPatchSchema.safeParse(patch).success).toBe(true)
  })
})
