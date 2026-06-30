import { createElement } from 'react'
import type { AppManifest, HudsonApp } from 'hudsonkit'
import { CodeIcon, ParametersIcon, VolumeIcon } from '@/components/icons/PealStudioIcon'
import { PealStudioProvider } from './Provider'
import { PealStudioContent } from './Content'
import { PealStudioLeftPanel } from './LeftPanel'
import { PealStudioInspector } from './Inspector'
import {
  usePealStudioCommands,
  usePealStudioLayoutMode,
  usePealStudioNavActions,
  usePealStudioNavCenter,
  usePealStudioStatus,
  usePealStudioStatusLeft,
  usePealStudioStatusRight,
} from './hooks'
import { pealStudioIntents } from './intents'
import { PEAL_STUDIO_SHELL_LAYOUT } from './layout'

const pealStudioManifest: AppManifest = {
  id: 'peal-studio',
  name: 'Sound Studio',
  description: 'Design UI sounds with live Web Audio API code and AI',
  mode: 'panel',
  commands: [
    { id: 'peal-studio:play', label: 'Play sound', shortcut: 'Space' },
    { id: 'peal-studio:pause', label: 'Pause sound' },
    { id: 'peal-studio:save', label: 'Save project', shortcut: 'Cmd+S' },
    { id: 'peal-studio:open-library', label: 'Open Library' },
    { id: 'peal-studio:switch-sfx', label: 'Switch tool: SFX' },
    { id: 'peal-studio:switch-voice', label: 'Switch tool: Voice' },
  ],
}

export const pealStudioApp: HudsonApp = {
  id: 'peal-studio',
  name: 'Sound Studio',
  description: 'Design UI sounds with live Web Audio API code and AI',
  mode: 'panel',
  multiInstance: 'singleton',
  icon: createElement(VolumeIcon, { size: 12, color: '#4a9eff' }),
  manifest: pealStudioManifest,
  intents: pealStudioIntents,
  leftPanel: {
    title: 'Web Audio',
    icon: createElement(CodeIcon, { size: 12 }),
  },
  rightPanel: {
    title: 'Parameters',
    icon: createElement(ParametersIcon, { size: 12 }),
  },
  layout: PEAL_STUDIO_SHELL_LAYOUT,
  Provider: PealStudioProvider,
  slots: {
    LeftPanel: PealStudioLeftPanel,
    Content: PealStudioContent,
    Inspector: PealStudioInspector,
  },
  hooks: {
    useCommands: usePealStudioCommands,
    useStatus: usePealStudioStatus,
    useStatusLeft: usePealStudioStatusLeft,
    useStatusRight: usePealStudioStatusRight,
    useNavCenter: usePealStudioNavCenter,
    useNavActions: usePealStudioNavActions,
    useLayoutMode: usePealStudioLayoutMode,
  },
}
