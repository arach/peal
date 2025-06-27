'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Shuffle, Hash, Download } from 'lucide-react'

interface DropdownItem {
  icon: React.ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  className?: string
}

interface SoundCardDropdownProps {
  items: DropdownItem[]
}

export default function SoundCardDropdown({ items }: SoundCardDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-8 h-8 bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 text-text-primary dark:text-gray-100 rounded transition-all hover:bg-background-tertiary dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        title="More actions"
      >
        <MoreVertical size={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-xl z-20">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                item.onClick(e)
                setIsOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-sm text-left
                text-text-primary dark:text-gray-100 
                hover:bg-background-tertiary dark:hover:bg-gray-700
                transition-colors
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === items.length - 1 ? 'rounded-b-lg' : ''}
                ${item.className || ''}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}