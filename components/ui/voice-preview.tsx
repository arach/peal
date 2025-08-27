"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pause, Volume2 } from "lucide-react"

interface VoicePreviewProps {
  voice: string
  model: string
  className?: string
}

export function VoicePreview({ voice, model, className }: VoicePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePreview = async () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    setIsLoading(true)

    try {
      // Generate a short preview with the selected voice
      const previewText = `Hello, this is a preview of the ${voice} voice.`

      let response
      if (model.startsWith("groq-")) {
        response = await fetch("/api/groq-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: previewText,
            voice: voice,
            model: model,
            speed: 1.0,
          }),
        })
      } else {
        response = await fetch("/api/generate-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: previewText,
            voice: voice,
            model: model,
            speed: 1.0,
          }),
        })
      }

      if (response.ok) {
        const data = await response.json()
        // Create and play audio
        const audioBlob = new Blob([Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))], {
          type: data.mimeType,
        })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }

        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Voice preview failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handlePreview}
      disabled={isLoading}
      className={`h-6 w-6 p-0 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-sm ${className}`}
    >
      {isLoading ? (
        <div className="w-3 h-3 border border-gray-400 border-t-blue-400 rounded-full animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-3 h-3" />
      ) : (
        <Volume2 className="w-3 h-3" />
      )}
    </Button>
  )
}