export type PealMusicPatternVersionSource = 'ai' | 'manual' | 'restore' | 'reset' | 'initial'

export interface PealMusicPatternVersion {
  id: string
  code: string
  label: string
  source: PealMusicPatternVersionSource
  tool?: string
  summary?: string
  routed: boolean
  timestamp: number
}

export interface PushPatternVersionInput {
  code: string
  label: string
  source: PealMusicPatternVersionSource
  tool?: string
  summary?: string
  routed?: boolean
}

export const MAX_PATTERN_VERSIONS = 32

function nextVersionId() {
  return `pat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function normalizeCode(code: string) {
  return code.trim()
}

export function headPatternVersion(versions: PealMusicPatternVersion[]): PealMusicPatternVersion | null {
  return versions.length > 0 ? versions[versions.length - 1] : null
}

export function findPatternVersion(
  versions: PealMusicPatternVersion[],
  id: string,
): PealMusicPatternVersion | null {
  return versions.find((version) => version.id === id) ?? null
}

export function versionIndex(versions: PealMusicPatternVersion[], id: string | null): number {
  if (!id) return -1
  return versions.findIndex((version) => version.id === id)
}

export function previousPatternVersion(
  versions: PealMusicPatternVersion[],
  activeId: string | null,
): PealMusicPatternVersion | null {
  const index = versionIndex(versions, activeId)
  if (index <= 0) return null
  return versions[index - 1] ?? null
}

export function pushPatternVersion(
  versions: PealMusicPatternVersion[],
  input: PushPatternVersionInput,
): { versions: PealMusicPatternVersion[]; activeId: string; pushed: boolean } {
  const code = normalizeCode(input.code)
  if (!code) {
    return { versions, activeId: versions.at(-1)?.id ?? '', pushed: false }
  }

  const head = headPatternVersion(versions)
  if (head && normalizeCode(head.code) === code) {
    if (input.routed && !head.routed) {
      const next = versions.map((version, index) => (
        index === versions.length - 1 ? { ...version, routed: true } : version
      ))
      return { versions: next, activeId: head.id, pushed: false }
    }
    return { versions, activeId: head.id, pushed: false }
  }

  const version: PealMusicPatternVersion = {
    id: nextVersionId(),
    code,
    label: input.label,
    source: input.source,
    tool: input.tool,
    summary: input.summary,
    routed: input.routed ?? false,
    timestamp: Date.now(),
  }

  const nextVersions = [...versions, version].slice(-MAX_PATTERN_VERSIONS)
  return { versions: nextVersions, activeId: version.id, pushed: true }
}

export function markPatternVersionRouted(
  versions: PealMusicPatternVersion[],
  activeId: string | null,
): PealMusicPatternVersion[] {
  if (!activeId) return versions
  return versions.map((version) => (
    version.id === activeId ? { ...version, routed: true } : version
  ))
}

export function formatPatternVersionLabel(version: PealMusicPatternVersion, index: number): string {
  const routed = version.routed ? ' · routed' : ''
  return `v${index + 1} · ${version.label}${routed}`
}