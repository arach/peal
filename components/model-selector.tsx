"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Zap, Brain, Mic } from "lucide-react"

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  models: Array<{
    id: string
    name: string
    provider: string
    tier: string
  }>
}

export function ModelSelector({ value, onValueChange, models }: ModelSelectorProps) {
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "groq":
        return <Zap className="w-3 h-3 text-orange-400" />
      case "openai":
        return <Brain className="w-3 h-3 text-green-400" />
      case "elevenlabs":
        return <Mic className="w-3 h-3 text-purple-400" />
      default:
        return <Brain className="w-3 h-3 text-gray-400" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "ultra-fast":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "fast":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "premium":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "advanced":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div>
      <Label className="text-xs text-gray-400 uppercase tracking-widest font-light">Model</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="mt-3 bg-black/40 border-gray-700/50 text-white font-mono text-sm font-extralight h-10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700/50 rounded-sm">
          {models.map((model) => (
            <SelectItem
              key={model.id}
              value={model.id}
              className="text-white font-mono text-sm font-extralight focus:bg-gray-800"
            >
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-2 w-full">
                  {getProviderIcon(model.provider)}
                  <span className="flex-1">{model.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 w-full">
                  <span className="text-xs text-gray-400">{model.provider}</span>
                  <Badge className={`text-xs font-light px-1.5 py-0 ${getTierColor(model.tier)}`}>{model.tier}</Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}