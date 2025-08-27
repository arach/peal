'use client'

import { useState } from 'react'
import { terminalStyles as ts, cx } from '@/lib/terminal-styles'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

interface StyleSpec {
  name: string
  type: 'typography' | 'color' | 'input' | 'button' | 'card' | 'badge' | 'status' | 'effect'
  style: string  // The actual style definition string
  details: Record<string, string>
  extras?: string
}

export default function TerminalStyleGuidePage() {
  const [hoveredSpec, setHoveredSpec] = useState<StyleSpec | null>(null)
  const [pinnedSpecs, setPinnedSpecs] = useState<StyleSpec[]>([])
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'raw' | 'computed'>('computed')
  const { toast } = useToast()

  // Parse the actual style definition from terminalStyles
  const parseStyleDefinition = (styleString: string): Record<string, string> => {
    const details: Record<string, string> = {}
    
    // Parse Tailwind classes into readable properties
    const classMap: Record<string, string> = {
      // Typography
      'font-mono': 'font: monospace',
      'font-light': 'weight: 300',
      'font-normal': 'weight: 400', 
      'font-medium': 'weight: 500',
      'text-xs': 'size: 12px',
      'text-sm': 'size: 14px',
      'text-base': 'size: 16px',
      'text-lg': 'size: 18px',
      'text-xl': 'size: 20px',
      'text-2xl': 'size: 24px',
      'text-3xl': 'size: 32px',
      'tracking-tight': 'tracking: -0.025em',
      'tracking-normal': 'tracking: normal',
      'tracking-wide': 'tracking: 0.025em',
      'tracking-wider': 'tracking: 0.05em',
      'uppercase': 'transform: uppercase',
      // Colors
      'text-gray-100': 'color: gray-100',
      'text-gray-200': 'color: gray-200',
      'text-gray-300': 'color: gray-300',
      'text-gray-400': 'color: gray-400',
      'text-gray-500': 'color: gray-500',
      'text-gray-600': 'color: gray-600',
      'text-sky-400': 'color: sky-400',
      'text-sky-500': 'color: sky-500',
      'text-emerald-400': 'color: emerald-400',
      'text-amber-500': 'color: amber-500',
      'text-red-500': 'color: red-500',
      // Backgrounds
      'bg-gray-950': 'bg: gray-950',
      'bg-gray-900': 'bg: gray-900',
      'bg-gray-800': 'bg: gray-800',
      'bg-transparent': 'bg: transparent',
      // Borders
      'border': 'border: 1px',
      'border-gray-900': 'border-color: gray-900',
      'border-gray-800': 'border-color: gray-800',
      'border-gray-700': 'border-color: gray-700',
      // Layout
      'px-3': 'padding-x: 12px',
      'py-2': 'padding-y: 8px',
      'rounded-sm': 'radius: 2px',
    }
    
    // Extract all matching classes
    const classes = styleString.split(' ')
    classes.forEach(cls => {
      const trimmed = cls.trim()
      if (classMap[trimmed]) {
        const [key, value] = classMap[trimmed].split(': ')
        details[key] = value
      } else if (trimmed.includes('shadow-')) {
        details['shadow'] = 'custom'
      } else if (trimmed.includes('hover:')) {
        details['hover'] = 'interactive'
      } else if (trimmed.includes('after:')) {
        details['pseudo'] = 'after element'
      }
    })
    
    // If no details found, show the raw classes
    if (Object.keys(details).length === 0) {
      details['classes'] = styleString.slice(0, 100) + (styleString.length > 100 ? '...' : '')
    }
    
    return details
  }

  // Generic wrapper that shows style definition
  const StyleElement = ({ 
    stylePath,
    styleValue, 
    children, 
    className = "",
    displayName
  }: { 
    stylePath: string,
    styleValue: string,
    children: React.ReactNode,
    className?: string,
    displayName?: string
  }) => {
    const pathParts = stylePath.split('.')
    const category = pathParts[0] as StyleSpec['type']
    const name = displayName || pathParts[pathParts.length - 1]
    
    const spec: StyleSpec = {
      name: name,
      type: category || 'typography',
      style: styleValue,
      details: parseStyleDefinition(styleValue),
      extras: stylePath
    }

    return (
      <div
        className={`hover:bg-gray-900/30 -mx-2 px-2 py-2 rounded transition-colors cursor-pointer ${className}`}
        onMouseEnter={() => setHoveredSpec(spec)}
        onMouseLeave={() => setHoveredSpec(null)}
        onMouseDown={() => {
          console.log('MouseDown on:', spec.name)
        }}
        onMouseUp={(e) => {
          console.log('MouseUp on:', spec.name)
          // Use mouseUp instead of onClick to avoid event conflicts
          const target = e.target as HTMLElement
          // Skip if clicking on actual interactive buttons
          if (target.tagName === 'BUTTON' || target.closest('button')) {
            console.log('Skipping - clicked on button')
            return
          }
          handleClick(spec)
        }}
      >
        {children}
      </div>
    )
  }

  const handleClick = (spec: StyleSpec) => {
    console.log('Clicked:', spec.name) // Debug log
    const existingIndex = pinnedSpecs.findIndex(s => s.name === spec.name)
    if (existingIndex > -1) {
      // Remove if already pinned
      setPinnedSpecs(pinnedSpecs.filter((_, i) => i !== existingIndex))
      // Adjust current index if needed
      if (currentPinnedIndex >= pinnedSpecs.length - 1) {
        setCurrentPinnedIndex(Math.max(0, pinnedSpecs.length - 2))
      }
    } else {
      // Add to pinned stack (max 5 for more comparisons)
      if (pinnedSpecs.length >= 5) {
        setPinnedSpecs([...pinnedSpecs.slice(1), spec])
        setCurrentPinnedIndex(4)
      } else {
        setPinnedSpecs([...pinnedSpecs, spec])
        setCurrentPinnedIndex(pinnedSpecs.length)
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
      
      {/* Fixed Pinned Specs Carousel - Top right */}
      <div className={cx(
        "fixed top-8 right-8 z-50 xl:right-[calc((100vw-1280px)/2-320px)] transition-all duration-300",
        pinnedSpecs.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <div className={ts.components.card.elevated + ' p-3 w-[280px]'}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={ts.typography.subsectionTitle + ' text-amber-500'}>PINNED STYLES</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'raw' ? 'computed' : 'raw')}
                className="text-[9px] px-2 py-0.5 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors"
              >
                {viewMode === 'raw' ? 'RAW CSS' : 'COMPUTED'}
              </button>
              <span className="text-[10px] text-gray-500">{pinnedSpecs.length}/5</span>
            </div>
          </div>
          
          {/* Carousel Container */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 gap-2"
                style={{ transform: `translateX(-${currentPinnedIndex * 100}%)` }}
              >
                {pinnedSpecs.map((spec, index) => (
                  <div 
                    key={spec.name}
                    className="flex-shrink-0 w-full"
                  >
                    <div className="border border-amber-500/30 rounded p-2">
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
                          ×
                        </button>
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase mb-1">{spec.type}</div>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">style:</span>
                          <span className="text-sky-400">{spec.name}</span>
                        </div>
                        {viewMode === 'raw' ? (
                          <div className="text-[9px] text-gray-400 font-mono bg-gray-950 p-1 rounded border border-gray-800 max-h-20 overflow-auto">
                            {spec.style.slice(0, 150)}{spec.style.length > 150 ? '...' : ''}
                          </div>
                        ) : (
                          spec.details && Object.entries(spec.details).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">{key}</span>
                              <span className="text-gray-400 truncate ml-2" style={{ maxWidth: '150px' }}>{value}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Indicators */}
            {pinnedSpecs.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {pinnedSpecs.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPinnedIndex(index)}
                    className={cx(
                      "w-1 h-1 rounded-full transition-all",
                      index === currentPinnedIndex ? 'w-3 bg-amber-500' : 'bg-gray-600 hover:bg-gray-500'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Active Preview - Middle right */}
      <div className="fixed top-[40%] right-8 transform -translate-y-1/2 z-50 xl:right-[calc((100vw-1280px)/2-320px)]">
        <div className={cx(
          ts.components.card.elevated,
          'p-4 w-[280px] transition-all duration-300',
          hoveredSpec ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
        )}>
          <h4 className={ts.typography.subsectionTitle + ' mb-3'}>ACTIVE PREVIEW</h4>
          {hoveredSpec && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-sky-400 font-medium">{hoveredSpec.name}</p>
                <span className="text-[9px] text-gray-500 uppercase">{hoveredSpec.type}</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-gray-500 uppercase">style:</span>
                  <span className="text-[10px] text-sky-400">{hoveredSpec.name}</span>
                </div>
              </div>
              {viewMode === 'raw' ? (
                <div className="text-[9px] text-gray-300 font-mono bg-gray-950 p-2 rounded border border-gray-800 max-h-32 overflow-auto">
                  {hoveredSpec.style}
                </div>
              ) : (
                hoveredSpec.details && Object.entries(hoveredSpec.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">{key}</span>
                    <span className="text-[11px] text-sky-400">{value}</span>
                  </div>
                ))
              )}
              {hoveredSpec.extras && (
                <div className="pt-2 border-t border-gray-800">
                  <span className="text-[10px] text-amber-500">{hoveredSpec.extras}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                <span className="text-[10px] text-gray-600">Click to pin</span>
                <button
                  onClick={() => setViewMode(viewMode === 'raw' ? 'computed' : 'raw')}
                  className="text-[9px] px-2 py-0.5 rounded border border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600"
                >
                  {viewMode === 'raw' ? 'VIEW COMPUTED' : 'VIEW RAW'}
                </button>
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
            <p className={ts.typography.bodyMono}>Platform Style Guide</p>
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
                <StyleElement 
                  stylePath="typography.h1"
                  styleValue={ts.typography.h1}
                  displayName="H1: Primary Header"
                >
                  <h1 className={ts.typography.h1}>H1: Primary Header</h1>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.h2"
                  styleValue={ts.typography.h2}
                  displayName="H2: Section Header"
                >
                  <h2 className={ts.typography.h2}>H2: Section Header</h2>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.h3"
                  styleValue={ts.typography.h3}
                  displayName="H3: Subsection Header"
                >
                  <h3 className={ts.typography.h3}>H3: Subsection Header</h3>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.h4"
                  styleValue={ts.typography.h4}
                  displayName="H4: Component Header"
                >
                  <h4 className={ts.typography.h4}>H4: Component Header</h4>
                </StyleElement>
              </div>
            </div>
            
            {/* Titles & Labels Section */}
            <div className="border-b border-gray-900 pb-6 mb-6">
              <h3 className={ts.typography.subsectionTitle + ' mb-4'}>TITLES & LABELS</h3>
              <div className="space-y-3">
                <StyleElement
                  stylePath="typography.sectionTitle"
                  styleValue={ts.typography.sectionTitle}
                  displayName="SECTION TITLE"
                >
                  <p className={ts.typography.sectionTitle}>SECTION TITLE</p>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.subsectionTitle"
                  styleValue={ts.typography.subsectionTitle}
                  displayName="SUBSECTION TITLE"
                >
                  <p className={ts.typography.subsectionTitle}>SUBSECTION TITLE</p>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.label"
                  styleValue={ts.typography.label}
                  displayName="INPUT LABEL"
                >
                  <label className={ts.typography.label}>INPUT LABEL</label>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.labelRequired"
                  styleValue={ts.typography.labelRequired}
                  displayName="REQUIRED FIELD"
                >
                  <label className={ts.typography.labelRequired}>REQUIRED FIELD</label>
                </StyleElement>
              </div>
            </div>
            
            {/* Body Text Section */}
            <div>
              <h3 className={ts.typography.subsectionTitle + ' mb-4'}>BODY TEXT</h3>
              <div className="space-y-3">
                <StyleElement
                  stylePath="typography.body"
                  styleValue={ts.typography.body}
                  displayName="Standard body text"
                >
                  <p className={ts.typography.body}>Standard body text for general content</p>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.bodyMono"
                  styleValue={ts.typography.bodyMono}
                  displayName="Monospace body text"
                >
                  <p className={ts.typography.bodyMono}>Monospace body text for technical content</p>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.bodySmall"
                  styleValue={ts.typography.bodySmall}
                  displayName="Small text"
                >
                  <p className={ts.typography.bodySmall}>Small text for secondary information</p>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.bodySmallMono"
                  styleValue={ts.typography.bodySmallMono}
                  displayName="Small monospace"
                >
                  <p className={ts.typography.bodySmallMono}>Small monospace for metadata</p>
                </StyleElement>
                
                <StyleElement
                  stylePath="typography.code"
                  styleValue={ts.typography.code}
                  displayName="Inline code"
                >
                  <div>
                    <code className={ts.typography.code}>inline.code()</code>
                  </div>
                </StyleElement>
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
                <StyleElement
                  stylePath="colors.gray.950"
                  styleValue={ts.colors.gray[950]}
                  displayName="Gray 950"
                  className="h-16"
                >
                  <div className="h-full bg-gray-950 border border-gray-800 flex items-center justify-center">
                    <span className="text-[10px] text-gray-500">950</span>
                  </div>
                </StyleElement>
                
                <StyleElement
                  stylePath="colors.gray.900"
                  styleValue={ts.colors.gray[900]}
                  displayName="Gray 900"
                  className="h-16"
                >
                  <div className="h-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <span className="text-[10px] text-gray-500">900</span>
                  </div>
                </StyleElement>
                
                <StyleElement
                  stylePath="colors.gray.800"
                  styleValue={ts.colors.gray[800]}
                  displayName="Gray 800"
                  className="h-16"
                >
                  <div className="h-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">800</span>
                  </div>
                </StyleElement>
                
                <StyleElement
                  stylePath="colors.gray.700"
                  styleValue={ts.colors.gray[700]}
                  displayName="Gray 700"
                  className="h-16"
                >
                  <div className="h-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                    <span className="text-[10px] text-gray-300">700</span>
                  </div>
                </StyleElement>
                
                <StyleElement
                  stylePath="colors.gray.600"
                  styleValue={ts.colors.gray[600]}
                  displayName="Gray 600"
                  className="h-16"
                >
                  <div className="h-full bg-gray-600 border border-gray-500 flex items-center justify-center">
                    <span className="text-[10px] text-gray-200">600</span>
                  </div>
                </StyleElement>
              </div>
            </div>
            
            {/* Accent Colors */}
            <div className={ts.components.card.default + ' p-6'}>
              <h3 className={ts.typography.subsectionTitle}>CRITICAL STATE INDICATORS</h3>
              <div className="space-y-2 mt-4">
                <StyleElement
                  stylePath="colors.accent.primary"
                  styleValue={ts.colors.accent.primary}
                  displayName="Primary Action"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-sky-500/20 border border-sky-500/50 rounded-sm" />
                    <span className="text-xs text-sky-500">PRIMARY ACTION</span>
                  </div>
                </StyleElement>
                
                <StyleElement
                  stylePath="colors.accent.success"
                  styleValue={ts.colors.accent.success}
                  displayName="Success State"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-emerald-500/20 border border-emerald-500/50 rounded-sm" />
                    <span className="text-xs text-emerald-500">SUCCESS STATE</span>
                  </div>
                </StyleElement>
                
                <StyleElement
                  stylePath="colors.accent.warning"
                  styleValue={ts.colors.accent.warning}
                  displayName="Warning State"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-amber-500/20 border border-amber-500/50 rounded-sm" />
                    <span className="text-xs text-amber-500">WARNING STATE</span>
                  </div>
                </StyleElement>
                
                <StyleElement
                  stylePath="colors.accent.error"
                  styleValue={ts.colors.accent.error}
                  displayName="Error State"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-red-500/20 border border-red-500/50 rounded-sm" />
                    <span className="text-xs text-red-500">ERROR STATE</span>
                  </div>
                </StyleElement>
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
              
              <StyleElement
                stylePath="components.input.default"
                styleValue={ts.components.input.default}
                displayName="Default Input"
              >
                <div>
                  <label className={ts.typography.label}>DEFAULT INPUT</label>
                  <input className={ts.components.input.default} placeholder="Enter command..." />
                </div>
              </StyleElement>
              
              <StyleElement
                stylePath="components.input.active"
                styleValue={ts.components.input.active}
                displayName="Active Input"
              >
                <div>
                  <label className={ts.typography.label}>ACTIVE INPUT</label>
                  <input className={ts.components.input.active} placeholder="Active state..." />
                </div>
              </StyleElement>
              
              <StyleElement
                stylePath="components.input.error"
                styleValue={ts.components.input.error}
                displayName="Error Input"
              >
                <div>
                  <label className={ts.typography.label}>ERROR INPUT</label>
                  <input className={ts.components.input.error} placeholder="Error state..." />
                </div>
              </StyleElement>
              
              <StyleElement
                stylePath="components.input.minimal"
                styleValue={ts.components.input.minimal}
                displayName="Minimal Input"
              >
                <div>
                  <label className={ts.typography.label}>MINIMAL INPUT</label>
                  <input className={ts.components.input.minimal} placeholder="Minimal style..." />
                </div>
              </StyleElement>
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
                  <StyleElement
                    stylePath="components.button.primary"
                    styleValue={ts.components.button.primary}
                    displayName="Primary Button States"
                  >
                    <div className="flex items-start gap-3">
                      <Button variant="default">DEFAULT</Button>
                      <Button variant="default" disabled>DISABLED</Button>
                    </div>
                  </StyleElement>
                </div>

                {/* Button Variants */}
                <div className="space-y-3 pt-4 border-t border-gray-900">
                  <p className={ts.typography.label}>BUTTON VARIANTS</p>
                  <div className="grid grid-cols-2 gap-4">
                    <StyleElement
                      stylePath="components.button.primary"
                      styleValue={ts.components.button.primary}
                      displayName="Primary Button"
                      className="space-y-2"
                    >
                      <div className="space-y-2">
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleButtonClick('Primary', 'Execute')
                          }}
                        >
                          EXECUTE
                        </Button>
                        <p className="text-[10px] text-gray-500">Primary action - High emphasis</p>
                      </div>
                    </StyleElement>
                    <StyleElement
                      stylePath="components.button.secondary"
                      styleValue={ts.components.button.secondary}
                      displayName="Secondary Button"
                      className="space-y-2"
                    >
                      <div className="space-y-2">
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleButtonClick('Secondary', 'Configure')
                          }}
                        >
                          CONFIGURE
                        </Button>
                        <p className="text-[10px] text-gray-500">Secondary - Standard action</p>
                      </div>
                    </StyleElement>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleButtonClick('Outline', 'Options')
                        }}
                      >
                        OPTIONS
                      </Button>
                      <p className="text-[10px] text-gray-500">Outline - Alternative action</p>
                    </div>
                    <StyleElement
                      stylePath="components.button.ghost"
                      styleValue={ts.components.button.ghost}
                      displayName="Ghost Button"
                      className="space-y-2"
                    >
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleButtonClick('Ghost', 'Cancel')
                          }}
                        >
                          CANCEL
                        </Button>
                        <p className="text-[10px] text-gray-500">Ghost - Minimal emphasis</p>
                      </div>
                    </StyleElement>
                    <StyleElement
                      stylePath="components.button.danger"
                      styleValue={ts.components.button.danger}
                      displayName="Destructive Button"
                      className="space-y-2"
                    >
                      <div className="space-y-2">
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleButtonClick('Destructive', 'Terminate')
                          }}
                        >
                          TERMINATE
                        </Button>
                        <p className="text-[10px] text-gray-500">Destructive - Dangerous action</p>
                      </div>
                    </StyleElement>
                    <StyleElement
                      stylePath="components.button.success"
                      styleValue={ts.components.button.success}
                      displayName="Success Button"
                      className="space-y-2"
                    >
                      <div className="space-y-2">
                        <Button 
                          variant="success" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleButtonClick('Success', 'Confirm')
                          }}
                        >
                          CONFIRM
                        </Button>
                        <p className="text-[10px] text-gray-500">Success - Positive action</p>
                      </div>
                    </StyleElement>
                    <StyleElement
                      stylePath="components.button.warning"
                      styleValue={ts.components.button.warning}
                      displayName="Warning Button"
                      className="space-y-2"
                    >
                      <div className="space-y-2">
                        <Button 
                          variant="warning" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleButtonClick('Warning', 'Warning')
                          }}
                        >
                          WARNING
                        </Button>
                        <p className="text-[10px] text-gray-500">Warning - Caution required</p>
                      </div>
                    </StyleElement>
                    <div className="space-y-2">
                      <Button 
                        variant="link" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleButtonClick('Link', 'Learn More')
                        }}
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
                    <Button 
                      variant="default"
                      onClick={() => toast({
                        title: 'SAVE OPERATION',
                        description: 'Configuration saved successfully',
                        variant: 'success' as any,
                      })}
                    >
                      SAVE
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => toast({
                        title: 'PREVIEW MODE',
                        description: 'Rendering preview...',
                      })}
                    >
                      PREVIEW
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => toast({
                        title: 'EXPORT INITIATED',
                        description: 'Preparing files for export',
                      })}
                    >
                      EXPORT
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => toast({
                        title: 'OPERATION CANCELLED',
                        description: 'All changes discarded',
                        variant: 'warning' as any,
                      })}
                    >
                      CANCEL
                    </Button>
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
            <StyleElement
              stylePath="components.card.default"
              styleValue={ts.components.card.default}
              displayName="Default Card"
            >
              <div className={cx(ts.components.card.default, 'p-4')}>
                <h3 className={ts.typography.subsectionTitle}>DEFAULT CARD</h3>
                <p className={ts.typography.bodySmallMono}>Standard container with border</p>
              </div>
            </StyleElement>
            
            <StyleElement
              stylePath="components.card.elevated"
              styleValue={ts.components.card.elevated}
              displayName="Elevated Card"
            >
              <div className={cx(ts.components.card.elevated, 'p-4')}>
                <h3 className={ts.typography.subsectionTitle}>ELEVATED CARD</h3>
                <p className={ts.typography.bodySmallMono}>Enhanced depth with shadow</p>
              </div>
            </StyleElement>
            
            <StyleElement
              stylePath="components.card.glass"
              styleValue={ts.components.card.glass}
              displayName="Glass Card"
            >
              <div className={cx(ts.components.card.glass, 'p-4')}>
                <h3 className={ts.typography.subsectionTitle}>GLASS CARD</h3>
                <p className={ts.typography.bodySmallMono}>Transparent with backdrop blur</p>
              </div>
            </StyleElement>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>STATUS BADGES</h2>
          
          <div className={cx(ts.components.card.default, 'p-6')}>
            <div className="flex flex-wrap gap-3">
              <StyleElement
                stylePath="components.badge.neutral"
                styleValue={`${ts.components.badge.default} ${ts.components.badge.neutral}`}
                displayName="Neutral Badge"
              >
                <span className={cx(ts.components.badge.default, ts.components.badge.neutral)}>NEUTRAL</span>
              </StyleElement>
              
              <StyleElement
                stylePath="components.badge.primary"
                styleValue={`${ts.components.badge.default} ${ts.components.badge.primary}`}
                displayName="Primary Badge"
              >
                <span className={cx(ts.components.badge.default, ts.components.badge.primary)}>PRIMARY</span>
              </StyleElement>
              
              <StyleElement
                stylePath="components.badge.success"
                styleValue={`${ts.components.badge.default} ${ts.components.badge.success}`}
                displayName="Success Badge"
              >
                <span className={cx(ts.components.badge.default, ts.components.badge.success)}>SUCCESS</span>
              </StyleElement>
              
              <StyleElement
                stylePath="components.badge.warning"
                styleValue={`${ts.components.badge.default} ${ts.components.badge.warning}`}
                displayName="Warning Badge"
              >
                <span className={cx(ts.components.badge.default, ts.components.badge.warning)}>WARNING</span>
              </StyleElement>
              
              <StyleElement
                stylePath="components.badge.error"
                styleValue={`${ts.components.badge.default} ${ts.components.badge.error}`}
                displayName="Error Badge"
              >
                <span className={cx(ts.components.badge.default, ts.components.badge.error)}>ERROR</span>
              </StyleElement>
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
                    <StyleElement
                      stylePath="components.status.online"
                      styleValue={ts.components.status.online}
                      displayName="Online Status"
                    >
                      <div className="flex items-center gap-2">
                        <span className={ts.components.status.online} />
                        <span className="text-emerald-500">ACTIVE</span>
                      </div>
                    </StyleElement>
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
                    <StyleElement
                      stylePath="components.status.warning"
                      styleValue={ts.components.status.warning}
                      displayName="Warning Status"
                    >
                      <div className="flex items-center gap-2">
                        <span className={ts.components.status.warning} />
                        <span className="text-amber-500">PENDING</span>
                      </div>
                    </StyleElement>
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
                    <StyleElement
                      stylePath="components.status.offline"
                      styleValue={ts.components.status.offline}
                      displayName="Offline Status"
                    >
                      <div className="flex items-center gap-2">
                        <span className={ts.components.status.offline} />
                        <span className="text-gray-500">OFFLINE</span>
                      </div>
                    </StyleElement>
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
              <StyleElement
                stylePath="effects.glowPrimary"
                styleValue={ts.effects.glowPrimary}
                displayName="GLOW EFFECT"
              >
                <button className={cx(ts.components.button.primary, ts.effects.glowPrimary, 'relative')}>
                  GLOW EFFECT
                  <div className="absolute inset-0 rounded-sm bg-sky-500/20 blur-xl -z-10 animate-pulse" />
                </button>
              </StyleElement>
            </div>
            
            <div className={cx(ts.components.card.default, 'p-6 text-center relative overflow-hidden')}>
              <StyleElement
                stylePath="effects.scanline"
                styleValue="animate-scan"
                displayName="SCANLINE ANIMATION"
              >
                <div className="relative h-20">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/10 to-transparent animate-scan" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan" style={{ animationDelay: '2s' }} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/10 to-transparent animate-scan" style={{ animationDelay: '4s' }} />
                  <p className={ts.typography.bodyMono + ' relative z-10 leading-[80px]'}>SCANLINE ANIMATION</p>
                </div>
              </StyleElement>
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