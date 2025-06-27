'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Shuffle, Hash, Download } from 'lucide-react'
import { createPortal } from 'react-dom'

interface DropdownItem {
  icon: React.ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  className?: string
  divider?: boolean
}

interface SoundCardDropdownProps {
  items: DropdownItem[]
}

export default function SoundCardDropdown({ items }: SoundCardDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 192 // w-48 = 12rem = 192px
      const dropdownHeight = items.length * 44 + 16 // approximate height
      
      let top = rect.bottom + 8
      let left = rect.right - dropdownWidth
      
      // Check if dropdown would go off screen bottom
      if (top + dropdownHeight > window.innerHeight - 20) {
        top = rect.top - dropdownHeight - 8
      }
      
      // Check if dropdown would go off screen left
      if (left < 10) {
        left = 10
      }
      
      setDropdownPosition({ top, left })
    }
  }, [isOpen, items.length])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const dropdownContent = isOpen && mounted && (
    <div 
      ref={dropdownRef}
      className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl shadow-black/20 dark:shadow-black/40 overflow-hidden"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        zIndex: 9999,
      }}
    >
      {items.map((item, index) => (
        <div key={index}>
          {item.divider && index > 0 && (
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              item.onClick(e)
              setIsOpen(false)
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
              text-gray-700 dark:text-gray-100 
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-all duration-150
              ${index === 0 && !item.divider ? 'rounded-t-lg' : ''}
              ${index === items.length - 1 ? 'rounded-b-lg' : ''}
              ${item.className || ''}
            `}
          >
            <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
        title="More actions"
      >
        <MoreVertical size={14} />
      </button>
      {mounted && createPortal(dropdownContent, document.body)}
    </>
  )
}