import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PEAL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export function pealProjectRoot() {
  return PEAL_ROOT
}

export function pealStateDir() {
  return resolve(PEAL_ROOT, '.peal')
}

export function strudelConfigPath() {
  return resolve(pealStateDir(), 'strudel.json')
}

export function strudelStatePath() {
  return resolve(pealStateDir(), 'strudel-state.json')
}

export function strudelLogPath() {
  return resolve(pealStateDir(), 'strudel.log')
}

export async function ensurePealStateDir() {
  await mkdir(pealStateDir(), { recursive: true })
}

export async function readJsonFile(path) {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return null
  }
}

export async function writeJsonFile(path, data) {
  await ensurePealStateDir()
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}