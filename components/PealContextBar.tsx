'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { BaseLink } from './BaseLink'
import { parsePealStudioToolFromPathname } from '@/app/hudson/peal-studio/routing'
import {
  contextNavActive,
  getContextSectionConfig,
  resolveContextSection,
} from './peal-nav/routing'

function PealContextNavContent({
  searchParams,
  variant,
}: {
  searchParams: URLSearchParams
  variant: 'inline' | 'mobile'
}) {
  const pathname = usePathname() ?? ''
  const section = resolveContextSection(pathname)
  const tool = parsePealStudioToolFromPathname(pathname)

  if (!section) return null

  const config = getContextSectionConfig(section, searchParams)
  const wrapperClass =
    variant === 'inline'
      ? `peal-nav-context peal-nav-context--${section}`
      : `peal-nav-mobile-context peal-nav-context--${section}`

  return (
    <div className={wrapperClass} aria-label={`${config.label} views`}>
      {variant === 'mobile' && (
        <div className="peal-context-crumb" aria-hidden="true">
          <span className="peal-context-section">{config.label}</span>
          <ChevronRight size={12} strokeWidth={1.75} className="peal-context-sep" />
        </div>
      )}

      <div className="peal-context-toggle" role="tablist" aria-label={`${config.label} sections`}>
        {config.items.map((item) => {
          const active = contextNavActive(pathname, tool, item.id)
          return (
            <BaseLink
              key={item.id}
              href={item.href}
              role="tab"
              aria-selected={active}
              className={`peal-context-toggle-btn${active ? ' is-active' : ''}`}
            >
              {item.label}
            </BaseLink>
          )
        })}
      </div>
    </div>
  )
}

function PealContextNavWithSearchParams({ variant }: { variant: 'inline' | 'mobile' }) {
  const searchParams = useSearchParams()
  return (
    <PealContextNavContent
      searchParams={searchParams}
      variant={variant}
    />
  )
}

export function PealContextNav() {
  return (
    <Suspense fallback={null}>
      <PealContextNavWithSearchParams variant="inline" />
    </Suspense>
  )
}

export function PealContextNavMobile() {
  return (
    <Suspense fallback={null}>
      <PealContextNavWithSearchParams variant="mobile" />
    </Suspense>
  )
}

export function hasPealContextNav(pathname: string) {
  return resolveContextSection(pathname) !== null
}