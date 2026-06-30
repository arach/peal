import { getEnvApiKey } from '@earendil-works/pi-ai'
import {
  hydratePealCredentialsFromFiles,
  pealCredentialEnvFilePaths,
  pealProjectRoot,
  resetPealCredentialHydrationForTests,
} from './envFiles'
import {
  PEAL_CREDENTIALS,
  PEAL_CREDENTIAL_IDS,
  type PealCredentialDef,
  type PealCredentialFeature,
  type PealCredentialId,
} from './registry'

export type { PealCredentialDef, PealCredentialFeature, PealCredentialId } from './registry'
export { PEAL_CREDENTIALS, PEAL_CREDENTIAL_IDS } from './registry'
export {
  hydratePealCredentialsFromFiles,
  pealCredentialEnvFilePaths,
  pealProjectRoot,
  parseEnvFile,
  readEnvFile,
} from './envFiles'

let ensured = false

/** Idempotent: hydrate env files once, then resolve from process.env / pi-ai. */
export function ensurePealCredentialsLoaded(): void {
  if (ensured) return
  ensured = true
  hydratePealCredentialsFromFiles()
}

export function resetPealCredentialCacheForTests(): void {
  ensured = false
  resetPealCredentialHydrationForTests()
}

function trimValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

export function resolvePealCredential(id: PealCredentialId): string | undefined {
  ensurePealCredentialsLoaded()
  const def = PEAL_CREDENTIALS[id] as PealCredentialDef

  const fromPrimary = trimValue(process.env[def.envVar])
  if (fromPrimary) return fromPrimary

  for (const alias of def.aliases ?? []) {
    const fromAlias = trimValue(process.env[alias])
    if (fromAlias) return fromAlias
  }

  if (def.piProvider) {
    return trimValue(getEnvApiKey(def.piProvider))
  }

  return undefined
}

export function isPealCredentialConfigured(id: PealCredentialId): boolean {
  return Boolean(resolvePealCredential(id))
}

export function pealCredentialSetupHint(id: PealCredentialId): string {
  const def = PEAL_CREDENTIALS[id] as PealCredentialDef
  const root = pealProjectRoot()
  return [
    `Set ${def.envVar} in ${root}/.env.local,`,
    'or add it to the shared ../.env.local next to the Peal repo,',
    'or set PEAL_ENV_FILE to a dotenv file path.',
    'Restart `pnpm dev` (port 3001) after changing env files.',
  ].join(' ')
}

/** Shape consumed by /api/check-providers and the voice UI. */
export function pealCredentialsStatus(): Record<PealCredentialId, boolean> {
  const status = {} as Record<PealCredentialId, boolean>
  for (const id of PEAL_CREDENTIAL_IDS) {
    status[id] = isPealCredentialConfigured(id)
  }
  return status
}

export function credentialsForFeature(feature: PealCredentialFeature): PealCredentialId[] {
  return PEAL_CREDENTIAL_IDS.filter((id) => {
    const def = PEAL_CREDENTIALS[id] as PealCredentialDef
    return def.features.includes(feature)
  })
}