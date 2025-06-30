'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Library, Sparkles, Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import DynamicPealLogo from './DynamicPealLogo'

export default function LibraryHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push('/')}
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
                onClick={() => window.location.reload()}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"
              >
                <Library size={16} />
                Library
              </button>
              <button
                onClick={() => router.push('/studio')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
              >
                <Sparkles size={16} />
                Studio
              </button>
              {isDev && (
                <button
                  onClick={() => router.push('/presets')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
                >
                  Presets (Dev)
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
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
                window.location.reload()
                setMobileMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2"
            >
              <Library size={16} />
              Library
            </button>
            <button
              onClick={() => {
                router.push('/studio')
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
                  router.push('/presets')
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                Presets (Dev)
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}