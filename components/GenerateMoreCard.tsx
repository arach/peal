'use client'

import { useState } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import GenerateOptionsModal from './GenerateOptionsModal'

export default function GenerateMoreCard() {
  const [showOptionsModal, setShowOptionsModal] = useState(false)

  return (
    <div className="group relative">
      <button
        onClick={() => setShowOptionsModal(true)}
        className="w-full h-full min-h-[200px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
      >
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            Generate More Sounds
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add 6 new sounds to your library
          </p>
        </div>
      </button>
      
      <GenerateOptionsModal 
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
      />
    </div>
  )
}