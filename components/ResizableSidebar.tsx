'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

interface ResizableSidebarProps {
  children: ReactNode
  side?: 'left' | 'right'
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  className?: string
  resizable?: boolean
}

export default function ResizableSidebar({
  children,
  side = 'left',
  defaultWidth = 384, // w-96 = 384px
  minWidth = 240,
  maxWidth = 600,
  className = '',
  resizable = true
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!resizable) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = side === 'left' 
        ? e.clientX 
        : window.innerWidth - e.clientX

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, side, minWidth, maxWidth, resizable])

  const handleMouseDown = () => {
    if (!resizable) return
    setIsResizing(true)
  }

  const baseClasses = `
    relative h-full bg-gray-50 dark:bg-gray-900 
    ${side === 'left' ? 'border-r' : 'border-l'} 
    border-gray-200 dark:border-gray-800
  `

  return (
    <div 
      ref={sidebarRef}
      style={{ width: `${width}px`, flexShrink: 0 }}
      className={`${baseClasses} ${className}`}
    >
      {children}
      
      {resizable && (
        <div
          className={`
            absolute top-0 ${side === 'left' ? 'right-0' : 'left-0'} 
            w-1 h-full cursor-col-resize 
            hover:bg-blue-500/50 active:bg-blue-500/70
            transition-colors z-10
            ${isResizing ? 'bg-blue-500/70' : ''}
          `}
          onMouseDown={handleMouseDown}
        >
          {/* Visual indicator when hovering */}
          <div className={`
            absolute top-1/2 ${side === 'left' ? 'right-1' : 'left-1'} 
            transform -translate-y-1/2
            w-1 h-8 bg-gray-400 dark:bg-gray-600 rounded-full
            opacity-0 hover:opacity-100 transition-opacity
          `} />
        </div>
      )}
    </div>
  )
}