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
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {sound.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setTab('preview')}
              className={`px-6 py-3 font-medium transition-colors ${
                tab === 'preview'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setTab('code')}
              className={`px-6 py-3 font-medium transition-colors ${
                tab === 'code'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Code
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {tab === 'preview' ? (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-8 text-center">
                  <button
                    onClick={() => {
                      const playFunction = new Function('return ' + code)()
                      playFunction()
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Play Sound
                  </button>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Click to preview how this sound will work in your app
                  </p>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <h3>About this sound</h3>
                  <p>
                    This is a lightweight, dependency-free implementation using the Web Audio API.
                    The code is optimized for performance and works in all modern browsers.
                  </p>
                  <h3>Features</h3>
                  <ul>
                    <li>Zero dependencies</li>
                    <li>Tiny footprint (~1KB)</li>
                    <li>Customizable volume</li>
                    <li>Works offline</li>
                    <li>TypeScript ready</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Copy this code into your project
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={16} className="text-green-600" />
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
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>

                <pre className="bg-gray-950 text-gray-100 p-6 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono">{code}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Customize this sound in the{' '}
              <a href="/studio" className="text-blue-600 dark:text-blue-400 hover:underline">
                Studio
              </a>{' '}
              or browse more in the{' '}
              <a href="/library" className="text-blue-600 dark:text-blue-400 hover:underline">
                Library
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}