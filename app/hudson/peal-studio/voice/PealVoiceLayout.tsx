'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { GridIcon, LayersIcon, LayoutIcon } from '@/components/icons/PealStudioIcon'
import { StudioModuleTabs, StudioPad, StudioPadTray } from '@/components/studio/StudioInstruments'
import { PealFxDesigner } from './PealFxDesigner'
import { PealVoiceConfig } from './PealVoiceConfig'
import {
  DEFAULT_VOICE_LAYOUT,
  VOICE_CENTER_MODULE_LABELS,
  loadVoiceLayout,
  saveVoiceLayout,
  type VoiceCenterModuleId,
  type VoiceLayoutMode,
  type VoiceLayoutState,
} from './voiceLayout'

interface PealVoiceLayoutContextValue extends VoiceLayoutState {
  setMode: (mode: VoiceLayoutMode) => void
  setActiveTab: (tab: VoiceCenterModuleId) => void
  setTileLeft: (module: VoiceCenterModuleId) => void
  setTileRight: (module: VoiceCenterModuleId) => void
  setTileRatio: (ratio: number) => void
}

const CENTER_MODULES = Object.keys(VOICE_CENTER_MODULE_LABELS) as VoiceCenterModuleId[]

const PealVoiceLayoutContext = createContext<PealVoiceLayoutContextValue | null>(null)

export function PealVoiceLayoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VoiceLayoutState>(DEFAULT_VOICE_LAYOUT)

  useEffect(() => {
    setState(loadVoiceLayout())
  }, [])

  useEffect(() => {
    saveVoiceLayout(state)
  }, [state])

  const patch = useCallback((next: Partial<VoiceLayoutState>) => {
    setState((prev) => ({ ...prev, ...next }))
  }, [])

  const value = useMemo<PealVoiceLayoutContextValue>(() => ({
    ...state,
    setMode: (mode) => patch({ mode }),
    setActiveTab: (activeTab) => patch({ activeTab }),
    setTileLeft: (tileLeft) => patch({ tileLeft }),
    setTileRight: (tileRight) => patch({ tileRight }),
    setTileRatio: (tileRatio) => patch({ tileRatio: Math.min(0.72, Math.max(0.28, tileRatio)) }),
  }), [patch, state])

  return (
    <PealVoiceLayoutContext.Provider value={value}>
      {children}
    </PealVoiceLayoutContext.Provider>
  )
}

export function usePealVoiceLayout() {
  const context = useContext(PealVoiceLayoutContext)
  if (!context) {
    throw new Error('usePealVoiceLayout must be used inside PealVoiceLayoutProvider')
  }
  return context
}

export function useOptionalPealVoiceLayout() {
  return useContext(PealVoiceLayoutContext)
}

function VoiceCenterModule({ moduleId }: { moduleId: VoiceCenterModuleId }) {
  switch (moduleId) {
    case 'fx':
      return <PealFxDesigner />
    case 'capture':
      return <PealVoiceConfig />
    default:
      return null
  }
}

function TileModuleSelect({
  value,
  onChange,
  label,
}: {
  value: VoiceCenterModuleId
  onChange: (id: VoiceCenterModuleId) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-gray-500">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as VoiceCenterModuleId)}
        className="peal-inst-select !py-1 !text-[9px]"
      >
        {CENTER_MODULES.map((id) => (
          <option key={id} value={id}>{VOICE_CENTER_MODULE_LABELS[id]}</option>
        ))}
      </select>
    </label>
  )
}

export function PealVoiceLayoutBar() {
  const layout = usePealVoiceLayout()

  const tabItems = CENTER_MODULES.map((id) => ({
    id,
    label: VOICE_CENTER_MODULE_LABELS[id],
  }))

  return (
    <div className="shrink-0 border-b border-[var(--inst-line-lo)] bg-[#0d0d0f] peal-instruments">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <span className="peal-inst-rack-label mr-1">Center</span>
        <StudioPadTray>
          <StudioPad
            active={layout.mode === 'panels'}
            onClick={() => layout.setMode('panels')}
            className="!text-[9px]"
            title="Mixer only in center — deck left, AI edit right"
          >
            <LayoutIcon size={11} />
            Single
          </StudioPad>
          <StudioPad
            active={layout.mode === 'tabs'}
            onClick={() => layout.setMode('tabs')}
            className="!text-[9px]"
            title="Tab the center panel between FX and capture"
          >
            <LayersIcon size={11} />
            Tabs
          </StudioPad>
          <StudioPad
            active={layout.mode === 'tile'}
            onClick={() => layout.setMode('tile')}
            className="!text-[9px]"
            title="Split the center panel — side panels stay put"
          >
            <GridIcon size={11} />
            Tile
          </StudioPad>
        </StudioPadTray>

        <p className="hidden font-mono text-[9px] text-gray-600 sm:block">
          Deck · AI edit panels stay open
        </p>

        {layout.mode === 'tabs' ? (
          <div className="min-w-0 flex-1">
            <StudioModuleTabs
              activeId={layout.activeTab}
              onChange={(id) => layout.setActiveTab(id as VoiceCenterModuleId)}
              tabs={tabItems}
            />
          </div>
        ) : null}

        {layout.mode === 'tile' ? (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <TileModuleSelect value={layout.tileLeft} onChange={layout.setTileLeft} label="Left" />
            <span className="font-mono text-[9px] text-gray-600">|</span>
            <TileModuleSelect value={layout.tileRight} onChange={layout.setTileRight} label="Right" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function PealVoiceTileWorkspace() {
  const layout = usePealVoiceLayout()
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!dragging) return

    const onMove = (event: MouseEvent) => {
      const root = document.getElementById('peal-voice-tile-root')
      if (!root) return
      const rect = root.getBoundingClientRect()
      const ratio = (event.clientX - rect.left) / rect.width
      layout.setTileRatio(ratio)
    }

    const onUp = () => {
      setDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [dragging, layout])

  const leftWidth = `${(layout.tileRatio * 100).toFixed(1)}%`

  return (
    <div id="peal-voice-tile-root" className="peal-voice-tile-root min-h-0 flex-1">
      <div className="peal-voice-tile-pane" style={{ width: leftWidth }}>
        <VoiceCenterModule moduleId={layout.tileLeft} />
      </div>
      <button
        type="button"
        aria-label="Resize tiles"
        className={`peal-voice-tile-divider${dragging ? ' peal-voice-tile-divider--active' : ''}`}
        onMouseDown={() => setDragging(true)}
      />
      <div className="peal-voice-tile-pane min-w-0 flex-1">
        <VoiceCenterModule moduleId={layout.tileRight} />
      </div>
    </div>
  )
}

export function PealVoiceWorkspace() {
  const layout = usePealVoiceLayout()

  if (layout.mode === 'panels') {
    return <PealFxDesigner />
  }

  if (layout.mode === 'tile') {
    return <PealVoiceTileWorkspace />
  }

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <VoiceCenterModule moduleId={layout.activeTab} />
    </div>
  )
}