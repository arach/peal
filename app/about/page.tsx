import Link from 'next/link'
import { Github, Mail, ExternalLink } from 'lucide-react'
import { isStaticBuild } from '@/utils/build'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About Peal</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Peal is a lightweight sound effect library designed for modern web and desktop applications. 
            We believe great user experiences deserve great audio feedback.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
            Why Peal?
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• <strong>Lightweight:</strong> Tiny file sizes that won't bloat your app</li>
            <li>• <strong>Cross-platform:</strong> Works everywhere Howler.js works</li>
            <li>• <strong>Customizable:</strong> Built-in studio for creating your own sounds</li>
            <li>• <strong>No dependencies:</strong> Just add the sounds you need</li>
          </ul>

          {!isStaticBuild && (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
                How to Use
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
                <pre className="text-sm overflow-x-auto">
                  <code className="language-javascript">{`// Install Howler.js
npm install howler

// Use Peal sounds
import { Howl } from 'howler'

const sound = new Howl({
  src: ['/sounds/success.wav']
})

sound.play()`}</code>
                </pre>
              </div>
            </>
          )}

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
            Sound Categories
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">UI Sounds</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Clicks, toggles, notifications, and feedback sounds for user interfaces.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ambient</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Background sounds and atmospheric audio for immersive experiences.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Game</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Power-ups, achievements, and action sounds for games.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Custom</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Use our Studio to create sounds tailored to your brand.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
            Made with Peal
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Want to showcase your project? Let us know!
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Badge for your project:</strong> Feel free to use "Audio by Peal" in your credits!
            </p>
          </div>

          {!isStaticBuild && (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-12 mb-4">
                Contact
              </h2>
              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  <Github size={20} />
                  GitHub
                </a>
                <a
                  href="mailto:hello@peal.app"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail size={20} />
                  Email
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}