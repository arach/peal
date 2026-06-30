import type { Sound } from '@/store/soundStore'

export interface ProposeSoundInput {
  summary: string
  type: 'click' | 'tone' | 'noise' | 'sweep'
  frequency?: number
  duration: number
  waveform?: 'sine' | 'square' | 'sawtooth' | 'triangle'
  attack?: number
  decay?: number
  sustain?: number
  release?: number
  notes?: string
}

export function coerceProposeSoundInput(args: Record<string, unknown>): ProposeSoundInput | null {
  const summary = typeof args.summary === 'string' ? args.summary : ''
  const type = args.type
  const duration = Number(args.duration)
  if (!summary || !['click', 'tone', 'noise', 'sweep'].includes(String(type)) || !Number.isFinite(duration)) {
    return null
  }

  return {
    summary,
    type: type as ProposeSoundInput['type'],
    frequency: args.frequency != null ? Number(args.frequency) : undefined,
    duration,
    waveform: args.waveform as ProposeSoundInput['waveform'] | undefined,
    attack: args.attack != null ? Number(args.attack) : undefined,
    decay: args.decay != null ? Number(args.decay) : undefined,
    sustain: args.sustain != null ? Number(args.sustain) : undefined,
    release: args.release != null ? Number(args.release) : undefined,
    notes: typeof args.notes === 'string' ? args.notes : undefined,
  }
}

function mapProposalType(type: ProposeSoundInput['type']): Sound['type'] {
  if (type === 'noise') return 'click'
  if (type === 'tone') return 'tone'
  return type
}

export function soundFromProposal(input: ProposeSoundInput, idSuffix = Date.now()): Sound {
  const soundType = mapProposalType(input.type)
  const frequency = input.frequency ?? (soundType === 'click' ? 1200 : 440)
  const durationSec = Math.max(0.02, Math.min(input.duration, 3))

  return {
    id: `ai-${idSuffix}`,
    type: soundType,
    frequency,
    duration: Math.round(durationSec * 1000),
    parameters: {
      frequency,
      duration: durationSec,
      waveform: input.waveform ?? (soundType === 'click' ? 'square' : 'sine'),
      attack: input.attack ?? 0.01,
      decay: input.decay ?? 0.08,
      sustain: input.sustain ?? 0.4,
      release: input.release ?? 0.12,
      effects: {
        reverb: false,
        delay: false,
        filter: false,
        distortion: false,
        compression: false,
      },
    },
    created: new Date(),
    favorite: false,
    tags: ['ai-designed', input.summary.toLowerCase().replace(/\s+/g, '-')],
    audioBuffer: null,
    waveformData: null,
  }
}