import { SoundGenerator } from '@/hooks/useSoundGeneration'
import { soundFromProposal, type ProposeSoundInput } from '@/lib/ai/soundProposal'
import { audioBufferToWav } from '@/lib/audioUtils'

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export async function renderSfxProposalToBase64(input: ProposeSoundInput) {
  const sound = soundFromProposal(input)
  const generator = new SoundGenerator()
  await (generator as unknown as { renderSound(s: typeof sound): Promise<void> }).renderSound(sound)
  if (!sound.audioBuffer) throw new Error('SFX synthesis failed')

  const wav = audioBufferToWav(sound.audioBuffer)
  return {
    audioBase64: arrayBufferToBase64(wav),
    mimeType: 'audio/wav',
    sound,
  }
}