'use client'

import { useState } from 'react'
import { X, Copy, Check, Download, Code2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SoundCodeModalProps {
  sound: {
    id: string
    name: string
    type: string
    preview?: string
  }
  onClose: () => void
}

export default function SoundCodeModal({ sound, onClose }: SoundCodeModalProps) {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'preview' | 'code'>('preview')

  const generateSoundCode = () => {
    // Generate code based on sound type
    const codeTemplates: Record<string, string> = {
      click: `// ${sound.name}
// A crisp, responsive click sound for buttons and interactions

export function play${sound.name.replace(/\s+/g, '')}(volume = 0.5) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  // Create oscillator for the click
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  // Click characteristics
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.01)
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}`,
      
      notification: `// ${sound.name}
// A pleasant notification sound that grabs attention without being jarring

export function play${sound.name.replace(/\s+/g, '')}(volume = 0.4) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  // Create two oscillators for a richer sound
  const osc1 = audioContext.createOscillator()
  const osc2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  osc1.connect(gainNode)
  osc2.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  // Notification melody
  osc1.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
  osc2.frequency.setValueAtTime(659.25, audioContext.currentTime) // E5
  
  osc1.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
  osc2.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.1) // G5
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
  
  osc1.start(audioContext.currentTime)
  osc2.start(audioContext.currentTime)
  osc1.stop(audioContext.currentTime + 0.4)
  osc2.stop(audioContext.currentTime + 0.4)
}`,

      success: `// ${sound.name}
// An uplifting success sound for completed actions

export function play${sound.name.replace(/\s+/g, '')}(volume = 0.3) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    
    osc.connect(gain)
    gain.connect(audioContext.destination)
    
    osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1)
    
    gain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1)
    gain.gain.linearRampToValueAtTime(volume * (1 - i * 0.2), audioContext.currentTime + i * 0.1 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3)
    
    osc.start(audioContext.currentTime + i * 0.1)
    osc.stop(audioContext.currentTime + i * 0.1 + 0.3)
  })
}`,

      error: `// ${sound.name}
// A subtle error sound that indicates something went wrong

export function play${sound.name.replace(/\s+/g, '')}(volume = 0.4) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  // Low frequency buzz
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()
  
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)
  
  // Error sound characteristics
  osc.frequency.setValueAtTime(150, audioContext.currentTime)
  osc.type = 'sawtooth'
  
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(400, audioContext.currentTime)
  filter.Q.setValueAtTime(10, audioContext.currentTime)
  
  gain.gain.setValueAtTime(volume, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
  
  osc.start(audioContext.currentTime)
  osc.stop(audioContext.currentTime + 0.2)
}`
    }

    return codeTemplates[sound.type] || codeTemplates.click
  }

  const code = generateSoundCode()

  // Syntax highlighting function
  const highlightJavaScript = (code: string) => {
    // Dark terminal-friendly color scheme
    const TOKEN_TYPES = {
      STRING: 'text-emerald-400',      // Bright green for strings
      KEYWORD: 'text-sky-400',         // Bright blue for keywords
      BOOLEAN: 'text-violet-400',      // Purple for booleans
      NUMBER: 'text-amber-400',        // Gold for numbers
      FUNCTION: 'text-yellow-300',     // Bright yellow for functions
      PROPERTY: 'text-orange-400',     // Orange for properties
      COMMENT: 'text-gray-500',        // Muted gray for comments
      EXPORT: 'text-rose-400',         // Rose for export statements
      VARIABLE: 'text-cyan-300',       // Cyan for variables
      OBJECT: 'text-indigo-300',       // Light indigo for objects
      PUNCTUATION: 'text-gray-300'     // Light gray for all punctuation
    }
    
    const decodeHtml = (str: string) => {
      return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
    }
    
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }
    
    const cleanCode = decodeHtml(code)
    const tokens: Array<{type: string, value: string}> = []
    let remaining = cleanCode
    
    while (remaining.length > 0) {
      let matched = false
      
      // Check for comments first
      if (remaining.match(/^\/\/.*/)) {
        const match = remaining.match(/^\/\/.*/)![0]
        tokens.push({ type: 'COMMENT', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for strings
      else if (remaining.match(/^(['"`])(?:[^\\]|\\.)*?\1/)) {
        const match = remaining.match(/^(['"`])(?:[^\\]|\\.)*?\1/)![0]
        tokens.push({ type: 'STRING', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for punctuation (parentheses, brackets, braces, operators)
      else if (remaining.match(/^[(){}[\];,.=+\-*/<>!&|:]/)) {
        const match = remaining.match(/^[(){}[\];,.=+\-*/<>!&|:]/)![0]
        tokens.push({ type: 'PUNCTUATION', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for export keyword
      else if (remaining.match(/^export\b/)) {
        const match = remaining.match(/^export\b/)![0]
        tokens.push({ type: 'EXPORT', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for keywords
      else if (remaining.match(/^(import|from|const|let|var|function|async|await|try|catch|throw|if|else|return|new|default|class|extends|constructor|static)\b/)) {
        const match = remaining.match(/^(import|from|const|let|var|function|async|await|try|catch|throw|if|else|return|new|default|class|extends|constructor|static)\b/)![0]
        tokens.push({ type: 'KEYWORD', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for boolean/null
      else if (remaining.match(/^(true|false|null|undefined)\b/)) {
        const match = remaining.match(/^(true|false|null|undefined)\b/)![0]
        tokens.push({ type: 'BOOLEAN', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for numbers
      else if (remaining.match(/^\d+(?:\.\d+)?/)) {
        const match = remaining.match(/^\d+(?:\.\d+)?/)![0]
        tokens.push({ type: 'NUMBER', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for function calls
      else if (remaining.match(/^[a-zA-Z_$][\w$]*(?=\s*\()/)) {
        const match = remaining.match(/^[a-zA-Z_$][\w$]*/)![0]
        tokens.push({ type: 'FUNCTION', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for method calls on objects
      else if (remaining.match(/^\.[a-zA-Z_$][\w$]*(?=\s*\()/)) {
        const match = remaining.match(/^\.[a-zA-Z_$][\w$]*/)![0]
        tokens.push({ type: 'FUNCTION', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for property access
      else if (remaining.match(/^\.[a-zA-Z_$][\w$]*/)) {
        const match = remaining.match(/^\.[a-zA-Z_$][\w$]*/)![0]
        tokens.push({ type: 'PROPERTY', value: match })
        remaining = remaining.slice(match.length)
        matched = true
      }
      // Check for identifiers (including variables like 'freq', 'i', etc.)
      else if (remaining.match(/^[a-zA-Z_$][\w$]*/)) {
        const match = remaining.match(/^[a-zA-Z_$][\w$]*/)![0]
        // Check if it's followed by a dot (likely an object)
        if (remaining.slice(match.length).match(/^\s*\./)) {
          tokens.push({ type: 'OBJECT', value: match })
        } else {
          tokens.push({ type: 'VARIABLE', value: match })
        }
        remaining = remaining.slice(match.length)
        matched = true
      }
      
      if (!matched) {
        tokens.push({ type: 'PLAIN', value: remaining[0] })
        remaining = remaining.slice(1)
      }
    }
    
    return tokens.map(token => {
      const escaped = escapeHtml(token.value)
      if (token.type === 'PLAIN') {
        return escaped
      }
      const className = TOKEN_TYPES[token.type as keyof typeof TOKEN_TYPES]
      return className ? `<span class="${className}">${escaped}</span>` : escaped
    }).join('')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadFile = () => {
    const blob = new Blob([code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sound.id}.js`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sound.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {sound.type} sound
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <button
              onClick={() => setTab('preview')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                tab === 'preview'
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Preview
              {tab === 'preview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setTab('code')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                tab === 'code'
                  ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Code
              {tab === 'code' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {tab === 'preview' ? (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 text-center border border-blue-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      // Extract just the function body without export statement
                      const functionBody = code.replace(/export function play\w+\([^)]*\)\s*{/, '').replace(/}$/, '')
                      try {
                        const playFunction = new Function('volume', functionBody)
                        playFunction(0.3)
                      } catch (error) {
                        console.error('Error playing sound:', error)
                      }
                    }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Play Sound
                  </button>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Click to preview how this sound will work in your app
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About this sound</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      This is a lightweight, dependency-free implementation using the Web Audio API.
                      The code is optimized for performance and works in all modern browsers.
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
                    <div className="space-y-2">
                      {['Zero dependencies', 'Tiny footprint (~1KB)', 'Customizable volume', 'Works offline', 'TypeScript ready'].map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Implementation Code</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Copy this code into your project
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadFile}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                  <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">{sound.id}.js</span>
                    </div>
                  </div>
                  <pre className="p-6 overflow-x-auto">
                    <code 
                      className="text-xs font-mono leading-5"
                      dangerouslySetInnerHTML={{ __html: highlightJavaScript(code) }}
                    />
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center justify-center gap-6 text-sm">
              <a 
                href={`/studio?sound=${sound.id}&type=${sound.type}`} 
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Customize in Studio
              </a>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <a 
                href="/library" 
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Browse Library
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}