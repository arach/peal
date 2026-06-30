import Link from 'next/link'
import { Mail, ExternalLink } from 'lucide-react'
import { isStaticBuild } from '@/utils/build'
import Header from '@/components/Header'

export default function AboutPage() {
  return (
    <>
      <Header variant="minimal" />
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
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
    </>
  )
}