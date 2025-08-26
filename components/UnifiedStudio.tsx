'use client'

import { useState, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import StudioHeader from './StudioHeader'
import StudioAudioLab from './StudioAudioLab'
import Studio from './Studio'
import TTSStudio from './TTSStudio'

type StudioTool = 'voice' | 'audio' | 'sfx'

interface StudioContextType {
  currentTool: StudioTool
  setCurrentTool: (tool: StudioTool) => void
  sharedState: {
    // Add any shared state here
  }
}

const StudioContext = createContext<StudioContextType | null>(null)

export const useStudio = () => {
  const context = useContext(StudioContext)
  if (!context) {
    throw new Error('useStudio must be used within StudioProvider')
  }
  return context
}

interface UnifiedStudioProps {
  initialTool?: StudioTool
}

export default function UnifiedStudio({ initialTool = 'voice' }: UnifiedStudioProps) {
  const [currentTool, setCurrentTool] = useState<StudioTool>(initialTool)
  const [sharedState] = useState({})

  const contextValue: StudioContextType = {
    currentTool,
    setCurrentTool,
    sharedState
  }

  const handleToolChange = (tool: StudioTool) => {
    setCurrentTool(tool)
  }

  const renderCurrentView = () => {
    switch (currentTool) {
      case 'voice':
        return <TTSStudio />
      case 'audio':
        return <StudioAudioLab />
      case 'sfx':
        return <Studio />
      default:
        return <TTSStudio />
    }
  }

  return (
    <StudioContext.Provider value={contextValue}>
      <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
        <StudioHeader 
          currentTool={currentTool}
          onToolChange={handleToolChange}
        />
        <div className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </div>
      </div>
    </StudioContext.Provider>
  )
}