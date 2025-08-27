"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Waveform } from "@/components/ui/waveform"
import { cn } from "@/lib/utils"

interface GenerationProgressProps {
  isGenerating: boolean
  script: string
  model: string
  voice: string
  className?: string
}

export function GenerationProgress({ isGenerating, script, model, voice, className }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("Initializing...")

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0)
      setStage("Initializing...")
      return
    }

    const stages = [
      { progress: 20, stage: "Processing script..." },
      { progress: 40, stage: "Loading model..." },
      { progress: 60, stage: "Synthesizing audio..." },
      { progress: 80, stage: "Applying voice..." },
      { progress: 95, stage: "Finalizing..." },
      { progress: 100, stage: "Complete!" },
    ]

    let currentStageIndex = 0
    const interval = setInterval(() => {
      if (currentStageIndex < stages.length) {
        const currentStage = stages[currentStageIndex]
        setProgress(currentStage.progress)
        setStage(currentStage.stage)
        currentStageIndex++
      } else {
        clearInterval(interval)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [isGenerating])

  if (!isGenerating) return null

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">{stage}</span>
        </div>
        <span className="text-xs text-gray-500 font-mono">{progress}%</span>
      </div>

      <Progress value={progress} className="h-1" />

      <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 font-mono">
        <div>
          <span className="text-gray-400">Model:</span> {model}
        </div>
        <div>
          <span className="text-gray-400">Voice:</span> {voice}
        </div>
        <div>
          <span className="text-gray-400">Length:</span> {script.length} chars
        </div>
      </div>

      <Waveform isGenerating={true} className="h-16" />
    </div>
  )
}