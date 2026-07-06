import { describe, expect, it } from 'vitest'
import {
  pushPatternVersion,
  previousPatternVersion,
} from './musicPatternVersions'

describe('pushPatternVersion', () => {
  it('dedupes identical code at the head', () => {
    const first = pushPatternVersion([], {
      code: 's("bd*4")',
      label: 'Kick',
      source: 'ai',
      tool: 'write_pattern',
    })
    expect(first.pushed).toBe(true)

    const second = pushPatternVersion(first.versions, {
      code: 's("bd*4")',
      label: 'Kick again',
      source: 'ai',
      tool: 'edit_pattern',
      routed: true,
    })

    expect(second.pushed).toBe(false)
    expect(second.versions).toHaveLength(1)
    expect(second.versions[0]?.routed).toBe(true)
  })

  it('tracks chronological versions', () => {
    const a = pushPatternVersion([], {
      code: 's("bd*4")',
      label: 'Kick',
      source: 'ai',
    })
    const b = pushPatternVersion(a.versions, {
      code: 'stack(s("bd*4"), s("hh*8"))',
      label: 'Added hats',
      source: 'ai',
    })

    expect(b.versions).toHaveLength(2)
    expect(previousPatternVersion(b.versions, b.activeId)?.code).toBe('s("bd*4")')
  })
})