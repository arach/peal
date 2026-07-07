import { studioHrefWithTool } from '@/app/hudson/peal-studio/routing'
import { isStaticBuild } from '@/utils/build'

export type PealNavLayout = 'landing' | 'app' | 'studio'

export type PealPrimaryId = 'library' | 'studio' | 'docs' | 'about'

export type PealContextId = 'sounds' | 'presets' | 'sfx' | 'voice' | 'music'

export type PealContextSection = 'library' | 'studio'

export function resolveNavLayout(pathname: string, override?: PealNavLayout): PealNavLayout {
  if (override) return override
  if (pathname.startsWith('/studio')) return 'studio'
  if (pathname === '/') return 'landing'
  return 'app'
}

export function isPresetsRoute(pathname: string) {
  return (
    pathname.startsWith('/presets')
    || pathname.startsWith('/premium')
    || pathname.startsWith('/keyboard')
    || pathname.startsWith('/mechanics')
    || pathname.startsWith('/brands')
    || pathname.startsWith('/signature')
  )
}

export function isLibrarySection(pathname: string) {
  return pathname.startsWith('/library') || isPresetsRoute(pathname)
}

export function isStudioSection(pathname: string) {
  return pathname.startsWith('/studio') || pathname.startsWith('/voice')
}

export function resolveContextSection(pathname: string): PealContextSection | null {
  if (isLibrarySection(pathname)) return 'library'
  if (isStudioSection(pathname)) return 'studio'
  return null
}

export function primaryNavActive(pathname: string, id: PealPrimaryId): boolean {
  switch (id) {
    case 'library':
      return isLibrarySection(pathname)
    case 'studio':
      return isStudioSection(pathname)
    case 'docs':
      return pathname.startsWith('/docs')
    case 'about':
      return pathname.startsWith('/about')
    default:
      return false
  }
}

export function contextNavActive(pathname: string, tool: string | null, id: PealContextId): boolean {
  switch (id) {
    case 'sounds':
      return pathname.startsWith('/library')
    case 'presets':
      return isPresetsRoute(pathname)
    case 'sfx':
      return pathname.startsWith('/studio') && (!tool || tool === 'sfx')
    case 'voice':
      return pathname.startsWith('/voice') || (pathname.startsWith('/studio') && tool === 'voice')
    case 'music':
      return pathname.startsWith('/studio') && tool === 'music'
    default:
      return false
  }
}

export function getContextSectionConfig(
  section: PealContextSection,
  searchParams: URLSearchParams,
) {
  if (section === 'library') {
    return {
      label: 'Library',
      items: [
        {
          id: 'sounds' as const,
          label: 'Sounds',
          href: isStaticBuild ? '/docs' : '/library',
        },
        {
          id: 'presets' as const,
          label: 'Presets',
          href: isStaticBuild ? '/docs' : '/presets',
        },
      ],
    }
  }

  return {
    label: 'Studio',
    items: [
      {
        id: 'sfx' as const,
        label: 'SFX',
        href: isStaticBuild ? '/about' : studioHrefWithTool(searchParams, 'sfx'),
      },
      {
        id: 'voice' as const,
        label: 'Voice',
        href: isStaticBuild ? '/about' : studioHrefWithTool(searchParams, 'voice'),
      },
      {
        id: 'music' as const,
        label: 'Music',
        href: isStaticBuild ? '/about' : studioHrefWithTool(searchParams, 'music'),
      },
    ],
  }
}

export function getPrimaryLinks() {
  const libraryHref = isStaticBuild ? '/docs' : '/library'
  const studioHref = isStaticBuild ? '/about' : '/studio'
  const docsHref = '/docs'

  return {
    product: [
      { id: 'library' as const, label: 'Library', href: libraryHref },
      { id: 'studio' as const, label: 'Studio', href: studioHref },
    ],
    meta: [
      { id: 'docs' as const, label: 'Docs', href: docsHref },
      { id: 'about' as const, label: 'About', href: '/about' },
    ],
  }
}