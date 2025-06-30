'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Sparkles, Keyboard, Volume2, Download, Code } from 'lucide-react'

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem('peal-welcome-seen')
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('peal-welcome-seen', 'true')
    setIsOpen(false)
  }

  const steps = [
    {
      icon: <Volume2 className="w-12 h-12 text-blue-500" />,
      title: "Welcome to Peal",
      content: "Create and discover beautiful sound effects for your apps. Click any sound to preview it instantly."
    },
    {
      icon: <Sparkles className="w-12 h-12 text-purple-500" />,
      title: "Studio Mode",
      content: "Design custom sounds in real-time with our Studio. Adjust parameters and hear changes instantly."
    },
    {
      icon: <Keyboard className="w-12 h-12 text-green-500" />,
      title: "Keyboard Shortcuts",
      content: "Press '?' anytime to see keyboard shortcuts. Use Space to play/pause, and arrow keys to navigate."
    },
    {
      icon: <Download className="w-12 h-12 text-orange-500" />,
      title: "Export & Use",
      content: "Download sounds as WAV files or copy the code to integrate them into your project."
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>

              {/* Content */}
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  {steps[currentStep].icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {steps[currentStep].content}
                </p>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}