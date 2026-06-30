#!/usr/bin/env node
/**
 * Generate Peal message background beds via Minimax and write to public/message-beds/.
 * Run: pnpm seed:message-beds  (or node scripts/seed-message-beds.mjs)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/message-beds')

const BEDS = [
  {
    id: 'success',
    label: 'Success glow',
    pealSound: 'success',
    musicPrompt:
      'Warm ambient UI success bed, soft major pads, gentle upward lift, 6 seconds, minimal, no vocals, sits under a spoken saved confirmation',
    suggestedSpeech: 'Saved successfully.',
  },
  {
    id: 'error',
    label: 'Error tension',
    pealSound: 'error',
    musicPrompt:
      'Low subtle error underscore, minor key, tight muted pulse, 5 seconds, restrained tension, no vocals, background for spoken failure message',
    suggestedSpeech: 'Something went wrong. Please try again.',
  },
  {
    id: 'notification',
    label: 'Notification hum',
    pealSound: 'notification',
    musicPrompt:
      'Neutral notification bed, soft synth hum, light rhythmic pulse, 5 seconds, friendly but unobtrusive, no vocals',
    suggestedSpeech: 'You have a new notification.',
  },
  {
    id: 'message',
    label: 'Message pad',
    pealSound: 'message',
    musicPrompt:
      'Calm conversational background, warm mid-range pads, very subtle movement, 7 seconds, intimate UI message feel, no vocals',
    suggestedSpeech: 'New message received.',
  },
  {
    id: 'mention',
    label: 'Mention sparkle',
    pealSound: 'mention',
    musicPrompt:
      'Light attention bed for mentions, soft bright arpeggio texture, short 4 second loop feel, playful not harsh, no vocals',
    suggestedSpeech: 'You were mentioned.',
  },
  {
    id: 'loading',
    label: 'Loading pulse',
    pealSound: 'loading',
    musicPrompt:
      'Gentle loading loop bed, soft pulsing synth, neutral key, 8 seconds, patient waiting-room energy, no vocals',
    suggestedSpeech: 'Loading, please wait.',
  },
]

function parseEnvFile(content) {
  const out = {}
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line
    const eq = normalized.indexOf('=')
    if (eq <= 0) continue
    const key = normalized.slice(0, eq).trim()
    let value = normalized.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function loadMinimaxKey() {
  for (const path of [resolve(root, '../.env.local'), resolve(root, '.env.local')]) {
    if (!existsSync(path)) continue
    const env = parseEnvFile(readFileSync(path, 'utf8'))
    if (env.MINIMAX_API_KEY) return env.MINIMAX_API_KEY
  }
  if (process.env.MINIMAX_API_KEY) return process.env.MINIMAX_API_KEY
  throw new Error('MINIMAX_API_KEY not found in ../.env.local or peal/.env.local')
}

async function generateBed(apiKey, prompt) {
  const response = await fetch('https://api.minimax.io/v1/music_generation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'music-2.6-free',
      prompt,
      is_instrumental: true,
      output_format: 'hex',
      audio_setting: { sample_rate: 44100, bitrate: 256000, format: 'mp3' },
    }),
  })

  const payload = await response.json()
  const code = payload.base_resp?.status_code ?? (response.ok ? 0 : response.status)
  if (!response.ok || code !== 0) {
    throw new Error(payload.base_resp?.status_msg || `HTTP ${response.status}`)
  }
  if (!payload.data?.audio) throw new Error('No audio in response')
  return Buffer.from(payload.data.audio, 'hex')
}

async function main() {
  const apiKey = loadMinimaxKey()
  mkdirSync(outDir, { recursive: true })

  const manifest = { generatedAt: new Date().toISOString(), beds: [] }

  for (const bed of BEDS) {
    process.stdout.write(`Generating ${bed.id}… `)
    const mp3 = await generateBed(apiKey, bed.musicPrompt)
    const filename = `${bed.id}.mp3`
    writeFileSync(resolve(outDir, filename), mp3)
    manifest.beds.push({
      ...bed,
      file: `/message-beds/${filename}`,
      mimeType: 'audio/mpeg',
    })
    console.log(`ok (${(mp3.length / 1024).toFixed(0)} KB)`)
  }

  writeFileSync(resolve(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`\nWrote ${manifest.beds.length} beds to public/message-beds/`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})