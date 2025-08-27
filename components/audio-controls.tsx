"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioControlsProps {
  audioUrl: string
  isPlaying: boolean
  onPlayPause: () => void
  className?: string
}

export function AudioControls({ audioUrl, isPlaying, onPlayPause, className }: AudioControlsProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([0.8])
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", onPlayPause)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", onPlayPause)
    }
  }, [onPlayPause])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0]
    }
  }, [volume, isMuted])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-black/20 rounded-sm border border-gray-800/30", className)}>
      <audio ref={audioRef} src={audioUrl} />

      <Button
        size="sm"
        variant="ghost"
        onClick={onPlayPause}
        className="h-8 w-8 p-0 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-sm"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-500 font-mono w-10">{formatTime(currentTime)}</span>
        <Slider value={[currentTime]} onValueChange={handleSeek} max={duration || 100} step={1} className="flex-1" />
        <span className="text-xs text-gray-500 font-mono w-10">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsMuted(!isMuted)}
          className="h-6 w-6 p-0 hover:bg-gray-800/50 text-gray-400 hover:text-white rounded-sm"
        >
          {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </Button>
        <Slider value={volume} onValueChange={setVolume} max={1} step={0.1} className="w-16" />
      </div>
    </div>
  )
}