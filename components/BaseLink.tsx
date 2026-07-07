'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentPropsWithoutRef } from 'react'
import { isStaticBuild } from '@/utils/build'

type BaseLinkProps = {
  href: string
  children: React.ReactNode
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children'>

// Component that handles base path for both Link and router.push
export function BaseLink({ href, children, className, onClick, ...rest }: BaseLinkProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  
  // For static builds, use regular anchor tags with base path
  if (isStaticBuild) {
    const fullPath = href.startsWith(basePath) || !href.startsWith('/')
      ? href
      : `${basePath}${href}`
    return (
      <a href={fullPath} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    )
  }
  
  // For regular builds, use Next.js Link
  return (
    <Link href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  )
}

// Hook to handle programmatic navigation with base path
export function useBasePath() {
  const router = useRouter()
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  
  const push = (path: string) => {
    if (isStaticBuild && typeof window !== 'undefined') {
      // For static builds, use window.location
      const fullPath = path.startsWith('/') ? `${basePath}${path}` : path
      window.location.href = fullPath
    } else {
      // For regular builds, use Next.js router
      router.push(path)
    }
  }
  
  return { push }
}