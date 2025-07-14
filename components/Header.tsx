'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Library, Sparkles, Crown, Mic, Book, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import DynamicPealLogo from './DynamicPealLogo'
import { useBasePath } from './BaseLink'
import { isStaticBuild } from '@/utils/build'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { push } = useBasePath()
  const isDev = process.env.NODE_ENV === 'development'

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
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => handleNavigation('/')}
            className="focus:outline-none"
          >
            <DynamicPealLogo 
              width={100} 
              height={32}
              preset="layered"
              animated={false}
              className="text-gray-900 dark:text-gray-100"
            />
          </button>
          <div className="flex items-center gap-4">
            {rightContent}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )

  const renderStudioHeader = () => (
    <header className="bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigation(backUrl || '/library')}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              {backLabel}
            </button>
            {title && (
              <>
                <div className="w-px h-6 bg-gray-700"></div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {rightContent}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )

  const renderStandaloneHeader = () => (
    <header className="border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigation(backUrl || '/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{backLabel}</span>
            </button>
            {title && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-sm flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-light text-white tracking-wide">{title}</h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {rightContent}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )

  const renderAppHeader = () => (
    <header className="bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNavigation('/')}
              className="focus:outline-none"
            >
              <DynamicPealLogo 
                width={100} 
                height={32}
                preset="layered"
                animated={false}
                className="text-gray-900 dark:text-gray-100"
              />
            </button>
            
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleNavigation('/library')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
              >
                <Library size={16} />
                Library
              </button>
              {!isStaticBuild && (
                <>
                  <button
                    onClick={() => handleNavigation('/studio')}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                  >
                    <Sparkles size={16} />
                    Studio
                  </button>
                  {isDev && (
                    <button
                      onClick={() => handleNavigation('/presets')}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                    >
                      <Crown size={16} />
                      Presets
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation('/voice')}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                  >
                    <Mic size={16} />
                    Voice
                  </button>
                </>
              )}
              <button
                onClick={() => handleNavigation('/docs')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
              >
                <Book size={16} />
                Docs
              </button>
              <button
                onClick={() => handleNavigation('/about')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                About
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {rightContent}
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <nav className="px-4 py-4 space-y-2">
            <button
              onClick={() => {
                handleNavigation('/library')
                setMobileMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <Library size={16} />
              Library
            </button>
            {!isStaticBuild && (
              <>
                <button
                  onClick={() => {
                    handleNavigation('/studio')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Studio
                </button>
                {isDev && (
                  <button
                    onClick={() => {
                      handleNavigation('/presets')
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Crown size={16} />
                    Presets
                  </button>
                )}
                <button
                  onClick={() => {
                    handleNavigation('/voice')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Mic size={16} />
                  Voice
                </button>
              </>
            )}
            <button
              onClick={() => {
                handleNavigation('/docs')
                setMobileMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <Book size={16} />
              Docs
            </button>
            <button
              onClick={() => {
                handleNavigation('/about')
                setMobileMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              About
            </button>
          </nav>
        </div>
      )}
    </header>
  )

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