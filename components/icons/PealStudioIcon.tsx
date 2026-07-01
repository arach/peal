'use client'

/**
 * Peal Sound Studio iconography — single source of truth.
 *
 * Maps semantic names onto Phosphor Icons (https://phosphoricons.com),
 * replacing Lucide across the Hudson studio surfaces so the chrome reads as
 * one cohesive, professional set on the dark shell (#111113 / #1c1c1e) with
 * the Peal blue accent (#4a9eff).
 *
 * Conventions:
 * - weight `bold` by default, to match the hardware / EDC sound-designer
 *   instrument chrome (`styles/studio-instruments.css`): rack labels, pad
 *   captions, and module tabs are all uppercase mono at `font-weight: 600`
 *   ("engraved"). Phosphor `regular` reads visibly lighter than those labels —
 *   especially the 9–10px pad icons on the brushed-metal gradient — so `bold`
 *   gives the icons the same engraved weight and crisp read on dark pads.
 * - icons inherit `currentColor`, so they pick up button text / accent colors
 *   (light on dark pads; near-black on an active blue pad, matching the label).
 * - default `size` is 14 (studio chrome); callers pass 12 / 16 / 20 / 32 where
 *   they need to match an existing control footprint.
 * - every wrapper forwards `className`, `color`, `weight`, and aria props, so a
 *   one-off can still override the weight where a lighter glyph is wanted.
 *
 * Do not import `@phosphor-icons/react` directly in studio files — add a
 * semantic mapping here instead so the icon set stays swappable in one place.
 *
 * Glyphs are imported from `@phosphor-icons/react/ssr` so server and client
 * render the same SVG paths. The main package uses React Context for weight;
 * during Next.js SSR that falls back to `regular` while the client applies our
 * default `bold`, which triggers hydration mismatches on every icon.
 */

import type { Icon, IconProps } from '@phosphor-icons/react'
import {
  ArrowsClockwise,
  Check,
  Code,
  Copy,
  DownloadSimple,
  FloppyDisk,
  FolderOpen,
  GearSix,
  GitBranch,
  MagicWand,
  Microphone,
  Pause,
  PencilSimple,
  Play,
  Scissors,
  SlidersHorizontal,
  Sparkle,
  SpeakerHigh,
  SquaresFour,
  StackSimple,
  Stop,
  Columns,
  DotsThree,
  Star,
  Trash,
  Waveform,
  WarningCircle,
} from '@phosphor-icons/react/ssr'

export type PealStudioIconProps = IconProps

function studioIcon(Glyph: Icon, displayName: string) {
  function PealStudioIcon({ size = 14, weight = 'bold', ...rest }: IconProps) {
    return <Glyph size={size} weight={weight} {...rest} />
  }
  PealStudioIcon.displayName = displayName
  return PealStudioIcon
}

// Transport
export const PlayIcon = studioIcon(Play, 'PlayIcon')
export const PauseIcon = studioIcon(Pause, 'PauseIcon')
export const StopIcon = studioIcon(Stop, 'StopIcon')

// Project / library
export const SaveIcon = studioIcon(FloppyDisk, 'SaveIcon')
export const LibraryIcon = studioIcon(FolderOpen, 'LibraryIcon')

// Panels / tabs
export const ParametersIcon = studioIcon(SlidersHorizontal, 'ParametersIcon')
export const SettingsIcon = studioIcon(GearSix, 'SettingsIcon')
export const AiDesignIcon = studioIcon(Sparkle, 'AiDesignIcon')
export const CodeIcon = studioIcon(Code, 'CodeIcon')
export const LayersIcon = studioIcon(StackSimple, 'LayersIcon')
export const LayoutIcon = studioIcon(Columns, 'LayoutIcon')
export const GridIcon = studioIcon(SquaresFour, 'GridIcon')

// Tools / actions
export const ScissorsIcon = studioIcon(Scissors, 'ScissorsIcon')
export const EditIcon = studioIcon(PencilSimple, 'EditIcon')
export const MagicWandIcon = studioIcon(MagicWand, 'MagicWandIcon')
export const CopyIcon = studioIcon(Copy, 'CopyIcon')
export const DownloadIcon = studioIcon(DownloadSimple, 'DownloadIcon')
export const TrashIcon = studioIcon(Trash, 'TrashIcon')
export const CheckIcon = studioIcon(Check, 'CheckIcon')
export const RefreshIcon = studioIcon(ArrowsClockwise, 'RefreshIcon')
export const GitBranchIcon = studioIcon(GitBranch, 'GitBranchIcon')
export const WarningIcon = studioIcon(WarningCircle, 'WarningIcon')

// Tool identities (nav / left panel)
export const VolumeIcon = studioIcon(SpeakerHigh, 'VolumeIcon')
export const WaveformIcon = studioIcon(Waveform, 'WaveformIcon')
export const MicIcon = studioIcon(Microphone, 'MicIcon')
export const StarIcon = studioIcon(Star, 'StarIcon')
export const MoreIcon = studioIcon(DotsThree, 'MoreIcon')
