'use client'

import { useMemo, useEffect, useState } from 'react'
import { generatePealWaveData, logoPresets, colorThemes, BarData } from '@/lib/waveGenerator'
import { useSoundStore } from '@/store/soundStore'

interface DynamicPealLogoProps {
  width?: number
  height?: number
  preset?: keyof typeof logoPresets
  animated?: boolean
  className?: string
}

export default function DynamicPealLogo({ 
  width = 120, 
  height = 40, 
  preset = 'compact',
  animated = false,
  className = ''
}: DynamicPealLogoProps) {
  const theme = useSoundStore(state => state.theme)
  const [animationTime, setAnimationTime] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
  // Determine color theme based on system theme
  const colorTheme = useMemo(() => {
    const isDark = theme === 'dark' || 
      (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    return isDark ? colorThemes.dark : colorThemes.light
  }, [theme])

  // Generate wave data
  const bars = useMemo(() => {
    const presetConfig = logoPresets[preset]
    return generatePealWaveData({
      canvasWidth: width,
      canvasHeight: height,
      ...presetConfig,
      colorTheme,
      animationTime: animationTime // Always use current animation time
    })
  }, [width, height, preset, colorTheme, animationTime])

  // Animation loop - only runs when animated or hovered
  // When stopped, animation pauses at current time rather than resetting
  useEffect(() => {
    if (!animated && !isHovered) return

    let animationFrameId: number
    const animate = () => {
      setAnimationTime(prev => prev + 0.05)
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [animated, isHovered])

  // Render bars with text
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: 'block', cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Define blur filter */}
      <defs>
        <filter id={`textBgBlur-${preset}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
      </defs>
      
      {/* Render wave bars */}
      {bars.map((bar: BarData, index: number) => (
        <rect
          key={index}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.color}
          rx={bar.width / 2}
          ry={bar.width / 2}
        />
      ))}
      
      {/* Subtle background pill for text */}
      <rect
        x={width * 0.25}
        y={height * 0.2}
        width={width * 0.5}
        height={height * 0.6}
        rx={height * 0.3}
        ry={height * 0.3}
        fill={theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) 
          ? 'rgba(17, 24, 39, 0.6)' 
          : 'rgba(255, 255, 255, 0.7)'}
        filter={`url(#textBgBlur-${preset})`}
      />
      
      {/* Add "peal" text */}
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        fontSize={height * 0.38}
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing={0.5}
      >
        peal
      </text>
    </svg>
  )
}