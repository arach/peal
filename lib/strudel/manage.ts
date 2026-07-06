import { spawn, execSync, type ChildProcess } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { appendFile, open } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import {
  pealProjectRoot,
  readJsonFile,
  strudelConfigPath,
  strudelLogPath,
  strudelStatePath,
  writeJsonFile,
} from './paths.mjs'

export const STRUDEL_DEFAULT_REPO = 'https://codeberg.org/uzu/strudel.git'
export const STRUDEL_DEFAULT_PORT = 4321
/** Peal proxy mount — Strudel dev server must use the same BASE_PATH. */
export const STRUDEL_PROXY_MOUNT = '/strudel'

export interface StrudelManageConfig {
  checkoutPath: string
  port: number
  devScript: string
  packageManager: 'bun' | 'pnpm' | 'npm'
  repoUrl: string
}

export interface StrudelManageState {
  pid: number
  port: number
  upstream: string
  startedAt: string
  logPath: string
}

export type StrudelProcessPhase =
  | 'unconfigured'
  | 'missing'
  | 'installed'
  | 'starting'
  | 'running'
  | 'stopped'
  | 'error'

export interface StrudelManageStatus {
  phase: StrudelProcessPhase
  config: StrudelManageConfig | null
  state: StrudelManageState | null
  upstream: string | null
  reachable: boolean
  pidAlive: boolean
  message: string
}

function defaultCheckoutPath(): string {
  return resolve(pealProjectRoot(), '../strudel')
}

export function defaultStrudelConfig(): StrudelManageConfig {
  return {
    checkoutPath: defaultCheckoutPath(),
    port: STRUDEL_DEFAULT_PORT,
    devScript: 'dev',
    packageManager: 'bun',
    repoUrl: STRUDEL_DEFAULT_REPO,
  }
}

export async function loadStrudelConfig(): Promise<StrudelManageConfig> {
  const stored = await readJsonFile(strudelConfigPath()) as Partial<StrudelManageConfig> | null
  return { ...defaultStrudelConfig(), ...stored }
}

export async function saveStrudelConfig(patch: Partial<StrudelManageConfig>): Promise<StrudelManageConfig> {
  const next = { ...(await loadStrudelConfig()), ...patch }
  await writeJsonFile(strudelConfigPath(), next)
  return next
}

export async function loadStrudelState(): Promise<StrudelManageState | null> {
  const state = await readJsonFile(strudelStatePath())
  return state as StrudelManageState | null
}

export async function clearStrudelState(): Promise<void> {
  const path = strudelStatePath()
  if (existsSync(path)) {
    try {
      unlinkSync(path)
    } catch {
      // ignore
    }
  }
}

function isPidAlive(pid: number): boolean {
  if (!Number.isFinite(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export type StrudelPackageManager = StrudelManageConfig['packageManager']

function detectPackageManager(checkoutPath: string): StrudelPackageManager {
  if (existsSync(resolve(checkoutPath, 'bun.lock')) || existsSync(resolve(checkoutPath, 'bun.lockb'))) {
    return 'bun'
  }
  if (existsSync(resolve(checkoutPath, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(resolve(checkoutPath, 'package-lock.json'))) return 'npm'
  return 'bun'
}

function assertPackageManagerAvailable(pm: StrudelPackageManager): void {
  try {
    execSync(`command -v ${pm}`, { stdio: 'ignore' })
  } catch {
    throw new Error(`${pm} is not on PATH — install it before managing Strudel.`)
  }
}

function upstreamForPort(port: number): string {
  return `http://127.0.0.1:${port}`
}

/** Resolved Strudel origin for proxying (env → managed state → default port). */
export function resolveStrudelUpstreamUrl(): string {
  return (
    process.env.STRUDEL_UPSTREAM?.trim().replace(/\/$/, '')
    ?? resolveManagedStrudelUpstream()
    ?? upstreamForPort(STRUDEL_DEFAULT_PORT)
  )
}

/** Path segment on the Strudel dev server (managed installs use /strudel). */
export function strudelUpstreamMountPath(): string {
  const configured = process.env.STRUDEL_BASE_PATH?.trim()
  if (configured !== undefined) {
    return configured.replace(/^\/+|\/+$/g, '')
  }
  return ''
}

export function buildStrudelUpstreamUrl(subpath = ''): string {
  const upstream = resolveStrudelUpstreamUrl()
  const mount = strudelUpstreamMountPath()
  const tail = subpath.replace(/^\/+/, '')
  const segments = [mount, tail].filter(Boolean)
  const path = segments.length ? `/${segments.join('/')}` : '/'
  return `${upstream}${path}`
}

/** Prefix for rewriting root-absolute Vite/Astro dev asset URLs. */
export function buildStrudelUpstreamAssetPrefix(): string {
  const mount = strudelUpstreamMountPath()
  const upstream = resolveStrudelUpstreamUrl()
  return mount ? `${upstream}/${mount}` : upstream
}

export async function probeStrudelUpstream(upstream: string, timeoutMs = 1500): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(upstream, { signal: controller.signal, redirect: 'follow' })
    return response.ok || response.status < 500
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/** Managed REPL must serve /embed with the real editor — not an Astro 404 shell. */
export async function probeStrudelEmbed(upstream: string, timeoutMs = 2000): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const base = upstream.replace(/\/$/, '')
    const response = await fetch(`${base}/embed`, { signal: controller.signal, redirect: 'follow' })
    if (!response.ok) return false
    const html = await response.text()
    return html.includes('Strudel REPL') && !html.includes('404: Not Found')
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

function pidsListeningOnPort(port: number): number[] {
  try {
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim()
    if (!out) return []
    return out.split('\n')
      .map((line) => Number(line.trim()))
      .filter((pid) => Number.isFinite(pid) && pid > 0)
  } catch {
    return []
  }
}

async function killListenersOnPort(port: number): Promise<void> {
  const pids = pidsListeningOnPort(port)
  if (!pids.length) return

  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // ignore
    }
  }
  await new Promise((r) => setTimeout(r, 800))
  for (const pid of pids) {
    if (isPidAlive(pid)) {
      try {
        process.kill(pid, 'SIGKILL')
      } catch {
        // ignore
      }
    }
  }
  await appendLog(`freed port ${port} (pids: ${pids.join(', ')})`)
}

async function freeManagedStrudelPorts(primaryPort: number): Promise<void> {
  const ports = new Set([primaryPort, 4322, 4323, 4324, 4325])
  for (const port of ports) {
    await killListenersOnPort(port)
  }
}

export function resolveManagedStrudelUpstream(): string | null {
  if (process.env.STRUDEL_UPSTREAM?.trim()) {
    return process.env.STRUDEL_UPSTREAM.trim().replace(/\/$/, '')
  }
  try {
    const path = strudelStatePath()
    if (!existsSync(path)) return null
    const state = JSON.parse(readFileSync(path, 'utf8')) as StrudelManageState
    if (!state?.upstream || !isPidAlive(state.pid)) return null
    return state.upstream.replace(/\/$/, '')
  } catch {
    return null
  }
}

export async function getStrudelStatus(): Promise<StrudelManageStatus> {
  const config = await loadStrudelConfig()
  const state = await loadStrudelState()
  const envUpstream = process.env.STRUDEL_UPSTREAM?.trim().replace(/\/$/, '') ?? null
  const pidAlive = state ? isPidAlive(state.pid) : false

  if (!existsSync(config.checkoutPath)) {
    return {
      phase: 'missing',
      config,
      state,
      upstream: envUpstream,
      reachable: envUpstream ? await probeStrudelUpstream(envUpstream) : false,
      pidAlive: false,
      message: `Checkout not found at ${config.checkoutPath}. Run bun run strudel:install.`,
    }
  }

  const managedUpstream = pidAlive && state ? state.upstream : null
  const upstream = envUpstream ?? managedUpstream
  const reachable = upstream
    ? (envUpstream
      ? await probeStrudelUpstream(upstream)
      : await probeStrudelEmbed(upstream))
    : false

  let phase: StrudelProcessPhase = 'installed'
  let message = 'Strudel checkout ready. Run bun run strudel:start.'

  if (envUpstream) {
    phase = reachable ? 'running' : 'error'
    message = reachable
      ? `Connected via STRUDEL_UPSTREAM (${envUpstream}).`
      : `STRUDEL_UPSTREAM set but not reachable (${envUpstream}).`
  } else if (pidAlive && reachable) {
    phase = 'running'
    message = `Strudel running (pid ${state?.pid}, ${upstream}).`
  } else if (pidAlive && !reachable) {
    phase = 'starting'
    message = `Strudel process started (pid ${state?.pid}) — waiting for ${upstream}…`
  } else if (state && !pidAlive) {
    phase = 'stopped'
    message = 'Strudel process is stopped.'
  }

  return {
    phase,
    config,
    state: pidAlive ? state : null,
    upstream,
    reachable,
    pidAlive,
    message,
  }
}

async function appendLog(line: string): Promise<void> {
  await appendFile(strudelLogPath(), `${new Date().toISOString()} ${line}\n`)
}

function runCommand(
  command: string,
  args: string[],
  cwd: string,
  label: string,
): void {
  execSync([command, ...args].join(' '), {
    cwd,
    stdio: 'inherit',
    env: process.env,
  })
  void appendLog(`${label} ok (${command} ${args.join(' ')})`)
}

export async function installStrudel(checkoutPath?: string): Promise<StrudelManageConfig> {
  const config = await saveStrudelConfig({
    checkoutPath: checkoutPath ? resolve(checkoutPath) : (await loadStrudelConfig()).checkoutPath,
  })

  if (!existsSync(config.checkoutPath)) {
    await appendLog(`cloning ${config.repoUrl} → ${config.checkoutPath}`)
    runCommand('git', ['clone', config.repoUrl, config.checkoutPath], dirname(config.checkoutPath), 'clone')
  }

  const pm = detectPackageManager(config.checkoutPath)
  const saved = await saveStrudelConfig({ packageManager: pm })
  assertPackageManagerAvailable(pm)
  await appendLog(`installing dependencies with ${pm}`)
  runCommand(pm, ['install'], saved.checkoutPath, 'install')
  return saved
}

let managedChild: ChildProcess | null = null

export async function startStrudel(): Promise<StrudelManageStatus> {
  const config = await loadStrudelConfig()
  if (!existsSync(config.checkoutPath)) {
    throw new Error(`Strudel checkout missing at ${config.checkoutPath}. Run install first.`)
  }

  const existingStatus = await getStrudelStatus()
  if (existingStatus.phase === 'running' && existingStatus.reachable) {
    return existingStatus
  }

  await freeManagedStrudelPorts(config.port)

  const upstream = upstreamForPort(config.port)
  const logHandle = await open(strudelLogPath(), 'a')
  const pm = config.packageManager || detectPackageManager(config.checkoutPath)
  assertPackageManagerAvailable(pm)

  await appendLog(`starting ${pm} run ${config.devScript} in ${config.checkoutPath}`)

  const child = spawn(pm, ['run', config.devScript], {
    cwd: config.checkoutPath,
    detached: true,
    stdio: ['ignore', logHandle.fd, logHandle.fd],
    env: {
      ...process.env,
      PORT: String(config.port),
      HOST: '127.0.0.1',
    },
  })

  child.unref()
  managedChild = child

  if (!child.pid) {
    throw new Error('Failed to start Strudel process.')
  }

  const state: StrudelManageState = {
    pid: child.pid,
    port: config.port,
    upstream,
    startedAt: new Date().toISOString(),
    logPath: strudelLogPath(),
  }
  await writeJsonFile(strudelStatePath(), state)

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((r) => setTimeout(r, 1000))
    if (await probeStrudelEmbed(upstream, 2000)) {
      return getStrudelStatus()
    }
    if (!isPidAlive(child.pid)) {
      throw new Error(`Strudel exited early — see ${strudelLogPath()}`)
    }
  }

  return getStrudelStatus()
}

export async function stopStrudel(): Promise<StrudelManageStatus> {
  const config = await loadStrudelConfig()
  const state = await loadStrudelState()
  if (state?.pid && isPidAlive(state.pid)) {
    try {
      process.kill(state.pid, 'SIGTERM')
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 500))
    if (isPidAlive(state.pid)) {
      try {
        process.kill(state.pid, 'SIGKILL')
      } catch {
        // ignore
      }
    }
    await appendLog(`stopped pid ${state.pid}`)
  }
  await freeManagedStrudelPorts(config.port)
  managedChild = null
  await clearStrudelState()
  return getStrudelStatus()
}

export async function setStrudelCheckoutPath(checkoutPath: string): Promise<StrudelManageConfig> {
  return saveStrudelConfig({ checkoutPath: resolve(checkoutPath) })
}