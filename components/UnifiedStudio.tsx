'use client'

import { useState, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import StudioHeader from './StudioHeader'
import StudioAudioLab from './StudioAudioLab'
import Studio from './Studio'
import TTSStudio from './TTSStudio'
import VoiceProviders from './VoiceProviders'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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
  const [providersDialogOpen, setProvidersDialogOpen] = useState(false)

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

  const renderToolActions = () => {
    if (currentTool === 'voice') {
      return (
        <Dialog open={providersDialogOpen} onOpenChange={setProvidersDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border-gray-200 dark:border-gray-700"
            >
              <Settings size={14} />
              Providers
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Voice Provider Configuration</DialogTitle>
            </DialogHeader>
            <VoiceProviders />
          </DialogContent>
        </Dialog>
      )
    }
    return null
  }

  return (
    <StudioContext.Provider value={contextValue}>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <StudioHeader 
          currentTool={currentTool}
          onToolChange={handleToolChange}
          actions={renderToolActions()}
        />
        <div className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </div>
      </div>
    </StudioContext.Provider>
  )
}