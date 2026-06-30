'use client'

import { useEffect, useRef, useState } from 'react'
import { AiDesignIcon, ParametersIcon } from '@/components/icons/PealStudioIcon'
import { StudioModuleTabs } from '@/components/studio/StudioInstruments'
import { PealVoiceAIDesign } from './PealVoiceAIDesign'
import { PealVoiceConfig } from './PealVoiceConfig'
import { usePealVoice } from './PealVoiceProvider'

type InspectorTab = 'ai' | 'capture'

export function PealVoiceInspector() {
  const voice = usePealVoice()
  const [tab, setTab] = useState<InspectorTab>(() => (voice.takes.length > 0 ? 'ai' : 'capture'))
  const hadClipsRef = useRef(voice.takes.length > 0)

  useEffect(() => {
    if (!hadClipsRef.current && voice.takes.length > 0) {
      setTab('ai')
      hadClipsRef.current = true
    }
  }, [voice.takes.length])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-gray-300">
      <div className="shrink-0 peal-instruments">
        <StudioModuleTabs
          activeId={tab}
          onChange={(id) => setTab(id as InspectorTab)}
          tabs={[
            { id: 'ai', label: 'AI Edit', icon: <AiDesignIcon size={12} /> },
            { id: 'capture', label: 'Capture', icon: <ParametersIcon size={12} /> },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'ai' ? <PealVoiceAIDesign /> : <PealVoiceConfig />}
      </div>
    </div>
  )
}