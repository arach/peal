'use client'

import { useRef, useState } from 'react'
import { AppShell } from 'hudsonkit/app-shell'
import { PlatformProvider, WEB_ADAPTER } from 'hudsonkit'
import { ThemeProvider } from 'hudsonkit/theme'
import { WorkspaceHostRoutesProvider, type WorkspaceHostRoutes } from 'hudsonkit/workspace'
import { useSoundStore } from '@/store/soundStore'
import StudioThemeBridge from '@/components/StudioThemeBridge'
import { pealStudioApp } from './peal-studio'
import '@/styles/studio-instruments.css'

const PEAL_HOST_ROUTES: WorkspaceHostRoutes = {
  aiChat: '/api/ai/chat',
}

export default function PealStudioShell() {
  const shellRef = useRef<HTMLDivElement>(null)
  const [shellElement, setShellElement] = useState<HTMLDivElement | null>(null)
  const pealTheme = useSoundStore((state) => state.theme)

  return (
    <div
      ref={(node) => {
        shellRef.current = node
        setShellElement(node)
      }}
      className="peal-studio-shell relative h-full overflow-hidden [transform:translateZ(0)] [--hud-accent:#4a9eff] [--hud-info:#4a9eff] [--hud-accent-soft:rgba(74,158,255,0.12)]"
      data-hudson-template="hudson"
    >
      <StudioThemeBridge shellRef={shellRef} />
      {shellElement ? (
        <ThemeProvider
          defaultTheme={pealTheme}
          defaultTemplate="hudson"
          rootElement={shellElement}
        >
          <PlatformProvider adapter={WEB_ADAPTER}>
            <WorkspaceHostRoutesProvider routes={PEAL_HOST_ROUTES}>
              <AppShell
                app={pealStudioApp}
                managedTheme={false}
                chrome={{
                  nav: false,
                  panelBehavior: {
                    mode: 'auto',
                    centerMinWidth: 560,
                    inspectorPin: true,
                  },
                }}
              />
            </WorkspaceHostRoutesProvider>
          </PlatformProvider>
        </ThemeProvider>
      ) : null}
    </div>
  )
}
