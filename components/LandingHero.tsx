'use client'

import { Code, Sparkles, Zap, ChevronDown, Volume2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import HeroSoundGrid from './HeroSoundGrid'
import { isStaticBuild } from '@/utils/build'
import { getPublicUrl } from '@/utils/url'

export default function LandingHero() {

  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-3 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 dark:bg-gray-800 rounded-full blur-3xl opacity-10" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl lg:text-6xl font-medium text-gray-900 dark:text-white mb-6"
          >
            Lightweight sound effects
            <br />
            <span className="text-blue-600 dark:text-blue-400">for modern apps</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6"
          >
            Beautiful, responsive UI sounds that work everywhere. 
            Elevate your brand with bespoke audio that makes your app feel futuristic.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-2 justify-center mb-4"
          >
            {isStaticBuild ? (
              <>
                <a
                  href={getPublicUrl('/docs')}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-medium rounded-xl transition-all transform hover:scale-105 touch-manipulation overflow-hidden hover:shadow-xl hover:shadow-blue-600/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Code size={20} className="relative" />
                  <span className="relative">Read the Docs</span>
                </a>
                <a
                  href={getPublicUrl('/about')}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-900 text-gray-900 dark:text-white text-base font-medium rounded-xl border border-gray-300 dark:border-gray-600 transition-all transform hover:scale-105 touch-manipulation overflow-hidden hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-gray-100/50 dark:via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <Sparkles size={20} className="relative" />
                  <span className="relative">Learn More</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href="/library"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 touch-manipulation relative overflow-hidden group"
                >
                  {/* Glass shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500">
                      <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-20deg]" />
                    </div>
                  </div>
                  <Volume2 size={20} className="relative z-10" />
                  <span className="relative z-10">Explore Library</span>
                </a>
                <a
                  href="/studio"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 active:bg-gray-300 dark:active:bg-white/20 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-white/20 backdrop-blur-sm transition-all duration-200 touch-manipulation relative overflow-hidden group"
                >
                  {/* Glass shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500">
                      <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-20deg]" />
                    </div>
                  </div>
                  <Sparkles size={20} className="relative z-10" />
                  <span className="relative z-10">Open Studio</span>
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
            <ChevronDown className="w-4 h-4 text-gray-400 animate-bounce" />
          </motion.div>
        </div>

        {/* Sound Grid Demo */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-center text-sm md:text-base font-medium text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider">
            Try our signature sounds
          </h3>
          <HeroSoundGrid />
        </motion.div>

        {/* Integration Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-2xl mx-auto overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl opacity-20" />
          <div className="relative">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Code className="text-blue-600 dark:text-blue-400" size={14} />
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Seamless integration
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-950 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                {/* Terminal command */}
                <div className="bg-gray-900 dark:bg-black px-4 py-3 border-b border-gray-800 font-mono">
                  <code className="font-mono text-xs block">
                    <span className="text-gray-500">&gt;</span> <span className="text-purple-400">npx peal</span> <span className="text-gray-100">add success notification error</span>
                  </code>
                </div>
                {/* Terminal output */}
                <div className="px-4 py-3 font-mono">
                  <code className="font-mono text-xs text-gray-300 block">
                    <div className="text-gray-400">🎧 Added 3 sounds:</div>
                    <div className="mt-1 space-y-0.5 ml-2">
                      <div><span className="text-green-400">✓</span> success</div>
                      <div><span className="text-green-400">✓</span> notification</div>
                      <div><span className="text-green-400">✓</span> error</div>
                    </div>
                  </code>
                </div>
              </div>
              
              <pre className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-xs text-left overflow-x-auto font-mono">
                <code className="font-mono block">
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
                Professional UI sounds with a{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  lightweight library that just works.
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-3 mt-8 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="group relative h-full"
          >
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-b from-gray-200/30 to-transparent dark:from-gray-700/30 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200/50 dark:border-gray-800/50 h-full">
              <div className="flex items-start space-x-2 h-full">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">Drop-in ready</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-[1.5]">
                    Single file. No build step. Works everywhere.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="group relative h-full"
          >
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-b from-gray-200/30 to-transparent dark:from-gray-700/30 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200/50 dark:border-gray-800/50 h-full">
              <div className="flex items-start space-x-2 h-full">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">Brand-tailored</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-[1.5]">
                    Fine-tune every parameter to match your aesthetic.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="group relative h-full"
          >
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-b from-gray-200/30 to-transparent dark:from-gray-700/30 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200/50 dark:border-gray-800/50 h-full">
              <div className="flex items-start space-x-2 h-full">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 flex items-center justify-center flex-shrink-0">
                  <Code className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">Native performance</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-[1.5]">
                    Pure Web Audio API. Zero dependencies.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="relative mt-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-cyan-600/10 rounded-2xl" />
          <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
              Ready to ship better audio?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
              Join developers building the next generation of interface design with thoughtful sound.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {isStaticBuild ? (
                <>
                  <a
                    href={getPublicUrl('/docs')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 active:bg-gray-700 dark:active:bg-gray-200 text-white dark:text-gray-900 font-medium rounded-lg text-sm transition-colors touch-manipulation"
                  >
                    Get Started
                    <ArrowRight size={16} />
                  </a>
                  <a
                    href={getPublicUrl('/about')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm border border-gray-300 dark:border-gray-600 transition-colors touch-manipulation"
                  >
                    <Code size={16} />
                    View Examples
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/library"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 active:bg-gray-700 dark:active:bg-gray-200 text-white dark:text-gray-900 font-medium rounded-lg text-sm transition-colors touch-manipulation"
                  >
                    Browse Library
                    <ArrowRight size={16} />
                  </a>
                  <a
                    href="/studio"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm border border-gray-300 dark:border-gray-600 transition-colors touch-manipulation"
                  >
                    <Sparkles size={16} />
                    Open Studio
                  </a>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}