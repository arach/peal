'use client'

import { useState, useEffect } from 'react'
import { Howl } from 'howler'
import { Play, Pause, Code, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const demoSounds = [
  { name: 'Success', file: '/sounds/custom/scout-success.wav', icon: '✨' },
  { name: 'Start', file: '/sounds/custom/scout-start.wav', icon: '🚀' },
  { name: 'Stop', file: '/sounds/custom/scout-stop.wav', icon: '🛑' },
  { name: 'Error', file: '/sounds/custom/scout-error.wav', icon: '⚡' }
]

export default function LandingHero() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [currentSound, setCurrentSound] = useState<Howl | null>(null)
  const [showCode, setShowCode] = useState(false)

  const playSound = (soundFile: string, soundName: string) => {
    if (currentSound) {
      currentSound.stop()
    }

    const howl = new Howl({
      src: [soundFile],
      onend: () => {
        setPlaying(null)
        setCurrentSound(null)
      }
    })
    
    howl.play()
    setPlaying(soundName)
    setCurrentSound(howl)
  }

  const stopSound = () => {
    if (currentSound) {
      currentSound.stop()
      setPlaying(null)
      setCurrentSound(null)
    }
  }

  useEffect(() => {
    return () => {
      if (currentSound) {
        currentSound.stop()
      }
    }
  }, [currentSound])

  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
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
            No dependencies, just pure audio goodness.
          </motion.p>

          {/* Quick Demo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wide">
              Try it now
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {demoSounds.map((sound) => (
                <button
                  key={sound.name}
                  onClick={() => playing === sound.name ? stopSound() : playSound(sound.file, sound.name)}
                  className={`
                    relative group p-4 rounded-lg border-2 transition-all
                    ${playing === sound.name 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{sound.icon}</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {sound.name}
                  </div>
                  {playing === sound.name && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCode(!showCode)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 mx-auto"
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

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <a
              href="#sounds"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Zap size={20} />
              Browse Sounds
            </a>
            <a
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
            >
              <Sparkles size={20} />
              Open Studio
            </a>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
            transition={{ duration: 0.5, delay: 0.5 }}
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
            transition={{ duration: 0.5, delay: 0.6 }}
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