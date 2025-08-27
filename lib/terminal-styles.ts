// Terminal-chic monochrome style system inspired by LatticeOS and Gotham
// Minimal grayscale palette with deliberate color accents for critical states

export const terminalStyles = {
  // Color Palette - Monochrome base with surgical color application
  colors: {
    // Grayscale foundation
    gray: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      850: '#1a1a1a',
      900: '#171717',
      925: '#111111',
      950: '#0a0a0a',
      1000: '#000000',
    },
    
    // Accent colors - used sparingly for critical states
    accent: {
      // Primary action - electric blue
      primary: '#0ea5e9', // sky-500
      primaryDim: '#0284c7', // sky-600
      
      // Success state - muted green
      success: '#10b981', // emerald-500
      successDim: '#059669', // emerald-600
      
      // Warning state - amber
      warning: '#f59e0b', // amber-500
      warningDim: '#d97706', // amber-600
      
      // Error state - red
      error: '#ef4444', // red-500
      errorDim: '#dc2626', // red-600
      
      // Info state - subtle blue
      info: '#3b82f6', // blue-500
      infoDim: '#2563eb', // blue-600
    }
  },

  // Typography - Monospace-first with selective sans usage
  typography: {
    // Headers - Sans for hierarchy
    h1: 'text-2xl font-light text-gray-100 tracking-tight',
    h2: 'text-xl font-light text-gray-200 tracking-tight',
    h3: 'text-lg font-normal text-gray-300',
    h4: 'text-base font-normal text-gray-400',
    
    // Section headers - Uppercase monospace
    sectionTitle: 'font-mono text-xs uppercase tracking-[0.2em] text-gray-500',
    subsectionTitle: 'font-mono text-[10px] uppercase tracking-[0.15em] text-gray-600',
    
    // Body text
    body: 'text-sm text-gray-300 font-light',
    bodyMono: 'font-mono text-sm text-gray-300',
    bodySmall: 'text-xs text-gray-400',
    bodySmallMono: 'font-mono text-xs text-gray-400',
    
    // Labels
    label: 'font-mono text-xs uppercase tracking-wider text-gray-500',
    labelRequired: 'font-mono text-xs uppercase tracking-wider text-gray-500 after:content-["*"] after:ml-0.5 after:text-red-500/70',
    
    // Code/Technical
    code: 'font-mono text-sm text-gray-300 bg-gray-900/50 px-1.5 py-0.5 rounded',
    codeBlock: 'font-mono text-sm text-gray-300 bg-gray-950 border border-gray-800 rounded-sm p-4',
  },

  // Components
  components: {
    // Inputs - Minimal borders, focus states
    input: {
      default: 'w-full bg-transparent border border-gray-800 text-gray-100 font-mono text-sm rounded-sm px-3 py-2 placeholder-gray-600 focus:border-gray-600 focus:outline-none transition-colors',
      
      active: 'w-full bg-transparent border border-gray-600 text-gray-100 font-mono text-sm rounded-sm px-3 py-2 placeholder-gray-600 focus:border-sky-500/50 focus:outline-none transition-colors',
      
      error: 'w-full bg-transparent border border-red-500/50 text-gray-100 font-mono text-sm rounded-sm px-3 py-2 placeholder-gray-600 focus:border-red-500 focus:outline-none transition-colors',
      
      minimal: 'w-full bg-transparent border-b border-gray-800 text-gray-100 font-mono text-sm px-1 py-2 placeholder-gray-600 focus:border-gray-500 focus:outline-none transition-colors',
    },
    
    // Textareas
    textarea: {
      default: 'w-full bg-transparent border border-gray-800 text-gray-100 font-mono text-sm rounded-sm px-3 py-2 placeholder-gray-600 resize-none focus:border-gray-600 focus:outline-none transition-colors',
      
      code: 'w-full bg-gray-950 border border-gray-800 text-gray-100 font-mono text-sm rounded-sm px-3 py-2 placeholder-gray-600 resize-none focus:border-gray-600 focus:outline-none transition-colors',
    },
    
    // Buttons - Defense-grade with depth and tactical feedback
    button: {
      primary: 'relative inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-b from-sky-500 to-sky-600 text-white font-mono text-xs uppercase tracking-wider rounded-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:from-sky-400 hover:to-sky-500 active:from-sky-600 active:to-sky-700 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)] transition-all duration-150 transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
      
      secondary: 'relative inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 text-gray-200 font-mono text-xs uppercase tracking-wider rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:from-gray-750 hover:to-gray-850 hover:border-gray-600 hover:text-gray-100 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] transition-all duration-150 transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
      
      ghost: 'relative inline-flex items-center justify-center px-6 py-2.5 text-gray-400 font-mono text-xs uppercase tracking-wider rounded-sm hover:text-gray-200 hover:bg-gray-800/30 hover:shadow-[0_0_0_1px_rgba(107,114,128,0.3)] active:bg-gray-900/50 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
      
      danger: 'relative inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-b from-red-900/20 to-red-950/30 border border-red-500/50 text-red-400 font-mono text-xs uppercase tracking-wider rounded-sm shadow-[inset_0_1px_0_0_rgba(239,68,68,0.1)] hover:from-red-900/30 hover:to-red-950/40 hover:border-red-500 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)] transition-all duration-150 transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
      
      success: 'relative inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-b from-emerald-900/20 to-emerald-950/30 border border-emerald-500/50 text-emerald-400 font-mono text-xs uppercase tracking-wider rounded-sm shadow-[inset_0_1px_0_0_rgba(16,185,129,0.1)] hover:from-emerald-900/30 hover:to-emerald-950/40 hover:border-emerald-500 hover:text-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)] transition-all duration-150 transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
      
      icon: 'relative inline-flex items-center justify-center p-2 bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 text-gray-400 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:from-gray-750 hover:to-gray-850 hover:border-gray-600 hover:text-gray-200 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] transition-all duration-150 transform hover:-translate-y-[1px] active:translate-y-0',
      
      warning: 'relative inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-b from-amber-900/20 to-amber-950/30 border border-amber-500/50 text-amber-400 font-mono text-xs uppercase tracking-wider rounded-sm shadow-[inset_0_1px_0_0_rgba(251,146,60,0.1)] hover:from-amber-900/30 hover:to-amber-950/40 hover:border-amber-500 hover:text-amber-300 hover:shadow-[0_0_20px_rgba(251,146,60,0.15)] active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)] transition-all duration-150 transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
    },
    
    // Cards - Subtle depth
    card: {
      default: 'bg-gray-950/50 border border-gray-800 rounded-sm',
      elevated: 'bg-gray-925 border border-gray-800 rounded-sm shadow-xl shadow-black/50',
      glass: 'bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-sm',
      active: 'bg-gray-900 border border-gray-700 rounded-sm',
    },
    
    // Badges - Minimal, informative
    badge: {
      default: 'inline-flex items-center px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded-sm',
      neutral: 'bg-gray-800 text-gray-400 border border-gray-700',
      primary: 'bg-sky-500/10 text-sky-500 border border-sky-500/30',
      success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30',
      warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/30',
      error: 'bg-red-500/10 text-red-500 border border-red-500/30',
    },
    
    // Tables - Data-dense, scannable
    table: {
      header: 'font-mono text-[10px] uppercase tracking-wider text-gray-500 bg-gray-900 border-b border-gray-800',
      row: 'border-b border-gray-900 hover:bg-gray-925/50 transition-colors',
      cell: 'font-mono text-xs text-gray-300 px-3 py-2',
    },
    
    // Status indicators
    status: {
      online: 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse',
      offline: 'w-2 h-2 rounded-full bg-gray-600',
      error: 'w-2 h-2 rounded-full bg-red-500 animate-pulse',
      warning: 'w-2 h-2 rounded-full bg-amber-500',
    }
  },
  
  // Layout
  layout: {
    // Containers
    container: 'bg-gray-950 text-gray-100',
    panel: 'bg-gray-925 border border-gray-800 rounded-sm',
    sidebar: 'bg-gray-950 border-r border-gray-800',
    
    // Sections
    section: 'border-b border-gray-900 pb-6 mb-6',
    divider: 'border-t border-gray-800',
  },
  
  // Special Effects
  effects: {
    // Glow effects for important elements
    glowPrimary: 'shadow-[0_0_10px_rgba(14,165,233,0.3)]',
    glowSuccess: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    glowError: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    
    // Scanline animation for that terminal feel
    scanline: 'relative after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-gray-100/5 after:to-transparent after:animate-scan',
    
    // Grid background
    grid: 'bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:20px_20px]',
  }
} as const

// Utility function to combine classes
export function cx(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}