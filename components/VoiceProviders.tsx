'use client'

import { useState, useEffect } from 'react'
import { Key, Check, X, Eye, EyeOff, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Provider {
  id: string
  name: string
  logo?: string
  envKey: string
  configured: boolean
  models: string[]
  description: string
}

export default function VoiceProviders() {
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: 'openai',
      name: 'OpenAI',
      envKey: 'OPENAI_API_KEY',
      configured: false,
      models: ['tts-1', 'tts-1-hd'],
      description: 'High-quality text-to-speech with natural sounding voices'
    },
    {
      id: 'groq',
      name: 'Groq',
      envKey: 'GROQ_API_KEY',
      configured: false,
      models: ['playai-tts', 'playai-tts-arabic'],
      description: 'Ultra-fast inference with PlayAI voices'
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      envKey: 'ELEVENLABS_API_KEY',
      configured: false,
      models: ['eleven_turbo_v2', 'eleven_multilingual_v2'],
      description: 'Advanced voice synthesis with voice cloning capabilities'
    },
    {
      id: 'fal',
      name: 'fal.ai',
      envKey: 'FAL_API_KEY',
      configured: false,
      models: ['bark', 'tortoise-tts', 'metavoice'],
      description: 'Serverless AI models with fast inference and realistic voices'
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      envKey: 'HUGGINGFACE_API_KEY',
      configured: false,
      models: ['facebook/mms-tts', 'microsoft/speecht5', 'suno/bark'],
      description: 'Open-source models with diverse voice options and languages'
    }
  ])

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [dialogOpen, setDialogOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check configuration status from API
    checkProviderStatus()
  }, [])

  const checkProviderStatus = async () => {
    try {
      const response = await fetch('/api/check-providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(prev => prev.map(provider => ({
          ...provider,
          configured: data[provider.envKey] || false
        })))
      }
    } catch (error) {
      console.error('Failed to check provider status:', error)
    }
  }

  const handleSaveKey = async (providerId: string, envKey: string) => {
    const key = apiKeys[providerId]
    if (!key) return

    try {
      const response = await fetch('/api/save-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envKey, apiKey: key })
      })

      if (response.ok) {
        setProviders(prev => prev.map(provider => 
          provider.id === providerId ? { ...provider, configured: true } : provider
        ))
        setDialogOpen(prev => ({ ...prev, [providerId]: false }))
        setApiKeys(prev => ({ ...prev, [providerId]: '' }))
      }
    } catch (error) {
      console.error('Failed to save API key:', error)
    }
  }

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return (
          <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
            <span className="text-white dark:text-black font-bold text-xs">AI</span>
          </div>
        )
      case 'groq':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">G</span>
          </div>
        )
      case 'elevenlabs':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">11</span>
          </div>
        )
      case 'fal':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">fal</span>
          </div>
        )
      case 'huggingface':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">🤗</span>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">?</span>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Voice Providers</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure API keys for TTS providers</p>
      </div>

      <div className="grid gap-4">
        {providers.map(provider => (
          <div 
            key={provider.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-4">
              {getProviderIcon(provider.id)}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{provider.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{provider.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {provider.models.map(model => (
                    <span 
                      key={model}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {provider.configured ? (
                  <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <Check size={16} />
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <X size={16} />
                    Not configured
                  </span>
                )}
              </div>

              <Dialog 
                open={dialogOpen[provider.id] || false}
                onOpenChange={(open) => setDialogOpen(prev => ({ ...prev, [provider.id]: open }))}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings size={14} />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configure {provider.name}</DialogTitle>
                    <DialogDescription>
                      Enter your API key for {provider.name}. This will be stored securely in your environment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`key-${provider.id}`}>API Key</Label>
                      <div className="relative">
                        <Input
                          id={`key-${provider.id}`}
                          type={showKeys[provider.id] ? 'text' : 'password'}
                          placeholder={`Enter your ${provider.name} API key`}
                          value={apiKeys[provider.id] || ''}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showKeys[provider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Environment variable: {provider.envKey}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setDialogOpen(prev => ({ ...prev, [provider.id]: false }))}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleSaveKey(provider.id, provider.envKey)}
                        disabled={!apiKeys[provider.id]}
                      >
                        Save Key
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}