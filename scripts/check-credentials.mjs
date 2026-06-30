#!/usr/bin/env node
/**
 * Print Peal credential status (no secret values).
 * Mirrors lib/credentials/envFiles.ts hydration for CLI use without TS loader.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const CREDENTIALS = [
  { id: 'MINIMAX_API_KEY', label: 'Minimax (AI Sound Designer)', features: 'ai-studio' },
  { id: 'OPENAI_API_KEY', label: 'OpenAI (TTS)', features: 'tts' },
  { id: 'GROQ_API_KEY', label: 'Groq (PlayAI TTS)', features: 'tts, tts-fallback' },
  { id: 'ELEVENLABS_API_KEY', label: 'ElevenLabs', features: 'voice-legacy' },
  { id: 'FAL_API_KEY', label: 'Fal', features: 'voice-legacy' },
  { id: 'HUGGINGFACE_API_KEY', label: 'Hugging Face', features: 'voice-legacy' },
]

function parseEnvFile(content) {
  const entries = []
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line
    const eq = normalized.indexOf('=')
    if (eq <= 0) continue
    const key = normalized.slice(0, eq).trim()
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue
    let value = normalized.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    entries.push({ key, value })
  }
  return entries
}

function envFilePaths() {
  const paths = []
  const explicit = process.env.PEAL_ENV_FILE?.trim()
  if (explicit) paths.push(resolve(explicit))
  paths.push(resolve(root, '../.env.local'))
  paths.push(resolve(root, '.env.local'))
  return paths
}

for (const filePath of envFilePaths()) {
  if (!existsSync(filePath)) continue
  for (const { key, value } of parseEnvFile(readFileSync(filePath, 'utf8'))) {
    if (process.env[key] === undefined && value) process.env[key] = value
  }
}

console.log('Peal credentials\n')
console.log('Env files (gap-fill order):')
for (const path of envFilePaths()) console.log(`  · ${path}`)
console.log()

const col = Math.max(...CREDENTIALS.map((c) => c.id.length), 10)
for (const cred of CREDENTIALS) {
  const ok = Boolean(process.env[cred.id]?.trim())
  console.log(`${ok ? '✓' : '·'} ${cred.id.padEnd(col)}  ${cred.label}  [${cred.features}]`)
}

const missing = CREDENTIALS.filter((c) => !process.env[c.id]?.trim())
if (missing.length === 0) {
  console.log('\nAll registered credentials are configured.')
} else {
  console.log(`\n${missing.length} missing — add to peal/.env.local or ../.env.local, then restart pnpm dev.`)
}