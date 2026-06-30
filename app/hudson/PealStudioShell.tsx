'use client'

import { useEffect } from 'react'
import { AppShell } from 'hudsonkit/app-shell'
import { PlatformProvider, WEB_ADAPTER } from 'hudsonkit'
import { ThemeProvider } from 'hudsonkit/theme'
import { WorkspaceHostRoutesProvider, type WorkspaceHostRoutes } from 'hudsonkit/workspace'
import { pealStudioApp } from './peal-studio'
import '@/styles/studio-instruments.css'

const PEAL_HOST_ROUTES: WorkspaceHostRoutes = {
  aiChat: '/api/ai/chat',
}

export default function PealStudioShell() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.dataset.hudsonTheme = 'dark'
    document.documentElement.dataset.hudsonTemplate = 'hudson'
    return () => {
      document.documentElement.classList.remove('dark')
      delete document.documentElement.dataset.hudsonTheme
      delete document.documentElement.dataset.hudsonTemplate
    }
  }, [])

  return (
    <div
      className="peal-studio-shell h-full overflow-hidden bg-[#111113] text-gray-100 [--hud-accent:#4a9eff] [--hud-info:#4a9eff] [--hud-accent-soft:rgba(74,158,255,0.12)]"
      data-hudson-theme="dark"
      data-hudson-template="hudson"
    >
      <ThemeProvider defaultTheme="dark" defaultTemplate="hudson">
        <PlatformProvider adapter={WEB_ADAPTER}>
          <WorkspaceHostRoutesProvider routes={PEAL_HOST_ROUTES}>
            <AppShell app={pealStudioApp} managedTheme={false} />
          </WorkspaceHostRoutesProvider>
        </PlatformProvider>
      </ThemeProvider>
    </div>
  )
}
