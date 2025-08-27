'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
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

// Context for style sections to provide category info
const StyleSectionContext = createContext<{ category: StyleSpec['type'] }>({ 
  category: 'typography' 
})

export default function TerminalStyleGuidePage() {
  const [hoveredSpec, setHoveredSpec] = useState<StyleSpec | null>(null)
  const [pinnedSpecs, setPinnedSpecs] = useState<StyleSpec[]>([])
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0)
  const { toast } = useToast()

  // Utility to detect element type from React children
  const detectElementType = (children: React.ReactNode): string | null => {
    if (!children || typeof children !== 'object') return null
    
    const child = React.Children.toArray(children)[0]
    if (React.isValidElement(child)) {
      const elementType = child.type
      if (typeof elementType === 'string') {
        return `<${elementType}>`
      }
    }
    return null
  }

  // StyleSection component to provide context
  const StyleSection = ({ category, children }: { category: StyleSpec['type'], children: React.ReactNode }) => {
    return (
      <StyleSectionContext.Provider value={{ category }}>
        {children}
      </StyleSectionContext.Provider>
    )
  }

  // Utility to create style spec
  const createStyleSpec = (
    name: string,
    category: StyleSpec['type'],
    styleValue: string,
    elementType: string | null
  ): StyleSpec => {
    return {
      name,
      type: category,
      style: styleValue,
      details: { classes: styleValue },
      extras: elementType || undefined
    }
  }

  // Thin wrapper component - just handles interaction
  const StyleElement = ({ 
    styleValue, 
    children, 
    className = "",
    displayName
  }: { 
    styleValue: string,
    children: React.ReactNode,
    className?: string,
    displayName?: string
  }) => {
    const { category } = useContext(StyleSectionContext)
    const name = displayName || ''
    const elementType = detectElementType(children)
    const spec = createStyleSpec(name, category, styleValue, elementType)

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
      // Add to pinned stack (no limit)
      setPinnedSpecs([...pinnedSpecs, spec])
      setCurrentPinnedIndex(pinnedSpecs.length)
    }
  }

  // Keyboard navigation for pinned items
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (pinnedSpecs.length <= 1) return
      
      if (e.key === 'ArrowLeft' && currentPinnedIndex > 0) {
        setCurrentPinnedIndex(currentPinnedIndex - 1)
      } else if (e.key === 'ArrowRight' && currentPinnedIndex < pinnedSpecs.length - 1) {
        setCurrentPinnedIndex(currentPinnedIndex + 1)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPinnedIndex, pinnedSpecs.length])

  const handleButtonClick = (variant: string, action: string) => {
    toast({
      title: `${action.toUpperCase()} INITIATED`,
      description: `${variant} action has been triggered successfully`,
      className: 'bg-gray-900 border-gray-700 text-gray-100 font-mono',
    })
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 relative">
      {/* Grid background effect */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      {/* Fixed Pinned Specs Carousel - Top right */}
      <div className={cx(
        "fixed top-8 right-8 z-50 xl:right-[max(2rem,calc((100vw-1536px)/2))] transition-all duration-300",
        pinnedSpecs.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <div className={cx('bg-gray-950/90 backdrop-blur-md border border-gray-800', 'p-3 w-[290px] relative overflow-hidden rounded-lg shadow-2xl')}>
          {/* Subtle scanline effect on inspector */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent animate-scan pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h4 className={ts.typography.uiSectionHeader + ' text-amber-500'}>Pinned Styles</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">{currentPinnedIndex + 1}/{pinnedSpecs.length}</span>
            </div>
          </div>
          
          {/* Carousel Container */}
          <div className="relative">
            {/* Previous Button */}
            {pinnedSpecs.length > 1 && currentPinnedIndex > 0 && (
              <button
                onClick={() => setCurrentPinnedIndex(currentPinnedIndex - 1)}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 flex items-center justify-center text-xs transition-all"
                aria-label="Previous"
              >
                ‹
              </button>
            )}
            
            {/* Next Button */}
            {pinnedSpecs.length > 1 && currentPinnedIndex < pinnedSpecs.length - 1 && (
              <button
                onClick={() => setCurrentPinnedIndex(currentPinnedIndex + 1)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 flex items-center justify-center text-xs transition-all"
                aria-label="Next"
              >
                ›
              </button>
            )}
            
            <div className="overflow-hidden" style={{ padding: '1px 3px' }}>
              <div 
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentPinnedIndex * 100}%)` }}
              >
                {pinnedSpecs.map((spec, index) => (
                  <div 
                    key={spec.name}
                    className="flex-shrink-0 w-full px-0.5"
                  >
                    <div className="border border-amber-500/30 rounded p-2 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-amber-400 font-medium flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>{spec.name}</span>
                        </span>
                        <button 
                          className="text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded px-1 transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPinnedSpecs(pinnedSpecs.filter((_, i) => i !== index))
                            // Adjust current index if needed
                            if (currentPinnedIndex >= pinnedSpecs.length - 1) {
                              setCurrentPinnedIndex(Math.max(0, pinnedSpecs.length - 2))
                            }
                          }}
                          title="Unpin"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase mb-1">{spec.type}</div>
                      <div className="space-y-1 text-[10px]">
                        {spec.extras && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">element</span>
                            <span className="text-amber-500 text-[10px]">{spec.extras}</span>
                          </div>
                        )}
                        {spec.details && Object.entries(spec.details).slice(0, 4).map(([key, value]) => {
                            if (key === 'classes') {
                              return (
                                <div key={key} className="flex gap-1 items-start">
                                  <span className="text-[9px] text-gray-600 uppercase flex-shrink-0 pt-0.5">CLASSES:</span>
                                  <div className="text-[9px] text-gray-500 font-mono bg-gray-900/50 px-1 py-0.5 rounded border border-gray-800/50 text-right leading-relaxed flex-1">
                                    {value.slice(0, 100)}{value.length > 100 ? '...' : ''}
                                  </div>
                                </div>
                              )
                            }
                            return (
                              <div key={key} className="flex justify-between text-[10px]">
                                <span className="text-gray-600">{key}</span>
                                <span className="text-gray-400 truncate ml-2" style={{ maxWidth: '150px' }}>{value}</span>
                              </div>
                            )
                          })}
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
      <div className="fixed top-[40%] right-8 transform -translate-y-1/2 z-50 xl:right-[max(2rem,calc((100vw-1536px)/2))]">
        <div className={cx(
          'bg-gray-950/90 backdrop-blur-md border border-gray-800',
          'p-4 w-[280px] transition-all duration-300 relative overflow-hidden rounded-lg shadow-2xl',
          hoveredSpec ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
        )}>
          {/* Subtle scanline effect on inspector */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent animate-scan pointer-events-none" />
          <h4 className={cx(ts.typography.uiSectionHeader, 'mb-3 relative z-10')}>Active Preview</h4>
          {hoveredSpec && (
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-sky-400 font-medium">{hoveredSpec.name}</p>
                <span className="text-[9px] text-gray-500 uppercase">{hoveredSpec.type}</span>
              </div>
              <div className="space-y-1">
                  {hoveredSpec.extras && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-500 uppercase">element</span>
                      <span className="text-[11px] text-amber-500">{hoveredSpec.extras}</span>
                    </div>
                  )}
                  {hoveredSpec.details && Object.entries(hoveredSpec.details).map(([key, value]) => {
                  if (key === 'classes') {
                    return (
                      <div key={key} className="flex gap-2 items-start">
                        <span className="text-[10px] text-gray-500 uppercase flex-shrink-0 pt-1.5">CLASSES:</span>
                        <div className="text-[10px] text-gray-400 font-mono bg-gray-900/60 p-1.5 rounded border border-gray-800/60 text-right leading-relaxed flex-1">
                          {value}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="text-[10px] text-gray-500 uppercase">{key}</span>
                      <span className="text-[11px] text-sky-400">{value}</span>
                    </div>
                  )
                  })}
                </div>
              <div className="pt-2 border-t border-gray-800">
                <span className="text-[10px] text-gray-600">Click to pin</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative max-w-4xl mx-auto space-y-12">
        {/* Header with scanline effect */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent animate-scan pointer-events-none" />
          <div className="border border-gray-800 p-6 bg-gray-950/80 backdrop-blur-sm">
            <h1 className="font-sans text-3xl font-light tracking-tight text-gray-100 mb-2">PEAL // TERMINAL INTERFACE</h1>
            <p className={ts.typography.bodyMono}>Platform Style Guide</p>
            <div className="flex items-center gap-2 mt-4">
              <span className={ts.components.status.online} />
              <span className={ts.typography.bodySmallMono}>SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* Typography */}
        <StyleSection category="typography">
          <section className="space-y-6">
            <h2 className={ts.typography.sectionTitle}>TYPOGRAPHY SYSTEM</h2>
            
            <div className={ts.components.card.default + ' p-6'}>
              {/* Headers Section */}
              <div className="border-b border-gray-900 pb-6 mb-6">
                <h3 className={ts.typography.subsectionTitle + ' mb-4'}>HEADERS</h3>
                <div className="space-y-4">
                  <StyleElement 
                    styleValue={ts.typography.h1}
                    displayName="Primary Header"
                  >
                    <h1 className={ts.typography.h1}>Primary Header</h1>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.typography.h2}
                    displayName="Section Header"
                  >
                    <h2 className={ts.typography.h2}>Section Header</h2>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.typography.h3}
                    displayName="Subsection Header"
                  >
                    <h3 className={ts.typography.h3}>Subsection Header</h3>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.typography.h4}
                    displayName="Component Header"
                  >
                    <h4 className={ts.typography.h4}>Component Header</h4>
                  </StyleElement>
                </div>
              </div>
              
              {/* Titles & Labels Section */}
              <div className="border-b border-gray-900 pb-6 mb-6">
                <h3 className={ts.typography.subsectionTitle + ' mb-4'}>TITLES & LABELS</h3>
                <div className="space-y-3">
                  <StyleElement
                    styleValue={ts.typography.sectionTitle}
                    displayName="SECTION TITLE"
                  >
                    <p className={ts.typography.sectionTitle}>SECTION TITLE</p>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.typography.subsectionTitle}
                    displayName="SUBSECTION TITLE"
                  >
                    <p className={ts.typography.subsectionTitle}>SUBSECTION TITLE</p>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.typography.label}
                    displayName="INPUT LABEL"
                  >
                    <label className={ts.typography.label}>INPUT LABEL</label>
                  </StyleElement>
                  
                  <StyleElement
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
                    styleValue={ts.typography.body}
                    displayName="Standard body text"
                  >
                    <p className={ts.typography.body}>Standard body text for general content</p>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.typography.bodyMono}
                    displayName="Monospace body text"
                  >
                    <p className={ts.typography.bodyMono}>Monospace body text for technical content</p>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.typography.bodySmall}
                    displayName="Small text"
                  >
                    <p className={ts.typography.bodySmall}>Small text for secondary information</p>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.typography.bodySmallMono}
                    displayName="Small monospace"
                  >
                    <p className={ts.typography.bodySmallMono}>Small monospace for metadata</p>
                  </StyleElement>
                  
                  <StyleElement
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
        </StyleSection>

        {/* Color Palette */}
        <StyleSection category="color">
          <section className="space-y-6">
            <h2 className={ts.typography.sectionTitle}>COLOR PROTOCOL</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Grayscale */}
              <div className={ts.components.card.default + ' p-6'}>
                <h3 className={ts.typography.subsectionTitle}>GRAYSCALE FOUNDATION</h3>
                <div className="grid grid-cols-5 gap-1 mt-4">
                  <StyleElement
                    styleValue={ts.colors.gray[950]}
                    displayName="Gray 950"
                    className="h-16"
                  >
                    <div className="h-full bg-gray-950 border border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-gray-500">950</span>
                    </div>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.colors.gray[900]}
                    displayName="Gray 900"
                    className="h-16"
                  >
                    <div className="h-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-gray-500">900</span>
                    </div>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.colors.gray[800]}
                    displayName="Gray 800"
                    className="h-16"
                  >
                    <div className="h-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                      <span className="text-[10px] text-gray-400">800</span>
                    </div>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.colors.gray[700]}
                    displayName="Gray 700"
                    className="h-16"
                  >
                    <div className="h-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                      <span className="text-[10px] text-gray-300">700</span>
                    </div>
                  </StyleElement>
                  
                  <StyleElement
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
                    styleValue={ts.colors.accent.primary}
                    displayName="Primary Action"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-sky-500/20 border border-sky-500/50 rounded-sm" />
                      <span className="text-xs text-sky-500">PRIMARY ACTION</span>
                    </div>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.colors.accent.success}
                    displayName="Success State"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-emerald-500/20 border border-emerald-500/50 rounded-sm" />
                      <span className="text-xs text-emerald-500">SUCCESS STATE</span>
                    </div>
                  </StyleElement>
                  
                  <StyleElement
                    styleValue={ts.colors.accent.warning}
                    displayName="Warning State"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-amber-500/20 border border-amber-500/50 rounded-sm" />
                      <span className="text-xs text-amber-500">WARNING STATE</span>
                    </div>
                  </StyleElement>
                  
                  <StyleElement
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
        </StyleSection>

        {/* Components */}
        <section className="space-y-6">
          <h2 className={ts.typography.sectionTitle}>COMPONENT LIBRARY</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <StyleSection category="input">
              <div className={ts.components.card.default + ' p-6 space-y-4'}>
                <h3 className={ts.typography.subsectionTitle}>INPUT FIELDS</h3>
              
              <StyleElement
                styleValue={ts.components.input.default}
                displayName="Default Input"
              >
                <div>
                  <label className={ts.typography.label}>DEFAULT INPUT</label>
                  <input className={ts.components.input.default} placeholder="Enter command..." />
                </div>
              </StyleElement>
              
              <StyleElement
                styleValue={ts.components.input.active}
                displayName="Active Input"
              >
                <div>
                  <label className={ts.typography.label}>ACTIVE INPUT</label>
                  <input className={ts.components.input.active} placeholder="Active state..." />
                </div>
              </StyleElement>
              
              <StyleElement
                styleValue={ts.components.input.error}
                displayName="Error Input"
              >
                <div>
                  <label className={ts.typography.label}>ERROR INPUT</label>
                  <input className={ts.components.input.error} placeholder="Error state..." />
                </div>
              </StyleElement>
              
              <StyleElement
                styleValue={ts.components.input.minimal}
                displayName="Minimal Input"
              >
                <div>
                  <label className={ts.typography.label}>MINIMAL INPUT</label>
                  <input className={ts.components.input.minimal} placeholder="Minimal style..." />
                </div>
                </StyleElement>
              </div>
            </StyleSection>
            
            {/* Buttons */}
            <StyleSection category="button">
              <div className={ts.components.card.default + ' p-6 space-y-6'}>
                <h3 className={ts.typography.subsectionTitle}>ACTION BUTTONS</h3>
              
              {/* Button States Demo */}
              <div className="space-y-6">
                {/* Interactive States */}
                <div className="space-y-3">
                  <p className={ts.typography.label}>INTERACTIVE STATES</p>
                  <p className="text-[11px] text-gray-500 mb-3">Hover and click buttons to see state transitions</p>
                  <StyleElement
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
            </StyleSection>
          </div>
        </section>

        {/* Cards */}
        <StyleSection category="card">
          <section className="space-y-6">
            <h2 className={ts.typography.sectionTitle}>CONTAINER TYPES</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <StyleElement
                styleValue={ts.components.card.default}
                displayName="Default Card"
              >
                <div className={cx(ts.components.card.default, 'p-4')}>
                  <h3 className={ts.typography.subsectionTitle}>DEFAULT CARD</h3>
                  <p className={ts.typography.bodySmallMono}>Standard container with border</p>
                </div>
              </StyleElement>
              
              <StyleElement
                styleValue={ts.components.card.elevated}
                displayName="Elevated Card"
              >
                <div className={cx(ts.components.card.elevated, 'p-4')}>
                  <h3 className={ts.typography.subsectionTitle}>ELEVATED CARD</h3>
                  <p className={ts.typography.bodySmallMono}>Enhanced depth with shadow</p>
                </div>
              </StyleElement>
              
              <StyleElement
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
        </StyleSection>

        {/* Badges */}
        <StyleSection category="badge">
          <section className="space-y-6">
            <h2 className={ts.typography.sectionTitle}>STATUS BADGES</h2>
            
            <div className={cx(ts.components.card.default, 'p-6')}>
              <div className="flex flex-wrap gap-3">
                <StyleElement
                  styleValue={`${ts.components.badge.default} ${ts.components.badge.neutral}`}
                  displayName="Neutral Badge"
                >
                  <span className={cx(ts.components.badge.default, ts.components.badge.neutral)}>NEUTRAL</span>
                </StyleElement>
                
                <StyleElement
                  styleValue={`${ts.components.badge.default} ${ts.components.badge.primary}`}
                  displayName="Primary Badge"
                >
                  <span className={cx(ts.components.badge.default, ts.components.badge.primary)}>PRIMARY</span>
                </StyleElement>
                
                <StyleElement
                  styleValue={`${ts.components.badge.default} ${ts.components.badge.success}`}
                  displayName="Success Badge"
                >
                  <span className={cx(ts.components.badge.default, ts.components.badge.success)}>SUCCESS</span>
                </StyleElement>
                
                <StyleElement
                  styleValue={`${ts.components.badge.default} ${ts.components.badge.warning}`}
                  displayName="Warning Badge"
                >
                  <span className={cx(ts.components.badge.default, ts.components.badge.warning)}>WARNING</span>
                </StyleElement>
                
                <StyleElement
                  styleValue={`${ts.components.badge.default} ${ts.components.badge.error}`}
                  displayName="Error Badge"
                >
                  <span className={cx(ts.components.badge.default, ts.components.badge.error)}>ERROR</span>
                </StyleElement>
              </div>
            </div>
          </section>
        </StyleSection>

        {/* Data Table */}
        <StyleSection category="status">
          <section className="space-y-6">
            <h2 className={ts.typography.sectionTitle}>DATA VISUALIZATION</h2>
            
            <div className={cx(ts.components.card.default)}>
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
                  <tr className={cx(ts.components.table.row, 'group hover:bg-gray-900/40 transition-all')}>
                    <td className={cx(ts.components.table.cell)}>001</td>
                    <td className={cx(ts.components.table.cell)}>ALPHA</td>
                    <td className={cx(ts.components.table.cell)}>440Hz</td>
                    <td className={cx(ts.components.table.cell)}>
                      <StyleElement
                        styleValue={ts.components.status.online}
                        displayName="Online Status"
                      >
                        <div className="flex items-center gap-2">
                          <span className={ts.components.status.online} />
                          <span className="text-emerald-500">ACTIVE</span>
                        </div>
                      </StyleElement>
                    </td>
                    <td className={cx(ts.components.table.cell)}>
                      <button className="text-sky-500 hover:text-sky-400 text-xs">MODIFY</button>
                    </td>
                  </tr>
                  <tr className={cx(ts.components.table.row, 'group hover:bg-gray-900/40 transition-all')}>
                    <td className={cx(ts.components.table.cell)}>002</td>
                    <td className={cx(ts.components.table.cell)}>BETA</td>
                    <td className={cx(ts.components.table.cell)}>880Hz</td>
                    <td className={cx(ts.components.table.cell)}>
                      <StyleElement
                        styleValue={ts.components.status.warning}
                        displayName="Warning Status"
                      >
                        <div className="flex items-center gap-2">
                          <span className={ts.components.status.warning} />
                          <span className="text-amber-500">PENDING</span>
                        </div>
                      </StyleElement>
                    </td>
                    <td className={cx(ts.components.table.cell)}>
                      <button className="text-sky-500 hover:text-sky-400 text-xs">MODIFY</button>
                    </td>
                  </tr>
                  <tr className={cx(ts.components.table.row, 'group hover:bg-gray-900/40 transition-all')}>
                    <td className={cx(ts.components.table.cell)}>003</td>
                    <td className={cx(ts.components.table.cell)}>GAMMA</td>
                    <td className={cx(ts.components.table.cell)}>220Hz</td>
                    <td className={cx(ts.components.table.cell)}>
                      <StyleElement
                        styleValue={ts.components.status.offline}
                        displayName="Offline Status"
                      >
                        <div className="flex items-center gap-2">
                          <span className={ts.components.status.offline} />
                          <span className="text-gray-500">OFFLINE</span>
                        </div>
                      </StyleElement>
                    </td>
                    <td className={cx(ts.components.table.cell)}>
                      <button className="text-sky-500 hover:text-sky-400 text-xs">MODIFY</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </StyleSection>


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