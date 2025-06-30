'use client'

import { useState } from 'react'
import { Code, Sparkles, Zap, ChevronDown, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'
import HeroSoundGrid from './HeroSoundGrid'

export default function LandingHero() {
  const [showCode, setShowCode] = useState(false)

  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Lightweight sound effects
            <br />
            <span className="text-blue-600 dark:text-blue-400">for modern apps</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
          >
            Beautiful, responsive UI sounds that work everywhere. 
            Elevate your brand with bespoke audio that makes your app feel futuristic.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <a
              href="#sounds"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition-colors touch-manipulation"
            >
              <Volume2 size={20} />
              Explore Library
            </a>
            <a
              href="/studio"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-900 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors touch-manipulation"
            >
              <Sparkles size={20} />
              Open Studio
            </a>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center"
          >
            <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce" />
          </motion.div>
        </div>

        {/* Sound Grid Demo */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-wide">
            Try our signature sounds
          </h3>
          <HeroSoundGrid />
        </motion.div>

        {/* Integration Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-3xl mx-auto"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Dead simple integration
          </h3>
          
          <button
            onClick={() => setShowCode(!showCode)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 mx-auto mb-4"
          >
            <Code size={16} />
            {showCode ? 'Hide' : 'Show'} integration code
          </button>

          {showCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm text-left overflow-x-auto">
                <code>{`// Using Peal with Howler.js
import { Howl } from 'howler'

const sound = new Howl({
  src: ['/sounds/success.wav']
})

// Play on user action
button.onclick = () => sound.play()`}</code>
              </pre>
            </motion.div>
          )}
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Lightweight</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tiny file sizes, instant playback. No bloat, just sound.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Studio Built-in</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create custom sounds with our real-time synthesis studio.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Easy Integration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Works with any framework. Just add and play.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}