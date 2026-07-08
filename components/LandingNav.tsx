'use client'

import { useState } from 'react'
import { BaseLink, useBasePath } from './BaseLink'
import { PealBrandMark, PealWordmark } from './PealBrandMark'
import WelcomeModal from './WelcomeModal'
import { getPublicUrl } from '@/utils/url'

const metaLinks = [
  { href: '/about', label: 'About' },
  { href: '/docs#troubleshooting', label: 'FAQ' },
  { href: '/docs', label: 'Docs' },
] as const

export default function LandingNav() {
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const { push } = useBasePath()

  return (
    <>
      <header className="landing-header">
        <div className="landing-header-inner">
          <BaseLink href="/" className="landing-header-brand">
            <PealBrandMark size={28} />
            <PealWordmark />
          </BaseLink>

          <nav className="landing-header-nav" aria-label="Site">
            {metaLinks.map(({ href, label }) => (
              <BaseLink
                key={href}
                href={getPublicUrl(href)}
                className="landing-header-link"
              >
                {label}
              </BaseLink>
            ))}
            <button
              type="button"
              className="landing-header-cta"
              onClick={() => setWelcomeOpen(true)}
            >
              Get started
            </button>
          </nav>
        </div>
      </header>

      <WelcomeModal
        variant="landing"
        open={welcomeOpen}
        onOpenChange={setWelcomeOpen}
        onComplete={() => push('/library')}
      />
    </>
  )
}