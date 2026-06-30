/** AppShell side panel defaults — mirrors hudsonkit AppShellLayoutConfig. */
export type PealStudioShellLayout = {
  leftWidth?: number
  rightWidth?: number
  minPanelWidth?: number
  maxPanelWidth?: number
  left?: { min?: number; max?: number }
  right?: { min?: number; max?: number }
}

/** Wider defaults — code editor left, AI conversation right. */
export const PEAL_STUDIO_SHELL_LAYOUT: PealStudioShellLayout = {
  leftWidth: 420,
  rightWidth: 400,
  minPanelWidth: 280,
  maxPanelWidth: 640,
  left: { min: 320, max: 640 },
  right: { min: 300, max: 560 },
}

export const PEAL_STUDIO_LAYOUT_MIGRATION_KEY = 'peal-studio.shell-layout.v2'