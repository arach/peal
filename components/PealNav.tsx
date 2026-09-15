'use client'

import { Suspense, useState } from 'react'
import { usePathname } from 'next/navigation'
import { KeyRound, Library, Menu, Sparkles, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { ByokSettingsHost } from './ByokSettings'
import { openByokSettings } from '@/lib/byok'
import { PealBrandMark, PealWordmark } from './PealBrandMark'
import { BaseLink } from './BaseLink'
import { PealContextNav, PealContextNavMobile } from './PealContextBar'
import {
  getPrimaryLinks,
  primaryNavActive,
  resolveNavLayout,
  type PealNavLayout,
  type PealPrimaryId,
} from './peal-nav/routing'

function PealNavShell({ layout: layoutOverride }: { layout?: PealNavLayout }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname() ?? ''
  const layout = resolveNavLayout(pathname, layoutOverride)
  const links = getPrimaryLinks()

  const linkClass = (id: PealPrimaryId, variant: 'primary' | 'mobile' = 'primary') =>
    `peal-nav-link peal-nav-link--${variant}${primaryNavActive(pathname, id) ? ' is-active' : ''}`

  const closeMobile = () => setMobileOpen(false)

  const productIcons = {
    library: Library,
    studio: Sparkles,
  } as const

  return (
    <nav className={`peal-nav peal-nav--${layout}`} aria-label="Primary">
      <div className="peal-nav-inner">
        <div className="peal-nav-left">
          <BaseLink href="/" className="peal-nav-brand" onClick={closeMobile}>
            <PealBrandMark size={28} />
            <PealWordmark />
          </BaseLink>

          <div className="peal-nav-links" aria-label="Product">
            {links.map((item) => (
              <BaseLink
                key={item.id}
                href={item.href}
                className={linkClass(item.id, 'primary')}
                onClick={closeMobile}
              >
                {item.label}
              </BaseLink>
            ))}
          </div>
        </div>

        <div className="peal-nav-center">
          <PealContextNav />
        </div>

        <div className="peal-nav-right">
          <div className="peal-nav-end">
            <button
              type="button"
              className="peal-nav-key"
              onClick={openByokSettings}
              aria-label="API keys"
              title="API keys — bring your own, stored in this browser only"
            >
              <KeyRound size={15} />
            </button>
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
      </div>

      {mobileOpen && (
        <div className="peal-nav-mobile">
          <div className="peal-nav-mobile-grid">
            {links.map((item) => {
              const Icon = productIcons[item.id]
              return (
                <BaseLink
                  key={item.id}
                  href={item.href}
                  className={linkClass(item.id, 'mobile')}
                  onClick={closeMobile}
                >
                  <Icon size={14} />
                  {item.label}
                </BaseLink>
              )
            })}
          </div>
          <PealContextNavMobile />
        </div>
      )}
      <ByokSettingsHost />
    </nav>
  )
}

export default function PealNav({ layout }: { layout?: PealNavLayout }) {
  return (
    <Suspense fallback={<PealNavShell layout={layout} />}>
      <PealNavShell layout={layout} />
    </Suspense>
  )
}