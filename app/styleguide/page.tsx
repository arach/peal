'use client'

import { styles } from '@/lib/styles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Peal Style Guide</h1>
          <p className="text-gray-600 dark:text-gray-400">Consistent design system for the entire application</p>
        </div>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Typography
          </h2>
          
          <div className="grid gap-6">
            {/* Section Headers */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Section Headers</h3>
              <div className="space-y-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h1 className={styles.sectionHeader.h1}>H1: Page Title</h1>
                <h2 className={styles.sectionHeader.h2}>H2: Section Title</h2>
                <h3 className={styles.sectionHeader.h3}>H3: Subsection Title</h3>
              </div>
            </div>

            {/* Component Headers */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Component Headers</h3>
              <div className="space-y-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className={styles.componentHeader.large}>Large Component Header</p>
                <p className={styles.componentHeader.medium}>Medium Component Header</p>
                <p className={styles.componentHeader.small}>SMALL COMPONENT HEADER</p>
              </div>
            </div>

            {/* Studio Headers */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Studio Specific</h3>
              <div className="space-y-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className={styles.studio.sectionTitle}>STUDIO SECTION TITLE</h4>
                <h5 className={styles.studio.subsectionTitle}>STUDIO SUBSECTION</h5>
                <label className={styles.studio.inputLabel}>INPUT LABEL</label>
                <p className={styles.studio.monoText}>Monospace text for technical content</p>
                <p className={styles.studio.fileName}>filename.tsx</p>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Text Content</h3>
              <div className="space-y-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className={styles.text.bodyLarge}>Large body text for important content</p>
                <p className={styles.text.body}>Regular body text for general content</p>
                <p className={styles.text.bodySmall}>Small body text for less important information</p>
                <p className={styles.text.muted}>Muted text for secondary information</p>
                <p className={styles.text.mutedSmall}>Small muted text for captions</p>
                <p className={styles.text.mono}>console.log("Monospace text")</p>
                <p className={styles.text.monoSmall}>// Small monospace for code comments</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Form Elements
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Input Fields</h3>
              <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div>
                  <Label className={styles.label.default}>Default Input</Label>
                  <input className={styles.input.default} placeholder="Enter text..." />
                </div>
                <div>
                  <Label className={styles.label.default}>Monospace Input</Label>
                  <input className={styles.input.mono} placeholder="Code input..." />
                </div>
                <div>
                  <Label className={styles.label.default}>Dark Input</Label>
                  <input className={styles.input.dark} placeholder="Dark themed input..." />
                </div>
                <div>
                  <Label className={styles.label.default}>Transparent Input</Label>
                  <input className={styles.input.transparent} placeholder="Minimal input..." />
                </div>
              </div>
            </div>

            {/* Textareas */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Textareas</h3>
              <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div>
                  <Label className={styles.label.default}>Default Textarea</Label>
                  <textarea className={styles.textarea.default} rows={3} placeholder="Enter description..." />
                </div>
                <div>
                  <Label className={styles.label.default}>Monospace Textarea</Label>
                  <textarea className={styles.textarea.mono} rows={3} placeholder="// Enter code..." />
                </div>
                <div>
                  <Label className={styles.label.default}>Dark Textarea</Label>
                  <textarea className={styles.textarea.dark} rows={3} placeholder="Dark themed textarea..." />
                </div>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Labels</h3>
            <div className="space-y-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <label className={styles.label.default}>Default Label</label>
              <label className={styles.label.required}>Required Label</label>
              <label className={styles.label.small}>SMALL UPPERCASE LABEL</label>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Buttons
          </h2>
          
          <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <button className={styles.button.primary}>Primary Button</button>
            <button className={styles.button.secondary}>Secondary Button</button>
            <button className={styles.button.outline}>Outline Button</button>
            <button className={styles.button.ghost}>Ghost Button</button>
            <button className={styles.button.danger}>Danger Button</button>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Cards
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`${styles.card.default} p-4`}>
              <h3 className="font-medium mb-2">Default Card</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Standard card with border</p>
            </div>
            <div className={`${styles.card.elevated} p-4`}>
              <h3 className="font-medium mb-2">Elevated Card</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Card with shadow elevation</p>
            </div>
            <div className={`${styles.card.dark} p-4`}>
              <h3 className="font-medium mb-2 text-gray-100">Dark Card</h3>
              <p className="text-sm text-gray-400">Dark themed card with blur</p>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Badges
          </h2>
          
          <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <span className={`${styles.badge.default} ${styles.badge.success}`}>Success</span>
            <span className={`${styles.badge.default} ${styles.badge.warning}`}>Warning</span>
            <span className={`${styles.badge.default} ${styles.badge.error}`}>Error</span>
            <span className={`${styles.badge.default} ${styles.badge.info}`}>Info</span>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Color Palette
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Primary</h4>
              <div className="space-y-1">
                <div className="h-10 bg-blue-600 rounded flex items-center px-2">
                  <span className="text-white text-xs">blue-600</span>
                </div>
                <div className="h-10 bg-blue-500 rounded flex items-center px-2">
                  <span className="text-white text-xs">blue-500</span>
                </div>
                <div className="h-10 bg-blue-400 rounded flex items-center px-2">
                  <span className="text-white text-xs">blue-400</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Success</h4>
              <div className="space-y-1">
                <div className="h-10 bg-green-600 rounded flex items-center px-2">
                  <span className="text-white text-xs">green-600</span>
                </div>
                <div className="h-10 bg-green-500 rounded flex items-center px-2">
                  <span className="text-white text-xs">green-500</span>
                </div>
                <div className="h-10 bg-green-400 rounded flex items-center px-2">
                  <span className="text-white text-xs">green-400</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Warning</h4>
              <div className="space-y-1">
                <div className="h-10 bg-yellow-600 rounded flex items-center px-2">
                  <span className="text-white text-xs">yellow-600</span>
                </div>
                <div className="h-10 bg-yellow-500 rounded flex items-center px-2">
                  <span className="text-white text-xs">yellow-500</span>
                </div>
                <div className="h-10 bg-yellow-400 rounded flex items-center px-2">
                  <span className="text-black text-xs">yellow-400</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Danger</h4>
              <div className="space-y-1">
                <div className="h-10 bg-red-600 rounded flex items-center px-2">
                  <span className="text-white text-xs">red-600</span>
                </div>
                <div className="h-10 bg-red-500 rounded flex items-center px-2">
                  <span className="text-white text-xs">red-500</span>
                </div>
                <div className="h-10 bg-red-400 rounded flex items-center px-2">
                  <span className="text-white text-xs">red-400</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}