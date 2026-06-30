import {
  DEFAULT_VOICE_FX,
  VOICE_FX_PRESETS,
  decodeAudioFromUrl,
  playDry,
  playWithVoiceFx,
  type VoiceFxHandle,
  type VoiceFxParams,
} from '@voxd/client/fx'

export { VOICE_FX_PRESETS }

export const PEAL_VOICE_FX_DRY_ID = ''

export function resolveVoiceFxPresetId(presetId: string) {
  if (!presetId) return null
  return VOICE_FX_PRESETS.find((preset) => preset.id === presetId) ?? null
}

export function voiceFxLabel(presetId: string) {
  return resolveVoiceFxPresetId(presetId)?.label ?? 'Dry'
}

export function resolveTakeFxParams(
  presetId: string,
  override?: Partial<VoiceFxParams>,
): VoiceFxParams | null {
  const preset = resolveVoiceFxPresetId(presetId)
  const hasOverride = override && Object.keys(override).length > 0
  if (!preset && !hasOverride) return null
  return {
    ...DEFAULT_VOICE_FX,
    ...(preset?.params ?? {}),
    ...(override ?? {}),
  }
}

export async function playTakeWithVoiceFx(
  audioUrl: string,
  presetId: string,
  options: {
    paramsOverride?: Partial<VoiceFxParams>
    signal?: AbortSignal
    onEnded?: () => void
  } = {},
): Promise<VoiceFxHandle> {
  const buffer = await decodeAudioFromUrl(audioUrl)
  const params = resolveTakeFxParams(presetId, options.paramsOverride)
  if (!params) {
    return playDry(buffer, options)
  }
  return playWithVoiceFx(buffer, { params, ...options })
}