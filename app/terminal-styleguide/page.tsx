'use client'

import { terminalStyles as ts, cx } from '@/lib/terminal-styles'

export default function TerminalStyleGuidePage() {
  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 font-mono">
      {/* Grid background effect */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-12">
        {/* Header with scanline effect */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent animate-scan pointer-events-none" />
          <div className="border border-gray-800 p-6 bg-gray-950/80 backdrop-blur-sm">
            <h1 className="text-3xl font-light tracking-tight text-gray-100 mb-2">PEAL // TERMINAL INTERFACE</h1>
            <p className={ts.typography.bodyMono}>Defense-grade audio synthesis platform</p>
            <div className="flex items-center gap-2 mt-4">
              <span className={ts.components.status.online} />
              <span className={ts.typography.bodySmallMono}>SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>TYPOGRAPHY SYSTEM</h2>
          
          <div className={ts.components.card.default + ' p-6 space-y-4'}>
            <div className="space-y-2 border-b border-gray-900 pb-4">
              <h1 className={ts.typography.h1 + ' group relative'}>
                H1: Primary Header
                <span className="absolute left-0 -bottom-6 text-[10px] text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  text-2xl font-light tracking-tight
                </span>
              </h1>
              <h2 className={ts.typography.h2 + ' group relative'}>
                H2: Section Header
                <span className="absolute left-0 -bottom-6 text-[10px] text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  text-xl font-light tracking-tight
                </span>
              </h2>
              <h3 className={ts.typography.h3 + ' group relative'}>
                H3: Subsection Header
                <span className="absolute left-0 -bottom-6 text-[10px] text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  text-lg font-normal
                </span>
              </h3>
              <h4 className={ts.typography.h4 + ' group relative'}>
                H4: Component Header
                <span className="absolute left-0 -bottom-6 text-[10px] text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  text-base font-normal
                </span>
              </h4>
            </div>
            
            <div className="space-y-2 border-b border-gray-900 pb-4">
              <p className={ts.typography.sectionTitle}>SECTION TITLE</p>
              <p className={ts.typography.subsectionTitle}>SUBSECTION TITLE</p>
              <label className={ts.typography.label}>INPUT LABEL</label>
              <label className={ts.typography.labelRequired}>REQUIRED FIELD</label>
            </div>
            
            <div className="space-y-2">
              <p className={ts.typography.body}>Standard body text for general content</p>
              <p className={ts.typography.bodyMono}>Monospace body text for technical content</p>
              <p className={ts.typography.bodySmall}>Small text for secondary information</p>
              <p className={ts.typography.bodySmallMono}>Small monospace for metadata</p>
              <code className={ts.typography.code}>inline.code()</code>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>COLOR PROTOCOL</h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Grayscale */}
            <div className={ts.components.card.default + ' p-6'}>
              <h3 className={ts.typography.subsectionTitle}>GRAYSCALE FOUNDATION</h3>
              <div className="grid grid-cols-5 gap-1 mt-4">
                <div className="h-16 bg-gray-950 border border-gray-800 flex items-center justify-center">
                  <span className="text-[10px] text-gray-500">950</span>
                </div>
                <div className="h-16 bg-gray-900 border border-gray-800 flex items-center justify-center">
                  <span className="text-[10px] text-gray-500">900</span>
                </div>
                <div className="h-16 bg-gray-800 border border-gray-700 flex items-center justify-center">
                  <span className="text-[10px] text-gray-400">800</span>
                </div>
                <div className="h-16 bg-gray-700 border border-gray-600 flex items-center justify-center">
                  <span className="text-[10px] text-gray-300">700</span>
                </div>
                <div className="h-16 bg-gray-600 border border-gray-500 flex items-center justify-center">
                  <span className="text-[10px] text-gray-200">600</span>
                </div>
              </div>
            </div>
            
            {/* Accent Colors */}
            <div className={ts.components.card.default + ' p-6'}>
              <h3 className={ts.typography.subsectionTitle}>CRITICAL STATE INDICATORS</h3>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-sky-500/20 border border-sky-500/50 rounded-sm" />
                  <span className="text-xs text-sky-500">PRIMARY ACTION</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-emerald-500/20 border border-emerald-500/50 rounded-sm" />
                  <span className="text-xs text-emerald-500">SUCCESS STATE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-amber-500/20 border border-amber-500/50 rounded-sm" />
                  <span className="text-xs text-amber-500">WARNING STATE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-red-500/20 border border-red-500/50 rounded-sm" />
                  <span className="text-xs text-red-500">ERROR STATE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>COMPONENT LIBRARY</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className={ts.components.card.default + ' p-6 space-y-4'}>
              <h3 className={ts.typography.subsectionTitle}>INPUT FIELDS</h3>
              
              <div>
                <label className={ts.typography.label}>DEFAULT INPUT</label>
                <input className={ts.components.input.default} placeholder="Enter command..." />
              </div>
              
              <div>
                <label className={ts.typography.label}>ACTIVE INPUT</label>
                <input className={ts.components.input.active} placeholder="Active state..." />
              </div>
              
              <div>
                <label className={ts.typography.label}>ERROR INPUT</label>
                <input className={ts.components.input.error} placeholder="Error state..." />
              </div>
              
              <div>
                <label className={ts.typography.label}>MINIMAL INPUT</label>
                <input className={ts.components.input.minimal} placeholder="Minimal style..." />
              </div>
            </div>
            
            {/* Buttons */}
            <div className={ts.components.card.default + ' p-6 space-y-4'}>
              <h3 className={ts.typography.subsectionTitle}>ACTION BUTTONS</h3>
              
              <div className="space-y-3">
                <button className={ts.components.button.primary}>EXECUTE</button>
                <button className={ts.components.button.secondary}>CONFIGURE</button>
                <button className={ts.components.button.ghost}>CANCEL</button>
                <button className={ts.components.button.danger}>TERMINATE</button>
                <button className={ts.components.button.success}>CONFIRM</button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>CONTAINER TYPES</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className={cx(ts.components.card.default, 'p-4')}>
              <h3 className={ts.typography.subsectionTitle}>DEFAULT CARD</h3>
              <p className={ts.typography.bodySmallMono}>Standard container with border</p>
            </div>
            
            <div className={cx(ts.components.card.elevated, 'p-4')}>
              <h3 className={ts.typography.subsectionTitle}>ELEVATED CARD</h3>
              <p className={ts.typography.bodySmallMono}>Enhanced depth with shadow</p>
            </div>
            
            <div className={cx(ts.components.card.glass, 'p-4')}>
              <h3 className={ts.typography.subsectionTitle}>GLASS CARD</h3>
              <p className={ts.typography.bodySmallMono}>Transparent with backdrop blur</p>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>STATUS BADGES</h2>
          
          <div className={cx(ts.components.card.default, 'p-6')}>
            <div className="flex flex-wrap gap-3">
              <span className={cx(ts.components.badge.default, ts.components.badge.neutral)}>NEUTRAL</span>
              <span className={cx(ts.components.badge.default, ts.components.badge.primary)}>PRIMARY</span>
              <span className={cx(ts.components.badge.default, ts.components.badge.success)}>SUCCESS</span>
              <span className={cx(ts.components.badge.default, ts.components.badge.warning)}>WARNING</span>
              <span className={cx(ts.components.badge.default, ts.components.badge.error)}>ERROR</span>
            </div>
          </div>
        </section>

        {/* Data Table */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>DATA VISUALIZATION</h2>
          
          <div className={ts.components.card.default}>
            <table className="w-full">
              <thead>
                <tr className={ts.components.table.header}>
                  <th className="text-left px-3 py-2">ID</th>
                  <th className="text-left px-3 py-2">SIGNAL</th>
                  <th className="text-left px-3 py-2">FREQUENCY</th>
                  <th className="text-left px-3 py-2">STATUS</th>
                  <th className="text-left px-3 py-2">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr className={ts.components.table.row}>
                  <td className={ts.components.table.cell}>001</td>
                  <td className={ts.components.table.cell}>ALPHA</td>
                  <td className={ts.components.table.cell}>440Hz</td>
                  <td className={ts.components.table.cell}>
                    <div className="flex items-center gap-2">
                      <span className={ts.components.status.online} />
                      <span className="text-emerald-500">ACTIVE</span>
                    </div>
                  </td>
                  <td className={ts.components.table.cell}>
                    <button className="text-sky-500 hover:text-sky-400 text-xs">MODIFY</button>
                  </td>
                </tr>
                <tr className={ts.components.table.row}>
                  <td className={ts.components.table.cell}>002</td>
                  <td className={ts.components.table.cell}>BETA</td>
                  <td className={ts.components.table.cell}>880Hz</td>
                  <td className={ts.components.table.cell}>
                    <div className="flex items-center gap-2">
                      <span className={ts.components.status.warning} />
                      <span className="text-amber-500">PENDING</span>
                    </div>
                  </td>
                  <td className={ts.components.table.cell}>
                    <button className="text-sky-500 hover:text-sky-400 text-xs">MODIFY</button>
                  </td>
                </tr>
                <tr className={ts.components.table.row}>
                  <td className={ts.components.table.cell}>003</td>
                  <td className={ts.components.table.cell}>GAMMA</td>
                  <td className={ts.components.table.cell}>220Hz</td>
                  <td className={ts.components.table.cell}>
                    <div className="flex items-center gap-2">
                      <span className={ts.components.status.offline} />
                      <span className="text-gray-500">OFFLINE</span>
                    </div>
                  </td>
                  <td className={ts.components.table.cell}>
                    <button className="text-sky-500 hover:text-sky-400 text-xs">MODIFY</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Special Effects */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>VISUAL EFFECTS</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className={cx(ts.components.card.default, 'p-6 text-center')}>
              <button className={cx(ts.components.button.primary, ts.effects.glowPrimary)}>
                GLOW EFFECT
              </button>
            </div>
            
            <div className={cx(ts.components.card.default, 'p-6 text-center relative overflow-hidden')}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent animate-scan pointer-events-none" />
              <p className={ts.typography.bodyMono}>SCANLINE ANIMATION</p>
            </div>
            
            <div className={cx(ts.components.card.default, ts.effects.grid, 'p-6 text-center')}>
              <p className={ts.typography.bodyMono}>GRID BACKGROUND</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-800 pt-6 pb-12">
          <p className={ts.typography.bodySmallMono}>
            PEAL AUDIO SYNTHESIS PLATFORM // VERSION 2.0.0 // CLASSIFIED
          </p>
        </div>
      </div>
    </div>
  )
}