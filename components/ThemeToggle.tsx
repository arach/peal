'use client'

import { useEffect, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useSoundStore } from '@/store/soundStore'
import { Check, ChevronDown, Sun, Moon, Monitor } from 'lucide-react'
import { useResolvedPealTheme } from '@/hooks/useResolvedPealTheme'

const themes = [
  { id: 'light' as const, label: 'Light', icon: Sun },
  { id: 'dark' as const, label: 'Dark', icon: Moon },
  { id: 'system' as const, label: 'System', icon: Monitor },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useSoundStore()
  const resolvedTheme = useResolvedPealTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="peal-theme-toggle" aria-hidden="true">
        <span className="peal-theme-trigger">
          <Monitor size={14} strokeWidth={1.75} />
          <ChevronDown className="peal-theme-trigger-chevron" size={10} strokeWidth={1.75} />
        </span>
      </div>
    )
  }

  const activeTheme = themes.find(({ id }) => id === theme) ?? themes[2]
  const ActiveThemeIcon = activeTheme.icon

  return (
    <div className="peal-theme-toggle">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="peal-theme-trigger"
            aria-label={`Color theme: ${activeTheme.label}`}
            title={`Theme: ${activeTheme.label}`}
          >
            <ActiveThemeIcon aria-hidden="true" size={14} strokeWidth={1.75} />
            <ChevronDown
              aria-hidden="true"
              className="peal-theme-trigger-chevron"
              size={10}
              strokeWidth={1.75}
            />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            collisionPadding={8}
            className="peal-theme-menu"
            data-peal-theme={resolvedTheme}
          >
            <DropdownMenu.Label className="peal-theme-menu-label">
              Appearance
            </DropdownMenu.Label>
            <DropdownMenu.RadioGroup
              value={theme}
              onValueChange={(value) => {
                const nextTheme = themes.find(({ id }) => id === value)
                if (nextTheme) setTheme(nextTheme.id)
              }}
            >
              {themes.map(({ id, label, icon: Icon }) => (
                <DropdownMenu.RadioItem
                  key={id}
                  value={id}
                  className="peal-theme-option"
                >
                  <Icon aria-hidden="true" size={14} strokeWidth={1.75} />
                  <span>{label}</span>
                  <DropdownMenu.ItemIndicator className="peal-theme-option-indicator">
                    <Check aria-hidden="true" size={13} strokeWidth={2} />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
