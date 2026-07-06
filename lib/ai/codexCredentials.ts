import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

interface CodexCliAuthFile {
  tokens?: {
    access_token?: string
  }
}

interface PiOAuthEntry {
  type?: string
  access?: string
  expires?: number
}

function readJsonFile(path: string): unknown | null {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

function trimToken(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function tokenFromCodexCliAuth(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  return trimToken((raw as CodexCliAuthFile).tokens?.access_token)
}

function tokenFromPiAuth(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const entry = (raw as Record<string, PiOAuthEntry>)['openai-codex']
  if (!entry || entry.type !== 'oauth') return undefined
  const token = trimToken(entry.access)
  if (!token) return undefined
  if (typeof entry.expires === 'number' && Date.now() >= entry.expires) return undefined
  return token
}

/**
 * Resolve a ChatGPT Codex access token for pi-ai's `openai-codex` provider.
 *
 * pi-ai has no env-var mapping for Codex; tokens come from the Codex CLI auth
 * store or a pi-ai `auth.json` OAuth entry.
 */
export function resolveOpenAICodexAccessToken(): string | undefined {
  const fromEnv = trimToken(process.env.OPENAI_CODEX_ACCESS_TOKEN)
    ?? trimToken(process.env.OPENAI_CODEX_API_KEY)
  if (fromEnv) return fromEnv

  const codexHome = trimToken(process.env.CODEX_HOME) ?? join(homedir(), '.codex')
  const fromCodexCli = tokenFromCodexCliAuth(readJsonFile(join(codexHome, 'auth.json')))
  if (fromCodexCli) return fromCodexCli

  const piAuthPaths = [
    join(process.cwd(), 'auth.json'),
    join(homedir(), '.pi', 'auth.json'),
  ]
  for (const path of piAuthPaths) {
    const token = tokenFromPiAuth(readJsonFile(path))
    if (token) return token
  }

  return undefined
}