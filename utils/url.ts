// Utility to handle URLs with base path for GitHub Pages
export function getPublicUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // In development or regular builds, just return the path
  if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_BASE_PATH) {
    return `/${cleanPath}`
  }
  
  // For production static builds with base path (GitHub Pages)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${basePath}/${cleanPath}`
}