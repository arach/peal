'use client'

import { Code, Sparkles, Zap, ChevronDown, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'
import HeroSoundGrid from './HeroSoundGrid'
import { isStaticBuild } from '@/utils/build'

export default function LandingHero() {

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
            {isStaticBuild ? (
              <>
                <a
                  href="/docs"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition-colors touch-manipulation"
                >
                  <Code size={20} />
                  Read the Docs
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-900 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors touch-manipulation"
                >
                  <Sparkles size={20} />
                  Learn More
                </a>
              </>
            ) : (
              <>
                <a
                  href="/library"
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
              </>
            )}
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
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl" />
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Code className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Seamless integration
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                {/* Terminal command */}
                <div className="bg-gray-900 dark:bg-black p-3 border-b border-gray-800">
                  <code className="font-mono text-xs">
                    <span className="text-gray-500">&gt;</span> <span className="text-purple-400">npx peal</span> <span className="text-gray-100">add success notification error</span>
                  </code>
                </div>
                {/* Terminal output */}
                <div className="p-3">
                  <code className="font-mono text-xs text-gray-300">
                    <div className="text-gray-400">🎧 Added 3 sounds:</div>
                    <div className="mt-1 space-y-0.5 ml-2">
                      <div><span className="text-green-400">✓</span> success</div>
                      <div><span className="text-green-400">✓</span> notification</div>
                      <div><span className="text-green-400">✓</span> error</div>
                    </div>
                  </code>
                </div>
              </div>
              
              <pre className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3 rounded-lg text-xs text-left overflow-x-auto">
                <code className="font-mono">
                  <span className="text-gray-500 dark:text-gray-400">{`// Use in your app`}</span>
                  {'\n'}
                  <span className="text-blue-600 dark:text-blue-400">import</span> {'{ '}<span className="text-orange-600 dark:text-orange-400">play</span>, <span className="text-orange-600 dark:text-orange-400">pause</span>, <span className="text-orange-600 dark:text-orange-400">stop</span>{' }'} <span className="text-blue-600 dark:text-blue-400">from</span> <span className="text-green-600 dark:text-green-400">'@/peal'</span>
                  {'\n\n'}
                  <span className="text-gray-500 dark:text-gray-400">{`// Play sounds with built-in volume control`}</span>
                  {'\n'}<span className="text-orange-600 dark:text-orange-400">play</span>(<span className="text-green-600 dark:text-green-400">'success'</span>)             
                  {'\n'}<span className="text-orange-600 dark:text-orange-400">play</span>(<span className="text-green-600 dark:text-green-400">'notification'</span>, <span className="text-green-600 dark:text-green-400">'loud'</span>)  
                  {'\n'}<span className="text-orange-600 dark:text-orange-400">play</span>(<span className="text-green-600 dark:text-green-400">'error'</span>, <span className="text-green-600 dark:text-green-400">'quiet'</span>)    
                  {'\n\n'}
                  <span className="text-gray-500 dark:text-gray-400">{`// Or use namespaced if you need 'play' elsewhere`}</span>
                  {'\n'}<span className="text-blue-600 dark:text-blue-400">import</span> <span className="text-orange-600 dark:text-orange-400">peal</span> <span className="text-blue-600 dark:text-blue-400">from</span> <span className="text-green-600 dark:text-green-400">'@/peal'</span>
                  {'\n'}<span className="text-orange-600 dark:text-orange-400">peal</span>.<span className="text-blue-600 dark:text-blue-400">play</span>(<span className="text-green-600 dark:text-green-400">'success'</span>)
                </code>
              </pre>
              
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Copy individual sounds or generate custom ones.{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  No npm packages, no dependencies.
                </span>
              </p>
            </div>
          </div>
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Copy & Paste</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No packages to install. Just copy the code you need.
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Customizable</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tweak any sound to match your brand perfectly.
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Zero Dependencies</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pure Web Audio API. Works everywhere, owns nothing.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}