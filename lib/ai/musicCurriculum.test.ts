import { describe, expect, it } from 'vitest'
import {
  formatMusicCurriculumForPrompt,
  GROOVE_STYLE_RECIPES,
  MUSIC_CURRICULUM_SOURCES,
} from './musicCurriculum'

describe('musicCurriculum', () => {
  it('includes all primary sources', () => {
    const prompt = formatMusicCurriculumForPrompt()
    for (const source of MUSIC_CURRICULUM_SOURCES) {
      expect(prompt).toContain(source.title)
      expect(prompt).toContain(source.url)
    }
  })

  it('teaches note() for synth pitch', () => {
    const prompt = formatMusicCurriculumForPrompt()
    expect(prompt).toContain('note(')
    expect(prompt).toContain("not `n()`")
  })

  it('includes style recipes', () => {
    const prompt = formatMusicCurriculumForPrompt()
    expect(GROOVE_STYLE_RECIPES.length).toBeGreaterThan(2)
    expect(prompt).toContain('House / four-on-floor')
  })

  it('targets varied instrumental beats', () => {
    const prompt = formatMusicCurriculumForPrompt()
    expect(prompt).toContain('lyricless')
    expect(prompt).toContain('Beat variation toolkit')
    expect(prompt).toContain('.mask(')
  })
})