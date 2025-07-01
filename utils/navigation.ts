// Helper for navigation with base path support
export function getBasePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH || ''
}

export function getPath(path: string) {
  const basePath = getBasePath()
  return `${basePath}${path}`
}