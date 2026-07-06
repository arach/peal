import { describe, expect, it } from 'vitest'
import {
  buildMusicLastEdit,
  finalizeMusicLastEdit,
  getMusicFollowUpSuggestions,
} from './musicAiFollowUps'

describe('getMusicFollowUpSuggestions', () => {
  it('suggests iteration chips after a routed pattern write', () => {
    const edit = buildMusicLastEdit({
      tool: 'write_pattern',
      summary: 'house groove',
      patternBefore: '',
      patternAfter: 'stack(s("bd*4"), s("~ cp ~ cp"))',
      routed: true,
      isDirty: false,
      tempoCps: 2,
      tempoBpm: 120,
    })

    const suggestions = getMusicFollowUpSuggestions(edit)
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.some((s) => s.includes('Route'))).toBe(false)
    expect(suggestions.some((s) => s.toLowerCase().includes('bass') || s.toLowerCase().includes('hat'))).toBe(true)
  })

  it('still nudges route when pattern is dirty', () => {
    const edit = buildMusicLastEdit({
      tool: 'edit_pattern',
      summary: 'added hats',
      patternBefore: 's("bd*4")',
      patternAfter: 'stack(s("bd*4"), s("hh*8"))',
      routed: false,
      isDirty: true,
      tempoCps: 1,
      tempoBpm: 60,
    })

    expect(getMusicFollowUpSuggestions(edit)).toContain('Route to hear the new pattern')
  })
})

describe('finalizeMusicLastEdit', () => {
  it('marks routed and rebuilds follow-ups', () => {
    const prior = buildMusicLastEdit({
      tool: 'edit_pattern',
      summary: 'darker filter',
      patternBefore: 's("bd*4")',
      patternAfter: 's("bd*4").lpf(400)',
      routed: false,
      isDirty: true,
      tempoCps: 1,
      tempoBpm: 60,
    })

    const finalized = finalizeMusicLastEdit(prior, {
      patternBefore: prior.patternBefore,
      patternAfter: prior.patternAfter,
      tempoCps: 1,
      tempoBpm: 60,
    })

    expect(finalized.routed).toBe(true)
    expect(finalized.isDirty).toBe(false)
    expect(finalized.followUpSuggestions.length).toBeGreaterThan(0)
    expect(finalized.followUpSuggestions.some((s) => s.includes('Route'))).toBe(false)
  })
})