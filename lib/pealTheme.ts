export type PealTheme = 'light' | 'dark' | 'system'
export type ResolvedPealTheme = 'light' | 'dark'

export function resolvePealTheme(theme: PealTheme): ResolvedPealTheme {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}