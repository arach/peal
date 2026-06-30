'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { PealBrandMark, PealWordmark } from './PealBrandMark'
import { isStaticBuild } from '@/utils/build'
import { getPublicUrl } from '@/utils/url'

export default function LandingNav() {
  const libraryHref = isStaticBuild ? getPublicUrl('/docs') : '/library'
  const studioHref = isStaticBuild ? getPublicUrl('/about') : '/studio'
  const docsHref = isStaticBuild ? getPublicUrl('/docs') : '/docs'

  return (
    <nav className="landing-nav" aria-label="Primary">
      <div className="landing-nav-inner">
        <Link href="/" className="landing-nav-brand">
          <PealBrandMark size={26} />
          <PealWordmark />
        </Link>

        <div className="landing-nav-links">
          <Link href={libraryHref} className="landing-nav-link">
            Library
          </Link>
          <Link href={studioHref} className="landing-nav-link">
            Studio
          </Link>
          <Link href={docsHref} className="landing-nav-link">
            Docs
          </Link>
          <div className="landing-nav-theme">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}