'use client'

import { useState } from 'react'
import { terminalStyles as ts, cx } from '@/lib/terminal-styles'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

interface FontSpec {
  name: string
  family: string
  size: string
  weight: string
  tracking?: string
  extras?: string
}

export default function TerminalStyleGuidePage() {
  const [hoveredSpec, setHoveredSpec] = useState<FontSpec | null>(null)
  const [pinnedSpecs, setPinnedSpecs] = useState<FontSpec[]>([])
  const { toast } = useToast()

  const handleClick = (spec: FontSpec) => {
    const existingIndex = pinnedSpecs.findIndex(s => s.name === spec.name)
    if (existingIndex > -1) {
      // Remove if already pinned
      setPinnedSpecs(pinnedSpecs.filter((_, i) => i !== existingIndex))
    } else {
      // Add to pinned stack (max 3)
      if (pinnedSpecs.length >= 3) {
        setPinnedSpecs([...pinnedSpecs.slice(1), spec])
      } else {
        setPinnedSpecs([...pinnedSpecs, spec])
      }
    }
  }

  const handleButtonClick = (variant: string, action: string) => {
    toast({
      title: `${action.toUpperCase()} INITIATED`,
      description: `${variant} action has been triggered successfully`,
      className: 'bg-gray-900 border-gray-700 text-gray-100 font-mono',
    })
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 font-mono relative">
      {/* Grid background effect */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      {/* Fixed Font Spec Display - In right margin */}
      <div className="fixed top-[35%] right-8 transform -translate-y-1/2 z-50 xl:right-[calc((100vw-1280px)/2-320px)] space-y-3">
        {/* Pinned Specs Stack */}
        {pinnedSpecs.length > 0 && (
          <div className="space-y-2">
            <h4 className={ts.typography.subsectionTitle + ' text-amber-500'}>PINNED STYLES</h4>
            {pinnedSpecs.map((spec, index) => (
              <div 
                key={spec.name}
                className={cx(
                  ts.components.card.default,
                  'p-3 w-[280px] border-amber-500/30 cursor-pointer hover:border-amber-500/50 transition-all'
                )}
                onClick={() => handleClick(spec)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-amber-400 font-medium flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                    {spec.name}
                  </span>
                  <button 
                    className="text-[10px] text-gray-600 hover:text-gray-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPinnedSpecs(pinnedSpecs.filter((_, i) => i !== index))
                    }}
                  >
                    REMOVE
                  </button>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Family</span>
                    <span className="text-gray-400">{spec.family}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size</span>
                    <span className="text-gray-400">{spec.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight</span>
                    <span className="text-gray-400">{spec.weight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Active Hover Spec */}
        <div className={cx(
          ts.components.card.elevated,
          'p-4 w-[280px] transition-all duration-300',
          hoveredSpec ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
        )}>
          <h4 className={ts.typography.subsectionTitle + ' mb-3'}>ACTIVE PREVIEW</h4>
          {hoveredSpec && (
            <div className="space-y-2">
              <p className="text-xs text-sky-400 font-medium mb-2">{hoveredSpec.name}</p>
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-500 uppercase">Family</span>
                <span className="text-[11px] text-sky-400">{hoveredSpec.family}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-500 uppercase">Size</span>
                <span className="text-[11px] text-sky-400">{hoveredSpec.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-500 uppercase">Weight</span>
                <span className="text-[11px] text-sky-400">{hoveredSpec.weight}</span>
              </div>
              {hoveredSpec.tracking && (
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-500 uppercase">Tracking</span>
                  <span className="text-[11px] text-sky-400">{hoveredSpec.tracking}</span>
                </div>
              )}
              {hoveredSpec.extras && (
                <div className="pt-2 border-t border-gray-800">
                  <span className="text-[10px] text-amber-500">{hoveredSpec.extras}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-800">
                <span className="text-[10px] text-gray-600">Click to pin (max 3)</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
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
          
          <div className={ts.components.card.default + ' p-6'}>
            {/* Headers Section */}
            <div className="border-b border-gray-900 pb-6 mb-6">
              <h3 className={ts.typography.subsectionTitle + ' mb-4'}>HEADERS</h3>
              <div className="space-y-4">
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredSpec({
                    name: 'H1: Primary Header',
                    family: 'Inter',
                    size: '32px / 40px',
                    weight: 'Light (300)',
                    tracking: '-0.025em'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                  onClick={() => handleClick({
                    name: 'H1: Primary Header',
                    family: 'Inter',
                    size: '32px / 40px',
                    weight: 'Light (300)',
                    tracking: '-0.025em'
                  })}
                >
                  <h1 className={ts.typography.h1}>H1: Primary Header</h1>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Inter',
                    size: '20px / 28px',
                    weight: 'Light (300)',
                    tracking: '-0.025em'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <h2 className={ts.typography.h2}>H2: Section Header</h2>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Inter',
                    size: '18px / 26px',
                    weight: 'Regular (400)',
                    tracking: 'Normal'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <h3 className={ts.typography.h3}>H3: Subsection Header</h3>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Inter',
                    size: '16px / 24px',
                    weight: 'Regular (400)',
                    tracking: 'Normal'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <h4 className={ts.typography.h4}>H4: Component Header</h4>
                </div>
              </div>
            </div>
            
            {/* Titles & Labels Section */}
            <div className="border-b border-gray-900 pb-6 mb-6">
              <h3 className={ts.typography.subsectionTitle + ' mb-4'}>TITLES & LABELS</h3>
              <div className="space-y-3">
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Monospace',
                    size: '11px / 16px',
                    weight: 'Medium (500)',
                    tracking: '0.1em',
                    extras: 'Uppercase'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <p className={ts.typography.sectionTitle}>SECTION TITLE</p>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Monospace',
                    size: '10px / 16px',
                    weight: 'Regular (400)',
                    tracking: '0.15em',
                    extras: 'Uppercase'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <p className={ts.typography.subsectionTitle}>SUBSECTION TITLE</p>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Monospace',
                    size: '12px / 18px',
                    weight: 'Regular (400)',
                    tracking: '0.05em',
                    extras: 'Uppercase'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <label className={ts.typography.label}>INPUT LABEL</label>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Monospace',
                    size: '12px / 18px',
                    weight: 'Regular (400)',
                    tracking: '0.05em',
                    extras: 'Uppercase + Required Asterisk'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <label className={ts.typography.labelRequired}>REQUIRED FIELD</label>
                </div>
              </div>
            </div>
            
            {/* Body Text Section */}
            <div>
              <h3 className={ts.typography.subsectionTitle + ' mb-4'}>BODY TEXT</h3>
              <div className="space-y-3">
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Inter',
                    size: '14px / 20px',
                    weight: 'Light (300)',
                    tracking: 'Normal'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <p className={ts.typography.body}>Standard body text for general content</p>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Monospace',
                    size: '14px / 20px',
                    weight: 'Regular (400)',
                    tracking: 'Normal'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <p className={ts.typography.bodyMono}>Monospace body text for technical content</p>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Inter',
                    size: '12px / 18px',
                    weight: 'Regular (400)',
                    tracking: 'Normal'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <p className={ts.typography.bodySmall}>Small text for secondary information</p>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Monospace',
                    size: '12px / 18px',
                    weight: 'Regular (400)',
                    tracking: 'Normal'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <p className={ts.typography.bodySmallMono}>Small monospace for metadata</p>
                </div>
                <div 
                  className="py-2 hover:bg-gray-900/30 -mx-2 px-2 rounded transition-colors cursor-default"
                  onMouseEnter={() => setHoveredSpec({
                    family: 'Monospace',
                    size: '14px / 20px',
                    weight: 'Regular (400)',
                    extras: 'Background + Padding + Border Radius'
                  })}
                  onMouseLeave={() => setHoveredSpec(null)}
                >
                  <div>
                    <code className={ts.typography.code}>inline.code()</code>
                  </div>
                </div>
              </div>
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
            <div className={ts.components.card.default + ' p-6 space-y-6'}>
              <h3 className={ts.typography.subsectionTitle}>ACTION BUTTONS</h3>
              
              {/* Button States Demo */}
              <div className="space-y-6">
                {/* Interactive States */}
                <div className="space-y-3">
                  <p className={ts.typography.label}>INTERACTIVE STATES</p>
                  <p className="text-[11px] text-gray-500 mb-3">Hover and click buttons to see state transitions</p>
                  <div className="flex items-start gap-3">
                    <Button variant="default">DEFAULT</Button>
                    <Button variant="default" disabled>DISABLED</Button>
                  </div>
                </div>

                {/* Button Variants */}
                <div className="space-y-3 pt-4 border-t border-gray-900">
                  <p className={ts.typography.label}>BUTTON VARIANTS</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => handleButtonClick('Primary', 'Execute')}
                      >
                        EXECUTE
                      </Button>
                      <p className="text-[10px] text-gray-500">Primary action - High emphasis</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => handleButtonClick('Secondary', 'Configure')}
                      >
                        CONFIGURE
                      </Button>
                      <p className="text-[10px] text-gray-500">Secondary - Standard action</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleButtonClick('Outline', 'Options')}
                      >
                        OPTIONS
                      </Button>
                      <p className="text-[10px] text-gray-500">Outline - Alternative action</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => handleButtonClick('Ghost', 'Cancel')}
                      >
                        CANCEL
                      </Button>
                      <p className="text-[10px] text-gray-500">Ghost - Minimal emphasis</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleButtonClick('Destructive', 'Terminate')}
                      >
                        TERMINATE
                      </Button>
                      <p className="text-[10px] text-gray-500">Destructive - Dangerous action</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="success" 
                        className="w-full"
                        onClick={() => handleButtonClick('Success', 'Confirm')}
                      >
                        CONFIRM
                      </Button>
                      <p className="text-[10px] text-gray-500">Success - Positive action</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="warning" 
                        className="w-full"
                        onClick={() => handleButtonClick('Warning', 'Warning')}
                      >
                        WARNING
                      </Button>
                      <p className="text-[10px] text-gray-500">Warning - Caution required</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="link" 
                        className="w-full"
                        onClick={() => handleButtonClick('Link', 'Learn More')}
                      >
                        LEARN MORE
                      </Button>
                      <p className="text-[10px] text-gray-500">Link - Navigation action</p>
                    </div>
                  </div>
                </div>

                {/* Button Sizes */}
                <div className="pt-4 border-t border-gray-900">
                  <p className={ts.typography.label + ' mb-3'}>BUTTON SIZES</p>
                  <div className="flex items-center gap-3">
                    <Button size="sm">SMALL</Button>
                    <Button size="default">DEFAULT</Button>
                    <Button size="lg">LARGE</Button>
                    <Button size="icon" aria-label="Settings">⚙</Button>
                  </div>
                </div>

                {/* Combined Examples */}
                <div className="pt-4 border-t border-gray-900">
                  <p className={ts.typography.label + ' mb-3'}>COMBINED USAGE</p>
                  <div className="flex gap-2">
                    <Button variant="default">SAVE</Button>
                    <Button variant="secondary">PREVIEW</Button>
                    <Button variant="outline">EXPORT</Button>
                    <Button variant="ghost">CANCEL</Button>
                  </div>
                </div>
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
      
      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}