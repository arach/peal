import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { resolveOpenAICodexAccessToken } from './codexCredentials'

describe('resolveOpenAICodexAccessToken', () => {
  let tempDir = ''

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'peal-codex-'))
    delete process.env.OPENAI_CODEX_ACCESS_TOKEN
    delete process.env.OPENAI_CODEX_API_KEY
    delete process.env.CODEX_HOME
  })

  afterEach(() => {
    delete process.env.OPENAI_CODEX_ACCESS_TOKEN
    delete process.env.OPENAI_CODEX_API_KEY
    delete process.env.CODEX_HOME
    if (tempDir) rmSync(tempDir, { recursive: true, force: true })
  })

  it('prefers OPENAI_CODEX_ACCESS_TOKEN', () => {
    process.env.OPENAI_CODEX_ACCESS_TOKEN = 'env-token'
    expect(resolveOpenAICodexAccessToken()).toBe('env-token')
  })

  it('reads access_token from Codex CLI auth.json', () => {
    process.env.CODEX_HOME = tempDir
    writeFileSync(join(tempDir, 'auth.json'), JSON.stringify({
      tokens: { access_token: 'cli-token' },
    }))
    expect(resolveOpenAICodexAccessToken()).toBe('cli-token')
  })

  it('reads openai-codex oauth entry from pi-ai auth.json', () => {
    const emptyCodexHome = mkdtempSync(join(tmpdir(), 'peal-codex-empty-'))
    process.env.CODEX_HOME = emptyCodexHome
    writeFileSync(join(tempDir, 'auth.json'), JSON.stringify({
      'openai-codex': {
        type: 'oauth',
        access: 'pi-token',
        expires: Date.now() + 60_000,
      },
    }))
    const previousCwd = process.cwd()
    try {
      process.chdir(tempDir)
      expect(resolveOpenAICodexAccessToken()).toBe('pi-token')
    } finally {
      process.chdir(previousCwd)
      rmSync(emptyCodexHome, { recursive: true, force: true })
    }
  })
})