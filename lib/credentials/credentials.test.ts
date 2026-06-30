import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseEnvFile, readEnvFile } from './envFiles'
import {
  isPealCredentialConfigured,
  resetPealCredentialCacheForTests,
  resolvePealCredential,
} from './index'

describe('parseEnvFile', () => {
  it('parses quoted and export-prefixed lines', () => {
    const entries = parseEnvFile([
      '# comment',
      'OPENAI_API_KEY=sk-test',
      'export GROQ_API_KEY="gsk_test"',
      'BAD-KEY=nope',
    ].join('\n'))

    expect(entries).toEqual([
      { key: 'OPENAI_API_KEY', value: 'sk-test' },
      { key: 'GROQ_API_KEY', value: 'gsk_test' },
    ])
  })
})

describe('resolvePealCredential', () => {
  let tempDir = ''

  beforeEach(() => {
    resetPealCredentialCacheForTests()
    tempDir = mkdtempSync(join(tmpdir(), 'peal-cred-'))
  })

  afterEach(() => {
    resetPealCredentialCacheForTests()
    delete process.env.PEAL_ENV_FILE
    delete process.env.OPENAI_API_KEY
    if (tempDir) rmSync(tempDir, { recursive: true, force: true })
  })

  it('reads from PEAL_ENV_FILE when process.env is unset', () => {
    const envPath = join(tempDir, 'shared.env')
    writeFileSync(envPath, 'OPENAI_API_KEY=from-shared-file\n')
    process.env.PEAL_ENV_FILE = envPath

    expect(resolvePealCredential('OPENAI_API_KEY')).toBe('from-shared-file')
    expect(isPealCredentialConfigured('OPENAI_API_KEY')).toBe(true)
  })

  it('does not override an existing process.env value', () => {
    const envPath = join(tempDir, 'shared.env')
    writeFileSync(envPath, 'OPENAI_API_KEY=from-file\n')
    process.env.PEAL_ENV_FILE = envPath
    process.env.OPENAI_API_KEY = 'from-process'

    expect(resolvePealCredential('OPENAI_API_KEY')).toBe('from-process')
  })
})