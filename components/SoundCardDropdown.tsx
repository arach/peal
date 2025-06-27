'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Shuffle, Hash, Download } from 'lucide-react'

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
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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
    
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // If not enough space below but more space above, show dropdown above
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
    
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
        title="More actions"
      >
        <MoreVertical size={14} />
      </button>

      <div className={`
        absolute right-0 z-50 w-48
        ${dropdownPosition === 'bottom' ? 'mt-2' : 'bottom-full mb-2'}
        transition-all duration-200 origin-top-right
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}>
        <div 
          ref={menuRef}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden"
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
      </div>
    </div>
  )
}