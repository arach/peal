'use client'

import { useSoundStore } from '@/store/soundStore'

export default function LoadingOverlay() {
  const { generationProgress, generationStatus } = useSoundStore()

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="surface-primary p-8 rounded-xl text-center shadow-2xl max-w-sm mx-4">
        <div className="w-12 h-12 border-3 border-border dark:border-gray-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
        
        <h3 className="text-lg font-medium text-text-primary dark:text-gray-100 mb-4">Generating Sounds...</h3>
        
        <div className="w-75 h-2 bg-background-tertiary dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-300 rounded-full"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
        
        <p className="text-sm text-text-secondary dark:text-gray-400">{generationStatus}</p>
      </div>
    </div>
  )
}