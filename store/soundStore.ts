import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sound {
  id: string
  type: 'tone' | 'chime' | 'click' | 'sweep' | 'pulse'
  duration: number
  frequency: number
  brightness: number
  created: Date
  favorite: boolean
  tags: string[]
  parameters: any
  waveformData: number[] | null
  audioBuffer: AudioBuffer | null
}

export interface SoundFilters {
  type: string[]
  favoriteOnly: boolean
  tags: string[]
  durationMin: number
  durationMax: number
  frequencyMin: number
  frequencyMax: number
}

interface SoundState {
  // Sound data
  sounds: Sound[]
  selectedSounds: Set<string>
  focusedIndex: number
  currentlyPlaying: string | null
  
  // UI state
  isGenerating: boolean
  generationProgress: number
  generationStatus: string
  showDetailModal: boolean
  detailSoundId: string | null
  showShortcuts: boolean
  showEditorModal: boolean
  editorSoundId: string | null
  showGenerationParams: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Filters and sorting
  filters: SoundFilters
  sortBy: 'creation' | 'duration' | 'frequency' | 'brightness' | 'type'
  
  // Generation parameters
  generationParams: {
    durationMin: number
    durationMax: number
    frequencyMin: number
    frequencyMax: number
    enabledTypes: string[]
    enabledEffects: string[]
  }
  
  // Actions
  addSounds: (sounds: Sound[]) => void
  updateSound: (id: string, updates: Partial<Sound>) => void
  removeSound: (id: string) => void
  removeSelectedSounds: () => void
  toggleSelection: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  toggleFavorite: (id: string) => void
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  setFocusedIndex: (index: number) => void
  setCurrentlyPlaying: (id: string | null) => void
  
  // Generation
  setGenerating: (generating: boolean) => void
  setGenerationProgress: (progress: number) => void
  setGenerationStatus: (status: string) => void
  updateGenerationParams: (params: Partial<SoundState['generationParams']>) => void
  
  // Modal controls
  showDetail: (id: string) => void
  hideDetail: () => void
  showEditor: (id: string) => void
  hideEditor: () => void
  toggleShortcuts: () => void
  toggleGenerationParams: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Filters
  updateFilters: (filters: Partial<SoundFilters>) => void
  setSortBy: (sortBy: SoundState['sortBy']) => void
  
  // Computed
  filteredSounds: () => Sound[]
  selectedCount: () => number
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      // Initial state
      sounds: [],
      selectedSounds: new Set(),
      focusedIndex: -1,
      currentlyPlaying: null,
      
      isGenerating: false,
      generationProgress: 0,
      generationStatus: '',
      showDetailModal: false,
      detailSoundId: null,
      showShortcuts: false,
      showEditorModal: false,
      editorSoundId: null,
      showGenerationParams: false,
      theme: 'system',
      
      filters: {
        type: [],
        favoriteOnly: false,
        tags: [],
        durationMin: 0,
        durationMax: 5000,
        frequencyMin: 0,
        frequencyMax: 5000,
      },
      sortBy: 'creation',
      
      generationParams: {
        durationMin: 200,
        durationMax: 1500,
        frequencyMin: 200,
        frequencyMax: 2000,
        enabledTypes: ['tone', 'chime', 'click', 'sweep', 'pulse'],
        enabledEffects: [],
      },
      
      // Actions
      addSounds: (newSounds) => set((state) => ({
        sounds: [...state.sounds, ...newSounds]
      })),
      
      updateSound: (id, updates) => set((state) => ({
        sounds: state.sounds.map(sound =>
          sound.id === id ? { ...sound, ...updates } : sound
        )
      })),
      
      removeSound: (id) => set((state) => {
        const newSelectedSounds = new Set(state.selectedSounds)
        newSelectedSounds.delete(id)
        return {
          sounds: state.sounds.filter(s => s.id !== id),
          selectedSounds: newSelectedSounds
        }
      }),
      
      removeSelectedSounds: () => set((state) => {
        const selectedIds = Array.from(state.selectedSounds)
        return {
          sounds: state.sounds.filter(s => !selectedIds.includes(s.id)),
          selectedSounds: new Set(),
          focusedIndex: -1
        }
      }),
      
      toggleSelection: (id) => set((state) => {
        const newSelectedSounds = new Set(state.selectedSounds)
        if (newSelectedSounds.has(id)) {
          newSelectedSounds.delete(id)
        } else {
          newSelectedSounds.add(id)
        }
        return { selectedSounds: newSelectedSounds }
      }),
      
      selectAll: () => set((state) => ({
        selectedSounds: new Set(state.sounds.map(s => s.id))
      })),
      
      clearSelection: () => set(() => ({
        selectedSounds: new Set()
      })),
      
      toggleFavorite: (id) => set((state) => ({
        sounds: state.sounds.map(sound =>
          sound.id === id ? { ...sound, favorite: !sound.favorite } : sound
        )
      })),
      
      addTag: (id, tag) => set((state) => ({
        sounds: state.sounds.map(sound =>
          sound.id === id 
            ? { ...sound, tags: [...new Set([...sound.tags, tag])] }
            : sound
        )
      })),
      
      removeTag: (id, tag) => set((state) => ({
        sounds: state.sounds.map(sound =>
          sound.id === id 
            ? { ...sound, tags: sound.tags.filter(t => t !== tag) }
            : sound
        )
      })),
      
      setFocusedIndex: (index) => set(() => ({ focusedIndex: index })),
      
      setCurrentlyPlaying: (id) => set(() => ({ currentlyPlaying: id })),
      
      // Generation
      setGenerating: (generating) => set(() => ({ isGenerating: generating })),
      
      setGenerationProgress: (progress) => set(() => ({ generationProgress: progress })),
      
      setGenerationStatus: (status) => set(() => ({ generationStatus: status })),
      
      updateGenerationParams: (params) => set((state) => ({
        generationParams: { ...state.generationParams, ...params }
      })),
      
      // Modal controls
      showDetail: (id) => set(() => ({ 
        showDetailModal: true, 
        detailSoundId: id 
      })),
      
      hideDetail: () => set(() => ({ 
        showDetailModal: false, 
        detailSoundId: null 
      })),
      
      showEditor: (id) => set(() => ({ 
        showEditorModal: true, 
        editorSoundId: id 
      })),
      
      hideEditor: () => set(() => ({ 
        showEditorModal: false, 
        editorSoundId: null 
      })),
      
      toggleShortcuts: () => set((state) => ({ 
        showShortcuts: !state.showShortcuts 
      })),
      
      toggleGenerationParams: () => set((state) => ({ 
        showGenerationParams: !state.showGenerationParams 
      })),
      
      setTheme: (theme) => set(() => ({ theme })),
      
      // Filters
      updateFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      
      setSortBy: (sortBy) => set(() => ({ sortBy })),
      
      // Computed
      filteredSounds: () => {
        const { sounds, filters, sortBy } = get()
        let filtered = sounds
        
        // Apply filters
        if (filters.type.length > 0) {
          filtered = filtered.filter(s => filters.type.includes(s.type))
        }
        
        if (filters.favoriteOnly) {
          filtered = filtered.filter(s => s.favorite)
        }
        
        if (filters.tags.length > 0) {
          filtered = filtered.filter(s => 
            filters.tags.some(tag => s.tags.includes(tag))
          )
        }
        
        filtered = filtered.filter(s => 
          s.duration >= filters.durationMin && 
          s.duration <= filters.durationMax &&
          s.frequency >= filters.frequencyMin && 
          s.frequency <= filters.frequencyMax
        )
        
        // Apply sorting
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'duration':
              return a.duration - b.duration
            case 'frequency':
              return a.frequency - b.frequency
            case 'brightness':
              return a.brightness - b.brightness
            case 'type':
              return a.type.localeCompare(b.type)
            case 'creation':
            default:
              // Ensure created is a Date object - sort descending (newest first)
              const aTime = a.created instanceof Date ? a.created.getTime() : new Date(a.created).getTime()
              const bTime = b.created instanceof Date ? b.created.getTime() : new Date(b.created).getTime()
              return bTime - aTime
          }
        })
        
        return filtered
      },
      
      selectedCount: () => get().selectedSounds.size,
    }),
    {
      name: 'peal-sound-store',
      partialize: (state) => ({
        sounds: state.sounds.map(sound => ({
          ...sound,
          // Don't persist audio buffers
          audioBuffer: null,
          waveformData: sound.waveformData,
          // Convert Date to string for storage
          created: sound.created.toISOString()
        })),
        generationParams: state.generationParams,
        filters: state.filters,
        sortBy: state.sortBy,
        theme: state.theme,
      }),
      // Custom serializer/deserializer to handle Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            const parsed = JSON.parse(str)
            // Convert date strings back to Date objects
            if (parsed.state?.sounds) {
              parsed.state.sounds = parsed.state.sounds.map((sound: any) => ({
                ...sound,
                created: new Date(sound.created)
              }))
            }
            return parsed
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
    }
  )
)