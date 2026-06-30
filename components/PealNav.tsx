'use client'

import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Book, Crown, Library, Menu, Mic, Sparkles, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { PealBrandMark, PealWordmark } from './PealBrandMark'
import { BaseLink } from './BaseLink'
import { isStaticBuild } from '@/utils/build'
import { getPublicUrl } from '@/utils/url'

type NavId = 'library' | 'studio' | 'presets' | 'voice' | 'docs' | 'about'

type NavItem = {
  id: NavId
  label: string
  href: string
  icon?: React.ComponentType<{ size?: number }>
  devOnly?: boolean
}

function navActive(pathname: string, tool: string | null, id: NavId): boolean {
  switch (id) {
    case 'library':
      return pathname.startsWith('/library')
    case 'studio':
      return pathname.startsWith('/studio') && tool !== 'voice'
    case 'voice':
      return pathname.startsWith('/voice') || (pathname.startsWith('/studio') && tool === 'voice')
    case 'presets':
      return pathname.startsWith('/presets') || pathname.startsWith('/premium') || pathname.startsWith('/keyboard') || pathname.startsWith('/mechanics') || pathname.startsWith('/brands') || pathname.startsWith('/signature')
    case 'docs':
      return pathname.startsWith('/docs')
    case 'about':
      return pathname.startsWith('/about')
    default:
      return false
  }
}

export default function PealNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams()
  const tool = searchParams.get('tool')
  const isDev = process.env.NODE_ENV === 'development'

  const libraryHref = isStaticBuild ? getPublicUrl('/docs') : '/library'
  const studioHref = isStaticBuild ? getPublicUrl('/about') : '/studio'
  const docsHref = isStaticBuild ? getPublicUrl('/docs') : '/docs'

  const productLinks: NavItem[] = [
    { id: 'library', label: 'Library', href: libraryHref, icon: Library },
    ...(!isStaticBuild
      ? [
          { id: 'studio' as const, label: 'Studio', href: studioHref, icon: Sparkles },
          ...(isDev ? [{ id: 'presets' as const, label: 'Presets', href: '/presets', icon: Crown, devOnly: true }] : []),
          { id: 'voice' as const, label: 'Voice', href: '/studio?tool=voice', icon: Mic },
        ]
      : []),
  ]

  const metaLinks: NavItem[] = [
    { id: 'docs', label: 'Docs', href: docsHref, icon: Book },
    { id: 'about', label: 'About', href: '/about' },
  ]

  const allLinks = [...productLinks, ...metaLinks]

  const linkClass = (id: NavId) =>
    `peal-nav-link${navActive(pathname, tool, id) ? ' is-active' : ''}`

  const renderLink = (item: NavItem) => {
    const Icon = item.icon
    return (
      <BaseLink
        key={item.id}
        href={item.href}
        className={linkClass(item.id)}
        onClick={() => setMobileOpen(false)}
      >
        {Icon ? <Icon size={14} /> : null}
        {item.label}
      </BaseLink>
    )
  }

  return (
    <nav className="peal-nav" aria-label="Primary">
      <div className="peal-nav-inner">
        <div className="peal-nav-start">
          <BaseLink href="/" className="peal-nav-brand" onClick={() => setMobileOpen(false)}>
            <PealBrandMark size={26} />
            <PealWordmark />
          </BaseLink>

          <div className="peal-nav-product" aria-label="Product">
            {productLinks.map(renderLink)}
          </div>
        </div>

        <div className="peal-nav-end">
          <div className="peal-nav-meta" aria-label="Resources">
            {metaLinks.map(renderLink)}
          </div>

          <div className="peal-nav-theme">
            <ThemeToggle />
          </div>

          <button
            type="button"
            className="peal-nav-menu-btn"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="peal-nav-mobile">
          <div className="peal-nav-mobile-grid">
            {allLinks.map(renderLink)}
          </div>
        </div>
      )}
    </nav>
  )
}