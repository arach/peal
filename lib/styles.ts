// Consistent style guide for the entire application
// This ensures uniformity across all components

export const styles = {
  // Page/Section Headers
  sectionHeader: {
    h1: 'text-2xl font-semibold text-gray-900 dark:text-white',
    h2: 'text-xl font-medium text-gray-900 dark:text-white',
    h3: 'text-lg font-medium text-gray-900 dark:text-white',
  },

  // Component Headers (inside cards, modals, etc)
  componentHeader: {
    large: 'text-base font-medium text-gray-900 dark:text-gray-100',
    medium: 'text-sm font-medium text-gray-800 dark:text-gray-200',
    small: 'text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider',
  },

  // Labels
  label: {
    default: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    required: 'text-sm font-medium text-gray-700 dark:text-gray-300 after:content-["*"] after:ml-0.5 after:text-red-500',
    small: 'text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider',
  },

  // Text Content
  text: {
    // Body text
    body: 'text-sm text-gray-700 dark:text-gray-300',
    bodyLarge: 'text-base text-gray-700 dark:text-gray-300',
    bodySmall: 'text-xs text-gray-600 dark:text-gray-400',
    
    // Muted/Secondary text
    muted: 'text-sm text-gray-500 dark:text-gray-400',
    mutedSmall: 'text-xs text-gray-500 dark:text-gray-400',
    
    // Code/Technical text
    mono: 'font-mono text-sm text-gray-700 dark:text-gray-300',
    monoSmall: 'font-mono text-xs text-gray-600 dark:text-gray-400',
  },

  // Input Fields
  input: {
    default: 'w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    
    mono: 'w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    
    dark: 'w-full bg-black/20 dark:bg-black/40 border border-gray-700/50 text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all',
    
    transparent: 'w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-1 py-2 text-sm focus:border-blue-500 transition-all',
  },

  // Textareas
  textarea: {
    default: 'w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    
    mono: 'w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
    
    dark: 'w-full bg-black/20 dark:bg-black/40 border border-gray-700/50 text-gray-100 font-mono text-sm rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all',
  },

  // Buttons
  button: {
    primary: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all shadow-sm hover:shadow-md',
    
    secondary: 'px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm rounded-lg transition-all',
    
    outline: 'px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg transition-all',
    
    ghost: 'px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg transition-all',
    
    danger: 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-all shadow-sm hover:shadow-md',
  },

  // Cards
  card: {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm',
    elevated: 'bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow',
    dark: 'bg-gray-900/50 dark:bg-gray-900/80 border border-gray-800/50 rounded-lg backdrop-blur-sm',
  },

  // Badges
  badge: {
    default: 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-md',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  },

  // Specific Component Styles
  studio: {
    sectionTitle: 'text-sm font-light text-gray-700 dark:text-gray-300 uppercase tracking-wide',
    
    subsectionTitle: 'text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider',
    
    inputLabel: 'text-xs text-gray-600 dark:text-gray-400 uppercase tracking-widest font-light',
    
    monoText: 'font-mono text-xs text-gray-600 dark:text-gray-400',
    
    fileName: 'font-mono text-xs text-blue-600 dark:text-blue-400 truncate',
  },
} as const

// Helper function to combine multiple style classes
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}