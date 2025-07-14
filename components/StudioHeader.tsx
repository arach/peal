'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeft, Volume2, Mic, Layers, Settings, HelpCircle } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

type StudioTool = 'voice' | 'audio' | 'sfx'

interface StudioHeaderProps {
  currentTool: StudioTool
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  onBack?: () => void
}

const toolConfig = {
  voice: {
    label: 'Voice Lab',
    icon: Mic,
    path: '/voice',
    description: 'Text-to-speech generation'
  },
  audio: {
    label: 'Audio Lab', 
    icon: Layers,
    path: '/audio',
    description: 'Audio processing & composition'
  },
  sfx: {
    label: 'SFX Studio',
    icon: Volume2, 
    path: '/studio',
    description: 'Sound effects creation'
  }
}

export default function StudioHeader({ 
  currentTool, 
  title,
  subtitle,
  actions,
  onBack 
}: StudioHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/library')
    }
  }

  const handleToolSwitch = (tool: StudioTool) => {
    if (tool !== currentTool) {
      router.push(toolConfig[tool].path)
    }
  }

  const currentConfig = toolConfig[currentTool]
  const CurrentIcon = currentConfig.icon

  return (
    <header className="bg-gray-950 border-b border-gray-800/60 relative">
      <div className="max-w-none mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left - Navigation & Branding */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-all group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to Peal</span>
            </button>
            
            <div className="w-px h-6 bg-gray-700/50"></div>
            
            {/* Studio Branding */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <CurrentIcon size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-100">
                  {title || currentConfig.label}
                </h1>
                {subtitle && (
                  <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Center - Tool Navigation */}
          <div className="flex items-center gap-1 bg-gray-900/60 rounded-lg p-1 border border-gray-800/40">
            {Object.entries(toolConfig).map(([key, config]) => {
              const isActive = key === currentTool
              const Icon = config.icon
              
              return (
                <button
                  key={key}
                  onClick={() => handleToolSwitch(key as StudioTool)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all relative
                    ${isActive 
                      ? 'bg-gray-700/80 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }
                  `}
                  title={config.description}
                >
                  <Icon size={14} />
                  <span>{config.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right - Actions & Settings */}
          <div className="flex items-center gap-3">
            {/* Tool-specific actions */}
            {actions && (
              <>
                <div className="flex items-center gap-2">
                  {actions}
                </div>
                <div className="w-px h-6 bg-gray-700/50"></div>
              </>
            )}
            
            {/* Global actions */}
            <button 
              className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-all"
              title="Help & shortcuts"
            >
              <HelpCircle size={16} />
            </button>
            
            <button 
              className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-all"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
    </header>
  )
}