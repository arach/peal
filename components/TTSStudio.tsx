"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Download, Copy, Trash2, FileAudio } from "lucide-react"
import { Waveform } from "@/components/waveform"
import { AudioControls } from "@/components/audio-controls"

interface GeneratedAudio {
  id: string
  script: string
  model: string
  voice: string
  speed: number
  filename: string
  duration: string
  createdAt: string
  audioUrl: string
}

export default function TTSStudio() {
  const [script, setScript] = useState("")
  const [selectedModel, setSelectedModel] = useState("tts-1")
  const [selectedVoice, setSelectedVoice] = useState("alloy")
  const [speed, setSpeed] = useState([1.0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [projectName, setProjectName] = useState("peal-tts-project")

  const audioRef = useRef<HTMLAudioElement>(null)

  const models = [
    { id: "tts-1", name: "OpenAI TTS-1", provider: "OpenAI", tier: "Standard" },
    { id: "tts-1-hd", name: "OpenAI TTS-1 HD", provider: "OpenAI", tier: "Premium" },
    { id: "playai-tts", name: "Groq PlayAI TTS (English)", provider: "Groq", tier: "Fast" },
    { id: "playai-tts-arabic", name: "Groq PlayAI TTS (Arabic)", provider: "Groq", tier: "Fast" },
  ]

  const voices = {
    "tts-1": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    "tts-1-hd": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    "playai-tts": ["Fritz-PlayAI", "Arista-PlayAI", "Atlas-PlayAI", "Basil-PlayAI", "Briggs-PlayAI", "Calum-PlayAI", "Celeste-PlayAI", "Cheyenne-PlayAI", "Chip-PlayAI", "Cillian-PlayAI", "Deedee-PlayAI", "Gail-PlayAI", "Indigo-PlayAI", "Mamaw-PlayAI", "Mason-PlayAI", "Mikail-PlayAI", "Mitch-PlayAI", "Quinn-PlayAI", "Thunder-PlayAI"],
    "playai-tts-arabic": ["Ahmad-PlayAI", "Amira-PlayAI", "Hani-PlayAI", "Layla-PlayAI"],
  }

  const generateFilename = (script: string, model: string, voice: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
    const scriptHash = script
      .slice(0, 20)
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
    return `${projectName}_${model}_${voice}_${scriptHash}_${timestamp}.mp3`
  }

  const handleGenerate = async () => {
    if (!script.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script.trim(),
          voice: selectedVoice,
          model: selectedModel,
          speed: speed[0],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Generation failed")
      }

      const data = await response.json()

      // Create audio blob from base64
      const audioBlob = new Blob([Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))], {
        type: data.mimeType,
      })
      const audioUrl = URL.createObjectURL(audioBlob)

      const filename = generateFilename(script, selectedModel, selectedVoice)

      const newAudio: GeneratedAudio = {
        id: Date.now().toString(),
        script: script.trim(),
        model: selectedModel,
        voice: selectedVoice,
        speed: speed[0],
        filename,
        duration: "0:45", // This would come from actual audio analysis
        createdAt: new Date().toLocaleString(),
        audioUrl,
      }

      setGeneratedAudios((prev) => [newAudio, ...prev])
      setScript("")
    } catch (error) {
      console.error("Generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = (audioUrl: string, id: string) => {
    if (currentlyPlaying === id) {
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setCurrentlyPlaying(id)
      }
    }
  }

  const handleDownload = (audio: GeneratedAudio) => {
    const link = document.createElement("a")
    link.href = audio.audioUrl
    link.download = audio.filename
    link.click()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const deleteAudio = (id: string) => {
    setGeneratedAudios((prev) => prev.filter((audio) => audio.id !== id))
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null)
      audioRef.current?.pause()
    }
  }

  return (
    <div className="flex-1 flex bg-gray-950">
      {/* Left Sidebar - Generated Files */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 p-6">
        <div className="space-y-4">
          <h2 className="text-sm font-light text-gray-300 tracking-wide">GENERATED FILES</h2>
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800/50 rounded-sm backdrop-blur-sm">
            {generatedAudios.length === 0 ? (
              <div className="p-12 text-center">
                <FileAudio className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-sm text-gray-500 font-light">No recordings yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50 max-h-96 overflow-y-auto">
                {generatedAudios.map((audio) => (
                  <div key={audio.id} className="p-5 hover:bg-black/20 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-blue-400 truncate font-extralight">{audio.filename}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400 font-mono">{audio.model}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-400 font-mono">{audio.voice}</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-400 font-mono">{audio.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-300 line-clamp-2 mb-3 font-light leading-relaxed">
                        {audio.script}
                      </p>
                      <Waveform isPlaying={currentlyPlaying === audio.id} audioUrl={audio.audioUrl} className="h-8" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-mono">{audio.createdAt}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(audio)}
                            className="h-7 w-7 p-0 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(audio.filename)}
                            className="h-7 w-7 p-0 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-sm"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteAudio(audio.id)}
                            className="h-7 w-7 p-0 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <AudioControls
                        audioUrl={audio.audioUrl}
                        isPlaying={currentlyPlaying === audio.id}
                        onPlayPause={() => handlePlay(audio.audioUrl, audio.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Project Configuration */}
          <div className="space-y-4">
            <h2 className="text-sm font-light text-gray-300 tracking-wide">PROJECT</h2>
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800/50 rounded-sm backdrop-blur-sm">
              <div className="p-6">
                <Label htmlFor="project-name" className="text-xs text-gray-400 uppercase tracking-widest font-light">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-3 bg-black/40 border-gray-700/50 text-white font-mono text-sm font-extralight focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  placeholder="peal-tts-project"
                />
              </div>
            </div>
          </div>

          {/* Script Input */}
          <div className="space-y-4">
            <h2 className="text-sm font-light text-gray-300 tracking-wide">SCRIPT</h2>
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800/50 rounded-sm backdrop-blur-sm">
              <div className="p-6">
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Enter your script here..."
                  className="min-h-40 bg-black/40 border-gray-700/50 text-white font-mono text-sm font-extralight resize-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  rows={10}
                />
              </div>
              {isGenerating && (
                <div className="border-t border-gray-800/50 p-6 bg-black/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">
                      Generating Audio
                    </span>
                  </div>
                  <Waveform isGenerating={true} className="h-16" />
                </div>
              )}
              <div className="border-t border-gray-800/50 px-6 py-3 bg-black/20">
                <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                  <span>{script.length} characters</span>
                  <span>~{Math.ceil(script.length / 200)}s estimated</span>
                </div>
              </div>
              <div className="border-t border-gray-800/50 p-6">
                <Button
                  onClick={handleGenerate}
                  disabled={!script.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-light h-11 rounded-sm shadow-lg shadow-blue-500/20 transition-all duration-200"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    "Generate Audio"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} className="hidden" />
      </div>

      {/* Right Sidebar - Configuration */}
      <div className="w-80 bg-gray-900 border-l border-gray-800 p-6">
        <div className="space-y-4">
          <h2 className="text-sm font-light text-gray-300 tracking-wide">CONFIGURATION</h2>
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800/50 rounded-sm backdrop-blur-sm">
            <div className="p-6 space-y-6">
              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-widest font-light">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
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
                        <div className="flex flex-col items-start">
                          <span>{model.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">{model.provider}</span>
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs font-light px-1.5 py-0">
                              {model.tier}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-widest font-light">Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="mt-3 bg-black/40 border-gray-700/50 text-white font-mono text-sm font-extralight h-10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700/50 rounded-sm">
                    {voices[selectedModel as keyof typeof voices]?.map((voice) => (
                      <SelectItem
                        key={voice}
                        value={voice}
                        className="text-white font-mono text-sm font-extralight focus:bg-gray-800"
                      >
                        {voice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-widest font-light">
                  Speed: {speed[0]}x
                </Label>
                <div className="mt-4">
                  <Slider value={speed} onValueChange={setSpeed} max={2} min={0.25} step={0.25} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}