import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface ParsedEnvEntry {
  key: string
  value: string
}

/** Parse a dotenv-style file without external dependencies. */
export function parseEnvFile(content: string): ParsedEnvEntry[] {
  const entries: ParsedEnvEntry[] = []

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line
    const eq = normalized.indexOf('=')
    if (eq <= 0) continue

    const key = normalized.slice(0, eq).trim()
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue

    let value = normalized.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    entries.push({ key, value })
  }

  return entries
}

export function readEnvFile(path: string): ParsedEnvEntry[] {
  if (!existsSync(path)) return []
  return parseEnvFile(readFileSync(path, 'utf8'))
}

/** Peal repo root (directory containing package.json / next.config.js). */
export function pealProjectRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../..')
}

/**
 * Env files loaded in order; later files do not override keys already set.
 * Matches the monorepo pattern: shared `../.env.local` fills gaps, project `.env.local` wins.
 */
export function pealCredentialEnvFilePaths(root = pealProjectRoot()): string[] {
  const paths: string[] = []

  const explicit = process.env.PEAL_ENV_FILE?.trim()
  if (explicit) paths.push(resolve(explicit))

  paths.push(resolve(root, '../.env.local'))
  paths.push(resolve(root, '.env.local'))

  return paths
}

let hydrated = false

/** Fill unset process.env keys from Peal credential env files (server / next.config only). */
export function hydratePealCredentialsFromFiles(): void {
  if (hydrated) return
  hydrated = true

  if (typeof process === 'undefined') return

  for (const filePath of pealCredentialEnvFilePaths()) {
    for (const { key, value } of readEnvFile(filePath)) {
      if (process.env[key] === undefined && value) {
        process.env[key] = value
      }
    }
  }
}

/** Reset hydration flag — tests only. */
export function resetPealCredentialHydrationForTests(): void {
  hydrated = false
}