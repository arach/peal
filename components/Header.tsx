'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import DynamicPealLogo from './DynamicPealLogo'
import PealNav from './PealNav'
import { useBasePath } from './BaseLink'

type HeaderVariant = 'none' | 'minimal' | 'app' | 'studio' | 'standalone'

interface HeaderProps {
  variant?: HeaderVariant
  title?: string
  subtitle?: string
  backUrl?: string
  backLabel?: string
  rightContent?: React.ReactNode
}

export default function Header({ 
  variant = 'app',
  title,
  subtitle,
  backUrl,
  backLabel = 'Back',
  rightContent
}: HeaderProps) {
  const router = useRouter()
  const { push } = useBasePath()

  // Don't render anything for 'none' variant
  if (variant === 'none') {
    return null
  }

  const handleNavigation = (path: string) => {
    if (variant === 'app') {
      push(path)
    } else {
      router.push(path)
    }
  }

  const renderMinimalHeader = () => (
    <header className="bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <button
            onClick={() => handleNavigation('/')}
            className="focus:outline-none"
          >
            <DynamicPealLogo 
              width={80} 
              height={24}
              preset="layered"
              animated={false}
              className="text-gray-900 dark:text-gray-100"
            />
          </button>
          <div className="flex items-center gap-3">
            {rightContent}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )

  const renderStudioHeader = () => (
    <header className="bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigation(backUrl || '/library')}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} />
              {backLabel}
            </button>
            {title && (
              <>
                <div className="w-px h-4 bg-gray-700"></div>
                <div>
                  <h1 className="text-sm font-medium text-gray-100">{title}</h1>
                  {subtitle && (
                    <p className="text-2xs text-gray-400 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {rightContent}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )

  const renderStandaloneHeader = () => (
    <header className="border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigation(backUrl || '/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-3 h-3 text-gray-400" />
              <span className="text-2xs text-gray-400">{backLabel}</span>
            </button>
            {title && (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-sm flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <h1 className="text-sm font-light text-white tracking-wide">{title}</h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {rightContent}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )

  const renderAppHeader = () => <PealNav />

  // Render appropriate variant
  switch (variant) {
    case 'minimal':
      return renderMinimalHeader()
    case 'studio':
      return renderStudioHeader()
    case 'standalone':
      return renderStandaloneHeader()
    case 'app':
    default:
      return renderAppHeader()
  }
}
