import { describe, expect, it } from 'vitest'
import { buildImprovUserMessage, pickImprovPrompt } from './musicImprovPrompts'

describe('musicImprovPrompts', () => {
  it('rotates arc phases', () => {
    const first = pickImprovPrompt({ tick: 1, style: 'arc', patternCode: 's("bd*4")' })
    const second = pickImprovPrompt({ tick: 2, style: 'arc', patternCode: 's("bd*4")' })
    expect(first.phase).toBe('build')
    expect(second.phase).toBe('twist')
    expect(first.directive).not.toBe(second.directive)
  })

  it('tags improv loop messages', () => {
    const message = buildImprovUserMessage({
      tick: 2,
      style: 'subtle',
      patternCode: 'stack(s("bd*4"), s("hh*8"))',
      isPlaying: true,
    })
    expect(message).toContain('[Improv loop #2')
    expect(message).toContain('subtle')
  })
})