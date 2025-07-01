'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isStaticBuild } from '@/utils/build'

interface BaseLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

// Component that handles base path for both Link and router.push
export function BaseLink({ href, children, className, onClick }: BaseLinkProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  
  // For static builds, use regular anchor tags with base path
  if (isStaticBuild) {
    const fullPath = href.startsWith('/') ? `${basePath}${href}` : href
    return (
      <a href={fullPath} className={className} onClick={onClick}>
        {children}
      </a>
    )
  }
  
  // For regular builds, use Next.js Link
  return (
    <Link href={href} className={className} onClick={onClick}>
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